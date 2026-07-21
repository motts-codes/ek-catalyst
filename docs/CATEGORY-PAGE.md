# Category / Faceted Page Customizations

How the category (and brand / search) pages are built, and where to change things.
These three pages share almost all of their UI, so most edits here affect all of them.

## Routing

`/windows` (or any category URL) does **not** map to a file. The proxy chain
([proxy.ts](../proxy.ts) → [proxies/with-routes.ts](../proxies/with-routes.ts)) resolves the URL
against the BigCommerce GraphQL API and rewrites it to the internal route
[app/[locale]/(default)/(faceted)/category/[slug]/page.tsx](../app/[locale]/(default)/(faceted)/category/[slug]/page.tsx).

The `(faceted)` route group holds **category**, **brand**, and **search** — they all render the same
`ProductsListSection`.

## The one component that renders (almost) everything

`page.tsx` fetches data and hands it to a single component:

```
ProductsListSection            vibes/soul/sections/products-list-section/index.tsx
├── Breadcrumbs                 (PDP-styled: 10px, light grey)
├── header row (title/count)    ← hidden on category via hideHeader; Sort moves left
├── FiltersPanel                vibes/soul/sections/products-list-section/filters-panel.tsx
│     └── (the left sidebar)
└── ProductList                 vibes/soul/sections/product-list/index.tsx
      └── ProductCard × N        vibes/soul/primitives/product-card/index.tsx
```

### Where to change what

| Want to change… | File |
| --- | --- |
| Data / which sections render | `category/[slug]/page.tsx` |
| GraphQL queries (fields, sort, breadcrumbs) | `category/[slug]/page-data.ts` |
| Filter sidebar (titles, checkboxes, price, pills) | `products-list-section/filters-panel.tsx` |
| The filter **data** (what facets exist, counts, rename) | `data-transformers/facets-transformer.ts` |
| Product grid layout (gaps, columns, aspect ratio) | `sections/product-list/index.tsx` |
| The product **card** itself | `primitives/product-card/index.tsx` |
| Card **data** (title, price, brand, badges, requiresOptions) | `data-transformers/product-card-transformer.ts` |
| Sort dropdown | `products-list-section/sorting.tsx` |

## Breadcrumb

Built in `page.tsx`. It prepends `Home`, uses the current category's own breadcrumb trail, and
**collapses consecutive duplicate labels** (the category data can repeat the current category, e.g.
`Windows / Windows`). Styling (10px, light grey `contrast-300`) is applied in `ProductsListSection`
via a `className` on `<Breadcrumbs>`, matching the PDP.

## Hidden header + Makeswift top content

`ProductsListSection` takes a `hideHeader` prop. The category page passes it so the big
`<h1>Appliances</h1>` + count are hidden and the **Sort control moves to the left**. This lets the
Makeswift **"top content" slot** (images / banners, added in the visual editor per category) lead
the page. The header-row padding shrinks when `hideHeader` is set.

**To add per-category content (images, banners):** open Makeswift, go to the category page, and drop
content into the *"{category} top content"* slot. It's keyed per category
(`snapshotId: category-{id}-top-content`) — no code needed.

## Filters (the sidebar)

`FiltersPanel` renders the facets. Key conventions:

- **Sections are always open** (no accordion toggle) — a bold `<h3>` title + options below,
  via the local `FilterSection` component.
- **Multi-option facets → checkbox lists** (Brands, Finish, Capacity…). One option per row,
  multi-select. (Previously wrapping "toggle" chips.)
- **Subcategory group** uses the current category's own name as its heading (e.g. "Appliances")
  with subcategories indented beneath — set in `page.tsx` (`label: tree.name`).
- **Price** is a compact range input (small Min/Max + apply circle). BigCommerce does **not** expose
  the category's min/max price bounds via the storefront API, so a real min–max slider isn't
  possible without extra per-category product queries — that's why it's inputs, not a slider.
- **Marketing-flag facets** (`__is_bestseller` / `__is_trending` / `__is_new`) are **hidden** from
  the sidebar entirely (`MARKETING_FLAG_LABELS` / `isMarketingFlagFacet` in `filters-panel.tsx`).
  They're internal merchandising flags surfaced via the card/PDP pills, not shopper filters.

Which facets appear at all is a **store setting** (BigCommerce → Settings → Search → Product
Filtering), not code. See [BIGCOMMERCE-SETUP.md](./BIGCOMMERCE-SETUP.md).

A thin grey vertical divider sits to the right of the sidebar (`@3xl:border-r` on the `<aside>` in
`ProductsListSection`).

## Product card

See the "Product card system" section in
[PRODUCT-CARD.md](./PRODUCT-CARD.md) — the card is shared far beyond category pages (PDP related
carousel, brand, search, wishlist, compare), so it has its own doc.

## Notes / gotchas

- **`ProductList` default `aspectRatio` is `1:1`** (square). Was `5:6` (tall portrait) — changed so
  product images aren't excessively tall.
- Editing `ProductsListSection` / `FiltersPanel` / `ProductList` / `ProductCard` affects
  **category + brand + search** together. Scope with a prop if you need a category-only change.
