#!/usr/bin/env python3
"""Download every door and kitchen photo the cabinet collection pages use.

Reads each child of 863: media.door_image / media.kitchen_image (the collection's own pair) and
finishes.by_finish[<finish>].door_image / kitchen_image (per finish, Prism), falling back to the
older gallery convention (media.images first = door, last = kitchen). Saves them as

    <out>/<collection-slug>/<collection-slug>[-<finish-slug>]-<door|kitchen>.<ext>

plus <out>/index.csv (collection, finish, kind, filename, source url) so new photos can be
matched back one for one.

    python3 scripts/download-collection-images.py                 # → ~/Downloads/ek-collection-images
    python3 scripts/download-collection-images.py --out <dir>

Needs BIGCOMMERCE_STORE_HASH / CATALYST_ACCESS_TOKEN (env or .env.local).
"""
import csv
import json
import os
import re
import sys
import urllib.parse
import urllib.request

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


def get(base, token, path):
    req = urllib.request.Request(base + path, headers={"X-Auth-Token": token, "Accept": "application/json"})
    return json.load(urllib.request.urlopen(req))


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def ext_of(url):
    path = urllib.parse.urlparse(url).path
    ext = os.path.splitext(path)[1].lower()
    return ext if ext in (".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif") else ".jpg"


def main():
    out = os.path.expanduser("~/Downloads/ek-collection-images")
    if "--out" in sys.argv:
        out = os.path.expanduser(sys.argv[sys.argv.index("--out") + 1])
    os.makedirs(out, exist_ok=True)

    hash_, token = load_env()
    base = API_ROOT.format(hash=hash_)
    cats = get(base, token, f"/catalog/trees/categories?parent_id:in={CABINETS_PARENT}&limit=250")["data"]

    rows = []
    for cat in sorted(cats, key=lambda c: c["name"]):
        cslug = slug(cat["name"])
        mfs = get(base, token, f"/catalog/categories/{cat['category_id']}/metafields?limit=250")["data"]
        value = lambda ns, key: next((m["value"] for m in mfs if m["namespace"] == ns and m["key"] == key), "")
        gallery = [u for u in (json.loads(value("media", "images") or "[]")) if u]
        named = value("media", "door_image") or value("media", "kitchen_image")
        wanted = []  # (finish, kind, url)
        door = value("media", "door_image") or (gallery[0] if gallery else "")
        kitchen = value("media", "kitchen_image") or ("" if named else (gallery[-1] if len(gallery) > 1 else ""))
        if door:
            wanted.append(("", "door", door))
        if kitchen and kitchen != door:
            wanted.append(("", "kitchen", kitchen))
        by_finish = json.loads(value("finishes", "by_finish") or "{}")
        for finish, entry in by_finish.items():
            images = [u for u in (entry.get("images") or []) if u]
            fdoor = entry.get("door_image") or (images[0] if images else "")
            fkitchen = entry.get("kitchen_image") or (images[1] if len(images) > 1 else "")
            if fdoor:
                wanted.append((finish, "door", fdoor))
            if fkitchen:
                wanted.append((finish, "kitchen", fkitchen))

        folder = os.path.join(out, cslug)
        os.makedirs(folder, exist_ok=True)
        for finish, kind, url in wanted:
            name = f"{cslug}{'-' + slug(finish) if finish else ''}-{kind}{ext_of(url)}"
            target = os.path.join(folder, name)
            if not os.path.exists(target):
                try:
                    urllib.request.urlretrieve(url, target)
                except Exception as e:  # noqa: BLE001 — report and carry on
                    print(f"  ! {cat['name']} {finish} {kind}: {e}")
                    continue
            rows.append((cat["name"], finish, kind, os.path.join(cslug, name), url))
        print(f"  {cat['name']}: {len(wanted)} image(s)")

    with open(os.path.join(out, "index.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["collection", "finish", "kind", "file", "source_url"])
        w.writerows(rows)
    print(f"\n{len(rows)} images in {out} (index.csv lists them).")


if __name__ == "__main__":
    main()
