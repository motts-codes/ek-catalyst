# Cabinet collection facets — BigCommerce setup (for the Catalyst cabinet pages)

The Catalyst cabinet pages (`/cabinets/assembled-cabinets`, `/cabinets/rta-cabinets`, and
the collection detail pages `/cabinets/avon/`, `/cabinets/dover/`) can only *filter* products by a
dimension if that dimension is a **BigCommerce search facet**. Right now the cabinet categories only
expose **Brand** and **Price** as facets — so none of the Stencil-style filtering works yet.

This is a **BigCommerce-admin data task**, not a code change. Once the facets below exist, the
Catalyst faceted category page picks them up automatically (it already renders whatever facets the
Storefront API returns), and the header/grid can filter server-side with correct pagination.

## Why this is needed (the problem it fixes)

- **RTA vs Assembled** currently lives only in the **product name** ("Avon Assembled …" / "Avon RTA …").
  Filtering by name in the app fails: the Storefront faceted search paginates first (~12/page), so
  post-pagination name-filtering shows an incomplete grid (e.g. 2 of 82 Assembled products). A real
  **Program facet** filters before pagination — correct and complete.
- The Stencil page's **Filter by Type / Door Style / Size / ADA** browsing needs the same thing:
  those are product attributes that must be configured as facets.

## Facets to configure

Create these as **Product Filtering (faceted search) attributes** in the BigCommerce control panel
(Settings → these appear once products carry the attribute values and the facet is enabled for the
channel). For each, the products in the Avon/Dover collections must have the attribute set.

| Facet (display name) | Values | Source in current data | Notes |
|---|---|---|---|
| **Program** | `Assembled`, `RTA` | today embedded in the product NAME | The key one. Set this attribute on each product (Assembled vs RTA). Accessories (moldings, panels, fillers, samples) should get **both** values (or a third `Accessory` value shown under both) so they appear in both program listings. |
| **Product Type** | Wall, Base, Vanity, Tall, Molding, Panel, … | product name / a custom field | Stencil's "Filter by Type" (with per-type icons). |
| **Door Style** | Shaker Full Overlay, Shaker Partial Overlay, … | category `merch.door_style` metafield | Stencil's door-style sub-tabs. |
| **Cabinets Width** | 12, 15, 18, 24, 30, 36 … (in.) | the product `Width` option | Stencil's size dropdown. |
| **Cabinets Height** | 30, 34.5, 42, 84, 96 … (in.) | the product `Height` option | Stencil's size dropdown. |
| **Cabinets Depth** | 12, 21, 24 … (in.) | (may need adding) | Stencil's size dropdown. |
| **ADA Compliant** | Yes / No | product name has "ADA" | Stencil's ADA checkbox. |

### Program facet — the recommended minimum for the pilot
If you only do one, do **Program**. It:
1. Makes `/cabinets/avon/?program=assembled` show the correct 82 (assembled + accessories) and
   `?program=rta` the correct 66 — server-side, paginated.
2. Is the same mechanism that unlocks all the other filters.

## Setting up the Program facet — exact steps

Two steps in the **BigCommerce control panel** (not Catalyst, not code). Do them in order.

### Step 1 — Put the `Program` value on each product (Custom Field)

BigCommerce faceted search filters on **product Custom Fields**. Each cabinet product needs a custom
field named exactly **`Program`** with value **`Assembled`** or **`RTA`**.

- **Manually (one product):** Products → View → open a product → **Custom Fields** tab → add
  `Name = Program`, `Value = Assembled` (or `RTA`). Accessories (moldings, panels, fillers, samples —
  no "RTA"/"Assembled" in the name) get the field **twice**: `Program = Assembled` AND `Program = RTA`,
  so they show under both listings.
- **In bulk (recommended):** run
  [`scripts/set-program-custom-field.py`](../scripts/set-program-custom-field.py) — it reads each
  cabinet product's name, sets `Program = RTA`/`Assembled` accordingly, and gives accessories BOTH.
  Idempotent (safe to re-run). `--dry-run` to preview, `--category <id>` to scope to one collection.

  ```bash
  python scripts/set-program-custom-field.py --dry-run      # preview
  python scripts/set-program-custom-field.py                # all cabinet products
  ```

### Step 2 — Expose `Program` as a Faceted Search filter

- **Settings → Faceted Search** (Storefront settings). Make sure faceted search is **enabled for the
  channel** this storefront uses.
- Add a **Product Filter** for the **`Program`** custom field → Save.
- Facets only appear once at least one product carries the value, so do Step 1 first.

## Code status — already wired

The `?program=` → grid-filter wiring is **done and shipped** (it was inert until the facet exists):

- `lib/cabinets/cabinet-collection.ts` — `cabinetProgramSearchParam(program)` builds the facet param
  `{ attr_Program: ['Assembled'|'RTA'] }` (constant `CABINET_PROGRAM_ATTRIBUTE = 'Program'`).
- `app/[locale]/(default)/(faceted)/category/[slug]/page.tsx` — injects that param into
  `fetchFacetedSearch` for cabinet collection pages. BigCommerce ignores an unknown attribute filter,
  so before the facet is configured the grid is unchanged; after Steps 1–2 it filters server-side,
  correctly paginated. The old name-based `productMatchesProgram()` is unused and can be deleted.

> ⚠️ The custom-field name (`Program`) and values (`Assembled` / `RTA`) must match exactly what the
> code injects. If you use different values in BC, update `cabinetProgramAttributeValue()`.

## Verify AFTER the facet is live (the active path is untestable until then)

The code was confirmed **inert** before setup (the grid is unchanged). But nothing downstream of
"enable the facet" can be verified until Steps 1–2 are done. Once live, check:

1. **It filters:** `?program=assembled` shows fewer products than unfiltered, and no RTA-named
   products appear in the grid (and vice-versa for `?program=rta`).
2. **⚠️ Accessories appear under BOTH** — open an accessory (e.g. a molding) and confirm it shows
   under both `?program=assembled` and `?program=rta`. **This is the load-bearing assumption:** that
   BigCommerce faceted search treats a product with two `Program` values (`RTA` + `Assembled`) as
   matching either filter. If BC dedupes or exposes only one value, accessories could vanish from
   both listings — this is the most likely surprise, so check it first.
3. **Complete across pagination:** page through the grid and confirm no short pages (the whole point
   over the old name-filter, which broke on pagination).
4. **Value casing:** confirm the facet value BC exposes matches `Assembled`/`RTA` exactly. If BC
   normalizes casing, `cabinetProgramAttributeValue()` is the single knob to adjust.

> **Behavior change once live:** a bare `/cabinets/avon` (no `?program`) filters to **Assembled**
> (the default program) — there's no longer an "all products" view of a collection. This matches the
> program-scoped model (and the header already defaults to Assembled). If you want a true unfiltered
> view, that needs a separate decision.

## Deferred (separate from facets — need data seeded, not facet config)

These are Laravel-fed in Stencil and not yet in BigCommerce:
- Image carousel, badges, specifications popup, assembly instructions (metafields or Laravel).
- Per-collection / per-card **color swatches** — buildable from BigCommerce (`Color` product option
  already exists on the products), a code task once prioritized.
- **Order Sample add-to-cart** — the seeded `sample.order_sample.product_id` values are live-store
  ids; needs sandbox sample products to wire real add-to-cart.

## Data hygiene note found during this work

4 closet products (Shelf 48", Side Panel 84", Tower with Shelf, Shelf and Rod) are assigned to BOTH
Closets (861) and Avon (864), so they currently leak into the Avon listing. They should be removed
from category 864.
