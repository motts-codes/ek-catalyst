#!/usr/bin/env python3
"""Give each Prism collection its own default finish (spec.info.default_color_id).

The default finish is the colour a Prism collection page opens on and the photo its card shows
on the Assembled listing. The import left most of them on Midnight, so the listing showed seven
near-identical dark kitchens; this spreads them across the palette so the row reads as a range.

    python3 scripts/set-prism-default-colors.py            # dry run
    python3 scripts/set-prism-default-colors.py --apply    # write

Needs BIGCOMMERCE_STORE_HASH / CATALYST_ACCESS_TOKEN (env or .env.local). Skips a collection
whose chosen colour is not among its colours or has no kitchen photo for it.
"""
import json
import os
import sys
import urllib.request

CABINETS_PARENT = 863
API_ROOT = "https://api.bigcommerce.com/stores/{hash}/v3"

# Collection name → default finish (colour master-list name).
DEFAULTS = {
    "Prism Avon": "Charcoal",
    "Prism Beacon Hill": "Chantilly",
    "Prism Cambridge": "Forest",
    "Prism Derry": "Lakehouse",
    "Prism Edinburgh": "Hurricane",
    "Prism Lexington": "Cappuccino",
    "Prism Mero": "Midnight",
}


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
    def __init__(self, hash_, token):
        self.base = API_ROOT.format(hash=hash_)
        self.h = {"X-Auth-Token": token, "Content-Type": "application/json", "Accept": "application/json"}

    def _req(self, method, path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(self.base + path, data=data, headers=self.h, method=method)
        with urllib.request.urlopen(req) as r:
            t = r.read()
            return json.loads(t) if t else {}

    def get(self, path):
        return self._req("GET", path)

    def put(self, path, body):
        return self._req("PUT", path, body)


def main():
    apply = "--apply" in sys.argv
    client = Client(*load_env())

    root = client.get(f"/catalog/categories/{CABINETS_PARENT}/metafields?limit=250")["data"]
    colors_raw = next((m["value"] for m in root if m["namespace"] == "attributes" and m["key"] == "colors"), "[]")
    color_id = {c["name"]: c["id"] for c in json.loads(colors_raw)}

    changed = 0
    for cat in client.get(f"/catalog/trees/categories?parent_id:in={CABINETS_PARENT}&limit=250")["data"]:
        wanted = DEFAULTS.get(cat["name"])
        if not wanted:
            continue
        mfs = client.get(f"/catalog/categories/{cat['category_id']}/metafields?limit=250")["data"]
        spec_mf = next((m for m in mfs if m["namespace"] == "spec" and m["key"] == "info"), None)
        finishes = next((json.loads(m["value"]) for m in mfs if m["namespace"] == "finishes" and m["key"] == "by_finish"), {})
        cid = color_id.get(wanted)
        if not spec_mf or not cid:
            print(f"  ! {cat['name']}: no spec or unknown colour {wanted!r}")
            continue
        spec = json.loads(spec_mf["value"])
        if cid not in spec.get("color_ids", []):
            print(f"  ! {cat['name']}: {wanted} is not one of its colours")
            continue
        if not (finishes.get(wanted) or {}).get("kitchen_image"):
            print(f"  ! {cat['name']}: {wanted} has no kitchen photo")
            continue
        if spec.get("default_color_id") == cid:
            print(f"  = {cat['name']}: already {wanted}")
            continue
        spec["default_color_id"] = cid
        print(f"  → {cat['name']}: default finish {wanted}")
        changed += 1
        if apply:
            client.put(f"/catalog/categories/{cat['category_id']}/metafields/{spec_mf['id']}", {"value": json.dumps(spec)})

    print(f"\n{changed} collection(s) {'updated' if apply else 'to update'}." + ("" if apply else " Re-run with --apply."))


if __name__ == "__main__":
    main()
