"""Recreate the sandbox Cabinets tree (parent + collections) in the LIVE Catalyst tree (tree 3).

Source: scripts/exports/sandbox-cabinets-<date>.json (export-cabinet-data.py). Idempotent: a
category whose URL already exists in tree 3 is reused, not duplicated. Writes an old->new id map
to scripts/live/cabinet-id-map.json for the metafield loader.

  python scripts/live/create-cabinet-categories.py              # dry run (default)
  python scripts/live/create-cabinet-categories.py --apply      # create for real
"""
import argparse, ast, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from lib.bc_guard import Guard, TREE_ID  # noqa: E402

EXPORT = 'scripts/exports/sandbox-cabinets-2026-11-03.json'
ID_MAP = 'scripts/live/cabinet-id-map.json'
FIELDS = ('name', 'description', 'page_title', 'meta_description', 'search_keywords',
          'default_product_sort')


def lit(v):
    try:
        return ast.literal_eval(v) if isinstance(v, str) else v
    except Exception:
        return v


def flatten(nodes, out=None):
    out = out if out is not None else {}
    for n in nodes:
        out[n['url']] = n
        flatten(n.get('children', []), out)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--export', default=EXPORT)
    a = ap.parse_args()

    g = Guard(apply=a.apply)
    src = json.load(open(a.export))
    cats = src['categories']
    by_id = {int(c['id']): c for c in cats}
    parent_old = int(src['parent_id'])
    root = by_id[parent_old]
    kids = sorted((c for c in cats if int(c['parent_id']) == parent_old),
                  key=lambda c: (int(c['sort_order'] or 0), c['name']))
    assert len(kids) + 1 == len(cats), 'export has deeper nesting than parent+children'

    live_t3 = flatten(g.get(f'/v3/catalog/trees/{TREE_ID}/categories')['data'])
    live_t1 = flatten(g.get('/v3/catalog/trees/1/categories')['data'])  # read-only, collision info

    def url_of(c):
        return lit(c['custom_url'])['url']

    def payload(c, parent_id):
        body = {k: c.get(k) or '' for k in FIELDS}
        body.update(tree_id=TREE_ID, parent_id=parent_id, is_visible=str(c['is_visible']) == 'True',
                    sort_order=int(c['sort_order'] or 0), url={'path': url_of(c), 'is_customized': True})
        if c.get('image_url'):
            body['image_url'] = c['image_url']
        if not body['default_product_sort']:
            body.pop('default_product_sort')
        return body

    print(f"\nPLAN  ({'APPLY' if a.apply else 'DRY RUN'})  source={a.export}\n")
    print(f"{'action':8} {'old':>4} {'name':34} {'url':38} {'vis':3} {'sort':>4}  tree-1 same path?")
    rows = [(root, 0)] + [(c, None) for c in kids]
    plan = []
    for c, pid in rows:
        u = url_of(c)
        exists = live_t3.get(u)
        action = 'reuse' if exists else 'create'
        clash = 'yes (id %s)' % live_t1[u]['id'] if u in live_t1 else ''
        print(f"{action:8} {c['id']:>4} {c['name'][:34]:34} {u:38} {'Y' if str(c['is_visible'])=='True' else 'n':3} "
              f"{int(c['sort_order'] or 0):>4}  {clash}")
        plan.append((c, pid, exists))
    print(f"\n{len(plan)} categories: {sum(1 for _,_,e in plan if not e)} to create, "
          f"{sum(1 for _,_,e in plan if e)} already in tree {TREE_ID}.")

    id_map = {}
    # 1. parent
    c, _, exists = plan[0]
    if exists:
        id_map[parent_old] = int(exists['id'])
    else:
        res = g.write('POST', '/v3/catalog/trees/categories', [payload(c, 0)])
        id_map[parent_old] = int(res['data'][0]['category_id']) if res else None
    new_parent = id_map[parent_old]
    if a.apply:
        g.refresh_tree_ids()
    # 2. children in batches
    todo = [(c, exists) for c, _, exists in plan[1:]]
    for c, exists in todo:
        if exists:
            id_map[int(c['id'])] = int(exists['id'])
    batch = [c for c, exists in todo if not exists]
    for i in range(0, len(batch), 20):
        chunk = batch[i:i + 20]
        body = [payload(c, new_parent if new_parent else 0) for c in chunk]
        if not a.apply:
            # dry run: parent id unknown yet; show the payload shape with a placeholder parent
            for b in body:
                b['parent_id'] = f'<new Cabinets id>' if new_parent is None else new_parent
            print(f'  DRY-RUN  POST /v3/catalog/trees/categories  [{len(body)} items] e.g. '
                  + json.dumps(body[0])[:300] + '…')
            continue
        res = g.write('POST', '/v3/catalog/trees/categories', body)
        for c, r in zip(chunk, res['data']):
            id_map[int(c['id'])] = int(r['category_id'])

    if a.apply:
        os.makedirs(os.path.dirname(ID_MAP), exist_ok=True)
        json.dump({'parent_old': parent_old, 'parent_new': new_parent, 'map': id_map}, open(ID_MAP, 'w'), indent=1)
        print(f'\nid map written: {ID_MAP}  (Cabinets parent old {parent_old} -> new {new_parent})')
        print('NEXT: tick these categories in Customers > Customer Groups > Guest > Category Access;'
              ' set CABINETS_CATEGORY_ID / CABINETS_PARENT_CATEGORY_ID to', new_parent)
    else:
        print('\nNothing written. Re-run with --apply to create.')


if __name__ == '__main__':
    main()
