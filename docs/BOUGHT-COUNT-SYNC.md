# "N bought in past month" — dynamic sales-count sync (plan)

Goal: show a real, per-product "100+ bought in past month" social-proof badge on the PDP, driven by
actual order data — refreshed on a schedule, not fetched live on every page load.

Status: **planned, not built.** The PDP currently shows a **static** badge
(`vibes/soul/sections/product-detail/index.tsx`, under the product `<h1>`). This doc is the blueprint
to make it dynamic.

## Why a precompute job (not a live query)

The BigCommerce **Storefront GraphQL API** — the only API the storefront uses — does **not** expose
per-product sales counts. Confirmed against this store's schema: no `salesCount` / `totalSold` /
`unitsSold` / `orderCount` on `Product`. `bestSellingProducts` returns a *rank*, not counts, and has
no time window.

The data lives in the **Orders** backend, reachable only via **admin/management APIs** (not
storefront tokens). Hitting those on every PDP render would be slow and rate-limited. So: aggregate
on a schedule → write the number into a **product custom field** → the storefront reads that field
cheaply (same pattern as `__is_bestseller`, `__sale`, `__fulfillment`).

## The custom field

- Name: **`__bought_last_month`** (the `__` prefix keeps it out of the PDP spec table, like the other
  marketing/meta fields).
- Value: an integer — units of the **base product** (summed across its variants) sold in the last 30
  days.
- Read path: already covered — the product-card / product-detail fragments fetch
  `customFields(first: 50)`, so no fragment change is needed.

## Credentials needed (you create these)

A **Store-level API Account** in the BigCommerce control panel
(Settings → API → Store-level API accounts → Create), with OAuth scopes:

- **Orders** — read-only (tally units sold)
- **Products** — modify (write the custom field)

This yields a **client id + access token + API path** (`https://api.bigcommerce.com/stores/{hash}/`).
These are **separate** from the storefront tokens in `.env.local`. Store them as new env vars, e.g.
`BIGCOMMERCE_ADMIN_ACCESS_TOKEN` (never commit them).

> Note: the store hash is already known (`BIGCOMMERCE_STORE_HASH`). The admin API base is
> `https://api.bigcommerce.com/stores/${STORE_HASH}/`.

## The aggregation job (script)

`scripts/sync-bought-counts.ts` (to build), run with `pnpm tsx`:

1. **Fetch recent orders** — Orders V2:
   `GET /v2/orders?min_date_created={ISO 30 days ago}&limit=250&page={n}`, paginate until empty.
   Consider filtering `status_id` to completed/shipped/awaiting-fulfillment (exclude cancelled/refunded
   — decide which statuses "count").
2. **Fetch line items per order** — `GET /v2/orders/{id}/products`. Sum `quantity` grouped by
   `product_id` (the base catalog product — NOT the variant; line items carry `product_id` and,
   separately, variant info, so grouping by `product_id` gives the per-product total you asked for).
3. **Write back** — for each product with a tally, upsert the `__bought_last_month` custom field via
   Catalog V3:
   - list existing: `GET /v3/catalog/products/{id}/custom-fields`
   - create/update: `POST` / `PUT /v3/catalog/products/{id}/custom-fields` with
     `{ name: '__bought_last_month', value: '<count>' }`.
   - Zero out / clear products whose count dropped to 0 (optional — or just skip them and let the
     storefront threshold hide them).

Watch-outs:
- **Rate limits** — the admin API is throttled (per-store concurrency). Batch and respect
  `X-Rate-Limit-*` headers; add backoff. For a large catalog this is the slow part.
- **Base product vs variant** — group by `product_id`. Requirement is per-product, so variants roll up.
- **Statuses** — decide which order statuses count as a "purchase".

## Scheduling

Run daily or weekly. Options:
- **Vercel Cron** (`vercel.json` cron → a route handler that runs the aggregation). Fits this app.
- External cron / GitHub Action calling a protected route.
- Manual `pnpm tsx scripts/sync-bought-counts.ts` for the first pass / testing.

Freshness note: "past month" then means "as of the last sync," which is fine for social proof.

## Storefront read + display (small change)

In `data-transformers/*` (product-detail path), read `__bought_last_month` from `customFields` and
pass a `boughtLastMonth?: number` through to the PDP. Then in
`vibes/soul/sections/product-detail/index.tsx` replace the static badge:

- Show the grey box / black-text badge **only when** `boughtLastMonth >= THRESHOLD` (e.g. 25) — a low
  or zero count shouldn't advertise weak demand. Hide otherwise.
- Format: round down to a friendly bucket — e.g. `>= 100 → "100+"`, `>= 50 → "50+"`, else the exact
  number — so it reads as social proof, not a precise inventory stat.

## Build checklist (when ready)

- [ ] Create Store-level API account (Orders read, Products modify); add `BIGCOMMERCE_ADMIN_ACCESS_TOKEN`
      to `.env.local` (and Vercel env).
- [ ] `scripts/sync-bought-counts.ts`: orders → tally by `product_id` → write `__bought_last_month`.
- [ ] Decide counted order statuses + threshold + bucket formatting.
- [ ] Schedule (Vercel Cron or external).
- [ ] Transformer: expose `boughtLastMonth`; PDP badge reads it with threshold + bucketing.
- [ ] Replace the static badge text with the dynamic value.
