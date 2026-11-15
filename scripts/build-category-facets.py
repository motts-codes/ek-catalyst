#!/usr/bin/env python3
"""Mine the live store for the brands and finishes each non-cabinet category actually carries.

Reads (never writes) the live BigCommerce store. Until Arun has moved the live products into the
Catalyst tree (tree 3), the Catalyst categories are mostly empty, so each Catalyst path is mined
from the Stencil-tree (tree 1) categories that feed it (SOURCES below); pass --tree 3 once the
Catalyst categories hold the products to mine them directly. Appliances have their own miner
(scripts/appliances/build-appliance-facets.py) and are not covered here.

Output: lib/category/category-facets.json, per Catalyst path:
  brands    [{name, entityId, count}]  visible products per brand id
  finishes  [{label, value, count}]    the "Product Finish" custom field (an enabled storefront filter, so
                                        the tile links filter on it exactly: ?attr_Product Finish=<value>)

A tile needs a share of the category (MIN_SHARE, with the absolute floors below) so a 2-product
sealant brand or one Swanstone colour out of twenty does not get a tile; a row needs 2+ tiles. If the
cap would cut inside a run of equal counts the whole run is dropped rather than picking arbitrarily.
A minor alias of a finish that is also present ("Chrome" next to "Polished Chrome") is hidden, since
a tile filters on one exact value; the sidebar filter still lists it.

Usage:  python3 scripts/build-category-facets.py [--tree 1|3] [--dry-run]
Env:    BIGCOMMERCE_STORE_HASH, CATALYST_ACCESS_TOKEN (read from .env.local if not set)
"""
import argparse
import collections
import json
import math
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / 'lib' / 'category' / 'category-facets.json'

FINISH_FIELD = 'Product Finish'
MIN_BRAND_PRODUCTS = 2
MIN_FINISH_PRODUCTS = 3
MIN_SHARE = {'brands': 0.02, 'finishes': 0.03}
MAX_TILES = 8
HIDE_ALIAS_WHEN_PRESENT = {'Chrome': 'Polished Chrome', 'Nickel': 'Brushed Nickel'}

# Catalyst path -> source category ids. Tree 1 = the live Stencil tree the products sit in today;
# tree 3 = the Catalyst tree (docs/LIVE-CATEGORY-IDS.md), used with --tree 3.
SOURCES = {
    '/bath': {1: [360, 366, 365, 377, 369, 368, 363], 3: [802]},
    '/bath/vanity-tops': {1: [366], 3: [857]},
    '/bath/side-splashes': {1: [365], 3: [867]},
    '/bath/bathroom-sinks': {1: [360, 368, 363], 3: [858]},
    '/bath/bathroom-faucets': {1: [377], 3: [864]},
    '/bath/drains-accessories': {1: [369, 379], 3: [868]},
    '/sinks-faucets': {1: [380, 385, 386, 387, 609, 483, 486, 383, 388, 382, 384, 389, 527, 528, 487], 3: [807]},
    '/sinks-faucets/kitchen-sinks': {1: [380, 385, 386, 387, 609], 3: [838]},
    '/sinks-faucets/kitchen-faucets': {1: [483, 486], 3: [859]},
    '/sinks-faucets/accessories': {1: [383, 388, 382, 384, 389, 527, 528, 487], 3: [862]},
    '/countertops': {1: [43, 94, 95, 97, 98], 3: [806]},
    '/countertops/granite': {1: [43], 3: [836]},
    '/countertops/quartz': {1: [94], 3: [853]},
    '/countertops/laminate': {1: [95], 3: [839]},
    '/countertops/prefabricated': {1: [97, 98], 3: [845]},
    '/windows': {1: [374, 375, 376, 371, 373, 635, 370], 3: [808]},
    '/windows/replacement': {1: [374, 375, 376, 635], 3: [854]},
    '/windows/replacement/double-hung-windows': {1: [374], 3: [875]},
    '/windows/replacement/slider-windows': {1: [376], 3: [879]},
    '/windows/replacement/hopper-windows': {1: [375], 3: [877]},
    '/windows/replacement/rep-vinyl-windows': {1: [635], 3: [880]},
    '/windows/new-construction': {1: [371, 373], 3: [843]},
    '/windows/accessories': {1: [370], 3: [881]},
    '/closets': {1: [674, 675], 3: [805]},
}


def env(name):
    if os.environ.get(name):
        return os.environ[name]
    for line in (ROOT / '.env.local').read_text().splitlines():
        if line.startswith(name + '='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit(f'missing {name}')


def api(store, token, path):
    for _ in range(5):
        req = urllib.request.Request(
            f'https://api.bigcommerce.com/stores/{store}{path}',
            headers={'X-Auth-Token': token, 'Accept': 'application/json'},
        )
        try:
            return json.load(urllib.request.urlopen(req, timeout=120))
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(int(e.headers.get('X-Rate-Limit-Time-Reset-Ms', '3000')) / 1000 + 0.5)
    sys.exit('rate limited')


def paged(store, token, path):
    page, out = 1, []
    while True:
        joiner = '&' if '?' in path else '?'
        data = api(store, token, f'{path}{joiner}page={page}&limit=250')
        out += data['data']
        if page >= data['meta']['pagination']['total_pages']:
            return out
        page += 1


def finish_of(product):
    for field in product.get('custom_fields', []):
        if field['name'] == FINISH_FIELD and field['value'].strip():
            return field['value'].strip()
    return None


def pick(counter, kind, total, floor):
    """Top values by count that clear the share threshold, cut at MAX_TILES without splitting a tie."""
    threshold = max(floor, math.ceil(total * MIN_SHARE[kind]))
    rows = [(value, n) for value, n in counter.most_common() if n >= threshold]
    if len(rows) > MAX_TILES:
        cut = rows[MAX_TILES][1]
        rows = [(value, n) for value, n in rows if n > cut]
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tree', type=int, choices=(1, 3), default=1)
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    store, token = env('BIGCOMMERCE_STORE_HASH'), env('CATALYST_ACCESS_TOKEN')
    brands = {b['id']: b['name'] for b in paged(store, token, '/v3/catalog/brands')}

    all_ids = sorted({cid for src in SOURCES.values() for cid in src[args.tree]})
    products = {}
    fields = 'id,name,brand_id,categories,custom_fields,is_visible'
    for i in range(0, len(all_ids), 40):
        chunk = ','.join(map(str, all_ids[i:i + 40]))
        for p in paged(store, token, f'/v3/catalog/products?categories:in={chunk}&is_visible=true&include=custom_fields&include_fields={fields}'):
            products[p['id']] = p
    print(f'{len(products)} visible products across {len(all_ids)} tree-{args.tree} categories', file=sys.stderr)

    by_category = collections.defaultdict(list)
    for p in products.values():
        for cid in p['categories']:
            by_category[cid].append(p)

    categories = {}
    for path, src in SOURCES.items():
        seen = {}
        for cid in src[args.tree]:
            for p in by_category.get(cid, []):
                seen[p['id']] = p
        items = list(seen.values())

        brand_counts = collections.Counter(p['brand_id'] for p in items if p['brand_id'])
        brand_rows = [
            {'name': brands.get(bid, f'Brand {bid}'), 'entityId': bid, 'count': n}
            for bid, n in pick(brand_counts, 'brands', len(items), MIN_BRAND_PRODUCTS)
        ]
        finish_counts = collections.Counter(f for f in map(finish_of, items) if f)
        for alias, main_value in HIDE_ALIAS_WHEN_PRESENT.items():
            if alias in finish_counts and main_value in finish_counts:
                del finish_counts[alias]
        finish_rows = [
            {'label': value, 'value': value, 'count': n}
            for value, n in pick(finish_counts, 'finishes', len(items), MIN_FINISH_PRODUCTS)
        ]

        categories[path] = {
            'count': len(items),
            'brands': brand_rows if len(brand_rows) >= 2 else [],
            'finishes': finish_rows if len(finish_rows) >= 2 else [],
        }
        print(f"{path:48} {len(items):4}  brands={[b['name'] for b in categories[path]['brands']]}  finishes={[f['label'] for f in categories[path]['finishes']]}", file=sys.stderr)

    out = {
        '_source': f'Live store, tree {args.tree} (visible products). Built by scripts/build-category-facets.py; do not edit by hand.',
        'categories': categories,
    }
    if args.dry_run:
        return
    OUT_JSON.write_text(json.dumps(out, indent=2, ensure_ascii=False) + '\n')
    print(f'wrote {OUT_JSON}', file=sys.stderr)


if __name__ == '__main__':
    main()
