#!/usr/bin/env python3
"""
Create the storefront categories the site already links to, and seed each category's FAQ and
SEO copy (`faq.list`, `seo.content`).

  python scripts/seed-categories-and-faqs.py --dry-run
  python scripts/seed-categories-and-faqs.py

Idempotent: a category is matched by its URL path (created only if missing); the FAQ metafield
(namespace "faq", key "list") is updated in place if it exists. Reads BIGCOMMERCE_STORE_HASH +
CATALYST_ACCESS_TOKEN from the environment or .env.local.

Categories go into the channel's tree (the one whose `channels` includes BIGCOMMERCE_CHANNEL_ID),
so the storefront sees them straight away. The proxy (proxies/with-routes.ts) then routes each
URL to the category template, which reads `faq.list` and the per-path copy in
lib/category/category-content.ts.

FAQ text: docs/category-faqs-source.md (captured verbatim from expresskitchens.com, 10 Oct 2026).
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

API_ROOT = "https://api.bigcommerce.com/stores/{hash}/v3"


def load_env():
    env = {}
    try:
        with open(os.path.join(os.path.dirname(__file__), "..", ".env.local")) as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    env[k] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    get = lambda k: os.environ.get(k) or env.get(k)
    hash_, token, channel = get("BIGCOMMERCE_STORE_HASH"), get("CATALYST_ACCESS_TOKEN"), get("BIGCOMMERCE_CHANNEL_ID")
    if not (hash_ and token and channel):
        sys.exit("Missing BIGCOMMERCE_STORE_HASH / CATALYST_ACCESS_TOKEN / BIGCOMMERCE_CHANNEL_ID.")
    return hash_, token, int(channel)


class Client:
    def __init__(self, hash_, token, dry_run):
        self.base = API_ROOT.format(hash=hash_)
        self.headers = {"X-Auth-Token": token, "Content-Type": "application/json", "Accept": "application/json"}
        self.dry_run = dry_run

    def req(self, method, path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(self.base + path, data=data, headers=self.headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as e:
            sys.exit(f"{method} {path} -> {e.code}: {e.read().decode()[:500]}")

    def tree_for_channel(self, channel_id):
        for tree in self.req("GET", "/catalog/trees")["data"]:
            if channel_id in tree.get("channels", []):
                return tree["id"]
        sys.exit(f"No catalog tree is assigned to channel {channel_id}.")

    def categories(self, tree_id):
        out, page = [], 1
        while True:
            data = self.req("GET", f"/catalog/trees/categories?tree_id:in={tree_id}&limit=250&page={page}")["data"]
            out.extend(data)
            if len(data) < 250:
                return out
            page += 1

    def create_category(self, tree_id, parent_id, name, path, sort_order):
        body = {
            "tree_id": tree_id,
            "parent_id": parent_id,
            "name": name,
            "url": {"path": path, "is_customized": True},
            "is_visible": True,
            "sort_order": sort_order,
        }
        if self.dry_run:
            print(f"  [dry-run] create {path!r} ({name}) under {parent_id}")
            return None
        created = self.req("POST", "/catalog/trees/categories", [body])["data"][0]
        print(f"  created {path} -> id {created['category_id']}")
        return created["category_id"]

    def upsert_faq(self, category_id, headline, items):
        value = json.dumps({"headline": headline, "items": items}, ensure_ascii=False)
        if self.dry_run:
            print(f"  [dry-run] faq.list on {category_id}: {len(items)} items")
            return
        existing = [
            m for m in self.req("GET", f"/catalog/categories/{category_id}/metafields?namespace=faq&limit=250")["data"]
            if m["key"] == "list"
        ]
        url = f"/catalog/categories/{category_id}/metafields"
        if existing:
            self.req("PUT", f"{url}/{existing[0]['id']}", {"value": value})
            print(f"  updated faq.list on {category_id} ({len(items)} items)")
        else:
            self.req("POST", url, {"permission_set": "write_and_sf_access", "namespace": "faq", "key": "list", "value": value})
            print(f"  created faq.list on {category_id} ({len(items)} items)")


    def upsert_json(self, category_id, namespace, key, value, label):
        body = json.dumps(value, ensure_ascii=False)
        if self.dry_run:
            print(f"  [dry-run] {namespace}.{key} on {category_id}: {label}")
            return
        existing = [
            m for m in self.req("GET", f"/catalog/categories/{category_id}/metafields?namespace={namespace}&limit=250")["data"]
            if m["key"] == key
        ]
        url = f"/catalog/categories/{category_id}/metafields"
        if existing:
            self.req("PUT", f"{url}/{existing[0]['id']}", {"value": body})
            print(f"  updated {namespace}.{key} on {category_id} ({label})")
        else:
            self.req("POST", url, {"permission_set": "write_and_sf_access", "namespace": namespace, "key": key, "value": body})
            print(f"  created {namespace}.{key} on {category_id} ({label})")

    def upsert_program_faq(self, category_id, program, faq):
        existing = [
            m for m in self.req("GET", f"/catalog/categories/{category_id}/metafields?namespace=faq&limit=250")["data"]
            if m["key"] == "by_program"
        ]
        current = json.loads(existing[0]["value"]) if existing else {}
        current[program] = faq
        value = json.dumps(current, ensure_ascii=False)
        if self.dry_run:
            print(f"  [dry-run] faq.by_program.{program} on {category_id}: {len(faq['items'])} items")
            return
        url = f"/catalog/categories/{category_id}/metafields"
        if existing:
            self.req("PUT", f"{url}/{existing[0]['id']}", {"value": value})
        else:
            self.req("POST", url, {"permission_set": "write_and_sf_access", "namespace": "faq", "key": "by_program", "value": value})
        print(f"  faq.by_program.{program} on {category_id} ({len(faq['items'])} items)")


# ── Categories to ensure: (path, name, children[(path, name)]) ──────────────────────────────────
# Names match the tiles in lib/category/category-content.ts so each tile links to its category.
CATEGORIES = [
    ("/bath/", "Bath", [
        ("/bath/vanity-tops/", "Vanity Tops"),
        ("/bath/side-splashes/", "Side Splashes"),
        ("/bath/bathroom-sinks/", "Bathroom Sinks"),
        ("/bath/bathroom-faucets/", "Bathroom Faucets"),
        ("/bath/drains-accessories/", "Drains & Accessories"),
    ]),
    ("/sinks-faucets/", "Sinks & Faucets", [
        ("/sinks-faucets/kitchen-sinks/", "Kitchen Sinks"),
        ("/sinks-faucets/kitchen-faucets/", "Kitchen Faucets"),
        ("/sinks-faucets/accessories/", "Accessories"),
    ]),
    ("/cabinet-hardware/", "Cabinet Hardware", [
        ("/cabinet-hardware/handles-knobs/", "Handles & Knobs"),
        ("/cabinet-hardware/tiles/", "Tiles"),
        ("/cabinet-hardware/accessories/", "Accessories"),
    ]),
    ("/appliances/", "Appliances", [
        ("/appliances/fridges-freezers/", "Fridges & Freezers"),
        ("/appliances/ranges-cooktops/", "Ranges & Cooktops"),
        ("/appliances/dishwashers/", "Dishwashers"),
        ("/appliances/microwaves/", "Microwaves"),
        ("/appliances/wall-ovens/", "Wall Ovens"),
        ("/appliances/range-hoods/", "Range Hoods"),
        ("/appliances/washers-dryers/", "Washers & Dryers"),
        ("/appliances/garbage-disposals/", "Garbage Disposals"),
        ("/appliances/air-conditioning/", "Air Conditioning"),
        ("/appliances/accessories/", "Accessories"),
    ]),
]


def ensure_categories(client, tree_id):
    by_path = {c["url"]["path"]: c["category_id"] for c in client.categories(tree_id) if c.get("url")}
    for path, name, children in CATEGORIES:
        parent_id = by_path.get(path)
        if parent_id is None:
            parent_id = client.create_category(tree_id, 0, name, path, 0)
            by_path[path] = parent_id
        else:
            print(f"  exists {path} (id {parent_id})")
        for i, (child_path, child_name) in enumerate(children):
            if child_path in by_path:
                print(f"    exists {child_path} (id {by_path[child_path]})")
                continue
            if parent_id is None:
                print(f"    [dry-run] create {child_path!r} ({child_name}) under <new {path}>")
                continue
            by_path[child_path] = client.create_category(tree_id, parent_id, child_name, child_path, i)
    return by_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    hash_, token, channel = load_env()
    client = Client(hash_, token, args.dry_run)
    tree_id = client.tree_for_channel(channel)
    print(f"Channel {channel} -> catalog tree {tree_id}")

    print("Categories")
    by_path = ensure_categories(client, tree_id)

    print("FAQs")
    with open(os.path.join(os.path.dirname(__file__), "category-faqs.json")) as f:
        faqs = json.load(f)
    for path, faq in faqs.items():
        category_id = by_path.get(path)
        if category_id is None:
            print(f"  skip {path}: category not found")
            continue
        client.upsert_faq(category_id, faq["headline"], faq["items"])

    print("SEO content")
    with open(os.path.join(os.path.dirname(__file__), "category-seo.json")) as f:
        seo = json.load(f)
    for path, content in seo.items():
        category_id = by_path.get(path)
        if category_id is None:
            print(f"  skip {path}: category not found")
            continue
        client.upsert_json(category_id, "seo", "content", content, f"{len(content['blocks'])} blocks")

    # Cabinets keep their per-program FAQ (faq.by_program on the parent); only the RTA side is
    # replaced, the Assembled side is left as authored.
    cabinets_id = by_path.get("/cabinets/")
    if cabinets_id is not None:
        with open(os.path.join(os.path.dirname(__file__), "cabinet-rta-faq.json")) as f:
            rta = json.load(f)
        client.upsert_program_faq(cabinets_id, "rta", rta)


if __name__ == "__main__":
    main()
