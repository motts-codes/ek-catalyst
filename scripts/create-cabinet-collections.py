#!/usr/bin/env python3
"""Create the cabinet collection categories (children of Cabinets) that the Laravel harvest has
and the store doesn't, then print the matching import commands.

Each row: sandbox category name, Laravel base card name, product line, construction. Names are
the Laravel card names, with the EM / EV shorthand spelled out (Euro Max / Euro Value) so the
storefront card reads properly; the alias keeps the importer's exact-name match working.

    python scripts/create-cabinet-collections.py --dry-run
    python scripts/create-cabinet-collections.py            # creates, idempotent (skips existing names)
    python scripts/create-cabinet-collections.py --print-import-commands

Reads BIGCOMMERCE_STORE_HASH + CATALYST_ACCESS_TOKEN from .env.local (or the environment).
"""

import argparse
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CABINETS_PARENT = 863
TREE_ID = 3

# (sandbox name, laravel base name, product line, construction)
STAR = [(n, n, 'Star', 'Framed') for n in (
    'Beacon Hill', 'Birmingham', 'Brunswick', 'Cambridge', 'Dublin', 'Edinburgh',
    'Lasalle', 'Lexington', 'Mero', 'Northampton',
)]
PRISM = [(f'Prism {n}', f'Prism {n}', 'Prism', 'Framed') for n in (
    'Avon', 'Beacon Hill', 'Cambridge', 'Derry', 'Edinburgh', 'Lexington', 'Mero',
)]
EURO = [(f'{line} {n}', f'{code} {n}', line, 'Frameless')
        for code, line in (('EM', 'Euro Max'), ('EV', 'Euro Value'))
        for n in ('Eden', 'Madison', 'Manhattan HG', 'Manhattan PM', 'Tribeca A', 'Tribeca B', 'Tribeca C', 'Tribeca Shaker')]
COLLECTIONS = STAR + PRISM + EURO


def load_env():
    path = os.path.join(ROOT, '.env.local')
    if os.path.exists(path):
        for line in open(path):
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def api(method, path, body=None):
    base = f"https://api.bigcommerce.com/stores/{os.environ['BIGCOMMERCE_STORE_HASH']}/v3"
    req = urllib.request.Request(base + path, data=json.dumps(body).encode() if body is not None else None,
                                 method=method, headers={'X-Auth-Token': os.environ['CATALYST_ACCESS_TOKEN'],
                                                         'Content-Type': 'application/json', 'Accept': 'application/json'})
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        sys.exit(f'{method} {path} -> {e.code} {e.read().decode()[:400]}')


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--print-import-commands', action='store_true')
    args = ap.parse_args()
    load_env()

    existing = {c['name'].strip().lower(): c['category_id']
                for c in api('GET', '/catalog/trees/categories?limit=250')['data'] if c.get('parent_id') == CABINETS_PARENT}

    for name, _laravel, _line, _construction in COLLECTIONS:
        if name.lower() in existing:
            continue
        body = [{'parent_id': CABINETS_PARENT, 'tree_id': TREE_ID, 'name': name, 'is_visible': True,
                 'url': {'path': f'/cabinets/{slug(name)}/', 'is_customized': True}}]
        if args.dry_run:
            print(f'[dry-run] create {name} -> /cabinets/{slug(name)}/')
            continue
        created = api('POST', '/catalog/trees/categories', body)['data'][0]
        existing[name.lower()] = created['category_id']
        print(f"created {created['category_id']} {name} -> {created['url']['path']}")

    if args.print_import_commands:
        h = '"$HOME/Desktop/Catalyst Products/Laravel Harvest"'
        print('\nH=' + h)
        for name, laravel, line, construction in COLLECTIONS:
            cid = existing.get(name.lower(), '<id>')
            alias = f' --alias "{name}={laravel}"' if name != laravel else ''
            print(f'python scripts/import-laravel-collections.py --file "$H/laravel_category_details.json" '
                  f'--collections "$H/laravel_collections.json" --category {cid} '
                  f'--product-line "{line}" --construction {construction}{alias}')


if __name__ == '__main__':
    main()
