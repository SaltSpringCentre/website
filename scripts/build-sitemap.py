#!/usr/bin/env python3
"""
Build sitemap.xml from Drive source.
Walks every desktop *.html in repo root excluding:
  - admin.html, admin-guide.html, photos.html, 52ACYR.html
  - wireframe-*.html (now archived but defensive)
  - event.html, post.html (templates)
  - schedule-editor*.html (utility/internal)
Uses git log lastmod from /tmp/sscy-website if available.
Output: BOTH /Users/pietsuess/.../My Drive/SSCY/website/sitemap.xml AND /tmp/sscy-website/sitemap.xml
"""

import os
import subprocess
from pathlib import Path

DRIVE = Path("/Users/pietsuess/Library/CloudStorage/GoogleDrive-psuess@gmail.com/My Drive/SSCY/website")
WORK = Path("/tmp/sscy-website")
BASE = "https://saltspringcentre.com"

EXCLUDE = {
    "admin.html", "admin-guide.html", "photos.html", "52ACYR.html",
    "event.html", "post.html",
    # schedule editors (utility internal)
    "schedule-editor.html",
    "schedule-editor-baked-2026-04-02.html",
}

def get_lastmod(filename):
    """Try git log to get last commit date for filename. Return None if unavailable."""
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", filename],
            cwd=str(WORK), capture_output=True, text=True, timeout=5,
        )
        date = result.stdout.strip()
        if date:
            return date
    except Exception:
        pass
    return None


def collect_pages():
    pages = []
    for p in sorted(DRIVE.glob("*.html")):
        name = p.name
        if name in EXCLUDE:
            continue
        if name.startswith("wireframe-"):
            continue
        if name.startswith("schedule-editor"):
            continue
        pages.append(name)
    return pages


def main():
    pages = collect_pages()
    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    # Add canonical root URL pointing to index.html
    for name in pages:
        lastmod = get_lastmod(name)
        loc = f"{BASE}/{name}" if name != "index.html" else f"{BASE}/"
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        if lastmod:
            lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append("  </url>")
    lines.append("</urlset>")
    lines.append("")
    out = "\n".join(lines)
    (DRIVE / "sitemap.xml").write_text(out, encoding="utf-8")
    (WORK / "sitemap.xml").write_text(out, encoding="utf-8")
    print(f"sitemap.xml written: {len(pages)} URLs")


if __name__ == "__main__":
    main()
