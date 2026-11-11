#!/usr/bin/env python3
"""Read-only smoke test for CMangini3D public SEO. Runs from GitHub-hosted runners."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

BASE = "https://cmangini3d.com.br"
ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = json.loads((ROOT / "src/server/products/published-catalog-snapshot.json").read_text())
APPROVAL = (ROOT / "src/features/products/search-approval.ts").read_text()
match = re.search(r"const approvedSlugs = new Set<string>\(\[([\s\S]*?)\]\);", APPROVAL)
if not match:
    sys.exit("ERRO: whitelist de indexacao nao encontrada")
APPROVED = set(re.findall(r'"([a-z0-9-]+)"', match.group(1)))
ROWS = {p["slug"]: p for p in SNAPSHOT}
PENDING = set(ROWS) - APPROVED
ERRORS = []
WARNINGS = []
PASSED = []

def fetch(url, max_bytes=1_000_000, timeout=25):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; CM3D-SEO-QA/1.0)", "Accept-Encoding": "identity"})
    try:
        with urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.geturl(), dict(resp.headers), resp.read(max_bytes)
    except HTTPError as e:
        return e.code, e.geturl(), dict(e.headers), e.read(min(max_bytes, 100_000))

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = []
        self.robots = []
        self.links = set()
        self.title = False
        self.description = False
        self.images = 0
    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append(attrs.get("href", ""))
        if tag == "meta":
            if attrs.get("name", "").lower() == "robots":
                self.robots.append(attrs.get("content", "").lower())
            if attrs.get("name") == "description":
                self.description = bool(attrs.get("content"))
        if tag == "title":
            self.title = True
        if tag == "a":
            self.links.add(attrs.get("href", ""))
        if tag == "img":
            self.images += 1

def verify_page(slug):
    url = BASE + "/produtos/" + slug
    want = slug in APPROVED
    errors = []
    try:
        code, final, headers, body = fetch(url)
        if code != 200:
            errors.append(f"{slug}: HTTP {code} (esperado 200)")
            return errors
        if final != url:
            errors.append(f"{slug}: redirect inesperado para {final}")
        parser = Page()
        parser.feed(body.decode("utf-8", errors="replace"))
        if want and parser.canonical != [url]:
            errors.append(f"{slug}: canonical inesperada {parser.canonical}")
        robots = " ".join(parser.robots + [headers.get("X-Robots-Tag", "").lower()])
        noindex = "noindex" in robots
        if noindex == want:
            errors.append(f"{slug}: robots incorreto ({robots!r}, aprovado={want})")
        if not parser.title or not parser.description:
            errors.append(f"{slug}: title ou meta description ausente")
        if want:
            expected = f"https://shopee.com.br/product/1433140862/{ROWS[slug]['id']}"
            if expected not in parser.links:
                errors.append(f"{slug}: link do item Shopee ausente: {expected}")
            if parser.images < 1:
                errors.append(f"{slug}: nenhuma imagem no HTML")
    except Exception as exc:
        errors.append(f"{slug}: falha HTTP/HTML: {type(exc).__name__}: {exc}")
    return errors

def check_main():
    try:
        status, final, headers, body = fetch(BASE + "/robots.txt")
        if status != 200 or f"Sitemap: {BASE}/sitemap.xml" not in body.decode("utf-8"):
            ERRORS.append("robots.txt: HTTP/URL de sitemap invalido")
    except Exception as exc:
        ERRORS.append(f"robots.txt: {exc}")
    try:
        status, final, headers, body = fetch(BASE + "/sitemap.xml")
        if status != 200:
            ERRORS.append(f"sitemap.xml: HTTP {status}")
            return
        root = ET.fromstring(body)
        urls = [e.text for e in root.iter() if e.tag.endswith("}loc") or e.tag == "loc"]
        expected = {BASE + p for p in ["/", "/estudio", "/produtos", "/orcamentos"]}
        expected.update(BASE + "/produtos/" + slug for slug in APPROVED)
        missing, excess = expected - set(urls), set(urls) - expected
        if missing:
            ERRORS.append(f"sitemap faltando {len(missing)} URLs: {sorted(missing)}")
        if excess:
            ERRORS.append(f"sitemap com {len(excess)} URLs extras: {sorted(excess)}")
        if len(urls) != len(set(urls)):
            ERRORS.append("sitemap possui URLs duplicadas")
        PASSED.append(f"sitemap: {len(urls)} URLs; {len(APPROVED)} produtos esperados")
    except Exception as exc:
        ERRORS.append(f"sitemap.xml: {type(exc).__name__}: {exc}")
    for source in ["https://www.cmangini3d.com.br/", "http://cmangini3d.com.br/"]:
        try:
            status, final, headers, body = fetch(source, max_bytes=1024)
            if final != BASE + "/":
                ERRORS.append(f"redirect {source} terminou em {final}")
        except Exception as exc:
            ERRORS.append(f"redirect {source}: {type(exc).__name__}: {exc}")

def check_image(slug):
    url = ROWS[slug]["imageUrls"][0]
    try:
        status, final, headers, body = fetch(url, max_bytes=2048, timeout=15)
        content_type = headers.get("Content-Type", "")
        if status not in (200, 206) or not content_type.startswith("image/"):
            return f"{slug}: imagem principal HTTP {status}, content-type {content_type}"
    except Exception as exc:
        return f"{slug}: CDN inacessivel: {type(exc).__name__}: {exc}"
    return None

if __name__ == "__main__":
    if len(ROWS) != 28 or len(APPROVED) != 25 or len(PENDING) != 3:
        ERRORS.append(f"catalogo divergente do lote: total={len(ROWS)} aprovados={len(APPROVED)} pendentes={len(PENDING)}")
    check_main()
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(verify_page, slug): slug for slug in ROWS}
        for fut in as_completed(futures):
            ERRORS.extend(fut.result())
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(check_image, slug): slug for slug in ROWS}
        for fut in as_completed(futures):
            note = fut.result()
            if note:
                WARNINGS.append(note)
    PASSED.append(f"paginas de produto consultadas: {len(ROWS)}")
    print("=== QA SEO REAL EM PRODUCTION ===")
    print("\n".join(PASSED))
    print(f"ERROS ({len(ERRORS)}):")
    print("\n".join(ERRORS) if ERRORS else "Nenhum")
    print(f"AVISOS DE CDN ({len(WARNINGS)}):")
    print("\n".join(WARNINGS) if WARNINGS else "Nenhum")
    summary = ["# SEO production smoke", "", f"- Páginas: {len(ROWS)}", f"- Aprovadas: {len(APPROVED)}",
               f"- Pendentes: {len(PENDING)}", f"- Erros: {len(ERRORS)}", f"- Avisos CDN: {len(WARNINGS)}",
               "", "## Erros", *(("- " + x for x in ERRORS) if ERRORS else ["Nenhum"]),
               "", "## Avisos de imagens", *(("- " + x for x in WARNINGS) if WARNINGS else ["Nenhum"])]
    if os.getenv("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as output:
            output.write("\n".join(summary) + "\n")
    sys.exit(1 if ERRORS else 0)
