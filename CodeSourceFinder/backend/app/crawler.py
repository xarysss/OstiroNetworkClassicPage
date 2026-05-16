"""
app/crawler.py
==============
Module Crawler : découverte des liens internes d'un site.
Travaille uniquement sur le HTML déjà rendu fourni par le scraper.
"""

import logging
from urllib.parse import urljoin, urlparse
from typing import List, Set
from bs4 import BeautifulSoup

from app.utils import normalize_url, same_domain, is_crawlable

logger = logging.getLogger(__name__)


def extract_internal_links(html: str, base_url: str) -> List[str]:
    """
    Extrait tous les liens internes d'une page HTML.

    Règles :
    - Balises <a href="..."> uniquement
    - Même domaine que base_url
    - Exclut les ancres (#), mailto:, tel:, javascript:
    - Exclut les extensions non-HTML (.pdf, .png, etc.)
    - Normalise les URLs (lowercase, sans fragment, sans trailing slash)

    Retourne une liste d'URLs normalisées et dédupliquées.
    """
    soup = BeautifulSoup(html, "html.parser")
    found: Set[str] = set()
    results: List[str] = []

    for tag in soup.find_all("a", href=True):
        href = tag["href"].strip()

        # Ignore les liens non-navigables
        if not href or href.startswith(("javascript:", "mailto:", "tel:", "#", "data:")):
            continue

        # Résolution URL relative → absolue
        full_url = urljoin(base_url, href)

        # Normalisation
        normalized = normalize_url(full_url)

        # Filtres
        if normalized in found:
            continue
        if not same_domain(base_url, normalized):
            continue
        if not is_crawlable(normalized):
            continue

        found.add(normalized)
        results.append(normalized)

    logger.debug("Found %d internal links on %s", len(results), base_url)
    return results
