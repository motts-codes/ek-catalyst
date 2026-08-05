#!/usr/bin/env python3
"""Seed cabinet metafields on BigCommerce categories (idempotent, parameterized by category id).

Replaces the one-off inline scripts used during sandbox development. Use it to stand the cabinet
feature up on a new channel — see docs/CABINET-REPLICATION.md. Every field's namespace/key/shape is
documented in docs/CABINET-METAFIELDS.md.

Credentials come from .env.local (BIGCOMMERCE_STORE_HASH, CATALYST_ACCESS_TOKEN) or the environment.
All writes use permission_set="write_and_sf_access" so the Storefront GraphQL API can read them.

Usage:
    # Program-wide data on the Cabinets PARENT category (attribute master-lists + program FAQ):
    python scripts/seed-cabinet-metafields.py parent --category <cabinets-parent-id>

    # One COLLECTION's data (pricing, spec selections, faq, content, gallery):
    python scripts/seed-cabinet-metafields.py collection --category <collection-id> --preset avon

The seeded values are EXAMPLES. For a real launch, prefer seeding structure then authoring real
content in the /cabinet-admin panel. Pass --dry-run to print what would be written without writing.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
import uuid

API_ROOT = "https://api.bigcommerce.com/stores/{hash}/v3"


# ── credentials ───────────────────────────────────────────────────────────────────────────────────
def load_env():
    """Read hash + token from the environment, falling back to .env.local."""
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


# ── API ───────────────────────────────────────────────────────────────────────────────────────────
class Client:
    def __init__(self, hash_, token, dry_run=False):
        self.base = API_ROOT.format(hash=hash_)
        self.headers = {
            "X-Auth-Token": token,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        self.dry_run = dry_run

    def _req(self, method, url, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, headers=self.headers, method=method)
        with urllib.request.urlopen(req) as resp:
            return json.load(resp)

    def list_metafields(self, category_id):
        out, page = [], 1
        while True:
            url = f"{self.base}/catalog/categories/{category_id}/metafields?limit=250&page={page}"
            data = self._req("GET", url).get("data", [])
            out.extend(data)
            if len(data) < 250:
                return out
            page += 1

    def upsert(self, category_id, namespace, key, value):
        """Update the metafield if it exists (by namespace+key), else create it."""
        label = f"{namespace}.{key}"
        if self.dry_run:
            preview = value if len(value) < 80 else value[:77] + "..."
            print(f"  [dry-run] {label} = {preview}")
            return
        existing = [
            m for m in self.list_metafields(category_id)
            if m.get("namespace") == namespace and m.get("key") == key
        ]
        url = f"{self.base}/catalog/categories/{category_id}/metafields"
        if existing:
            self._req("PUT", f"{url}/{existing[0]['id']}", {"value": value})
            print(f"  updated {label}")
        else:
            self._req("POST", url, {
                "permission_set": "write_and_sf_access",
                "namespace": namespace,
                "key": key,
                "value": value,
            })
            print(f"  created {label}")


# ── PARENT (863-equivalent): attribute master-lists + program-wide FAQ ─────────────────────────────
def seed_parent(client, category_id):
    print(f"Seeding Cabinets PARENT category {category_id} (attributes + program FAQ)")

    # Stable ids so collections can reference them. Regenerated each run only if you re-seed; if
    # collections already reference ids, DON'T re-run this blindly (it will mint new ids). For a
    # fresh channel this is fine.
    product_lines = [{"id": str(uuid.uuid4()), "name": n} for n in ("Star", "Prism", "Euro Max", "Euro Value")]
    constructions = [{"id": str(uuid.uuid4()), "name": n} for n in ("Framed", "Frameless", "Slab")]
    colors = [
        {"id": str(uuid.uuid4()), "name": "Bisque", "hex": "#E3D9C6", "image": ""},
        {"id": str(uuid.uuid4()), "name": "Espresso", "hex": "#3B2417", "image": ""},
        {"id": str(uuid.uuid4()), "name": "White Shaker", "hex": "#F5F5F0", "image": ""},
    ]
    client.upsert(category_id, "attributes", "product_lines", json.dumps(product_lines))
    client.upsert(category_id, "attributes", "constructions", json.dumps(constructions))
    client.upsert(category_id, "attributes", "colors", json.dumps(colors))

    program_faq = {
        "assembled": {
            "headline": "Assembled Cabinets — FAQ",
            "items": [
                {"q": "Do assembled cabinets arrive fully built?",
                 "a": "Yes. They ship fully constructed with doors, drawers and soft-close hardware installed."},
            ],
        },
        "rta": {
            "headline": "RTA Cabinets — FAQ",
            "items": [
                {"q": "How hard are RTA cabinets to assemble?",
                 "a": "They use a tool-free cam-lock system — typically 15–20 minutes each."},
            ],
        },
    }
    client.upsert(category_id, "faq", "by_program", json.dumps(program_faq))
    print("Done. NOTE: attribute ids were generated fresh — set collections' spec.info to match, or")
    print("author selections in the admin panel (which reads these ids).")


# ── COLLECTION (864-equivalent): pricing, delivery, faq, content, gallery, etc. ────────────────────
PRESETS = {
    "avon": {"name": "Avon"},
    "dover": {"name": "Dover"},
    "generic": {"name": "Collection"},
}


def seed_collection(client, category_id, preset_key):
    preset = PRESETS.get(preset_key, PRESETS["generic"])
    name = preset["name"]
    print(f"Seeding COLLECTION category {category_id} ({name})")

    client.upsert(category_id, "pricing_10x10", "pricing", json.dumps({
        "assembled": {"price": "4999", "strike_price": "6499", "emi_text": "or $84/mo"},
        "rta": {"price": "3499", "strike_price": "4299", "emi_text": "or $59/mo"},
    }))
    client.upsert(category_id, "fulfillment", "delivery", json.dumps({
        "assembled": "Ships in 3 weeks", "rta": "Ships in 2 weeks",
    }))
    client.upsert(category_id, "assets", "spec_sheets", json.dumps({
        "assembled": "", "rta": "",
    }))
    client.upsert(category_id, "sample", "order_sample", json.dumps({"product_id": 0, "price": "35"}))

    # spec.info references the parent's attribute ids. Left EMPTY on purpose: set these in the admin
    # panel (Collections -> Edit) after the attributes exist, or fill ids in by hand.
    client.upsert(category_id, "spec", "info", json.dumps({
        "product_line_id": "", "construction_id": "", "color_ids": [], "default_color_id": "",
    }))

    client.upsert(category_id, "faq", "by_program", json.dumps({
        "assembled": {"headline": "Frequently Asked Questions",
                      "items": [{"q": f"Do assembled {name} cabinets arrive built?", "a": "Yes."}]},
        "rta": {"headline": "Frequently Asked Questions",
                "items": [{"q": f"What does RTA mean for {name}?", "a": "Ready to assemble — ships flat."}]},
    }))

    client.upsert(category_id, "assembly", "videos", json.dumps([
        {"name": "How to install a base cabinet", "url": ""},
    ]))

    # content.* are RAW HTML strings (not JSON).
    client.upsert(category_id, "content", "overview",
                  f"<p>The <b>{name}</b> collection pairs a classic door with modern soft-close hardware.</p>"
                  "<ul><li>All-plywood box</li><li>Soft-close doors &amp; drawers</li></ul>")
    client.upsert(category_id, "content", "specifications",
                  "<table><tr><th>Box</th><td>3/4\" plywood</td></tr>"
                  "<tr><th>Finish</th><td>Conversion varnish</td></tr></table>")
    client.upsert(category_id, "content", "disclaimer",
                  "<p>Colors are approximate; wood grain and tone vary. Specifications subject to change.</p>")

    # media.images — up to 5, [0] = main. Empty here; add real URLs in the admin panel.
    client.upsert(category_id, "media", "images", json.dumps([]))
    print("Done. Set spec.info selections + real content/images in /cabinet-admin.")


# ── CLI ─────────────────────────────────────────────────────────────────────────────────────────
def main():
    p = argparse.ArgumentParser(description="Seed cabinet metafields (idempotent).")
    sub = p.add_subparsers(dest="target", required=True)

    pp = sub.add_parser("parent", help="Seed the Cabinets parent (attributes + program FAQ).")
    pp.add_argument("--category", type=int, required=True, help="Cabinets parent category id.")
    pp.add_argument("--dry-run", action="store_true")

    cp = sub.add_parser("collection", help="Seed one collection category.")
    cp.add_argument("--category", type=int, required=True, help="Collection category id.")
    cp.add_argument("--preset", default="generic", choices=list(PRESETS), help="Naming preset.")
    cp.add_argument("--dry-run", action="store_true")

    args = p.parse_args()
    hash_, token = load_env()
    client = Client(hash_, token, dry_run=getattr(args, "dry_run", False))

    try:
        if args.target == "parent":
            seed_parent(client, args.category)
        else:
            seed_collection(client, args.category, args.preset)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:400]}")


if __name__ == "__main__":
    main()
