# Collection pages: the "Recommended" product order

How the products on a cabinet collection page (Avon, Dover, Prism Beacon Hill…) are ordered by
default, and how to change that order yourself in the cabinet admin and in BigCommerce.

## What a visitor sees

Every collection page opens with the sort menu set to **Recommended**. In that order the grid
reads the way a kitchen is planned:

1. Wall cabinets
2. Base cabinets
3. Sink base cabinets
4. Tall cabinets
5. Vanity cabinets
6. Trim & decorative (mouldings, panels, fillers, samples)

Within each type, products run from the narrowest to the widest, and at the same width from the
shortest to the tallest. So page one of Avon starts with the 9" walls, then the 12" walls, and so
on, and the base cabinets begin once the walls run out.

A visitor can still pick any other sort from the menu (Price, Name, Newest…). Those come
straight from BigCommerce's own sorting. **Recommended** is the only order the site works out
itself.

Why not "Best selling" or "Featured"? Best selling only orders by real sales, so on a new store
it is random. Featured depends on someone ticking the Featured box on each product, which nobody
does. Recommended gives a sensible order from day one and needs no upkeep.

## Changing the type order (cabinet admin)

1. Open the cabinet admin and sign in: **/cabinet-admin**.
2. Go to the **Attributes** tab.
3. Scroll to **Recommended order on collection pages**.
4. Type the cabinet types, one per line, in the order you want. Use the exact names that the
   products carry in their **Product Type** field:

   ```
   BASE CABINET
   WALL CABINET
   SINK BASE CABINET
   TALL CABINET
   VANITY CABINET
   TRIM & DECORATIVE
   ```

   That example puts base cabinets before walls on every collection page.

5. Click **Save changes**. The change shows on the site within a few minutes (pages are cached
   for up to five minutes).

Notes:

- Capitalisation and spacing do not matter (`Base cabinet` and `BASE CABINET` are the same).
- A type you leave out goes to the end, after all the listed ones.
- Leave the box empty to go back to the built-in order (wall, base, sink base, tall, vanity,
  trim & decorative).
- The order applies to every collection at once. There is no per-collection type order; use the
  per-product pin below for one-offs.

## Pinning particular products first (BigCommerce)

To put specific products at the top of a collection, whatever their type, give each one a
custom field in BigCommerce:

1. In the BigCommerce control panel open the product and go to **Custom Fields**.
2. Add a field named `__sort` with a number as its value. Lower numbers come first.
3. Save the product.

Examples:

| Product | `__sort` | Result |
|---|---|---|
| Avon Base Cabinet 36 in. W | `1` | Shown first on the Avon page |
| Avon Sink Base Cabinet 36 in. W | `2` | Shown second |
| Avon Wall Cabinet 30 in. W x 30 in. H | `3` | Shown third |
| Every other Avon product | (none) | Follows in the normal type / width / height order |

Pinned products come before everything else, in `__sort` order; then the rest follow the type
order. The same `__sort` value on products in different collections does not interact; each
collection page orders only its own products.

The field can also be set in a product import sheet as a column named `__sort`, which is handy
for pinning a "starter kitchen" set across many collections at once.

## Where the pieces live (for whoever maintains the site)

- Type order: metafield `attributes.recommended_type_order` on the Cabinets category (863), a
  JSON list of type names. Empty or missing = built-in order.
- Per-product pin: product custom field `__sort` (any number; non-numbers are ignored).
- Code: `lib/cabinets/type-filter-fallback.ts` (`recommendedOrder`, `DEFAULT_TYPE_ORDER`) and
  the category page, which sends the sort param to BigCommerce for every sort except
  `recommended`.
- Because the Product Type and size fields are not indexed search facets in BigCommerce, the
  collection pages fetch the whole collection once (cached ten minutes), then filter, order and
  page it in code. Any sort the visitor picks is applied by BigCommerce before that pass; the
  Recommended order is applied in that pass.
