# Cabinet feature — live-channel replication runbook

How to rebuild the entire cabinet feature (storefront pages + admin panel + metafield data) on the
**live BigCommerce channel**, after it was prototyped in the sandbox.

Read alongside [CABINET-METAFIELDS.md](CABINET-METAFIELDS.md) (field schema) and
[CABINET-FACETS.md](CABINET-FACETS.md) (search-facet setup).

The code ships as-is; the work is **data + configuration + one code constant**. Do the steps in order.

---

## 0. What "replicate" means here

The cabinet feature is three layers:

1. **Code** — already in the repo (storefront sections under `vibes/soul/sections/cabinet-*`, data
   in `lib/cabinets/*`, admin under `app/cabinet-admin/*` + `lib/cabinet-admin/*`). Deploying the app
   to the live channel brings all of it. Only **one constant** needs changing (step 2).
2. **Category structure** — a "Cabinets" parent category with child collection categories (Avon,
   Dover, …), on the live channel's category tree.
3. **Metafields** — the per-category data (pricing, attributes, FAQ, content, gallery…). Seed with
   the script (step 4) and/or author in the admin panel.

---

## 1. Prerequisites on the live store

- **Store hash + Storefront token + management token** for the live store.
  - `CATALYST_ACCESS_TOKEN` doubles as the management token (X-Auth-Token) — it does read **and**
    write against `/v3/catalog/...`.
- **Category tree** for the live channel containing:
  - a **Cabinets** parent category, and
  - child **collection** categories (Avon, Dover, …) under it.
  - Note their **category ids** — you'll need the Cabinets parent id for step 2 and all ids for
    step 4.
- Products assigned to the collection categories **and to the live channel** (channel assignment is a
  silent gotcha — see [BIGCOMMERCE-SETUP.md](BIGCOMMERCE-SETUP.md)).

---

## 2. The ONE code change: the Cabinets parent category id

The sandbox hardcodes the Cabinets parent as **863**. On the live channel it is different.

Change it in **one** place:

- [lib/cabinets/cabinet-lines-data.ts](../lib/cabinets/cabinet-lines-data.ts) — `export const
  CABINETS_CATEGORY_ID = 863;` → the live id.

That constant is re-exported/imported everywhere else, including
[lib/cabinet-admin/collection-shape-const.ts](../lib/cabinet-admin/collection-shape-const.ts)
(`CABINETS_PARENT_CATEGORY_ID`). **Verify both constants match the live id** — they are defined
separately (to avoid a circular import) but must be the same number.

The collection ids (Avon/Dover) are **not** hardcoded — the app discovers them as children of the
Cabinets parent via `categoryTree`. So only the parent id matters in code.

The storefront routes (`/cabinets/assembled-cabinets`, `/cabinets/rta-cabinets`) are
static app routes and need no change. The collection detail pages resolve by URL like any category.

---

## 3. Environment variables (live)

Set these on the live deployment (all server-only — never `NEXT_PUBLIC_`):

| Var | Purpose |
|---|---|
| `BIGCOMMERCE_STORE_HASH` | Live store hash |
| `CATALYST_ACCESS_TOKEN` | Storefront **and** management token (read + write metafields) |
| `AUTH_SECRET` | Signs both shopper and admin sessions (already set for the app) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth web-client for the `/cabinet-admin` Google sign-in |
| `EK_ADMIN_EMAILS` | Comma-separated allowlist of staff emails allowed into `/cabinet-admin` |

**Google OAuth redirect URI** for the live domain must be added in the Google Cloud console:
`https://<live-domain>/api/admin-auth/callback/google` (Authorized redirect URIs), and the bare
domain under Authorized JavaScript origins. The admin auth instance uses basePath `/api/admin-auth`
and its own cookie `ek-admin.session-token` (separate from shopper login).

`/cabinet-admin` is already excluded from the proxy matcher in [proxy.ts](../proxy.ts) so it isn't
resolved as a BigCommerce entity — no change needed.

---

## 4. Seed the metafields

Use [scripts/seed-cabinet-metafields.py](../scripts/seed-cabinet-metafields.py). It is **idempotent**
(update-if-exists else create) and **parameterized by category id** — no hardcoded 863/864.

```bash
# Reads BIGCOMMERCE_STORE_HASH + CATALYST_ACCESS_TOKEN from .env.local (or env).
# 1) Seed the program-wide attribute master-lists + program FAQ on the Cabinets parent:
python scripts/seed-cabinet-metafields.py parent --category <cabinets-parent-id>

# 2) Seed one collection's fields (pricing, spec selections, faq, content, gallery):
python scripts/seed-cabinet-metafields.py collection --category <avon-id> --preset avon
```

> **Product-level metafields** (`merch.program_sibling` — the RTA↔Assembled twin used by the PDP
> toggle — and `pdp.features`) are seeded by the original bootstrap
> [scripts/cabinets_pilot.py](../scripts/cabinets_pilot.py), which looks collections up by name and
> carries the pilot's real data. Edit its `LARAVEL` block + collection names for the live catalog.
> See [scripts/README.md](../scripts/README.md) for which script covers what.

The script writes demo/example values — **replace them with real content**, or (recommended for a
live launch) seed only the *structure* and let the client author real values in the admin panel:

- **Attributes** tab → add the real Product Lines, Constructions, Colors.
- **Collections** tab → Edit each collection → pricing, spec selections, FAQ, Overview /
  Specifications / Disclaimer, gallery images.
- **Cabinet Assembly** tab → the program-wide FAQ.

Every field's namespace/key/shape is in [CABINET-METAFIELDS.md](CABINET-METAFIELDS.md). All writes use
`permission_set: "write_and_sf_access"` (required for Storefront read) — the script sets it.

---

## 5. Search facets (optional but recommended)

Program / Type / Door Style / Size / ADA filtering needs BigCommerce **search facets** configured in
the control panel — a data task, not code. See [CABINET-FACETS.md](CABINET-FACETS.md). Without the
**Program** facet, the collection grid can't be filtered by Assembled/RTA server-side (only the
header/pricing are program-aware via `?program=`).

---

## 6. Verify (live)

For each collection, load `/<collection-path>?program=assembled` and `?program=rta` and confirm:

- Header: gallery, Product Line · Construction, "Available Finishes" swatches, pricing, spec-sheet link.
- Overview HTML renders (formatted), **not** the native category description.
- Specifications section + Assembly videos + FAQ (program-specific) + Disclaimer footer.

And the shop pages `/cabinets/assembled-cabinets` + `/rta-cabinets`: collection cards + the
program-wide FAQ.

Admin: sign in at `/cabinet-admin` with an allowlisted Google account; confirm all four tabs
(Collections, Products, Attributes, Cabinet Assembly) load and a save round-trips (edits revalidate
the collection pages immediately).

---

## Quick reference — order of operations

1. Live category tree: Cabinets parent + collection children; note ids; assign products to channel.
2. Code: set `CABINETS_CATEGORY_ID` (and matching `CABINETS_PARENT_CATEGORY_ID`) to the live parent id.
3. Env vars + Google OAuth redirect URI for the live domain.
4. Seed metafields (script) or author in the admin panel.
5. (Optional) Configure search facets.
6. Deploy + verify.
