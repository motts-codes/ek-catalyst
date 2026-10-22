# scripts/

Seed/migration scripts for the cabinet feature. Both read `BIGCOMMERCE_STORE_HASH` +
`CATALYST_ACCESS_TOKEN` from the repo `.env.local` (or the environment) and write metafields with
`permission_set: "write_and_sf_access"` (required for Storefront GraphQL read).

See [docs/CABINET-METAFIELDS.md](../docs/CABINET-METAFIELDS.md) for the field schema and
[docs/CABINET-REPLICATION.md](../docs/CABINET-REPLICATION.md) for the live-channel rebuild order.

| Script | Scope | Parameterized? |
|---|---|---|
| [seed-cabinet-metafields.py](seed-cabinet-metafields.py) | **Category** metafields (newer): attribute master-lists + program FAQ on the parent; pricing/delivery/spec/FAQ/content/gallery on a collection | Yes — `--category <id>`, idempotent, `--dry-run` |
| [cabinets_pilot.py](cabinets_pilot.py) | **Original bootstrap**: category basics **by name** (Avon/Dover) + **product** metafields (`merch.program_sibling`, `pdp.features`) with real pilot data | Partly — collections looked up by name; edit the `LARAVEL` block for a new catalog |
| [import-laravel-collections.py](import-laravel-collections.py) | Per-collection **real data** from the Laravel harvest → category metafields (pricing, delivery, spec sheets, specs, images, colours, sample link, product line / construction). Merges Prism's one-record-per-colour into one collection and writes `finishes.by_finish` (price + door photos per finish). `--fields <ns,…>` rewrites only those namespaces. | Yes — `--category <id>` (repeatable), `--only`, `--alias`, `--product-line`, `--construction`, `--fields`, `--dry-run` |
| [harvest-collection-descriptions.py](harvest-collection-descriptions.py) | Fills each collection's `content.overview` (the header copy) from the live site's collection page `og:description` — the harvest never captured it. Same name matching / `--alias` as the importer. | Yes — `--category <id>`, `--alias`, `--force`, `--dry-run`; writes only empty overviews unless `--force` |
| [create-cabinet-collections.py](create-cabinet-collections.py) | Creates the harvest's **collection categories** under Cabinets 863 (Star / Prism / Euro Max / Euro Value table inside; `/cabinets/<slug>/` URLs) and prints the matching `import-laravel-collections.py` command per collection. | Yes — idempotent by name, `--dry-run`, `--print-import-commands` |
| [finish-import.py](finish-import.py) | **Post-import finishing pass** for non-cabinet catalog imports (handles, tiles, accessories, sinks…): `brand_id` from the "Brand" custom field (creates missing brands), `__delivery` ("Ships Next Day" when the import's Shipping field says so, else "Ships in 2 days"), and Finish/Color options → swatch type with a hex per value (map inside the script). | Yes — `--category <ids…>` or `--id-min/--id-max [--only-categories]`, idempotent, `--dry-run` |
| [set-program-custom-field.py](set-program-custom-field.py) | Sets the **`Program` product CUSTOM FIELD** (Assembled/RTA, both for accessories) from each product's name — the data half of the Program faceted-search filter. Custom fields ≠ metafields. See [docs/CABINET-FACETS.md](../docs/CABINET-FACETS.md). | Yes — `--category <id>`, idempotent, `--dry-run` |

**Which to use when**
- New channel / fresh rebuild: run `seed-cabinet-metafields.py` for the category-level structure
  (parameterized by id), then author real values in `/cabinet-admin`. Use `cabinets_pilot.py` (with
  its `LARAVEL` block edited) if you also need the product-level `program_sibling` / `pdp.features`
  seeded in bulk rather than by hand.
- The two together cover the full metafield surface (category + product).

**Examples**
```bash
# category-level (newer seeder)
python scripts/seed-cabinet-metafields.py parent --category <cabinets-parent-id> --dry-run
python scripts/seed-cabinet-metafields.py collection --category <avon-id> --preset avon

# original bootstrap (category-by-name + product metafields) — edit LARAVEL/collection names first
python scripts/cabinets_pilot.py
```
