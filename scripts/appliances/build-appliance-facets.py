#!/usr/bin/env python3
"""Mine the live store's appliance catalogue for what each sub-category actually contains.

Reads (never writes) the live BigCommerce store: the Stencil tree's appliance categories
(/kitchen-appliances/*) and their visible products. The products carry no "type" or "finish"
field and no options, so kinds and finishes are read out of the product names with the patterns
below, brands from the brand id. Output:

  lib/category/appliance-facets.json              per Catalyst path: kinds, widths, finishes, brands
  public/images/category/tiles/appliances/*.webp  one 1200x900 tile per kind. The client's own card
                                                   images live here (Nov 2026); an existing tile is
                                                   never overwritten unless --refresh-images is passed,
                                                   in which case it is rebuilt from a representative
                                                  product photo, padded to 4:3 on white)

Usage:  python3 scripts/appliances/build-appliance-facets.py [--no-images] [--dry-run]
Env:    BIGCOMMERCE_STORE_HASH, CATALYST_ACCESS_TOKEN (read from .env.local if not set)
Needs:  sips + cwebp on PATH for the images (macOS + `brew install webp`).
"""
import argparse
import collections
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_JSON = ROOT / 'lib' / 'category' / 'appliance-facets.json'
OUT_IMG = ROOT / 'public' / 'images' / 'category' / 'tiles' / 'appliances'

# Live (Stencil, tree 1) category id -> Catalyst storefront path the facets belong to.
LIVE_TO_PATH = {
    140: '/appliances/fridges-freezers',
    142: '/appliances/ranges-cooktops',
    143: '/appliances/dishwashers',
    144: '/appliances/microwaves',
    329: '/appliances/wall-ovens',
    141: '/appliances/range-hoods',
    145: '/appliances/washers-dryers',
    326: '/appliances/garbage-disposals',
    146: '/appliances/air-conditioning',
    147: '/appliances/accessories',
}

# Kinds per category: (label, name pattern, search term). Order = display order; a product can
# match more than one (a counter-depth French door is both). Widths are kept separate below.
KINDS = {
    140: [
        ('Top Freezer', r'top[- ]freezer|top[- ]mount', 'top freezer'),
        ('French Door', r'french[- ]door', 'french door'),
        ('Side-by-Side', r'side[- ]by[- ]side', 'side by side'),
        ('Bottom Freezer', r'bottom[- ]freezer|bottom[- ]mount', 'bottom freezer'),
        ('Counter-Depth', r'counter[- ]depth', 'counter depth'),
        ('Garage Ready', r'garage ready', 'garage ready'),
        ('Chest Freezers', r'chest freezer', 'chest freezer'),
        ('Upright Freezers', r'upright', 'upright freezer'),
    ],
    142: [
        ('Electric Ranges', r'electric range', 'electric range'),
        ('Gas Ranges', r'gas range', 'gas range'),
        ('Induction Ranges', r'induction', 'induction'),
        ('Free-Standing', r'free[- ]?standing', 'free-standing'),
        ('Slide-In', r'slide[- ]in', 'slide-in'),
        ('Cooktops', r'cooktop', 'cooktop'),
    ],
    143: [
        ('Top Control', r'top[- ]control|fully integrated|hidden control', 'top control'),
        ('Front Control', r'front[- ]control|full console', 'front control'),
        ('Compact 18"', r'\b18["”]? ?(inch|in\b)?', '18 inch'),
        ('ADA Compliant', r'\bada\b', 'ada'),
        ('Stainless Tub', r'stainless steel (tub|interior)', 'stainless steel interior'),
        ('Portable', r'portable', 'portable'),
    ],
    144: [
        ('Over-the-Range', r'over[- ]the[- ]range|\botr\b', 'over the range'),
        ('Countertop', r'countertop|counter top', 'countertop'),
        ('Built-In', r'built[- ]in', 'built-in'),
        ('Drawer', r'drawer', 'drawer'),
    ],
    329: [
        ('Single Wall Ovens', r'single', 'single wall oven'),
        ('Double Wall Ovens', r'double', 'double wall oven'),
    ],
    141: [
        ('Under Cabinet', r'under[- ]?(the[- ])?cabinet', 'under cabinet'),
        ('Wall Mount', r'wall[- ]mount|chimney', 'wall mount'),
        ('Convertible', r'convertible', 'convertible'),
        ('Insert / Liner', r'insert|liner', 'insert'),
    ],
    145: [
        ('Washers', r'washer(?!.*dryer)|washer with', 'washer'),
        ('Electric Dryers', r'electric dryer', 'electric dryer'),
        ('Gas Dryers', r'gas dryer', 'gas dryer'),
        ('Laundry Centers', r'laundry center|stacked|unitized', 'laundry center'),
        ('Front Load', r'front load', 'front load'),
        ('Top Load', r'top load', 'top load'),
        ('Compact 24"', r'\b24["”]? ?(inch|in\b)?', '24 inch'),
    ],
    326: [
        ('Corded', r'(?<!non-)(?<!non )corded', 'corded'),
        ('Non-Corded', r'non[- ]corded', 'non-corded'),
    ],
    146: [
        ('Window Units', r'window', 'window air conditioner'),
        ('Built-In / Through-the-Wall', r'built[- ]in|through[- ]the[- ]wall|thru', 'wall air conditioner'),
        ('Portable', r'portable air', 'portable air conditioner'),
        ('Dehumidifiers', r'dehumidifier', 'dehumidifier'),
    ],
    147: [
        ('Cords', r'\bcord', 'cord'),
        ('Ice Maker Kits', r'ice ?maker', 'ice maker'),
        ('Hoses & Connectors', r'hose|connector', 'hose'),
        ('AC Sleeves & Cases', r'sleeve|wall case', 'sleeve'),
        ('Ducts & Vents', r'duct|vent', 'duct'),
        ('Stacking Kits & Risers', r'stack|riser|pedestal', 'stacking kit'),
        ('Grates & Trim', r'grate|trim|filler', 'grate'),
    ],
}

# Widths worth a chip row (categories where the opening size is the first question).
WIDTHS = {
    140: ['28"', '30"', '33"', '36"'],
    142: ['24"', '30"', '36"'],
    143: ['18"', '24"'],
    329: ['24"', '27"', '30"'],
    141: ['24"', '30"', '36"'],
    144: ['24"', '30"'],
}

# Horsepower chips for disposals, read the same way as widths.
HP = {326: ['1/3 HP', '1/2 HP', '3/4 HP', '1 HP']}

# Finish: (label, name pattern, search term, swatch, tile image). First match wins, so the specific
# ones lead. Tile images are the client's finish swatches (public/images/category/tiles/finishes,
# 15 Nov 2026); a finish without one shows its swatch colour.
FINISHES = [
    ('Fingerprint Resistant', r'fingerprint[- ]resistant|smudge[- ]?proof|resistant stainless', 'fingerprint resistant', '#b9bcc0', 'fingerprint-resistant-stainless'),
    ('Black Stainless Steel', r'black stainless', 'black stainless', '#3a3d42', 'black-stainless-steel'),
    ('Stainless Steel', r'stainless', 'stainless steel', '#c7c9cc', 'stainless-steel'),
    ('Black Slate', r'black slate', 'black slate', '#2f3236', None),
    ('Slate', r'(?<!black )slate', 'slate', '#5b6066', 'slate'),
    ('White', r'\bwhite\b', 'white', '#f4f4f4', 'white'),
    ('Black', r'\bblack\b', 'black', '#141414', 'black'),
    ('Bisque', r'bisque', 'bisque', '#e9dcc5', 'bisque'),
    ('Soft Gray', r'soft gray', 'soft gray', '#b7b9bb', None),
    ('Diamond Gray', r'diamond gray', 'diamond gray', '#6e7276', 'diamond-gray'),
    ('Satin Nickel', r'satin nickel', 'satin nickel', '#a8a9ad', None),
    ('Sapphire Blue', r'sapphire blue', 'sapphire blue', '#2a4b8d', None),
]

# Brand logos we have as SVGs (public/images/brands). Others render as text.
BRAND_LOGOS = {
    'GE Appliances': 'ge-appliances',
    'Frigidaire': 'frigidaire',
    'Whirlpool': 'whirlpool',
    'Samsung': 'samsung',
    'LG Electronics': 'lg',
    'Maytag': 'maytag',
    'Amana': 'amana',
    'Haier': 'haier',
}


def env(name):
    if os.environ.get(name):
        return os.environ[name]
    for line in (ROOT / '.env.local').read_text().splitlines():
        if line.startswith(name + '='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit(f'missing {name}')


def api(store, token, path):
    req = urllib.request.Request(
        f'https://api.bigcommerce.com/stores/{store}{path}',
        headers={'X-Auth-Token': token, 'Accept': 'application/json'},
    )
    return json.load(urllib.request.urlopen(req, timeout=120))


def paged(store, token, path):
    page, out = 1, []
    while True:
        joiner = '&' if '?' in path else '?'
        data = api(store, token, f'{path}{joiner}page={page}&limit=250')
        out += data['data']
        if page >= data['meta']['pagination']['total_pages']:
            return out
        page += 1


def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower().replace('"', '')).strip('-')


def width_pattern(width):
    n = width.rstrip('"')
    return re.compile(rf'\b{n}\s*(?:["”]|-?inch\b|-?in\b)', re.I)


def hp_pattern(hp):
    return re.compile(re.escape(hp.lower()), re.I)


def pick_hero(products, images):
    """A representative product photo for a kind: in stock first, then by the store's own sort."""
    def rank(p):
        in_stock = any(cf['name'] == 'Stock Status' and cf['value'] == 'In-Stock' for cf in p.get('custom_fields', []))
        name = p['name'].lower()
        finish_rank = 0 if 'stainless' in name else 1
        return (0 if in_stock else 1, finish_rank, images.get(p['id'], {}).get('sort', 9999), p['id'])
    for p in sorted(products, key=rank):
        img = images.get(p['id'])
        if img and img.get('zoom'):
            return p, img['zoom']
    return None, None


def make_tile(url, dest):
    """Download a product photo and pad it to an 800x600 white tile as webp."""
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / 'src.jpg'
        urllib.request.urlretrieve(url, src)
        mid = Path(tmp) / 'mid.png'
        subprocess.run(['sips', '-s', 'format', 'png', '--resampleHeightWidthMax', '520', str(src), '--out', str(mid)],
                       check=True, capture_output=True)
        subprocess.run(['sips', '--padToHeightWidth', '600', '800', '--padColor', 'FFFFFF', str(mid)],
                       check=True, capture_output=True)
        subprocess.run(['cwebp', '-quiet', '-q', '82', str(mid), '-o', str(dest)], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--no-images', action='store_true', help='skip downloading tile photos')
    ap.add_argument('--refresh-images', action='store_true',
                    help='rebuild tiles that already exist (default keeps the supplied card images)')
    ap.add_argument('--dry-run', action='store_true', help='print the result, write nothing')
    args = ap.parse_args()

    store, token = env('BIGCOMMERCE_STORE_HASH'), env('CATALYST_ACCESS_TOKEN')
    brands = {b['id']: b['name'] for b in paged(store, token, '/v3/catalog/brands')}
    ids = ','.join(map(str, LIVE_TO_PATH))
    products = [p for p in paged(
        store, token,
        f'/v3/catalog/products?categories:in={ids}&include=custom_fields,primary_image'
        '&include_fields=id,name,brand_id,categories,is_visible,sort_order',
    ) if p['is_visible']]
    images = {p['id']: {'zoom': (p.get('primary_image') or {}).get('url_zoom'), 'sort': p.get('sort_order', 0)}
              for p in products}
    print(f'{len(products)} visible appliance products, {len(brands)} brands', file=sys.stderr)

    result = {}
    for live_id, path in LIVE_TO_PATH.items():
        ps = [p for p in products if live_id in p['categories']]
        names = {p['id']: p['name'].lower() for p in ps}
        entry = {'count': len(ps), 'kinds': [], 'widths': [], 'finishes': [], 'brands': []}

        for label, pattern, term in KINDS.get(live_id, []):
            rx = re.compile(pattern, re.I)
            hits = [p for p in ps if rx.search(names[p['id']])]
            if not hits:
                continue
            hero, url = pick_hero(hits, images)
            file = f'{slugify(path.rsplit("/", 1)[-1])}-{slugify(label)}'
            kind = {'label': label, 'term': term, 'count': len(hits), 'image': f'/images/category/tiles/appliances/{file}.webp'}
            if hero:
                kind['imageAlt'] = hero['name']
            tile_exists = (OUT_IMG / f'{file}.webp').exists()
            if url and not args.no_images and not args.dry_run and (args.refresh_images or not tile_exists):
                OUT_IMG.mkdir(parents=True, exist_ok=True)
                try:
                    make_tile(url, OUT_IMG / f'{file}.webp')
                except subprocess.CalledProcessError as exc:
                    print(f'  ! tile failed for {label}: {exc.stderr[:200] if exc.stderr else exc}', file=sys.stderr)
                    kind.pop('image')
            entry['kinds'].append(kind)

        for width in WIDTHS.get(live_id, []):
            rx = width_pattern(width)
            n = sum(1 for p in ps if rx.search(names[p['id']]))
            if n:
                entry['widths'].append({'label': width, 'term': f'{width.rstrip(chr(34))} inch', 'count': n})
        for hp in HP.get(live_id, []):
            rx = hp_pattern(hp)
            n = sum(1 for p in ps if rx.search(names[p['id']]))
            if n:
                entry['widths'].append({'label': hp, 'term': hp.lower(), 'count': n})

        finish_counts = collections.Counter()
        for p in ps:
            for label, pattern, _term, _swatch, _image in FINISHES:
                if re.search(pattern, names[p['id']], re.I):
                    finish_counts[label] += 1
                    break
        for label, _pattern, term, swatch, image in FINISHES:
            if finish_counts[label]:
                finish = {'label': label, 'term': term, 'swatch': swatch, 'count': finish_counts[label]}
                if image:
                    finish['image'] = f'/images/category/tiles/finishes/{image}.webp'
                entry['finishes'].append(finish)

        brand_counts = collections.Counter(p['brand_id'] for p in ps if p.get('brand_id'))
        for brand_id, n in brand_counts.most_common():
            name = brands.get(brand_id)
            if not name:
                continue
            brand = {'name': name, 'entityId': brand_id, 'count': n}
            if name in BRAND_LOGOS:
                brand['logo'] = f'/images/brands/{BRAND_LOGOS[name]}.svg'
            entry['brands'].append(brand)

        result[path] = entry
        print(f'{path}: {len(ps)} products, {len(entry["kinds"])} kinds, {len(entry["widths"])} widths, '
              f'{len(entry["finishes"])} finishes, {len(entry["brands"])} brands', file=sys.stderr)

    payload = {
        '_source': 'Live store, Stencil tree appliance categories (visible products). Built by scripts/appliances/build-appliance-facets.py; do not edit by hand.',
        'categories': result,
    }
    if args.dry_run:
        print(json.dumps(payload, indent=2))
        return
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n')
    print(f'wrote {OUT_JSON.relative_to(ROOT)}', file=sys.stderr)


if __name__ == '__main__':
    main()
