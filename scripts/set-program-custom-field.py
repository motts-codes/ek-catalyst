#!/usr/bin/env python3
"""Set the `Program` product CUSTOM FIELD on cabinet products, derived from the product name.

This is the DATA half of the "Program" faceted-search filter (see docs/CABINET-FACETS.md). Custom
fields are what BigCommerce faceted search filters on — distinct from metafields. After running this,
enable "Program" as a Faceted Search filter in the BC control panel, and the cabinet collection grid
will filter by ?program= server-side (the code wiring is already in place; it's inert until then).

Rules (derived from the product name):
  - name contains " RTA "        -> Program = RTA
  - name contains " Assembled "  -> Program = Assembled
  - neither (accessories: moldings, panels, fillers, samples, etc.) -> BOTH RTA and Assembled,
    so the accessory appears under both program listings.

Idempotent: updates the existing Program custom field(s) if present, else creates them. For "both",
it ensures one RTA and one Assembled value exist. Credentials from .env.local or env.

Usage:
    python scripts/set-program-custom-field.py                 # all cabinet products (children of 863)
    python scripts/set-program-custom-field.py --category 864  # only products in one collection
    python scripts/set-program-custom-field.py --dry-run       # print what would change, write nothing
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

API_ROOT = "https://api.bigcommerce.com/stores/{hash}/v3"
FIELD_NAME = "Program"


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
        sys.exit("Missing BIGCOMMERCE_STORE_HASH / CATALYST_ACCESS_TOKEN (env or .env.local).")
    return hash_, token


class Client:
    def __init__(self, hash_, token, dry_run=False):
        self.base = API_ROOT.format(hash=hash_)
        self.headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        self.dry_run = dry_run

    def _req(self, method, path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(self.base + path, data=data, headers=self.headers, method=method)
        with urllib.request.urlopen(req) as resp:
            text = resp.read()

            return json.loads(text) if text else {}

    def cabinet_product_ids(self, category_id=None):
        """All product ids in the cabinet categories (children of 863), or one collection."""
        if category_id is None:
            # children of the Cabinets parent (863)
            tree = self._req("GET", "/catalog/trees/categories?limit=250").get("data", [])
            cat_ids = [c["category_id"] for c in tree if c.get("parent_id") == 863]
        else:
            cat_ids = [category_id]

        ids = {}  # id -> name
        for cid in cat_ids:
            page = 1
            while True:
                resp = self._req(
                    "GET",
                    f"/catalog/products?categories:in={cid}&limit=250&page={page}"
                    "&include_fields=name",
                )
                for p in resp.get("data", []):
                    ids[p["id"]] = p["name"]
                pag = resp.get("meta", {}).get("pagination", {})
                if page >= pag.get("total_pages", 1):
                    break
                page += 1

        return ids

    def programs_for(self, name):
        """The Program value(s) a product should have, from its name."""
        if " RTA " in f" {name} ":
            return ["RTA"]
        if " Assembled " in f" {name} ":
            return ["Assembled"]

        return ["RTA", "Assembled"]  # accessory -> both

    def set_program(self, product_id, name):
        want = self.programs_for(name)
        existing = [
            cf
            for cf in self._req("GET", f"/catalog/products/{product_id}/custom-fields").get(
                "data", []
            )
            if cf.get("name") == FIELD_NAME
        ]
        have = {cf["value"] for cf in existing}

        if self.dry_run:
            print(f"  [dry-run] {product_id} {name[:50]!r}: have {sorted(have)} -> want {want}")

            return

        # Create any missing values.
        for value in want:
            if value not in have:
                self._req(
                    "POST",
                    f"/catalog/products/{product_id}/custom-fields",
                    {"name": FIELD_NAME, "value": value},
                )
        # Remove stray Program values not in `want` (keeps the field consistent on re-runs).
        for cf in existing:
            if cf["value"] not in want:
                self._req("DELETE", f"/catalog/products/{product_id}/custom-fields/{cf['id']}")

        print(f"  {product_id}: Program = {', '.join(want)}  ({name[:45]})")


def main():
    p = argparse.ArgumentParser(description="Set the Program custom field on cabinet products.")
    p.add_argument("--category", type=int, help="Limit to one collection category id.")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    hash_, token = load_env()
    client = Client(hash_, token, dry_run=args.dry_run)

    products = client.cabinet_product_ids(args.category)
    print(f"{len(products)} cabinet products found. Setting Program custom field…")
    try:
        for pid, name in sorted(products.items()):
            client.set_program(pid, name)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:400]}")

    print("\nDone. Next: enable 'Program' as a Faceted Search filter in the BC control panel")
    print("(Settings -> Faceted Search). The grid code is already wired — see docs/CABINET-FACETS.md.")


if __name__ == "__main__":
    main()
