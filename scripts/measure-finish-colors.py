#!/usr/bin/env python3
"""Give each per-finish (Prism) colour in the 863 master list a measured hex.

Prism colours have no swatch in the master list — the storefront draws their chips from the
finish's door photo. A hex is still useful: the storefront sorts a per-finish collection's chips
light → dark by it, and it stands in behind the photo while it loads.

For every child of 863 with `finishes.by_finish`, each finish's door photo (door_image, else
images[0]) is downloaded, its central panel sampled (median RGB of the middle 40% × 40%), and the
result written as `hex` on the matching colour (by name) in `attributes.colors` on 863.

    python3 scripts/measure-finish-colors.py            # dry run: prints name → hex, luminance
    python3 scripts/measure-finish-colors.py --apply    # writes the master list
    python3 scripts/measure-finish-colors.py --force    # re-measure colours that already have a hex

Needs Pillow (`pip3 install pillow`) and BIGCOMMERCE_STORE_HASH / CATALYST_ACCESS_TOKEN
(env or .env.local).
"""
import io
import json
import os
import statistics
import sys
import urllib.request

from PIL import Image

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


def metafields(client, cat_id):
    return client.get(f"/catalog/categories/{cat_id}/metafields?limit=250")["data"]


def find(mfs, namespace, key):
    return next((m for m in mfs if m["namespace"] == namespace and m["key"] == key), None)


def sample_hex(url):
    """Median colour of the central 40% × 40% of the image, as #rrggbb."""
    with urllib.request.urlopen(url) as r:
        img = Image.open(io.BytesIO(r.read())).convert("RGB")
    w, h = img.size
    box = (int(w * 0.3), int(h * 0.3), int(w * 0.7), int(h * 0.7))
    pixels = list(img.crop(box).getdata())
    r, g, b = (int(statistics.median(ch)) for ch in zip(*pixels))
    return f"#{r:02x}{g:02x}{b:02x}"


def luminance(hex_):
    r, g, b = (int(hex_[i : i + 2], 16) / 255 for i in (1, 3, 5))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def main():
    apply = "--apply" in sys.argv
    force = "--force" in sys.argv
    client = Client(*load_env())

    root = metafields(client, CABINETS_PARENT)
    colors_mf = find(root, "attributes", "colors")
    if not colors_mf:
        sys.exit("863 has no attributes.colors metafield.")
    colors = json.loads(colors_mf["value"])
    by_name = {c["name"].strip().lower(): c for c in colors}

    # Door photo per colour name, from the first per-finish collection that has one.
    photos = {}
    cats = client.get(f"/catalog/trees/categories?parent_id:in={CABINETS_PARENT}&limit=250")["data"]
    for cat in cats:
        mf = find(metafields(client, cat["category_id"]), "finishes", "by_finish")
        if not mf:
            continue
        for name, entry in json.loads(mf["value"]).items():
            images = [u for u in (entry.get("images") or []) if u]
            door = entry.get("door_image") or (images[0] if images else "")
            if door:
                photos.setdefault(name.strip().lower(), door)

    changed = 0
    for key, url in photos.items():
        color = by_name.get(key)
        if not color:
            print(f"  ! no master-list colour named {key!r}")
            continue
        if color.get("hex") and not force:
            print(f"  = {color['name']:<18} {color['hex']}  (kept)")
            continue
        hex_ = sample_hex(url)
        color["hex"] = hex_
        changed += 1
        print(f"  → {color['name']:<18} {hex_}  luminance {luminance(hex_):.2f}")

    print(f"\n{changed} colour(s) measured.")
    if apply and changed:
        client.put(
            f"/catalog/categories/{CABINETS_PARENT}/metafields/{colors_mf['id']}",
            {"value": json.dumps(colors)},
        )
        print("Written to 863 attributes.colors.")
    elif changed:
        print("Dry run — re-run with --apply to write.")


if __name__ == "__main__":
    main()
