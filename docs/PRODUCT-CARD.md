# Product Card System

The product card is a **shared** primitive. Changing it affects every surface that renders a card:

- Category / brand / search grids (the faceted pages)
- PDP "Related products" carousel
- Featured product lists
- Wishlist, order history, compare, nav search results

So card changes are storefront-wide by design. Scope with a prop (or a wrapper `className`) if you
ever need a surface-specific look.

## Files

```
vibes/soul/primitives/product-card/
├── index.tsx            The card: image, badges, title, brand, price, rating, CTA, compare
├── cta-icons.tsx        Inline options / add-to-cart SVG icons (currentColor)
├── add-to-cart-cta.tsx  Client "Add to Cart" icon button (real add-to-cart action)
└── compare.tsx          Compare checkbox

data-transformers/product-card-transformer.ts   Builds the card's data (Product) from BC product
components/product-card/fragment.ts              The GraphQL fields the card needs
app/[locale]/(default)/(faceted)/product-card-add-to-cart.tsx   The add-to-cart server action
```

## Data flow

`ProductCardFragment` (GraphQL) → `singleProductCardTransformer` → `Product` → `<ProductCard>`.

The transformer sets: `title, href, image, price, subtitle (brand), badges, requiresOptions,
rating, numberOfReviews, inventoryMessage`.

Two card features depend on **custom fields** and **product options** being in the fragment (they
are — `customFields(first: 50)` and `productOptions(first: 1)`):

- **`badges`** — from `__is_new` / `__is_bestseller` / `__is_trending` = `"yes"`. See
  `getCardBadges`. Colors reuse the PDP pill CSS vars (`--pill-*-background`), so cards and PDP match.
  Order: New → Bestseller → Trending. Rendered as a **row** of pills, top-left over the image.
- **`requiresOptions`** — true if any product option `isRequired`. Drives the CTA (below).

## Visual conventions

- **Image**: `1:1` (square), `object-contain` (whole product, not cropped), **white** background +
  light border, hover **scales down** (`scale-95`, not up). Products are shot on white.
- **Title**: 2-line clamp with `min-h-[2lh]` so 1-line titles still reserve 2 lines — this keeps the
  price and CTA aligned across cards in a row.
- **Brand**: light grey (`contrast-300`), 12px — matches the PDP.
- **Price**: PDP-style superscript (`$` and cents raised, whole number 1.5×), via the `superscript`
  prop on `PriceLabel` (handles both single and range prices).
- **Compare**: small square checkbox (reduced corner radius so it isn't circular).
- **Grid**: equal-height cards; the CTA is pinned to the bottom with `mt-auto` so **CTAs line up
  across a row** regardless of title length / missing brand / range vs single price.

## The CTA (the important part)

The card CTA is **smart**, keyed on `requiresOptions`:

| Product | CTA | Behavior |
| --- | --- | --- |
| Requires options | **View Options** | Circle with an options icon that **expands on hover** to a labeled pill (desktop); always labeled on touch (`max-lg`). Links to the PDP to choose options. |
| No required options | **Add to Cart** | Icon-only cart circle that **directly adds to cart** (real `addToOrCreateCart` action). No label, no reveal — the cart icon is universally understood. |

Both are 36px circles at rest, red outline + **red icon** (matching `--button-primary-background`,
`#d90716`), and use the **same left-to-right slide-fill hover** as the PDP add-to-cart button
(an `::after` that translates in), turning solid red with a white icon/label. `after:rounded-full`
keeps the sliding fill pill-shaped.

### Why View Options is built the way it is

- A true circle at rest needs `h-9 min-w-9` with **no** horizontal padding (icon-only content makes
  it exactly 36×36). Padding + label appear only on hover.
- The hover padding must be `hover:px-4` — **not** `group-hover/cta:px-4`. `group-hover` styles
  *descendants* of the group, not the group element itself, so `group-hover` silently does nothing
  on the button's own padding. The label (a descendant) correctly stays on `group-hover`.

### Add-to-Cart wiring

The real add-to-cart action (`productCardAddToCartAction`, reusing `addToOrCreateCart` — same flow
as the PDP/compare) is threaded:

```
category/page.tsx → ProductsListSection → ProductList → ProductCard → AddToCartCta
   (addToCartAction prop at each layer)
```

The card renders `AddToCartCta` only when `requiresOptions === false` **and** an `addToCartAction`
is provided; otherwise it falls back to a `ViewOptionsCta` PDP link.

**Caveat:** if every product in a category requires options, the Add-to-Cart path renders on no
product there. The **Makeswift home-page carousel** uses a *different* transformer
(`useBcProductToVibesProduct`) that does **not** compute `requiresOptions`/`badges` and does **not**
thread the add-to-cart action — so home cards always show "View Options" and no badges. That's a
deliberate, deferred gap; achieving parity means extending the Makeswift schema/transformer and
wiring the server action into the Makeswift runtime.
