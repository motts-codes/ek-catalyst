#!/usr/bin/env python3
"""
Cabinets pilot — the ORIGINAL bootstrap seeder (category basics + PRODUCT metafields).

Relationship to scripts/seed-cabinet-metafields.py:
  - THIS script covers what the newer seeder does NOT: it looks collections up BY NAME
    (Avon/Dover) via the category tree, and it seeds PRODUCT-level metafields —
    merch.program_sibling (RTA<->Assembled twin for the PDP toggle) and pdp.features.
    It carries the real Laravel-harvested spec-sheet URLs and pricing for the pilot.
  - seed-cabinet-metafields.py is the newer, id-parameterized CATEGORY seeder for the
    attribute master-lists, per-collection FAQ, content (overview/spec/disclaimer) and
    gallery — the fields added after this pilot. Prefer it for those.
  - Together they cover the full metafield surface. See docs/CABINET-METAFIELDS.md for the
    schema and docs/CABINET-REPLICATION.md for the live-channel rebuild order.

  For a live rebuild, the collection NAMES (Avon/Dover) and the LARAVEL data below are
  sandbox/pilot-specific — edit them for the live catalog, or author in /cabinet-admin.

PATCHED for this store:
  - Credentials are read from .env.local at runtime (BIGCOMMERCE_STORE_HASH +
    CATALYST_ACCESS_TOKEN), not hardcoded.
  - Category lookup uses /catalog/trees/categories (the flat /catalog/categories
    endpoint is deprecated on this store and returns 0). Uses `category_id`.
Everything else is unchanged from the original.

Run AFTER:
  1. Creating two categories in the sandbox admin, named exactly: Avon, Dover   [done: 864 / 865]
  2. Importing EK-Sandbox-Cabinets-AvonDover.csv (products + variants)          [done]

What it does:
  A. Category metafields on Avon + Dover:
       pricing_10x10.pricing   {"rta": {...}, "assembled": {...}}
       merch.info              {line, door_style, default_finish}
       fulfillment.delivery    {"rta": "2 Weeks", "assembled": "3 Weeks"}
       assets.spec_sheets      {"rta": url, "assembled": url}
       sample.order_sample     {product_id, price}
  B. Product metafields:
       merch.program_sibling   on every RTA/Assembled parent pair
       pdp.features            demo 3x2 tiles on the two Wall Cabinet parents
All values write with permission_set write_and_sf_access so Catalyst can read
them via GraphQL. Uses only urllib — no packages needed.
"""
import json, os, urllib.request, urllib.parse


# ---- credentials from .env.local (patched: no hardcoded secrets) ----
def load_env(path):
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


# .env.local lives at the repo root (one level up from scripts/); fall back to env vars.
_REPO_ENV = os.path.join(os.path.dirname(__file__), "..", ".env.local")
_ENV = load_env(_REPO_ENV) if os.path.exists(_REPO_ENV) else {}
STORE_HASH   = os.environ.get("BIGCOMMERCE_STORE_HASH") or _ENV.get("BIGCOMMERCE_STORE_HASH")
ACCESS_TOKEN = os.environ.get("CATALYST_ACCESS_TOKEN") or _ENV.get("CATALYST_ACCESS_TOKEN")
if not STORE_HASH or not ACCESS_TOKEN:
    raise SystemExit("Missing BIGCOMMERCE_STORE_HASH / CATALYST_ACCESS_TOKEN (env or repo .env.local).")

BASE = f"https://api.bigcommerce.com/stores/{STORE_HASH}/v3"
HDRS = {"X-Auth-Token": ACCESS_TOKEN, "Content-Type": "application/json",
        "Accept": "application/json"}

def call(method, path, body=None):
    req = urllib.request.Request(BASE + path, method=method, headers=HDRS,
                                 data=json.dumps(body).encode() if body else None)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read() or "{}")
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:300]
        raise RuntimeError(f"{method} {path} -> HTTP {e.code}: {detail}")

# ---------------- Laravel-harvested data (Avon + Dover, both programs) ----------------
LARAVEL = {
 "Avon": {
  "rta":       {"price": "2992.77", "strike_price": "3494.19", "emi_text": "As Low As $46.16/Month",
                "delivery_time": "2 Weeks",
                "spec_sheet_url": "https://store-dsdbflh9ev.mybigcommerce.com/product_images/Product%20Images%20Bigcommerce/Specsheet/Avon_RTA.pdf"},
  "assembled": {"price": "3289.55", "strike_price": "3840.69", "emi_text": "As Low As $50.73/Month",
                "delivery_time": "3 Weeks",
                "spec_sheet_url": "https://store-dsdbflh9ev.mybigcommerce.com/product_images/Product%20Images%20Bigcommerce/EK%20Specsheet/Express%20Sell%20Sheet_2_21_Avon.pdf"},
  "merch": {"line": "Star", "door_style": "Shaker Full Overlay", "default_finish": "Painted White"},
  "sample": {"product_id": 61803, "price": "11.52"},
 },
 "Dover": {
  "rta":       {"price": "2734.10", "strike_price": "3192.18", "emi_text": "As Low As $42.17/Month",
                "delivery_time": "2 Weeks",
                "spec_sheet_url": "https://store-dsdbflh9ev.mybigcommerce.com/product_images/Product%20Images%20Bigcommerce/Specsheet/RTA%20Sell%20Sheet_3_21_Dover_Compressed.pdf"},
  "assembled": {"price": "3004.98", "strike_price": "3508.44", "emi_text": "As Low As $46.34/Month",
                "delivery_time": "3 Weeks",
                "spec_sheet_url": "https://store-dsdbflh9ev.mybigcommerce.com/product_images/Product%20Images%20Bigcommerce/EK%20Specsheet/Express%20Sell%20Sheet_3_21_Dover_Compressed.pdf"},
  "merch": {"line": "Star", "door_style": "Shaker Partial Overlay", "default_finish": "Caramel"},
  "sample": {"product_id": 61813, "price": "11.52"},
 },
}

FEATURE_TILES = [
  {"image": "", "title": "Soft-Close Everything",
   "text": "Six-way adjustable concealed hinges and undermount drawer glides with integrated soft close, standard on every cabinet."},
  {"image": "", "title": "Solid Birch Construction",
   "text": "Dovetail solid Birch drawer boxes and 1/2 in. plywood sides with natural Birch veneer, inside and out."},
  {"image": "", "title": "Adjustable Shelving",
   "text": "3/4 in. plywood shelves adjust to your storage, with metal shelf clips included."},
  {"image": "", "title": "Framed, Fully Finished",
   "text": "1-1/2 in. solid Birch face frame, doweled and glued, dadoed to receive the side panels."},
  {"image": "", "title": "10x10 Kitchen Pricing",
   "text": "Transparent whole-kitchen pricing: best price for 20 feet of cabinets in this style and finish."},
  {"image": "", "title": "Order a Door Sample",
   "text": "See the real finish before you commit - door samples ship for a few dollars, credited on your order."},
]

def upsert_meta(kind, entity_id, namespace, key, value, description=""):
    path = f"/catalog/{kind}/{entity_id}/metafields"
    existing = [m for m in call("GET", f"{path}?namespace={namespace}&key={key}").get("data", [])]
    body = {"namespace": namespace, "key": key, "value": json.dumps(value),
            "permission_set": "write_and_sf_access", "description": description}
    if existing:
        call("PUT", f"{path}/{existing[0]['id']}", body); return "updated"
    call("POST", path, body); return "created"

# ---------------- A. category metafields ----------------
# PATCHED: use the category tree endpoint (flat /catalog/categories returns 0 on this store),
# and key on `category_id`.
cats = {c["name"]: c["category_id"] for c in call("GET", "/catalog/trees/categories?limit=250").get("data", [])}
for coll, d in LARAVEL.items():
    cid = cats.get(coll)
    if not cid:
        print(f"CATEGORY NOT FOUND: '{coll}' — create it in the sandbox admin first"); continue
    r = upsert_meta("categories", cid, "pricing_10x10", "pricing",
        {"rta": {k: d["rta"][k] for k in ("price","strike_price","emi_text")},
         "assembled": {k: d["assembled"][k] for k in ("price","strike_price","emi_text")}},
        "10x10 kitchen pricing per program")
    upsert_meta("categories", cid, "merch", "info", d["merch"], "Line / door style / finish")
    upsert_meta("categories", cid, "fulfillment", "delivery",
        {"rta": d["rta"]["delivery_time"], "assembled": d["assembled"]["delivery_time"]},
        "Delivery promise per program")
    upsert_meta("categories", cid, "assets", "spec_sheets",
        {"rta": d["rta"]["spec_sheet_url"], "assembled": d["assembled"]["spec_sheet_url"]},
        "Sell-sheet PDFs")
    upsert_meta("categories", cid, "sample", "order_sample", d["sample"],
        "Door sample product (LIVE-store id — replace with sandbox sample product if testing add-to-cart)")
    print(f"category '{coll}' (id {cid}): metafields {r}")

# ---------------- B. product metafields ----------------
products = {}
page = 1
while True:
    resp = call("GET", f"/catalog/products?limit=250&page={page}&include_fields=name")
    for p in resp.get("data", []):
        if p["name"].startswith(("Avon ", "Dover ")):
            products[p["name"]] = p["id"]
    if page >= resp.get("meta", {}).get("pagination", {}).get("total_pages", 1): break
    page += 1
print(f"pilot products found: {len(products)}")

# sibling links: match 'X RTA ...' <-> 'X Assembled ...'
linked = 0
for name, pid in products.items():
    if " RTA " in name:
        sib = name.replace(" RTA ", " Assembled ")
    elif " Assembled " in name:
        sib = name.replace(" Assembled ", " RTA ")
    else:
        continue
    sid = products.get(sib)
    if sid:
        upsert_meta("products", pid, "merch", "program_sibling",
                    {"product_id": sid, "name": sib}, "Other-program twin for PDP toggle")
        linked += 1
print(f"sibling links written: {linked}")

# demo feature tiles on the Wall Cabinet parents
tiles = 0
for coll in ("Avon", "Dover"):
    for prog in ("Assembled", "RTA"):
        fin = LARAVEL[coll]["merch"]["default_finish"]
        name = f"{coll} {prog} Wall Cabinet in {fin}"
        pid = products.get(name)
        if pid:
            upsert_meta("products", pid, "pdp", "features",
                        {"layout": "3x2", "features": FEATURE_TILES}, "PDP feature tiles")
            print(f"features tiles: {name}")
            tiles += 1
print(f"feature-tile products written: {tiles}")

print("\nDone. Catalyst GraphQL: category(entityId).metafields(namespace:...) and "
      "product.metafields(namespace: \"merch\"/\"pdp\").")
