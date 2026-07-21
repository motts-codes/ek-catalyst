# BigCommerce Data Setup & Gotchas

Store-side configuration this storefront depends on. **Most of these break _silently_** — the code
is correct but nothing shows, because the data/config in BigCommerce isn't set up. This doc is the
map of that coupling.

Store hash and channel ID live in `.env.local` (`BIGCOMMERCE_STORE_HASH`, `BIGCOMMERCE_CHANNEL_ID`).
Management-API calls use `CATALYST_ACCESS_TOKEN` (header `X-Auth-Token`); storefront GraphQL uses
`BIGCOMMERCE_STOREFRONT_TOKEN`.

## 1. Channels ↔ category trees (the big one)

The store has **two storefront channels**, each bound to its **own category tree**:

| Channel | Name | Category tree | Notes |
| --- | --- | --- | --- |
| `1` | Express Kitchens (Stencil) | tree 1 "Default catalog tree" | the old Stencil store |
| (this app's channel) | CatalystSandbox | tree 3 "Catalyst Catalog" | what we build against |

A category tree can be assigned to **only one channel**. The two trees mirror each other but have
**different category IDs** (e.g. Windows was 431 in tree 1, 432 in tree 3). This caused: duplicate
"Windows / Windows" breadcrumbs, category pages resolving to the wrong tree, and empty results.

**Rule:** categories the Catalyst store shows must live in **tree 3** (the channel's tree). If a
category page is empty or shows the wrong products, check which tree its categories are in.

## 2. Products must be assigned to the channel (silent!)

Per BigCommerce docs: *"A product must be explicitly assigned to a channel to be sold on that
channel."* Assigning a product to a **category** is **not** enough.

Symptom we hit: products were visible, in stock, in the right categories, and **keyword search found
them** — but **category-filtered search returned 0** and no facets appeared. Cause: the products had
`channels: []` (no channel assignment).

**Fix / API:**
```
PUT /v3/catalog/products/channel-assignments
Body: [{ "product_id": <id>, "channel_id": <channelId> }]   → HTTP 204
```
Verify with the reverse lookup (the per-product `/channel-assignments` GET can read stale/empty even
when assigned):
```
GET /v3/catalog/products/channel-assignments?channel_id:in=<channelId>
```

After assigning, the **search index needs to catch up** — category results/facets can lag a minute
or more (sometimes needs a reindex from BigCommerce support after big structural changes).

## 3. Marketing-flag custom fields (badges + pills)

Bestseller / Trending / New are stored as **product custom fields**, value exactly `"yes"`:

| Custom field | Meaning |
| --- | --- |
| `__is_bestseller` | Bestseller badge/pill |
| `__is_trending` | Trending badge/pill |
| `__is_new` | New badge/pill |

- **`__` prefix is load-bearing.** The code filters out all `__`-prefixed custom fields from the
  PDP "Product Details" spec table, so these flags (and `__fulfillment`) never leak in as spec rows.
- These drive: the **PDP pills** (above the product name) and the **card badges**. Same source of
  truth for both.
- Set via admin (Product → Custom Fields) or:
  `POST /v3/catalog/products/{id}/custom-fields  { "name": "__is_new", "value": "yes" }`

Other `__` fields in use: `__fulfillment` (pickup/delivery message shown in the PDP purchase panel).

## 4. Search facets are a store setting

Which filters appear on category/search pages is configured in **Settings → Search → Product
Filtering** (Faceted Search), **not** in code. If the master "Product Filtering" toggle is **off**,
no facets show anywhere regardless of code.

Manage via `GET/PUT /v3/settings/search/filters` (the PUT is a **full-collection replace** — send the
entire list back or you'll wipe other facets). Currently enabled facets: **Brand, Price, Height
(in.), Width (in.)** — plus Bestseller / Trending / New (renamed from `__is_bestseller` etc. to
clean display names), which the code then **hides** from the sidebar (they surface as pills instead).

A facet with a single option (e.g. one product → one brand/price) is typically suppressed — you need
≥2 distinct values for a facet to render.

## 5. Metafields (PDP rich content)

PDP Features grid, FAQ, and Product-Information features are stored as **metafields** (JSON), not
custom fields. They require `permission_set: "write_and_sf_access"` for storefront visibility and
must be queried by `namespace`. See the PDP metafield notes (memory `pdp-metafield-content`) and
`docs/` PDP references.

## 6. `customFields(first: 50)`

The storefront GraphQL `customFields` connection **defaults to 10** with no explicit page size —
products with >10 custom fields would drop `__fulfillment` / `__is_*` off the end. All product
queries use `customFields(first: 50)` (50 is the API max). If a flag/field mysteriously doesn't
appear on a product with many custom fields, check for a missing `first:`.

## Quick triage

| Symptom | Likely cause |
| --- | --- |
| Category page empty / wrong products | Categories in wrong tree (tree 1 vs 3), or products not channel-assigned |
| Product found by search but not in its category | Not assigned to the channel |
| No filters on any category | "Product Filtering" master toggle off in store settings |
| A specific filter missing | That facet disabled in search settings, or <2 distinct values |
| Badge/pill/flag not showing | Custom field missing/misspelled, value ≠ "yes", or dropped by the `first:` limit |
| Breadcrumb shows a category twice | Tree data quirk — handled in code (consecutive-duplicate collapse) |
