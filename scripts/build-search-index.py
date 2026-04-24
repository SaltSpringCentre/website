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


# ===== events-data.js parsing =====
# Pulls entries out of four top-level arrays (EVENTS, CLASSES_DATA,
# COMMUNITY_DATA, TREATMENTS_DATA) by scanning the file as plain text.
# This is intentionally quote-and-brace aware so we don't have to run JS.

EVENT_ARRAY_NAMES = ("EVENTS", "CLASSES_DATA", "COMMUNITY_DATA", "TREATMENTS_DATA")


def _find_array_body(text, array_name):
    """Return the substring between the opening `[` and its matching `]`
    for `var <array_name> = [ ... ]`, or None if not found.

    Scans quote-aware (single, double, template backticks) and ignores
    line/block comments so brackets inside strings don't confuse us.
    """
    m = re.search(r"\bvar\s+" + re.escape(array_name) + r"\s*=\s*\[", text)
    if not m:
        return None
    start = m.end()  # first char inside the outer `[`
    depth = 1
    i = start
    n = len(text)
    while i < n:
        c = text[i]
        # line comment
        if c == "/" and i + 1 < n and text[i + 1] == "/":
            nl = text.find("\n", i + 2)
            if nl == -1:
                return None
            i = nl + 1
            continue
        # block comment
        if c == "/" and i + 1 < n and text[i + 1] == "*":
            end = text.find("*/", i + 2)
            if end == -1:
                return None
            i = end + 2
            continue
        # string literal
        if c in ("'", '"', "`"):
            quote = c
            j = i + 1
            while j < n:
                cj = text[j]
                if cj == "\\" and j + 1 < n:
                    j += 2
                    continue
                if cj == quote:
                    j += 1
                    break
                j += 1
            i = j
            continue
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return text[start:i]
        i += 1
    return None


def _split_top_level_objects(body):
    """Yield each top-level `{...}` substring from an array body. Brace /
    bracket depth is tracked; strings and comments are skipped."""
    n = len(body)
    i = 0
    while i < n:
        # Skip whitespace, commas, and comments between top-level objects.
        c = body[i]
        if c.isspace() or c == ",":
            i += 1
            continue
        if c == "/" and i + 1 < n and body[i + 1] == "/":
            nl = body.find("\n", i + 2)
            if nl == -1:
                return
            i = nl + 1
            continue
        if c == "/" and i + 1 < n and body[i + 1] == "*":
            end = body.find("*/", i + 2)
            if end == -1:
                return
            i = end + 2
            continue
        if c != "{":
            # Unexpected — skip forward to next brace to stay resilient.
            nb = body.find("{", i)
            if nb == -1:
                return
            i = nb
            continue
        # Walk one balanced `{...}` object.
        depth = 0
        start = i
        while i < n:
            ch = body[i]
            if ch == "/" and i + 1 < n and body[i + 1] == "/":
                nl = body.find("\n", i + 2)
                if nl == -1:
                    return
                i = nl + 1
                continue
            if ch == "/" and i + 1 < n and body[i + 1] == "*":
                end = body.find("*/", i + 2)
                if end == -1:
                    return
                i = end + 2
                continue
            if ch in ("'", '"', "`"):
                quote = ch
                j = i + 1
                while j < n:
                    cj = body[j]
                    if cj == "\\" and j + 1 < n:
                        j += 2
                        continue
                    if cj == quote:
                        j += 1
                        break
                    j += 1
                i = j
                continue
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    yield body[start : i + 1]
                    i += 1
                    break
            i += 1


def _extract_js_string(obj_body, key):
    """Return the decoded value of `key: 'string'` or `key: "string"` at
    any depth within a JS object body, or None. Handles `\\'`, `\\"`, and
    common escapes; ignores the shape of values that aren't strings."""
    # Match: key (bare or quoted), colon, opening quote, body (with
    # escaped chars), matching closing quote.
    pattern = (
        r"(?:^|[,{\s])\s*(?:'"
        + re.escape(key)
        + r"'|\""
        + re.escape(key)
        + r"\"|"
        + re.escape(key)
        + r")\s*:\s*"
        r"(?P<q>['\"])(?P<val>(?:\\.|(?!(?P=q)).)*)(?P=q)"
    )
    m = re.search(pattern, obj_body, re.DOTALL)
    if not m:
        return None
    raw = m.group("val")
    # Decode the common JS escapes we actually see: \' \" \\ \n \t \r \/
    # and unicode \uXXXX. Anything else we leave as-is.
    def _unesc(s):
        out = []
        i = 0
        while i < len(s):
            ch = s[i]
            if ch == "\\" and i + 1 < len(s):
                nxt = s[i + 1]
                if nxt in ("'", '"', "\\", "/"):
                    out.append(nxt)
                    i += 2
                    continue
                if nxt == "n":
                    out.append("\n")
                    i += 2
                    continue
                if nxt == "t":
                    out.append("\t")
                    i += 2
                    continue
                if nxt == "r":
                    out.append("\r")
                    i += 2
                    continue
                if nxt == "u" and i + 5 < len(s):
                    try:
                        out.append(chr(int(s[i + 2 : i + 6], 16)))
                        i += 6
                        continue
                    except ValueError:
                        pass
                # Unknown escape — drop the backslash, keep the char.
                out.append(nxt)
                i += 2
                continue
            out.append(ch)
            i += 1
        return "".join(out)

    return _unesc(raw)


def _make_excerpt(text, limit=160):
    if not text:
        return ""
    t = re.sub(r"\s+", " ", text).strip()
    if len(t) <= limit:
        return t
    cut = t[:limit]
    # Word-boundary truncation.
    sp = cut.rfind(" ")
    if sp > 0:
        cut = cut[:sp]
    return cut + "..."


def collect_events():
    path = os.path.join(ROOT, "events-data.js")
    if not os.path.isfile(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    out = []
    for arr_name in EVENT_ARRAY_NAMES:
        body = _find_array_body(text, arr_name)
        if body is None:
            continue
        for obj in _split_top_level_objects(body):
            ident = _extract_js_string(obj, "id")
            title = _extract_js_string(obj, "title")
            if not ident or not title:
                continue
            long_desc = _extract_js_string(obj, "longDesc")
            short_desc = _extract_js_string(obj, "desc")
            excerpt = _make_excerpt(long_desc or short_desc or "")
            out.append({
                "kind": "event",
                "page": "event.html?id=" + ident,
                "title": title,
                "headings": [],
                "excerpt": excerpt,
            })
    return out


def main():
    entries = collect_pages() + collect_posts() + collect_events()
    out_path = os.path.join(ROOT, "search-index.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, separators=(",", ":"))
    print("Wrote {} entries to {}".format(len(entries), out_path))


if __name__ == "__main__":
    main()
