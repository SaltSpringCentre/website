#!/usr/bin/env python3
"""Migrate sscy-photos.json from legacy `banner: true` / `hero: true`
boolean flags to a single `aspect` category field.

Buckets (matched to consumer code):
    wide       ratio >= 2.0      (homepage event strip, MFP banner)
    landscape  1.3 <= r < 2.0    (subpage hero)
    square     0.8 <= r < 1.3    (scroll strips, retreat thumbs)
    portrait   ratio < 0.8       (offering cards on index)

For each photo with a legacy flag set, measure the image's natural
width/height (PIL for raster, viewBox parse for SVG) and assign the
matching bucket. Delete the old `banner` and `hero` fields. Photos
without legacy flags are left untouched.

Remote URLs (http(s)://) cannot be measured from disk — those entries
keep their legacy flags stripped but get aspect: null (effectively
opted out of auto-pickers). The picker UI lets a human re-flag them.

Run from repo root:
    python3 scripts/migrate-aspect.py [path-to-sscy-photos.json]
Defaults to the sscy-photos.json sibling of this script's repo root.
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

try:
    from PIL import Image
    HAVE_PIL = True
except ImportError:
    HAVE_PIL = False


def bucket_for_ratio(ratio):
    if not ratio or ratio <= 0:
        return None
    if ratio >= 2.0:
        return 'wide'
    if ratio >= 1.3:
        return 'landscape'
    if ratio >= 0.8:
        return 'square'
    return 'portrait'


def measure_svg(path):
    """Parse <svg> attributes for width/height or viewBox. Returns
    (width, height) floats or (None, None) if we can't tell."""
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            head = f.read(4096)
    except IOError:
        return (None, None)
    # viewBox="minx miny w h"
    m = re.search(r'viewBox\s*=\s*["\']([^"\']+)["\']', head)
    if m:
        parts = m.group(1).replace(',', ' ').split()
        if len(parts) >= 4:
            try:
                return (float(parts[2]), float(parts[3]))
            except ValueError:
                pass
    # width="..." height="..." (strip units)
    wm = re.search(r'\bwidth\s*=\s*["\']([\d.]+)', head)
    hm = re.search(r'\bheight\s*=\s*["\']([\d.]+)', head)
    if wm and hm:
        try:
            return (float(wm.group(1)), float(hm.group(1)))
        except ValueError:
            pass
    return (None, None)


def measure_image(abs_path):
    """Return (width, height) ints/floats, or (None, None) on failure."""
    if not os.path.isfile(abs_path):
        return (None, None)
    ext = os.path.splitext(abs_path)[1].lower()
    if ext == '.svg':
        return measure_svg(abs_path)
    if not HAVE_PIL:
        return (None, None)
    try:
        with Image.open(abs_path) as im:
            return (im.width, im.height)
    except Exception:
        return (None, None)


def main():
    json_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'sscy-photos.json')
    if not os.path.isfile(json_path):
        print('error: not found:', json_path, file=sys.stderr)
        sys.exit(1)

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    stats = {
        'legacy_total': 0,
        'banner_only': 0,
        'hero_only': 0,
        'both': 0,
        'wide': 0,
        'landscape': 0,
        'square': 0,
        'portrait': 0,
        'unmeasurable_remote': 0,
        'unmeasurable_missing': 0,
        'failed': [],
    }

    for cat, photos in data.items():
        if not isinstance(photos, list):
            continue
        for p in photos:
            if not isinstance(p, dict):
                continue
            had_banner = (p.get('banner') is True or
                          (p.get('banner') and p.get('banner') is not True))
            had_hero = p.get('hero') is True
            if not (had_banner or had_hero):
                continue

            stats['legacy_total'] += 1
            if had_banner and had_hero:
                stats['both'] += 1
            elif had_banner:
                stats['banner_only'] += 1
            else:
                stats['hero_only'] += 1

            src = p.get('src') or ''
            if not src:
                stats['unmeasurable_missing'] += 1
                stats['failed'].append({'cat': cat, 'cap': p.get('cap', ''), 'reason': 'no src'})
                p.pop('banner', None)
                p.pop('hero', None)
                continue

            if re.match(r'^https?:', src):
                # Remote URL — can't measure from disk. Drop the legacy
                # flags; the picker UI will let a human assign aspect.
                stats['unmeasurable_remote'] += 1
                stats['failed'].append({'cat': cat, 'cap': p.get('cap', ''), 'reason': 'remote URL', 'src': src})
                p.pop('banner', None)
                p.pop('hero', None)
                continue

            abs_path = os.path.join(ROOT, src.lstrip('/'))
            w, h = measure_image(abs_path)
            if not w or not h:
                stats['unmeasurable_missing'] += 1
                stats['failed'].append({'cat': cat, 'cap': p.get('cap', ''), 'reason': 'missing or unreadable', 'src': src})
                p.pop('banner', None)
                p.pop('hero', None)
                continue

            ratio = w / h
            bucket = bucket_for_ratio(ratio)
            if bucket and not p.get('aspect'):
                p['aspect'] = bucket
                stats[bucket] += 1
            p.pop('banner', None)
            p.pop('hero', None)

    # Pretty-write back to JSON.
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

    print('Migration complete.')
    print('  Legacy entries:           {}'.format(stats['legacy_total']))
    print('    banner+hero:            {}'.format(stats['both']))
    print('    banner only:            {}'.format(stats['banner_only']))
    print('    hero only:              {}'.format(stats['hero_only']))
    print('  Bucketed:')
    print('    wide:                   {}'.format(stats['wide']))
    print('    landscape:              {}'.format(stats['landscape']))
    print('    square:                 {}'.format(stats['square']))
    print('    portrait:               {}'.format(stats['portrait']))
    print('  Unmeasurable:')
    print('    remote URLs:            {}'.format(stats['unmeasurable_remote']))
    print('    missing/unreadable:     {}'.format(stats['unmeasurable_missing']))
    if stats['failed']:
        print('  Failed/skipped entries (legacy flags stripped, no aspect set):')
        for entry in stats['failed']:
            print('    [{}] {}: {}'.format(entry['reason'], entry.get('cap', ''), entry.get('src', '')))


if __name__ == '__main__':
    main()
