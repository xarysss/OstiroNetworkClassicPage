"""
CodeSourceFinder — Backend Flask
Fetch the HTML source of any URL server-side (like a curl proxy),
parse all linked CSS files, and return everything to the frontend.
"""

import re
import io
import zipfile
import logging
from typing import Optional, List, Dict
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
#  Configuration
# ─────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

TIMEOUT = 15
MAX_CSS_FILES = 20  # max CSS files to fetch per page


# ─────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────

def fetch_html(url: str) -> Dict:
    """
    Fetch the raw HTML of a URL server-side (proxy style).
    Returns: {html, final_url, status_code, content_type}
    """
    try:
        session = requests.Session()
        resp = session.get(
            url,
            headers=HEADERS,
            timeout=TIMEOUT,
            allow_redirects=True,
        )
        resp.raise_for_status()
        # Try to decode with detected encoding
        resp.encoding = resp.apparent_encoding or "utf-8"
        return {
            "html": resp.text,
            "final_url": resp.url,
            "status_code": resp.status_code,
            "content_type": resp.headers.get("Content-Type", ""),
            "error": None,
        }
    except requests.exceptions.Timeout:
        return {"html": "", "final_url": url, "status_code": 0,
                "content_type": "", "error": "Délai d'attente dépassé (timeout)."}
    except requests.exceptions.SSLError:
        return {"html": "", "final_url": url, "status_code": 0,
                "content_type": "", "error": "Erreur SSL. Essayez avec http:// à la place."}
    except requests.exceptions.ConnectionError:
        return {"html": "", "final_url": url, "status_code": 0,
                "content_type": "", "error": "Impossible de se connecter au site. Vérifiez l'URL."}
    except requests.exceptions.HTTPError as e:
        return {"html": "", "final_url": url, "status_code": e.response.status_code,
                "content_type": "", "error": f"Erreur HTTP {e.response.status_code}."}
    except Exception as e:
        return {"html": "", "final_url": url, "status_code": 0,
                "content_type": "", "error": str(e)}


def fetch_resource(url: str) -> str:
    """Fetch a text resource (CSS/JS). Returns empty string on failure."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding or "utf-8"
        return resp.text
    except Exception as exc:
        logger.warning("Failed to fetch resource %s: %s", url, exc)
        return ""


def extract_css_links(soup: BeautifulSoup, base_url: str) -> List[Dict]:
    """
    Find all <link rel="stylesheet"> and <style> blocks.
    Returns list of {url, content, type: 'external'|'inline'}.
    """
    css_list = []
    seen_urls = set()

    # External stylesheets
    for tag in soup.find_all("link", rel=lambda r: r and "stylesheet" in r):
        href = tag.get("href", "").strip()
        if not href or href.startswith("data:"):
            continue
        full_url = urljoin(base_url, href)
        if full_url in seen_urls:
            continue
        seen_urls.add(full_url)

        if len(css_list) >= MAX_CSS_FILES:
            break

        logger.info("Fetching CSS: %s", full_url)
        content = fetch_resource(full_url)
        css_list.append({
            "url": full_url,
            "content": content,
            "type": "external",
            "size": len(content),
        })

    # Inline <style> blocks
    for i, tag in enumerate(soup.find_all("style")):
        inline_content = tag.get_text()
        if inline_content.strip():
            css_list.append({
                "url": f"[inline style #{i+1}]",
                "content": inline_content,
                "type": "inline",
                "size": len(inline_content),
            })

    return css_list


def extract_meta(soup: BeautifulSoup) -> Dict:
    """Extract useful metadata from the page."""
    title = soup.find("title")
    desc = soup.find("meta", attrs={"name": "description"})
    charset = soup.find("meta", attrs={"charset": True})
    return {
        "title": title.get_text(strip=True) if title else "",
        "description": desc.get("content", "") if desc else "",
        "charset": charset.get("charset", "utf-8") if charset else "utf-8",
    }


def safe_filename(url: str, ext: str = "") -> str:
    """Convert URL to safe filename."""
    parsed = urlparse(url)
    name = (parsed.netloc + parsed.path).strip("/")
    name = re.sub(r"[^\w\-.]", "_", name)
    name = name[:80]  # limit length
    return (name or "index") + ext


# ─────────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/fetch", methods=["POST"])
def api_fetch():
    """
    Main endpoint: fetch HTML + CSS for a given URL.
    Body: {"url": "https://..."}
    """
    data = request.get_json(force=True)
    url: str = (data.get("url") or "").strip()

    if not url:
        return jsonify({"error": "URL manquante."}), 400

    # Auto-add https:// if missing
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    logger.info("Fetching URL: %s", url)

    # 1. Fetch the main HTML
    result = fetch_html(url)

    if result["error"]:
        return jsonify({"error": result["error"]}), 502

    if not result["html"]:
        return jsonify({"error": "Le serveur n'a renvoyé aucun contenu."}), 502

    html = result["html"]
    final_url = result["final_url"]

    # 2. Parse HTML
    soup = BeautifulSoup(html, "html.parser")

    # 3. Extract CSS
    css_list = extract_css_links(soup, final_url)

    # 4. Extract meta
    meta = extract_meta(soup)

    return jsonify({
        "url": final_url,
        "original_url": url,
        "html": html,
        "html_size": len(html),
        "status_code": result["status_code"],
        "meta": meta,
        "css_files": css_list,
        "css_count": len(css_list),
    })


@app.route("/api/download", methods=["POST"])
def api_download():
    """
    Build a ZIP archive with the HTML + all CSS files.
    Body: {"url": "...", "html": "...", "css_files": [...]}
    """
    data = request.get_json(force=True)
    html: str = data.get("html", "")
    css_files: list = data.get("css_files", [])
    url: str = data.get("url", "page")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # Main HTML
        html_name = safe_filename(url, ".html")
        zf.writestr(html_name, html)

        # CSS files
        seen = set()
        for css in css_files:
            if css.get("type") == "inline":
                name = f"css/inline_{css['url'][-5:]}.css"
            else:
                name = "css/" + safe_filename(css.get("url", "style"), ".css")

            # Avoid duplicates
            base_name = name
            counter = 1
            while name in seen:
                name = base_name.replace(".css", f"_{counter}.css")
                counter += 1
            seen.add(name)

            zf.writestr(name, css.get("content", ""))

        # README
        readme = f"""CodeSourceFinder Export
========================
URL: {url}
HTML file: {html_name}
CSS files ({len(css_files)}):
"""
        for css in css_files:
            readme += f"  - {css.get('url', '')}\n"
        zf.writestr("README.txt", readme)

    buf.seek(0)
    return send_file(
        buf,
        mimetype="application/zip",
        as_attachment=True,
        download_name="source_code.zip",
    )


# ─────────────────────────────────────────────
#  Entry point
# ─────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)
