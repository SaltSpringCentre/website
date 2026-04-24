#!/usr/bin/env python3
"""Build search-index.json for site-wide search.

Walks desktop *.html (excluding Archive/, wireframe*, test*, schedule-editor-baked-*,
and a handful of utility pages without normal content). Extracts:
  - title (from <title> or first <h1>)
  - page (URL path like /offerings.html)
  - headings (array of {text, id} for h2/h3)
  - excerpt (first ~150 chars of visible body text)
  - kind ("page" or "post")

Also pulls blog post entries from posts/index.json.

Run from repo root:
    python3 scripts/build-search-index.py
"""

import json
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EXCLUDE_FILES = {
    # Utility / admin / non-content pages — keep them out of search results.
    "admin.html",
    "player.html",
    "schedule-editor.html",
    "52ACYR.html",
    "photos.html",
    # Blog list / single-post template — the actual posts are pulled from posts/index.json.
    "post.html",
    # event.html is a per-event template loaded with ?slug — don't index the empty shell.
    "event.html",
}

EXCLUDE_PREFIXES = ("wireframe", "test", "schedule-editor-baked-")


def slug_from_text(text):
    s = re.sub(r"[^\w\s-]", "", text or "").strip().lower()
    return re.sub(r"[\s_]+", "-", s)


class PageExtractor(HTMLParser):
    """Pulls out title, h1/h2/h3 (with ids), and visible body text."""

    SKIP_TAGS = {"script", "style", "noscript", "svg", "template"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_title = False
        self.title = ""
        self.h1 = ""
        self.headings = []  # list of {text, id, level}
        self.body_text_parts = []
        self._tag_stack = []
        self._current_heading = None  # {text, id, level} buffer
        self._heading_buffer = ""
        self._in_body = False
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        attrd = dict(attrs)
        if tag == "body":
            self._in_body = True
        if tag in self.SKIP_TAGS:
            self._skip_depth += 1
        self._tag_stack.append(tag)
        if tag == "title":
            self.in_title = True
        if tag in ("h1", "h2", "h3"):
            self._current_heading = {"text": "", "id": attrd.get("id", ""), "level": tag}
            self._heading_buffer = ""

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag in ("h1", "h2", "h3"):
            if self._current_heading is not None:
                text = re.sub(r"\s+", " ", self._heading_buffer).strip()
                self._current_heading["text"] = text
                if text:
                    if tag == "h1" and not self.h1:
                        self.h1 = text
                    if tag in ("h2", "h3"):
                        self.headings.append({
                            "text": text,
                            "id": self._current_heading["id"] or slug_from_text(text),
                        })
                self._current_heading = None
                self._heading_buffer = ""
        if tag in self.SKIP_TAGS and self._skip_depth > 0:
            self._skip_depth -= 1
        if self._tag_stack and self._tag_stack[-1] == tag:
            self._tag_stack.pop()

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self._current_heading is not None:
            self._heading_buffer += data
        if self._in_body and self._skip_depth == 0:
            self.body_text_parts.append(data)


def extract_page(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            html = f.read()
    except (IOError, UnicodeDecodeError):
        return None
    p = PageExtractor()
    try:
        p.feed(html)
    except Exception:
        # Ignore parser errors — best effort.
        pass

    title = re.sub(r"\s+", " ", p.title).strip()
    if not title:
        title = p.h1 or os.path.basename(path).replace(".html", "").replace("-", " ").title()
    # Strip "Salt Spring Centre of Yoga" suffix from title if present.
    title = re.sub(r"\s*[\|\-]\s*Salt Spring Centre of Yoga\s*$", "", title)

    body_text = " ".join(p.body_text_parts)
    body_text = re.sub(r"\s+", " ", body_text).strip()
    excerpt = body_text[:160]
    if len(body_text) > 160:
        excerpt = excerpt.rsplit(" ", 1)[0] + "..."

    return {
        "kind": "page",
        "page": os.path.basename(path),
        "title": title,
        "headings": p.headings,
        "excerpt": excerpt,
    }


def collect_pages():
    entries = []
    for name in sorted(os.listdir(ROOT)):
        if not name.endswith(".html"):
            continue
        if name in EXCLUDE_FILES:
            continue
        if name.startswith(EXCLUDE_PREFIXES):
            continue
        full = os.path.join(ROOT, name)
        if not os.path.isfile(full):
            continue
        entry = extract_page(full)
        if entry and entry["title"]:
            entries.append(entry)
    return entries


def collect_posts():
    posts_index = os.path.join(ROOT, "posts", "index.json")
    if not os.path.isfile(posts_index):
        return []
    with open(posts_index, "r", encoding="utf-8") as f:
        try:
            posts = json.load(f)
        except json.JSONDecodeError:
            return []
    out = []
    for p in posts:
        slug = p.get("slug") or ""
        if not slug:
            continue
        out.append({
            "kind": "post",
            "page": "post.html?slug=" + slug,
            "title": p.get("title", ""),
            "headings": [],
            "excerpt": (p.get("excerpt") or "")[:200],
            "date": p.get("date", ""),
            "categories": p.get("categories", []),
        })
    return out


def main():
    entries = collect_pages() + collect_posts()
    out_path = os.path.join(ROOT, "search-index.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, separators=(",", ":"))
    print("Wrote {} entries to {}".format(len(entries), out_path))


if __name__ == "__main__":
    main()
