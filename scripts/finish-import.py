#!/usr/bin/env python3
"""Finishing pass for freshly imported products (handles, tiles, cabinet accessories, …).

The CSV import gets names, prices, variants, images and categories in; this script adds the
storefront bits the import can't express:

  * brand_id        — from the "Brand" custom field (brand created if the store lacks it)
  * __delivery      — "Ships Next Day" when the import's "Shipping" field says so, else
                      "Ships in 2 days" (the accessories convention; appliances/windows are
                      "2-Day Pickup" and are NOT handled here)
  * swatch options  — Finish / Color options become swatch-type with a hex colour per value so
                      cards and the PDP show colour dots instead of a dropdown

Idempotent: re-running changes nothing that is already right.

    python scripts/finish-import.py --category 889 890 891 [--dry-run]
    python scripts/finish-import.py --id-min 15913 --id-max 15950 [--dry-run]

Reads BIGCOMMERCE_STORE_HASH + CATALYST_ACCESS_TOKEN from .env.local (or the environment).
"""

import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Approximate colours for the finish names used across the hardware/accessory imports. Keys are
# matched case-insensitively. Unknown names fall back to a neutral grey and are reported.
HEX = {
    'satin nickel': '#C9C9C4', 'brushed nickel': '#BDBDB8', 'polished nickel': '#DCDCD8',
    'matte nickel': '#B8B8B3', 'antique nickel': '#9A9A94', 'black nickel': '#3A3A3C',
    'polished chrome': '#E3E6E8', 'chrome': '#DDE1E4', 'brushed chrome': '#CFD3D6',
    'champagne bronze': '#C8A977', 'golden champagne': '#D6B77A', 'satin gold': '#D4B46A',
    'satin brass': '#C9A961', 'brass': '#C8A24A', 'brushed brass': '#D2B374',
    'brushed aurum gold': '#CDAA5C', 'rose gold': '#D7A6A0',
    'oil-rubbed bronze': '#4A3B2E', 'brushed oil-rubbed bronze': '#5A4635', 'black bronze': '#2E2A28',
    'matte black': '#1F1F1F', 'black': '#111111', 'gunmetal': '#5B5E62',
    'black stainless steel': '#2F3133', 'stainless steel': '#B7BCC0',
    'antique copper': '#8B5A3C', 'copper': '#B87333', 'antique english': '#6B5744', 'pewter': '#8E9094',
    'white': '#F4F4F2', 'almond': '#E6D2B5', 'silver': '#C6C8CA', 'gray': '#8F9296', 'grey': '#8F9296',
    'maple': '#DDBF8F', 'natural maple': '#E2C79A', 'unfinished maple': '#E7D3B0', 'walnut': '#6B4A2B',
    'orion gray with walnut': '#6E6A66', 'orion gray with maple': '#7A7672', 'stainless with black': '#9EA3A8',
    'clear, brushed brass': '#D2B374', 'clear, chrome': '#DDE1E4', 'clear, matte black': '#2A2A2A',
    'argento romano 6697-58': '#A7A39A', 'milano amber 4724-60': '#9A6B3F',
    'milano brown 4725-60': '#5E4634', 'milano quartz 4726-60': '#B9AFA0',
}
FALLBACK_HEX = '#BDBDBD'
SWATCH_OPTIONS = {'finish', 'color', 'colour', 'bowl color'}

# Brand names in the import → existing store brand (so we don't create near-duplicates).
BRAND_ALIASES = {'msi': 'M S International', 'rev-a-shelf': 'Rev-a-shelf'}


def load_env():
    path = os.path.join(ROOT, '.env.local')
    if os.path.exists(path):
        for line in open(path):
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


class BC:
    def __init__(self, dry_run):
        self.base = f"https://api.bigcommerce.com/stores/{os.environ['BIGCOMMERCE_STORE_HASH']}/v3"
        self.token = os.environ['CATALYST_ACCESS_TOKEN']
        self.dry_run = dry_run

    def call(self, method, path, body=None, params=None):
        url = self.base + path
        if params:
            url += ('&' if '?' in url else '?') + urllib.parse.urlencode(params, doseq=True)
        if self.dry_run and method != 'GET':
            print(f'   [dry-run] {method} {path} {json.dumps(body)[:160]}')
            return {}
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method, headers={
            'X-Auth-Token': self.token, 'Content-Type': 'application/json', 'Accept': 'application/json',
        })
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req) as r:
                    raw = r.read()
                    return json.loads(raw) if raw else {}
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt < 3:
                    time.sleep(float(e.headers.get('X-Rate-Limit-Time-Reset-Ms', 3000)) / 1000)
                    continue
                print(f'   !! {method} {path} -> {e.code} {e.read().decode()[:300]}')
                raise

    def products(self, params):
        out, page = [], 1
        while True:
            res = self.call('GET', '/catalog/products', params={**params, 'page': page, 'limit': 50,
                            'include': 'custom_fields,options', 'include_fields': 'name,categories,brand_id,sku'})
            out += res['data']
            if page >= res['meta']['pagination']['total_pages']:
                return out
            page += 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--category', type=int, nargs='*', help='leaf category ids (queried one at a time)')
    ap.add_argument('--id-min', type=int)
    ap.add_argument('--id-max', type=int)
    ap.add_argument('--only-categories', type=int, nargs='*', help='with --id-min/max: keep products in these categories')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    load_env()
    bc = BC(args.dry_run)

    products = {}
    # categories:in with several ids silently truncates, so query each category separately.
    for cat in args.category or []:
        for p in bc.products({'categories:in': cat}):
            products[p['id']] = p
    if args.id_min and args.id_max:
        for p in bc.products({'id:min': args.id_min, 'id:max': args.id_max}):
            if not args.only_categories or set(p['categories']) & set(args.only_categories):
                products[p['id']] = p
    print(f'{len(products)} products')

    brands = {b['name'].lower(): b['id'] for b in bc.call('GET', '/catalog/brands', params={'limit': 250})['data']}

    def brand_id(name):
        key = BRAND_ALIASES.get(name.lower(), name).lower()
        if key not in brands:
            created = bc.call('POST', '/catalog/brands', {'name': name})
            brands[key] = created.get('data', {}).get('id', -1)
            print(f'   + brand "{name}" -> {brands[key]}')
        return brands[key]

    unknown_hex = set()
    for pid, p in sorted(products.items()):
        cf = {f['name']: f for f in p.get('custom_fields', [])}
        changes = []

        # brand
        brand_name = cf.get('Brand', {}).get('value')
        if brand_name:
            bid = brand_id(brand_name)
            if bid > 0 and p['brand_id'] != bid:
                bc.call('PUT', f'/catalog/products/{pid}', {'brand_id': bid})
                changes.append(f'brand {brand_name}->{bid}')

        # delivery line
        delivery = 'Ships Next Day' if cf.get('Shipping', {}).get('value') == 'Ships Next Day' else 'Ships in 2 days'
        if '__delivery' not in cf:
            bc.call('POST', f'/catalog/products/{pid}/custom-fields', {'name': '__delivery', 'value': delivery})
            changes.append(f'__delivery={delivery}')
        elif cf['__delivery']['value'] != delivery:
            bc.call('PUT', f"/catalog/products/{pid}/custom-fields/{cf['__delivery']['id']}", {'name': '__delivery', 'value': delivery})
            changes.append(f'__delivery->{delivery}')

        # swatches
        for o in p.get('options', []):
            if o['display_name'].lower() not in SWATCH_OPTIONS or o['type'] == 'swatch':
                continue
            values = []
            for v in o['option_values']:
                hx = HEX.get(v['label'].lower())
                if hx is None:
                    unknown_hex.add(v['label'])
                    hx = FALLBACK_HEX
                values.append({'id': v['id'], 'label': v['label'], 'sort_order': v['sort_order'],
                               'is_default': v['is_default'], 'value_data': {'colors': [hx]}})
            bc.call('PUT', f"/catalog/products/{pid}/options/{o['id']}",
                    {'display_name': o['display_name'], 'type': 'swatch', 'option_values': values})
            changes.append(f"swatch {o['display_name']}({len(values)})")

        print(f"{pid} {p['name'][:55]:55} | {', '.join(changes) or 'ok'}")

    if unknown_hex:
        print('\nNo hex for (used grey):', sorted(unknown_hex), file=sys.stderr)


if __name__ == '__main__':
    main()
