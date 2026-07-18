# PDP — hidden / missing-data elements audit

An audit of elements on the Product Detail Page (PDP) that render empty, are supported but never
wired, or are gated by BigCommerce settings. Use this to decide what else to enable.

Audited on the GE Top-Freezer Refrigerator product. "Wired" = passed as a prop in
[product/[slug]/page.tsx](../app/[locale]/(default)/product/[slug]/page.tsx). "Rendered" = the vibes
component [product-detail/index.tsx](../vibes/soul/sections/product-detail/index.tsx) draws it when
the data/condition is present.

---

## 1. Empty-space elements (render but show nothing)

| Element | Location | Status |
| --- | --- | --- |
| **Stock/backorder message slot** | [product-detail-form.tsx](../vibes/soul/sections/product-detail/product-detail-form.tsx) (the `h-[1.6rem]` reserved div) | ✅ **Fixed** — now wrapped in a condition so it collapses to zero height when there is no stock/backorder message, instead of always reserving space above the add-to-cart button. |
| **Product summary** | `group/product-summary` in [product-detail/index.tsx](../vibes/soul/sections/product-detail/index.tsx) | ⚠️ **Renders empty** — the component supports a `summary` field, but `page.tsx` never passes it. See §2. |

---

## 2. Component props supported but NOT wired in `page.tsx`

The vibes `ProductDetailProduct` type declares these fields, but
[product/[slug]/page.tsx](../app/[locale]/(default)/product/[slug]/page.tsx) never sets them, so they
silently do nothing:

| Prop | What it would show | Why it's blank |
| --- | --- | --- |
| **`summary`** | A short product summary line (separate from the full description) | Not passed. Also verify BigCommerce exposes a distinct summary field — it may just be a truncated description. |
| **`badge`** | A badge/label on the product (e.g. "New", "Sale", "Best seller") | Not passed → never renders. |

Props that ARE correctly wired: `href`, `images`, `price`, `numberOfReviews`, `subtitle`,
`subtitleHref`, `rating`, `accordions`, `minQuantity`, `maxQuantity`, `stockDisplayData`,
`backorderDisplayData`, `title`, `description`.

---

## 3. Features wired but gated by BigCommerce **settings** (not code)

These show/hide based on store configuration in the BigCommerce control panel — the same class of
"looks missing but is really a setting" as the breadcrumb was. Gate logic in
[page.tsx](../app/[locale]/(default)/product/[slug]/page.tsx) lines ~101–103:

| Feature | Condition | Current state |
| --- | --- | --- |
| **Rating stars** | `settings.reviews.enabled && settings.display.showProductRating` | Showing ✅ (settings on) |
| **"Write a review" form** | `reviewsEnabled` (reviews on, rating display off) | Showing |
| **Reviews section** (`#reviews`) | `showRating` | Showing ✅ |
| **Tax display (inc/ex)** | `settings.tax.pdp` | Driven by store tax settings |

If any of these disappear on other products/stores, check the BigCommerce settings, not the code.

---

## 4. Wired but worth double-checking

| Element | Note |
| --- | --- |
| **Wishlist button** | `page.tsx` passes a `WishlistButton` as `additionalActions`, but the audit selector didn't match it by label/icon. Confirm it renders and works if wishlists are used on this store. |
| **Breadcrumbs** | ✅ Now wired (was previously unwired — the component supported it but `page.tsx` never passed the data). Shows `Home / <category trail> / <product name>`. |

---

## Recommended next steps (if desired)

1. **Wire `summary`** — check the BigCommerce Product schema for a summary/short-description field,
   add it to the product query in
   [page-data.ts](../app/[locale]/(default)/product/[slug]/page-data.ts), and pass it as `summary`.
   Same pattern used for breadcrumbs and the brand path.
2. **Decide on `badge`** — only wire if the store uses product badges/labels.
3. **Verify the wishlist button** renders and functions.

The stock-message spacer (§1) is already fixed and verified.
