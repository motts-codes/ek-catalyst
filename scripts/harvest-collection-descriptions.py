#!/usr/bin/env python3
"""Fill each cabinet collection's `content.overview` from the live site's collection description.

The Laravel harvest never captured the collection copy ("For clean lines, select this shaker flat
recessed center panel door…"). The live collection pages carry it as the og:description meta tag
(and in the page body), so this fetches that per collection and stores it as a <p> in the
`content.overview` metafield — the field the storefront's collection header renders.

Matching: sandbox collection name -> Laravel record (same rules + --alias as
import-laravel-collections.py); the record's `_shop_now_url` is the live page.

    python scripts/harvest-collection-descriptions.py --file "$H/laravel_category_details.json" --dry-run
    python scripts/harvest-collection-descriptions.py --file ... --alias "Derry Stratus=Derry" ...
    python scripts/harvest-collection-descriptions.py --file ... --category 915 --force   # overwrite

Writes only where `content.overview` is empty unless --force. Reads BIGCOMMERCE_STORE_HASH +
CATALYST_ACCESS_TOKEN from .env.local.
"""

import argparse
import html
import importlib.util
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))

# Reuse the importer's env loading, API client, and name matching.
_spec = importlib.util.spec_from_file_location(
    "import_laravel_collections", os.path.join(HERE, "import-laravel-collections.py")
)
_importer = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_importer)


def fetch_description(url):
    """The og:description of a live collection page, lightly tidied; '' when absent."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (EK harvest)"})
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            page = r.read().decode("utf-8", "ignore")
    except Exception as e:  # noqa: BLE001 — report and move on
        print(f"    !! {url} -> {e}")
        return ""
    m = re.search(r'<meta\s+(?:name|property)="og:description"\s+content="([^"]*)"', page)
    if not m:
        return ""
    text = html.unescape(m.group(1)).strip()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([.,])", r"\1", text)          # "Avon ." -> "Avon."
    text = re.sub(r"\.(?=[A-Z])", ". ", text)          # "door.Simple" -> "door. Simple"
    return text


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--file", required=True, help="laravel_category_details.json")
    p.add_argument("--category", type=int, action="append", default=[])
    p.add_argument("--alias", action="append", default=[], metavar="SANDBOX=LARAVEL")
    p.add_argument("--force", action="store_true", help="overwrite a non-empty overview")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    aliases = {}
    for a in args.alias:
        k, v = a.split("=", 1)
        aliases[k.strip().lower()] = v.strip().lower()

    hash_, token = _importer.load_env()
    client = _importer.Client(hash_, token, dry_run=args.dry_run)
    laravel = json.load(open(args.file))

    # Laravel records by base name; prefer the Assembled record's page, else RTA's.
    by_base = {}
    for rec in laravel.values():
        if isinstance(rec, dict) and rec.get("_card_name"):
            by_base.setdefault(_importer.base_name(rec["_card_name"]), []).append(rec)

    collections = client.cabinet_collections()
    if args.category:
        collections = [(cid, n) for cid, n in collections if cid in args.category]
    print(f"{len(collections)} sandbox collection(s)")

    for cid, name in collections:
        bn = aliases.get(name.strip().lower(), name.strip().lower())
        recs = by_base.get(bn, [])
        recs = sorted(recs, key=lambda r: 0 if str(r.get("_type")) == "2" else 1)
        url = next((r.get("_shop_now_url") or r.get("shop_now_url") for r in recs
                    if r.get("_shop_now_url") or r.get("shop_now_url")), None)
        if not url:
            print(f"- {name} ({cid}): no Laravel page URL, skipped")
            continue

        existing = next((m["value"] for m in client.list_metafields("categories", cid)
                         if m["namespace"] == "content" and m["key"] == "overview"), "")
        if existing.strip() and not args.force:
            print(f"- {name} ({cid}): overview already set, skipped")
            continue

        text = fetch_description(url)
        if not text:
            print(f"- {name} ({cid}): no og:description on {url}")
            continue

        print(f"+ {name} ({cid}): {text[:90]}…")
        client.upsert("categories", cid, "content", "overview", f"<p>{html.escape(text, quote=False)}</p>")

    print("\nDone.")


if __name__ == "__main__":
    main()
