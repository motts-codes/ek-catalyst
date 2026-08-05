# Cabinet metafields — schema reference

The single source of truth for **every** BigCommerce metafield the cabinet feature reads/writes.
Use this together with [CABINET-REPLICATION.md](CABINET-REPLICATION.md) when rebuilding on the live
channel.

All metafields are on **category** resources (`/v3/catalog/categories/{id}/metafields`) and written
with `permission_set: "write_and_sf_access"` — that flag is **required** so the Storefront GraphQL
API can read them. Values are JSON-encoded strings **except** the three `content.*` rich-text fields,
which are stored as **raw HTML** (not JSON).

Two category "levels" hold metafields:

- **Cabinets parent** (sandbox id **863**) — program-wide data shared by all collections.
- **Each collection** (sandbox: Avon **864**, Dover …) — data for that one collection.

> ⚠️ **IDs 863 / 864 are sandbox-specific.** On the live channel these categories have different ids.
> See the replication runbook. In code, the parent id is the constant `CABINETS_CATEGORY_ID` in
> [lib/cabinets/cabinet-lines-data.ts](../lib/cabinets/cabinet-lines-data.ts) and
> `CABINETS_PARENT_CATEGORY_ID` in
> [lib/cabinet-admin/collection-shape-const.ts](../lib/cabinet-admin/collection-shape-const.ts).

---

## On the Cabinets parent category (863)

| namespace | key | value shape | Purpose | Admin editor |
|---|---|---|---|---|
| `attributes` | `product_lines` | `[{id, name}]` | Master list: Star / Prism / Euro Max / Euro Value | Attributes tab |
| `attributes` | `constructions` | `[{id, name}]` | Master list: Framed / Frameless / Slab | Attributes tab |
| `attributes` | `colors` | `[{id, name, hex, image}]` | Master color palette (image = swatch URL) | Attributes tab |
| `faq` | `by_program` | `{assembled:{headline,items:[{q,a}]}, rta:{…}}` | **Program-wide** FAQ (shown on `/cabinets/* listing`) | "Cabinet Assembly" tab |

`id` values are stable UUIDs generated when an option is added. Collections reference options by
these ids (see `spec.info` below). Deleting an option leaves dangling references, which the
storefront drops silently.

---

## On each collection category (Avon = 864, Dover, …)

| namespace | key | value shape | Purpose | Renders |
|---|---|---|---|---|
| `pricing_10x10` | `pricing` | `{rta:{price,strike_price,emi_text}, assembled:{…}}` | 10×10 kitchen pricing per program | Header pricing card |
| `merch` | `info` | `{line, door_style, default_finish}` | **Legacy** free-text merch (superseded by `spec.info`; kept as fallback) | Header (fallback only) |
| `fulfillment` | `delivery` | `{rta, assembled}` (strings) | Delivery/lead-time text per program | Header ("Ships: …") |
| `assets` | `spec_sheets` | `{rta, assembled}` (PDF URLs) | Spec-sheet PDF per program | Header "Specification Sheet" link |
| `sample` | `order_sample` | `{product_id, price}` | Order-a-sample product + price | Header (sample CTA — href deferred) |
| `faq` | `by_program` | `{assembled:{headline,items:[{q,a}]}, rta:{…}}` | **Per-collection** FAQ, split by program | FAQ accordion below grid |
| `spec` | `info` | `{product_line_id, construction_id, color_ids:[…], default_color_id}` | Attribute **selections** (ids into the 863 master lists) | Header: "Line · Construction" + swatch row |
| `assembly` | `videos` | `[{name, url}]` | Assembly instruction videos (YouTube) | Assembly section (embedded) |
| `content` | `overview` | **raw HTML string** | Long copy; **replaces** the native category description | Header body |
| `content` | `specifications` | **raw HTML string** | Specifications (table-aware) | Specifications section below grid |
| `content` | `disclaimer` | **raw HTML string** | Small print | Bottom of collection content |
| `media` | `images` | `[url, …]` (max 5, `[0]` = main) | Collection gallery | Header image gallery |

---

## On PRODUCTS (not categories)

Two metafields live on **product** resources (`/v3/catalog/products/{id}/metafields`), seeded by
[scripts/cabinets_pilot.py](../scripts/cabinets_pilot.py):

| namespace | key | value shape | Purpose |
|---|---|---|---|
| `merch` | `program_sibling` | `{product_id, name}` | The other-program twin (RTA product ↔ its Assembled product) for the PDP program toggle |
| `pdp` | `features` | `{layout, features:[{image,title,text}]}` | PDP feature tiles (demo 3×2) |

These are the product-level counterpart to the category metafields above; the category seeder does
not touch them.

### Field-source map (code)

- Read/write on collections: [lib/cabinet-admin/collection-shape.ts](../lib/cabinet-admin/collection-shape.ts)
- Read/write attribute master-lists: [lib/cabinet-admin/attributes-shape.ts](../lib/cabinet-admin/attributes-shape.ts)
- Storefront reads: [lib/cabinets/cabinet-collection.ts](../lib/cabinets/cabinet-collection.ts)
  (collection detail) and [lib/cabinets/cabinet-lines-data.ts](../lib/cabinets/cabinet-lines-data.ts)
  (shop-listing cards + program-wide FAQ).

---

## Reconciliation notes (important for a clean rebuild)

- **`merch.line` / `merch.door_style` / `merch.default_finish` are legacy.** The current model drives
  Line from `spec.product_line_id`, Construction from `spec.construction_id`, and default finish from
  `spec.default_color_id` — all resolved against the 863 master lists. The storefront falls back to
  the `merch.*` free-text only when no `spec` selection exists. On a fresh live rebuild you can skip
  `merch.info` entirely and author everything via `attributes` + `spec.info`.
- **`content.overview` replaces the native category Description** for cabinet collections — don't
  author long copy in both places.
- The native BC category `description` is no longer rendered on cabinet collection pages.

## HTML trust boundary

`content.*` is rendered directly via `dangerouslySetInnerHTML` (no sanitizer), because it is authored
only through the Google-auth + EK-allowlist admin panel — the same trust boundary as the native BC
category description the platform already renders raw. If content authoring is ever opened to
untrusted users, add server-side sanitization at the render sites (cabinet-collection-header,
cabinet-specs).
