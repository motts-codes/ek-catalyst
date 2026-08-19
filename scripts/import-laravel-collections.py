#!/usr/bin/env python3
"""Import the real Laravel collection data into BigCommerce category metafields.

Source: a Laravel category-details JSON (keyed by laravel id; each record has _card_name, _type
("1"=RTA / "2"=Assembled), and the rich fields). This merges the RTA + Assembled records for each
collection and writes them to the matching sandbox category's metafields, in the exact shape the
storefront + admin read (see docs/CABINET-METAFIELDS.md).

Matching: sandbox collection name (child of Cabinets 863) -> Laravel record by EXACT base name
(strip " RTA"/" Assembled", lowercase, compare equal — so "PRISM AVON" does NOT match "AVON").

Per-program fields (merged from the two records): pricing (price/strike/emi), spec_sheet_url,
specification, assembly_instructions, shop_now_url.
Shared fields (same on both, taken from whichever record has them): images, short_description,
order_sample, colors, tags(->door style).

Colors: imported as NAME references into the 863 attribute master-list (hex/image left blank for
manual entry — Laravel's are null). See the --dry-run output before writing.

Usage:
    python scripts/import-laravel-collections.py --file /path/to/laravel_category_details.json --dry-run
    python scripts/import-laravel-collections.py --file /path/to/laravel_category_details.json
    python scripts/import-laravel-collections.py --file ... --only avon    # one collection
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
import uuid

CABINETS_PARENT = 863
API_ROOT = "https://api.bigcommerce.com/stores/{hash}/v3"


def load_env():
    hash_ = os.environ.get("BIGCOMMERCE_STORE_HASH")
    token = os.environ.get("CATALYST_ACCESS_TOKEN")
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    if (not hash_ or not token) and os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("BIGCOMMERCE_STORE_HASH=") and not hash_:
                    hash_ = line.split("=", 1)[1].strip().strip('"').strip("'")
                elif line.startswith("CATALYST_ACCESS_TOKEN=") and not token:
                    token = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not hash_ or not token:
        sys.exit("Missing BIGCOMMERCE_STORE_HASH / CATALYST_ACCESS_TOKEN.")
    return hash_, token


class Client:
    def __init__(self, hash_, token, dry_run=False):
        self.base = API_ROOT.format(hash=hash_)
        self.h = {"X-Auth-Token": token, "Content-Type": "application/json", "Accept": "application/json"}
        self.dry_run = dry_run

    def _req(self, method, path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(self.base + path, data=data, headers=self.h, method=method)
        with urllib.request.urlopen(req) as r:
            t = r.read()
            return json.loads(t) if t else {}

    def cabinet_collections(self):
        tree = self._req("GET", "/catalog/trees/categories?limit=250").get("data", [])
        return [(c["category_id"], c["name"]) for c in tree if c.get("parent_id") == CABINETS_PARENT]

    def list_metafields(self, entity, eid):
        return self._req("GET", f"/catalog/{entity}/{eid}/metafields?limit=250").get("data", [])

    def upsert(self, entity, eid, ns, key, value):
        label = f"{ns}.{key}"
        if self.dry_run:
            preview = value if len(value) < 70 else value[:67] + "..."
            print(f"    [dry-run] {entity} {eid} {label} = {preview}")
            return
        ex = [m for m in self.list_metafields(entity, eid) if m["namespace"] == ns and m["key"] == key]
        body = {"namespace": ns, "key": key, "value": value, "permission_set": "write_and_sf_access"}
        if ex:
            self._req("PUT", f"/catalog/{entity}/{eid}/metafields/{ex[0]['id']}", body)
        else:
            self._req("POST", f"/catalog/{entity}/{eid}/metafields", body)
        print(f"    wrote {label}")


def base_name(card):
    """'Avon RTA' -> 'avon', 'AVON' -> 'avon', 'PRISM AVON' -> 'prism avon'."""
    n = str(card or "").strip()
    for suffix in (" rta", " assembled"):
        if n.lower().endswith(suffix):
            n = n[: -len(suffix)]
    return n.strip().lower()


def normalize_videos(items):
    """Laravel assembly_instructions use .title; our shape uses .name."""
    out = []
    for it in items or []:
        name = (it.get("title") or it.get("name") or "").strip()
        url = (it.get("url") or "").strip()
        if name or url:
            out.append({"name": name, "url": url})
    return out


# ── attribute master-list (colors) upsert on 863 ────────────────────────────────────────────────
def sync_colors_to_master(client, color_names):
    """Ensure each color NAME exists in 863 attributes.colors; return {name: id}. hex/image blank."""
    mfs = client.list_metafields("categories", CABINETS_PARENT)
    raw = next((m["value"] for m in mfs if m["namespace"] == "attributes" and m["key"] == "colors"), "[]")
    try:
        colors = json.loads(raw) if raw else []
    except Exception:
        colors = []
    by_name = {c.get("name", "").strip().lower(): c for c in colors if isinstance(c, dict)}
    changed = False
    for name in color_names:
        key = name.strip().lower()
        if key and key not in by_name:
            new = {"id": str(uuid.uuid4()), "name": name.strip(), "hex": "", "image": ""}
            colors.append(new)
            by_name[key] = new
            changed = True
    if changed and not client.dry_run:
        client.upsert("categories", CABINETS_PARENT, "attributes", "colors", json.dumps(colors))
    elif changed:
        print(f"    [dry-run] would add colors to 863 master: {[n for n in color_names]}")
    return {c["name"].strip().lower(): c["id"] for c in colors if isinstance(c, dict) and c.get("id")}


# ── main import for one collection ──────────────────────────────────────────────────────────────
def import_collection(client, cat_id, cat_name, rta, asm, color_id_map):
    print(f"\n=== {cat_name} (category {cat_id}) — RTA={'yes' if rta else 'NO'} Assembled={'yes' if asm else 'NO'}")

    def g(rec, key, default=""):
        return (rec or {}).get(key, default)

    # pricing_10x10.pricing = { rta:{price,strike_price,emi_text}, assembled:{...} }
    def pricing(rec):
        return {
            "price": str(g(rec, "price", "")),
            "strike_price": str(g(rec, "discounted_price", "")),
            "emi_text": str(g(rec, "emi_text", "")),
        }

    client.upsert("categories", cat_id, "pricing_10x10", "pricing",
                  json.dumps({"rta": pricing(rta), "assembled": pricing(asm)}))

    # assets.spec_sheets = { rta, assembled }
    client.upsert("categories", cat_id, "assets", "spec_sheets",
                  json.dumps({"rta": g(rta, "specification_sheet_url"),
                              "assembled": g(asm, "specification_sheet_url")}))

    # assets.shop_now_url = { rta, assembled }
    client.upsert("categories", cat_id, "assets", "shop_now_url",
                  json.dumps({"rta": g(rta, "shop_now_url") or g(rta, "_shop_now_url"),
                              "assembled": g(asm, "shop_now_url") or g(asm, "_shop_now_url")}))

    # sample.order_sample (shared)
    src = rta or asm
    client.upsert("categories", cat_id, "sample", "order_sample",
                  json.dumps({"product_id": g(src, "order_sample_product_id", 0),
                              "price": str(g(src, "order_sample_price", ""))}))

    # content.short_description (shared, raw HTML)
    client.upsert("categories", cat_id, "content", "short_description", g(src, "short_description"))

    # content.spec_by_program = { rta, assembled } (raw HTML per program)
    client.upsert("categories", cat_id, "content", "spec_by_program",
                  json.dumps({"rta": g(rta, "specification"), "assembled": g(asm, "specification")}))

    # assembly.by_program = { rta:[{name,url}], assembled:[...] }
    client.upsert("categories", cat_id, "assembly", "by_program",
                  json.dumps({"rta": normalize_videos(g(rta, "assembly_instructions", [])),
                              "assembled": normalize_videos(g(asm, "assembly_instructions", []))}))

    # media.images (shared, up to 5)
    images = [u for u in (g(src, "images", []) or []) if isinstance(u, str) and u.strip()][:5]
    client.upsert("categories", cat_id, "media", "images", json.dumps(images))

    # merch.info — door_style from tags[0].name (Laravel treats door-style as a tag). line/finish
    # from whatever's known; kept as the legacy fallback (attribute selection supersedes on storefront).
    tags = g(src, "tags", []) or []
    door_style = tags[0]["name"] if tags and isinstance(tags[0], dict) else ""
    client.upsert("categories", cat_id, "merch", "info",
                  json.dumps({"line": "", "door_style": door_style, "default_finish": ""}))

    # spec.info — color references into the 863 master list (names only).
    colors = g(src, "colors", []) or []
    color_ids, default_color_id = [], ""
    for c in colors:
        nm = (c.get("name") or "").strip().lower()
        cid = color_id_map.get(nm)
        if cid:
            color_ids.append(cid)
            if c.get("is_default"):
                default_color_id = cid
    if color_ids and not default_color_id:
        default_color_id = color_ids[0]
    client.upsert("categories", cat_id, "spec", "info",
                  json.dumps({"product_line_id": "", "construction_id": "",
                              "color_ids": color_ids, "default_color_id": default_color_id}))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--file", required=True, help="laravel_category_details.json")
    p.add_argument("--only", help="only import the collection whose name matches this (case-insensitive)")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    hash_, token = load_env()
    client = Client(hash_, token, dry_run=args.dry_run)
    laravel = json.load(open(args.file))

    # index laravel records by (base_name, type)
    by_key = {}
    for rec in laravel.values():
        if not isinstance(rec, dict) or not rec.get("_card_name"):
            continue
        by_key[(base_name(rec["_card_name"]), str(rec.get("_type")))] = rec

    collections = client.cabinet_collections()
    if args.only:
        collections = [(cid, n) for cid, n in collections if args.only.lower() in n.lower()]
    print(f"{len(collections)} sandbox collection(s) to import.")

    # Pre-sync all colors that will be referenced into the 863 master list.
    color_names = set()
    for _, name in collections:
        bn = name.strip().lower()
        for rec in (by_key.get((bn, "1")), by_key.get((bn, "2"))):
            for c in (rec or {}).get("colors", []) or []:
                if c.get("name"):
                    color_names.add(c["name"].strip())
    color_id_map = sync_colors_to_master(client, sorted(color_names))

    try:
        for cid, name in collections:
            bn = name.strip().lower()
            rta = by_key.get((bn, "1"))
            asm = by_key.get((bn, "2"))
            if not rta and not asm:
                print(f"\n=== {name} (category {cid}) — NO Laravel match for base name '{bn}', skipping")
                continue
            import_collection(client, cid, name, rta, asm, color_id_map)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:400]}")

    print("\nDone.")


if __name__ == "__main__":
    main()
