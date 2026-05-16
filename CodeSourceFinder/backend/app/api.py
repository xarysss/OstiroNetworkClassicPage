"""
app/api.py — Routes FastAPI (CodeSourcesGrabber by Ostiro)
==========================================================
Crawl BFS entièrement synchrone dans un thread.
Aucun Playwright, aucun asyncio dans le crawler.
"""

import io, logging, os, threading, uuid
from collections import deque
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.crawler import extract_internal_links
from app.scraper import scrape_page
from app.utils   import build_zip, normalize_url, save_page

logger     = logging.getLogger(__name__)
router     = APIRouter()
OUTPUT_DIR = "output"

jobs: Dict[str, Dict[str, Any]] = {}


def _new_job(job_id, url, max_pages, max_depth):
    return {
        "id":           job_id,
        "url":          url,
        "max_pages":    max_pages,
        "max_depth":    max_depth,
        "status":       "pending",
        "progress":     0,
        "total_queued": 1,
        "current_url":  "",
        "pages":        [],
        "errors":       [],
        "log":          deque(maxlen=200),
        "fatal_error":  None,
    }


# ── Crawl synchrone dans un thread ──────────────────────────

def _crawl(job_id: str):
    job       = jobs[job_id]
    start_url = normalize_url(job["url"])

    def log(msg):
        logger.info("[%s] %s", job_id, msg)
        job["log"].append(msg)

    job["status"] = "running"
    log(f"🚀 Scan démarré → {start_url}")

    try:
        visited: set  = set()
        queue: deque  = deque([(start_url, 0)])

        while queue and len(visited) < job["max_pages"]:
            url, depth = queue.popleft()
            if url in visited:
                continue
            visited.add(url)
            job["current_url"] = url
            job["progress"]    = len(visited)
            log(f"[{len(visited)}/{job['max_pages']}] {url}")

            data = scrape_page(url)

            if data["error"]:
                log(f"  ⚠ {data['error']}")
                job["errors"].append({"url": url, "error": data["error"]})
                continue

            log(f"  ✓ {data['html_size']//1024}Ko · {data['css_count']} CSS")

            try:
                save_page(OUTPUT_DIR, job_id, data)
            except Exception as e:
                log(f"  ⚠ Sauvegarde: {e}")

            job["pages"].append({
                "url":         data["url"],
                "html":        data["html"],
                "html_size":   data["html_size"],
                "status_code": data["status_code"],
                "meta":        data["meta"],
                "css_files":   data["css_files"],
                "css_count":   data["css_count"],
            })

            if depth < job["max_depth"] and data["html"]:
                links = extract_internal_links(data["html"], data["url"])
                for link in links:
                    if link not in visited:
                        queue.append((link, depth + 1))
                job["total_queued"] = len(visited) + len(queue)
                log(f"  🔗 {len(links)} liens internes")

        job["status"]      = "done"
        job["current_url"] = ""
        log(f"Terminé — {len(job['pages'])} pages · {len(job['errors'])} erreur(s)")

    except Exception as exc:
        err = str(exc) or type(exc).__name__
        job["status"]      = "error"
        job["fatal_error"] = err
        log(f"❌ Erreur: {err}")
        logger.exception("Job %s failed", job_id)


# ── Modèle ──────────────────────────────────────────────────

class ScanRequest(BaseModel):
    url:       str
    max_pages: int = 30
    max_depth: int = 4


# ── Endpoints ───────────────────────────────────────────────

@router.post("/scan")
async def start_scan(req: ScanRequest):
    url = req.url.strip()
    if not url:
        raise HTTPException(400, "URL manquante.")
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    job_id       = str(uuid.uuid4())[:8]
    jobs[job_id] = _new_job(
        job_id, url,
        max(1, min(req.max_pages, 100)),
        max(1, min(req.max_depth, 8)),
    )

    threading.Thread(target=_crawl, args=(job_id,), daemon=True).start()

    return {"job_id": job_id, "status": "started",
            "message": f"Scan démarré — max {req.max_pages} pages, profondeur max {req.max_depth}"}


@router.get("/status/{job_id}")
async def status(job_id: str):
    j = jobs.get(job_id)
    if not j:
        raise HTTPException(404, "Job introuvable.")
    return {
        "id":           j["id"],
        "status":       j["status"],
        "progress":     j["progress"],
        "total_queued": j["total_queued"],
        "current_url":  j["current_url"],
        "pages_count":  len(j["pages"]),
        "errors_count": len(j["errors"]),
        "log":          list(j["log"])[-30:],
        "fatal_error":  j.get("fatal_error"),
    }


@router.get("/result/{job_id}")
async def result(job_id: str):
    j = jobs.get(job_id)
    if not j:
        raise HTTPException(404, "Job introuvable.")
    if j["status"] in ("pending", "running"):
        raise HTTPException(202, "En cours.")
    return {"id": job_id, "url": j["url"], "status": j["status"],
            "pages": j["pages"], "errors": j["errors"]}


@router.get("/download/{job_id}")
async def download(job_id: str):
    j = jobs.get(job_id)
    if not j:
        raise HTTPException(404, "Job introuvable.")
    d = os.path.join(OUTPUT_DIR, job_id)
    if not os.path.exists(d):
        raise HTTPException(404, "Aucun fichier.")
    z = build_zip(d)
    return StreamingResponse(io.BytesIO(z), media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=site_{job_id}.zip"})
