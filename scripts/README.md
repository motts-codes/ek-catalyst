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
