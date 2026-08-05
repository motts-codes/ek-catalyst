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

## After the facets exist — what changes in code

The pieces are already staged:
- `lib/cabinets/cabinet-collection.ts` — `parseCabinetProgram()` reads `?program`; the header is
  already program-aware. `productMatchesProgram()` (name-based) can be **deleted** once the facet
  exists.
- `app/[locale]/(default)/(faceted)/category/[slug]/page.tsx` — currently does NOT filter the grid
  by program (name-based filtering was removed because it can't paginate). Once **Program** is a
  facet, the `?program=` value maps to that facet in the faceted-search request
  (`fetchFacetedSearch`), and the grid filters correctly. This is a small change to inject the
  Program facet selection into the search params.

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
