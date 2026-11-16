"""Copy the cabinet CATEGORY metafields (parent + every collection) from the sandbox store onto the
matching LIVE tree-3 categories. Category content only: nothing about products is read or written.

Source: the sandbox store, read live (read-only, .env.sandbox.local), or --source <export.json>
(scripts/export-cabinet-data.py output). Target ids come from scripts/live/category-id-map.json.

Idempotent: for each (namespace, key) on a live category the value is created if missing,
updated if different, left alone if identical. Nothing is ever deleted. Writes go through
scripts/lib/bc_guard.py, which only allows metafield writes on tree-3 categories.

Values that embed a SANDBOX category id (e.g. an offer or gallery pointing at a collection) are
rewritten to the live id through the map (JSON keys matching category/collection). Sandbox
product ids are NOT rewritten (there are no sandbox products on live by decision, 8 Nov 2026);
they are reported so the fields can be re-pointed once Arun's products exist.

  python scripts/live/import-category-metafields.py                 # dry run
  python scripts/live/import-category-metafields.py --apply
  python scripts/live/import-category-metafields.py --only 864,865  # sandbox ids
  python scripts/live/import-category-metafields.py --namespaces content,faq
  python scripts/live/import-category-metafields.py --scope non-cabinets   # faq.list / seo.content
  python scripts/live/import-category-metafields.py --scope all
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.request

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from lib.bc_guard import Guard, _load_env  # noqa: E402

SANDBOX_ENV = '.env.sandbox.local'
ID_MAP = 'scripts/live/category-id-map.json'
SANDBOX_CABINETS = 863
COPY = ('namespace', 'key', 'value', 'permission_set', 'description')
CATEGORY_KEY = re.compile(r'(category|collection)', re.I)
GALLERY_REF = re.compile(r'^([cf]):(\d+)(.*)$')


def sandbox_get(path: str):
    env = _load_env(SANDBOX_ENV)
    req = urllib.request.Request(
        f"https://api.bigcommerce.com/stores/{env['BIGCOMMERCE_STORE_HASH']}{path}",
        headers={'X-Auth-Token': env['CATALYST_ACCESS_TOKEN'], 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def sandbox_paged(path: str):
    out, page = [], 1
    sep = '&' if '?' in path else '?'
    while True:
        d = sandbox_get(f'{path}{sep}limit=250&page={page}')
        out.extend(d['data'])
        if page >= d['meta']['pagination']['total_pages']:
            return out
        page += 1


def read_sandbox(scope: str) -> dict[int, dict]:
    """{sandbox category id: {'name', 'metafields': [...]}} for the chosen scope of tree 3."""
    tree = sandbox_get('/v3/catalog/trees/3/categories')['data']

    def flatten(nodes, out):
        for n in nodes:
            out.append(n)
            flatten(n.get('children', []), out)
        return out

    cab = next(n for n in tree if int(n['id']) == SANDBOX_CABINETS)
    cabinet_nodes = [cab] + list(cab.get('children', []))
    if scope == 'cabinets':
        nodes = cabinet_nodes
    elif scope == 'non-cabinets':
        cabinet_ids = {int(n['id']) for n in cabinet_nodes}
        nodes = [n for n in flatten(tree, []) if int(n['id']) not in cabinet_ids]
    else:
        nodes = flatten(tree, [])
    out = {}
    for n in nodes:
        cid = int(n['id'])
        out[cid] = {'name': n['name'], 'metafields': sandbox_paged(f'/v3/catalog/categories/{cid}/metafields')}
        if out[cid]['metafields']:
            print(f'  sandbox {cid} {n["name"]}: {len(out[cid]["metafields"])} metafields')
    return out


def read_export(path: str) -> dict[int, dict]:
    d = json.load(open(path))
    return {int(c['id']): {'name': c['name'], 'metafields': c.get('metafields', [])} for c in d['categories']}


def remap_value(raw: str, id_map: dict[int, int], prod_ids: set[int], report: list[str], label: str) -> str:
    """Rewrite sandbox category ids found under category/collection-like JSON keys; report product ids."""
    try:
        val = json.loads(raw)
    except Exception:
        return raw
    changed = False

    def walk(node, key_hint=''):
        nonlocal changed
        if isinstance(node, dict):
            return {k: walk(v, k) for k, v in node.items()}
        if isinstance(node, list):
            return [walk(v, key_hint) for v in node]
        # Gallery slots ("c:864", "f:911:Lakehouse") carry the category id inside a string.
        if isinstance(node, str) and key_hint == 'ref':
            m = GALLERY_REF.match(node)
            if m and int(m.group(2)) in id_map:
                changed = True
                return f'{m.group(1)}:{id_map[int(m.group(2))]}{m.group(3)}'
            return node
        if isinstance(node, (int, str)) and str(node).isdigit():
            n = int(node)
            if CATEGORY_KEY.search(key_hint) and n in id_map:
                changed = True
                return type(node)(id_map[n]) if isinstance(node, int) else str(id_map[n])
            if n in prod_ids and not CATEGORY_KEY.search(key_hint):
                report.append(f'{label}: {key_hint or "(list)"} = sandbox product {n}')
        return node

    new = walk(val)
    return json.dumps(new, ensure_ascii=False) if changed else raw


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--source', help='export JSON instead of reading the sandbox API')
    ap.add_argument('--only', help='comma-separated SANDBOX category ids')
    ap.add_argument('--namespaces', help='comma-separated namespaces to copy (default all)')
    ap.add_argument('--scope', choices=['cabinets', 'non-cabinets', 'all'], default='cabinets',
                    help='which sandbox tree-3 categories to read (default: Cabinets + collections)')
    a = ap.parse_args()

    g = Guard(apply=a.apply)
    id_map = {int(k): int(v['live_id']) for k, v in json.load(open(ID_MAP))['map'].items()}

    src = read_export(a.source) if a.source else read_sandbox(a.scope)
    only = {int(x) for x in a.only.split(',')} if a.only else None
    namespaces = set(a.namespaces.split(',')) if a.namespaces else None
    prod_ids: set[int] = set()
    if a.source:
        prod_ids = {int(p['id']) for p in json.load(open(a.source)).get('products', [])}

    totals = {'create': 0, 'update': 0, 'same': 0, 'skip': 0}
    product_refs: list[str] = []
    sandbox_cdn = 0

    for old, cat in sorted(src.items()):
        if only and old not in only:
            continue
        if not cat['metafields']:
            continue
        live_id = id_map.get(old)
        if not live_id:
            print(f'!! sandbox {old} {cat["name"]} has no live id in {ID_MAP}; skipped')
            totals['skip'] += len(cat['metafields'])
            continue
        existing = {(m['namespace'], m['key']): m for m in g.get_all(f'/v3/catalog/categories/{live_id}/metafields')}
        print(f'\n{cat["name"]}: sandbox {old} -> live {live_id}  ({len(existing)} metafields already on live)')
        for m in sorted(cat['metafields'], key=lambda x: (x['namespace'], x['key'])):
            if namespaces and m['namespace'] not in namespaces:
                continue
            label = f"{cat['name']} {m['namespace']}.{m['key']}"
            value = remap_value(m['value'], id_map, prod_ids, product_refs, label)
            sandbox_cdn += value.count('store-4smdoosoqx.mybigcommerce.com')
            body = {k: m.get(k) for k in COPY if m.get(k) is not None}
            body['value'] = value
            cur = existing.get((m['namespace'], m['key']))
            if cur is None:
                totals['create'] += 1
                print(f"  create {m['namespace']}.{m['key']} ({len(value)} chars)")
                g.write('POST', f'/v3/catalog/categories/{live_id}/metafields', body)
            elif cur['value'] != value or cur.get('permission_set') != body.get('permission_set'):
                totals['update'] += 1
                print(f"  update {m['namespace']}.{m['key']} ({len(cur['value'])} -> {len(value)} chars)")
                g.write('PUT', f"/v3/catalog/categories/{live_id}/metafields/{cur['id']}",
                        {k: v for k, v in body.items() if k not in ('namespace', 'key')})
            else:
                totals['same'] += 1

    print(f"\n{'APPLIED' if a.apply else 'DRY RUN'}: {totals}")
    if sandbox_cdn:
        print(f'note: {sandbox_cdn} value(s) still point at the SANDBOX image host (store-4smdoosoqx); they work'
              ' while the sandbox exists. Re-host before the sandbox is retired (scripts/download-collection-images.py).')
    if product_refs:
        print(f'note: {len(product_refs)} value(s) reference sandbox PRODUCT ids (no products are copied to live):')
        for r in product_refs[:20]:
            print('   ', r)
    if not a.apply:
        print('Nothing written. Re-run with --apply to write.')


if __name__ == '__main__':
    main()
