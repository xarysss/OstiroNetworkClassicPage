"""
app/scraper.py — Scraper HTTP pur (requests + BeautifulSoup)
=============================================================
Pas de Playwright, pas d'asyncio, zéro conflit Windows.
Fonctionne comme codebeautify.org : fetch côté serveur via HTTP.
"""

import logging
import requests
from urllib.parse import urljoin
from typing import Dict, List
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

TIMEOUT    = 15
MAX_CSS    = 25
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept":          "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection":      "keep-alive",
}

session = requests.Session()
session.headers.update(HEADERS)


def scrape_page(url: str) -> Dict:
    """Fetch une URL et extrait HTML + CSS."""
    try:
        resp = session.get(url, timeout=TIMEOUT, allow_redirects=True)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding or "utf-8"
        html      = resp.text
        final_url = resp.url
        status    = resp.status_code

        soup      = BeautifulSoup(html, "html.parser")
        meta      = _meta(soup)
        css_files = _css(soup, final_url)

        logger.info("✓ %s — %d bytes", final_url, len(html))
        return {
            "url":         final_url,
            "html":        html,
            "html_size":   len(html),
            "status_code": status,
            "meta":        meta,
            "css_files":   css_files,
            "css_count":   len(css_files),
            "error":       None,
        }
    except Exception as exc:
        msg = str(exc)[:300]
        logger.warning("✗ %s — %s", url, msg)
        return {
            "url":         url,
            "html":        "",
            "html_size":   0,
            "status_code": 0,
            "meta":        {"title": "", "description": ""},
            "css_files":   [],
            "css_count":   0,
            "error":       msg,
        }


def _css(soup: BeautifulSoup, base_url: str) -> List[Dict]:
    result, seen = [], set()

    for tag in soup.find_all("link", rel=lambda r: r and "stylesheet" in r):
        href = (tag.get("href") or "").strip()
        if not href or href.startswith("data:"):
            continue
        full = urljoin(base_url, href)
        if full in seen or len(result) >= MAX_CSS:
            continue
        seen.add(full)
        content = _fetch_text(full)
        result.append({"url": full, "content": content, "type": "external", "size": len(content)})

    for i, tag in enumerate(soup.find_all("style")):
        t = tag.get_text()
        if t.strip():
            result.append({"url": f"[inline #{i+1}]", "content": t, "type": "inline", "size": len(t)})

    return result


def _fetch_text(url: str) -> str:
    try:
        r = session.get(url, timeout=10, allow_redirects=True)
        r.raise_for_status()
        r.encoding = r.apparent_encoding or "utf-8"
        return r.text
    except Exception as e:
        return f"/* Erreur: {e} */"


def _meta(soup: BeautifulSoup) -> Dict:
    t = soup.find("title")
    d = soup.find("meta", attrs={"name": "description"}) or \
        soup.find("meta", attrs={"property": "og:description"})
    return {
        "title":       t.get_text(strip=True) if t else "",
        "description": d.get("content", "") if d else "",
    }
