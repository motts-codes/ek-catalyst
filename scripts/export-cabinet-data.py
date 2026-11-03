#!/usr/bin/env python3
"""Export the cabinet feature's store data (read-only) so it can be re-seeded on another channel.

Dumps the Cabinets parent category, its collection categories, every category metafield, and the
products in those categories with their custom fields and product metafields.

Usage:
    python scripts/export-cabinet-data.py --env .env.sandbox.local --parent 863 --out scripts/exports/sandbox-cabinets.json
"""
import argparse, json, os, sys, time, urllib.parse, urllib.request

API = "https://api.bigcommerce.com/stores/{h}/v3"

def load_env(path):
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1); env[k] = v.strip().strip('"')
    return env

def get(hash_, token, path, params=None):
    url = API.format(h=hash_) + path
    if params: url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"X-Auth-Token": token, "Accept": "application/json"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 3: time.sleep(5); continue
            raise

def paged(hash_, token, path, params=None):
    params = dict(params or {}); params["limit"] = 250; page = 1; out = []
    while True:
        params["page"] = page
        res = get(hash_, token, path, params); out += res.get("data", [])
        pg = res.get("meta", {}).get("pagination", {})
        if page >= pg.get("total_pages", 1): return out
        page += 1

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--env", default=".env.local"); ap.add_argument("--parent", type=int, required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    env = load_env(a.env); h, t = env["BIGCOMMERCE_STORE_HASH"], env["CATALYST_ACCESS_TOKEN"]
    print("store", h, "parent", a.parent)
    # Collections can sit in a non-default category tree, so walk the trees endpoint, then pull
    # each category's full record (description, url, image, seo) individually.
    tree_nodes = [n for n in paged(h, t, "/catalog/trees/categories", {"category_id:in": str(a.parent)})]
    tree_nodes += paged(h, t, "/catalog/trees/categories", {"parent_id:in": str(a.parent)})
    cats = []
    for n in tree_nodes:
        rec = get(h, t, f"/catalog/categories/{n['category_id']}")["data"]
        rec["tree_id"] = n.get("tree_id"); rec["parent_id"] = n.get("parent_id"); cats.append(rec)
    print("categories:", len(cats), [c["name"] for c in cats])
    for c in cats:
        c["metafields"] = paged(h, t, f"/catalog/categories/{c['id']}/metafields")
        print(f"  {c['id']} {c['name']}: {len(c['metafields'])} metafields")
    ids = ",".join(str(c["id"]) for c in cats)
    products = paged(h, t, "/catalog/products", {"categories:in": ids, "include": "custom_fields,images,variants", "include_fields": "name,sku,price,categories,custom_fields,is_visible,description,page_title,meta_description,images,variants,brand_id,sort_order,availability,inventory_level"})
    print("products:", len(products))
    for i, p in enumerate(products):
        p["metafields"] = paged(h, t, f"/catalog/products/{p['id']}/metafields")
        if i % 25 == 0: print(f"  product metafields {i}/{len(products)}")
    out = {"exported_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "store_hash": h, "parent_id": a.parent, "categories": cats, "products": products}
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w") as f: json.dump(out, f, indent=1)
    print("wrote", a.out, os.path.getsize(a.out) // 1024, "KB")

if __name__ == "__main__": main()
