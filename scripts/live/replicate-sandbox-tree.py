"""Recreate the SANDBOX store's Catalyst category tree (tree 3, all 79 categories) inside the
LIVE store's Catalyst tree (tree 3 "EK Catalyst Live").

Rules (memory "live-store-write-guard"): creates/updates only in live tree 3 through
scripts/lib/bc_guard.py; never touches tree 1 (Stencil); NEVER deletes anything. Idempotent: a
category whose URL path already exists in live tree 3 is reused, never duplicated.

Source is read live from the sandbox store (read-only, .env.sandbox.local) or from a saved JSON
list (--source). Writes an old->new id map to scripts/live/category-id-map.json for the
metafield / product stages.

  python scripts/live/replicate-sandbox-tree.py              # dry run (default)
  python scripts/live/replicate-sandbox-tree.py --apply      # create for real
  python scripts/live/replicate-sandbox-tree.py --source scratch/sandbox-categories.json
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from lib.bc_guard import Guard, TREE_ID, _load_env  # noqa: E402

SANDBOX_ENV = '.env.sandbox.local'
SANDBOX_TREE_ID = 3
ID_MAP = 'scripts/live/category-id-map.json'
COPY_FIELDS = ('name', 'description', 'page_title', 'meta_description', 'meta_keywords',
               'search_keywords', 'default_product_sort', 'image_url')
BATCH = 20


def read_sandbox_tree() -> list[dict]:
    env = _load_env(SANDBOX_ENV)
    store, token = env['BIGCOMMERCE_STORE_HASH'], env['CATALYST_ACCESS_TOKEN']
    out, page = [], 1
    while True:
        req = urllib.request.Request(
            f'https://api.bigcommerce.com/stores/{store}/v3/catalog/trees/categories'
            f'?tree_id:in={SANDBOX_TREE_ID}&limit=250&page={page}',
            headers={'X-Auth-Token': token, 'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=60) as r:
            d = json.load(r)
        out.extend(d['data'])
        if page >= d['meta']['pagination']['total_pages']:
            break
        page += 1
    return [c for c in out if c['tree_id'] == SANDBOX_TREE_ID]


def flatten(nodes, out=None):
    out = out if out is not None else {}
    for n in nodes:
        out[n['url']] = n
        flatten(n.get('children', []), out)
    return out


def payload(c: dict, parent_live_id: int) -> dict:
    body = {k: c[k] for k in COPY_FIELDS if c.get(k) not in (None, '', [])}
    if isinstance(body.get('meta_keywords'), list) and not body['meta_keywords']:
        body.pop('meta_keywords')
    body.update(
        tree_id=TREE_ID,
        parent_id=parent_live_id,
        is_visible=bool(c['is_visible']),
        sort_order=int(c.get('sort_order') or 0),
        url={'path': c['url']['path'], 'is_customized': True},
    )
    return body


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--source', help='JSON list of sandbox categories instead of reading the sandbox API')
    a = ap.parse_args()

    g = Guard(apply=a.apply)  # refuses unless .env.local is the live store + tree 3 is intact

    src = json.load(open(a.source)) if a.source else read_sandbox_tree()
    src = [c for c in src if c['tree_id'] == SANDBOX_TREE_ID]
    by_old = {c['category_id']: c for c in src}

    def depth(c):
        d = 0
        while c['parent_id']:
            c = by_old[c['parent_id']]
            d += 1
        return d

    ordered = sorted(src, key=lambda c: (depth(c), int(c.get('sort_order') or 0), c['name']))

    live_t3 = flatten(g.get(f'/v3/catalog/trees/{TREE_ID}/categories')['data'])
    live_t1 = flatten(g.get('/v3/catalog/trees/1/categories')['data'])  # read-only, info only

    print(f"\nPLAN  ({'APPLY' if a.apply else 'DRY RUN'})  source={'sandbox API' if not a.source else a.source}"
          f"  -> live tree {TREE_ID}\n")
    print(f"{'action':7} {'old':>4} {'depth':5} {'name':30} {'url':52} same URL in tree 1?")
    to_create = 0
    for c in ordered:
        u = c['url']['path']
        exists = live_t3.get(u)
        action = 'reuse' if exists else 'create'
        to_create += 0 if exists else 1
        clash = f"yes (tree-1 id {live_t1[u]['id']})" if u in live_t1 else ''
        print(f"{action:7} {c['category_id']:>4} {depth(c):5} {c['name'][:30]:30} {u:52} {clash}")
    print(f"\n{len(ordered)} categories: {to_create} to create, {len(ordered) - to_create} already in live tree {TREE_ID}.")
    print('Tree-1 URL matches are informational: the Stencil tree is never touched, and BigCommerce allows'
          ' the same path in different trees (verified 3 Nov 2026 with /cabinets/).')

    if not a.apply:
        print('\nNothing written. Re-run with --apply to create.')
        return

    id_map: dict[int, int] = {}
    created: list[int] = []
    for d in range(0, max(depth(c) for c in ordered) + 1):
        level = [c for c in ordered if depth(c) == d]
        pending = []
        for c in level:
            u = c['url']['path']
            if u in live_t3:
                id_map[c['category_id']] = int(live_t3[u]['id'])
            else:
                pending.append(c)
        for i in range(0, len(pending), BATCH):
            chunk = pending[i:i + BATCH]
            body = [payload(c, id_map[c['parent_id']] if c['parent_id'] else 0) for c in chunk]
            try:
                res = g.write('POST', '/v3/catalog/trees/categories', body)
                rows = res['data']
            except RuntimeError as e:
                # Isolate the failing item(s) without stopping the run.
                print(f'  batch of {len(chunk)} failed ({str(e)[:160]}); retrying one by one')
                rows = []
                for c, b in zip(chunk, body):
                    try:
                        rows.append(g.write('POST', '/v3/catalog/trees/categories', [b])['data'][0])
                    except RuntimeError as e2:
                        print(f'  FAILED  {c["name"]} {c["url"]["path"]}: {str(e2)[:300]}')
                        rows.append(None)
            for c, r in zip(chunk, rows):
                if r:
                    id_map[c['category_id']] = int(r['category_id'])
                    created.append(int(r['category_id']))
        g.refresh_tree_ids()
        live_t3 = flatten(g.get(f'/v3/catalog/trees/{TREE_ID}/categories')['data'])

    os.makedirs(os.path.dirname(ID_MAP), exist_ok=True)
    json.dump(
        {
            'live_tree_id': TREE_ID,
            'sandbox_tree_id': SANDBOX_TREE_ID,
            'map': {str(old): {'live_id': new, 'name': by_old[old]['name'], 'url': by_old[old]['url']['path']}
                    for old, new in sorted(id_map.items())},
        },
        open(ID_MAP, 'w'), indent=1)
    cab = next((new for old, new in id_map.items() if by_old[old]['url']['path'] == '/cabinets/'), None)
    missing = [c for c in ordered if c['category_id'] not in id_map]
    print(f'\nDone: {len(created)} created this run, {len(id_map)} mapped in total, {len(missing)} failed.')
    for c in missing:
        print('  missing:', c['name'], c['url']['path'])
    print(f'id map written: {ID_MAP}')
    print(f'Cabinets parent on live: {cab}  -> set CABINETS_CATEGORY_ID={cab} (env) for the live deployment')
    print('NEXT (control panel, Arun): Customers > Customer Groups > guest group > Category Access: tick every'
          ' new tree-3 category, or the storefront hides them (see memory live-channel-storefront-blocker).')
    print('New live ids:', ','.join(map(str, created)))


if __name__ == '__main__':
    main()
