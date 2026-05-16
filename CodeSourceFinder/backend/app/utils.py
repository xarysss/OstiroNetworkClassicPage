"""
app/utils.py
============
Fonctions utilitaires : nettoyage d'URL, nommage de fichiers,
sauvegarde sur disque, création d'archive ZIP.
"""

import os
import re
import io
import zipfile
import logging
from urllib.parse import urlparse
from typing import Dict, List

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
#  URL helpers
# ─────────────────────────────────────────────

def normalize_url(url: str) -> str:
    """
    Normalise une URL :
    - Lowercase scheme + netloc
    - Supprime le fragment (#...)
    - Supprime le slash final sauf pour la racine
    """
    parsed = urlparse(url)
    clean = parsed._replace(
        scheme=parsed.scheme.lower(),
        netloc=parsed.netloc.lower(),
        fragment=""
    )
    path = clean.path.rstrip("/") or "/"
    return clean._replace(path=path).geturl()


def same_domain(base_url: str, url: str) -> bool:
    """Vérifie si deux URLs appartiennent au même domaine."""
    return urlparse(base_url).netloc == urlparse(url).netloc


def is_crawlable(url: str) -> bool:
    """
    Vérifie si une URL est crawlable :
    - Schéma HTTP ou HTTPS uniquement
    - Pas de fichiers binaires (.pdf, .png, .jpg, etc.)
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return False
    excluded_exts = (
        ".pdf", ".png", ".jpg", ".jpeg", ".gif", ".svg",
        ".ico", ".woff", ".woff2", ".ttf", ".eot",
        ".mp4", ".mp3", ".zip", ".tar", ".gz", ".exe"
    )
    path = parsed.path.lower()
    return not any(path.endswith(ext) for ext in excluded_exts)


# ─────────────────────────────────────────────
#  File helpers
# ─────────────────────────────────────────────

def safe_name(url: str, max_len: int = 60) -> str:
    """
    Convertit une URL en nom de dossier/fichier sécurisé.
    Ex: https://example.com/about → example_com_about
    """
    parsed = urlparse(url)
    raw = (parsed.netloc + parsed.path).strip("/")
    name = re.sub(r"[^\w\-]", "_", raw)
    name = re.sub(r"_+", "_", name).strip("_")
    return (name or "index")[:max_len]


def save_page(output_dir: str, job_id: str, page_data: Dict) -> str:
    """
    Sauvegarde une page scannée sur disque :
    /output/{job_id}/{page_name}/
        index.html
        style_0.css  (external CSS)
        inline_1.css (inline <style>)
    Retourne le chemin du dossier créé.
    """
    dir_name = safe_name(page_data["url"])
    page_dir = os.path.join(output_dir, job_id, dir_name)
    os.makedirs(page_dir, exist_ok=True)

    # ── Écriture du HTML rendu ──
    html_path = os.path.join(page_dir, "index.html")
    with open(html_path, "w", encoding="utf-8", errors="replace") as f:
        f.write(page_data.get("html", ""))

    # ── Écriture des fichiers CSS ──
    seen_names: set = set()
    for i, css in enumerate(page_data.get("css_files", [])):
        if css["type"] == "inline":
            css_name = f"inline_{i}.css"
        else:
            base = os.path.basename(urlparse(css["url"]).path)
            base = re.sub(r"[^\w\-.]", "_", base)
            css_name = base if base.endswith(".css") else f"style_{i}.css"

        # Évite les doublons de noms
        original_name = css_name
        counter = 1
        while css_name in seen_names:
            css_name = original_name.replace(".css", f"_{counter}.css")
            counter += 1
        seen_names.add(css_name)

        css_path = os.path.join(page_dir, css_name)
        with open(css_path, "w", encoding="utf-8", errors="replace") as f:
            f.write(css.get("content", ""))

    logger.info("Saved page: %s → %s", page_data["url"], page_dir)
    return page_dir


def build_zip(job_dir: str) -> bytes:
    """
    Crée une archive ZIP de tout le dossier du job.
    Retourne les octets de l'archive.
    """
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _dirs, files in os.walk(job_dir):
            for file_name in files:
                file_path = os.path.join(root, file_name)
                # Chemin relatif à partir du parent du dossier du job
                arcname = os.path.relpath(file_path, os.path.dirname(job_dir))
                zf.write(file_path, arcname)
    buf.seek(0)
    return buf.read()
