"""Write gate for the LIVE BigCommerce store (dsdbflh9ev).

Every live-store script imports this and never touches the token itself.
Rule (docs/LIVE-MIGRATION.md, memory "live-store-write-guard"): writes are allowed ONLY
inside the Catalyst channel's own tree (tree 3) and Catalyst channel assignments. Nothing the
Stencil storefront uses (tree 1 categories, existing product data, brands, settings) may change.

  from lib.bc_guard import Guard
  g = Guard(apply=False)          # dry-run unless apply=True
  g.get('/v3/catalog/trees')      # reads always pass
  g.write('POST', '/v3/catalog/trees/categories', [...])   # validated, printed, performed only on apply
"""
from __future__ import annotations

import datetime as _dt
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

LIVE_STORE_HASH = 'dsdbflh9ev'
TREE_ID = 3
TREE_NAME = 'EK Catalyst Live'
CHANNEL_ID = 1908757
LOG_PATH = os.path.join(os.path.dirname(__file__), '..', 'live', 'write-log.jsonl')


class GuardRefused(Exception):
    pass


def _load_env(path: str) -> dict:
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                env[k] = v.strip().strip('"').strip("'")
    return env


class Guard:
    def __init__(self, apply: bool = False, env_file: str = '.env.local'):
        env = _load_env(env_file)
        self.hash = env.get('BIGCOMMERCE_STORE_HASH')
        if self.hash != LIVE_STORE_HASH:
            raise GuardRefused(f'{env_file} points at store {self.hash!r}, expected {LIVE_STORE_HASH!r}')
        if str(env.get('BIGCOMMERCE_CHANNEL_ID')) != str(CHANNEL_ID):
            raise GuardRefused(f'{env_file} channel is {env.get("BIGCOMMERCE_CHANNEL_ID")!r}, expected {CHANNEL_ID}')
        self._token = env['CATALYST_ACCESS_TOKEN']
        self.apply = apply
        self.base = f'https://api.bigcommerce.com/stores/{self.hash}'
        self.tree_ids: set[int] = set()
        self._preflight()

    # ---- transport -------------------------------------------------------------------------
    def _req(self, method: str, path: str, body=None):
        req = urllib.request.Request(
            self.base + path,
            data=json.dumps(body).encode() if body is not None else None,
            method=method,
            headers={'X-Auth-Token': self._token, 'Accept': 'application/json',
                     'Content-Type': 'application/json'},
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                raw = r.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            raise RuntimeError(f'{method} {path} -> HTTP {e.code}: {e.read()[:600].decode()}') from None

    def get(self, path: str):
        return self._req('GET', path)

    def get_all(self, path: str, limit: int = 250):
        """Paginate a v3 list endpoint."""
        out, page = [], 1
        sep = '&' if '?' in path else '?'
        while True:
            d = self._req('GET', f'{path}{sep}limit={limit}&page={page}')
            out.extend(d.get('data', []))
            pg = d.get('meta', {}).get('pagination', {})
            if page >= pg.get('total_pages', 1):
                return out
            page += 1

    # ---- preflight ---------------------------------------------------------------------------
    def _preflight(self):
        trees = self.get('/v3/catalog/trees')['data']
        t = next((t for t in trees if t['id'] == TREE_ID), None)
        if not t or t['name'] != TREE_NAME or t['channels'] != [CHANNEL_ID]:
            raise GuardRefused(f'tree {TREE_ID} is not {TREE_NAME!r} on channel {CHANNEL_ID} only: {t}')
        self.refresh_tree_ids()

    def refresh_tree_ids(self):
        def walk(nodes):
            for n in nodes:
                self.tree_ids.add(int(n['id']))
                walk(n.get('children', []))
        walk(self.get(f'/v3/catalog/trees/{TREE_ID}/categories')['data'])

    # ---- validation --------------------------------------------------------------------------
    def _validate(self, method: str, path: str, body):
        p = urllib.parse.urlparse(path)
        route, qs = p.path, urllib.parse.parse_qs(p.query)

        if route == '/v3/catalog/trees/categories':
            if not isinstance(body, list) and method != 'DELETE':
                raise GuardRefused('trees/categories body must be a list')
            if method == 'POST':
                for c in body:
                    if int(c.get('tree_id', -1)) != TREE_ID:
                        raise GuardRefused(f'create outside tree {TREE_ID}: {c.get("name")}')
                    pid = int(c.get('parent_id', 0))
                    if pid != 0 and pid not in self.tree_ids:
                        raise GuardRefused(f'parent {pid} is not a tree-{TREE_ID} category ({c.get("name")})')
                return
            if method == 'PUT':
                for c in body:
                    cid = int(c['category_id'])
                    if cid not in self.tree_ids:
                        raise GuardRefused(f'update of category {cid} outside tree {TREE_ID}')
                    if 'tree_id' in c and int(c['tree_id']) != TREE_ID:
                        raise GuardRefused(f'category {cid}: tree_id change refused')
                    if 'parent_id' in c and int(c['parent_id']) not in self.tree_ids | {0}:
                        raise GuardRefused(f'category {cid}: parent outside tree {TREE_ID}')
                return
            if method == 'DELETE':
                ids = [int(x) for x in ','.join(qs.get('category_id:in', [])).split(',') if x]
                if not ids or any(i not in self.tree_ids for i in ids):
                    raise GuardRefused(f'delete must name only tree-{TREE_ID} ids, got {ids}')
                return

        m = re.fullmatch(r'/v3/catalog/categories/(\d+)/metafields(?:/(\d+))?', route)
        if m and method in ('POST', 'PUT', 'DELETE'):
            cid = int(m.group(1))
            if cid not in self.tree_ids:
                raise GuardRefused(f'metafield write on category {cid} outside tree {TREE_ID}')
            return

        if route == '/v3/catalog/products/channel-assignments' and method == 'PUT':
            for a in body:
                if int(a.get('channel_id', -1)) != CHANNEL_ID:
                    raise GuardRefused(f'channel assignment to {a.get("channel_id")} refused (only {CHANNEL_ID})')
            return

        m = re.fullmatch(r'/v3/catalog/products/(\d+)', route)
        if m and method == 'PUT':
            if set(body.keys()) != {'categories'}:
                raise GuardRefused(f'product {m.group(1)}: only "categories" may change, got {sorted(body)}')
            cur = set(self.get(f'{route}?include_fields=categories')['data']['categories'])
            new = set(int(x) for x in body['categories'])
            if not cur <= new:
                raise GuardRefused(f'product {m.group(1)}: would REMOVE categories {sorted(cur - new)}')
            if not (new - cur) <= self.tree_ids:
                raise GuardRefused(f'product {m.group(1)}: added categories outside tree {TREE_ID}: {sorted(new - cur - self.tree_ids)}')
            return

        raise GuardRefused(f'{method} {path} is not an allowed live-store write')

    # ---- the gate --------------------------------------------------------------------------
    def write(self, method: str, path: str, body=None):
        method = method.upper()
        if method == 'GET':
            return self.get(path)
        self._validate(method, path, body)
        summary = json.dumps(body)[:400] if body is not None else ''
        if not self.apply:
            print(f'  DRY-RUN  {method} {path}  {summary}')
            return None
        res = self._req(method, path, body)
        os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
        with open(LOG_PATH, 'a') as f:
            f.write(json.dumps({'at': _dt.datetime.now(_dt.timezone.utc).isoformat(), 'method': method,
                                'path': path, 'body': body, 'result_ids': _ids(res)}) + '\n')
        print(f'  APPLIED  {method} {path}  {summary}')
        return res


def _ids(res):
    d = res.get('data') if isinstance(res, dict) else None
    if isinstance(d, list):
        return [x.get('category_id', x.get('id')) for x in d if isinstance(x, dict)]
    if isinstance(d, dict):
        return [d.get('category_id', d.get('id'))]
    return None
