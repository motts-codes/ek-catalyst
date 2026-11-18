# Live-store migration checklist (sandbox → live Catalyst store)

Everything the sandbox storefront needs in order to run against the **live BigCommerce store**.
The code is store-agnostic; the work is **catalog data + metafields**, then configuration, then a
deploy. Work top to bottom. Tick each box.

Companion docs: [CABINET-REPLICATION.md](CABINET-REPLICATION.md) (cabinet feature in depth),
[CABINET-METAFIELDS.md](CABINET-METAFIELDS.md) (field schema), [CABINET-FACETS.md](CABINET-FACETS.md)
(facet setup), [BIGCOMMERCE-SETUP.md](BIGCOMMERCE-SETUP.md) (store gotchas),
[DEPLOYMENT.md](DEPLOYMENT.md) (how deploys work).

---

## 0. What moves, and how

| Layer                                                                           | Moves by                                                    | Effort                            |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------- |
| Code (pages, sections, nav config, footer config, admin panel)                  | Deploying this repo with live env vars                      | Low — one constant to change (§3) |
| Design (theme tokens, layout, fonts)                                            | Same — it is all in the repo                                | None                              |
| Makeswift content (edited slots, header/footer overrides, Makeswift-only pages) | Reuse the same Makeswift site key, or rebuild on a new site | None if the key is reused         |
| **Catalog structure** (categories, channel assignment)                          | Created in the live store                                   | **Main work**                     |
| **Metafields + custom fields** (cabinet content, PDP content, badges, delivery) | Seed scripts + admin panel + control panel                  | **Main work**                     |
| Store settings (facets, stock display, reviews)                                 | Control panel                                               | Low                               |
| Redirects / SEO                                                                 | next.config redirects + BigCommerce redirects               | Low                               |

---

## 1. Live store prerequisites

- [ ] **Channel + category tree.** The Catalyst channel must have its **own category tree**; every
      category the storefront shows must live in **that tree** (see BIGCOMMERCE-SETUP §1). Note the
      tree id.
- [ ] **Products assigned to the channel.** Products not assigned to the channel silently return
      nothing (BIGCOMMERCE-SETUP §2). **Decision 8 Nov 2026: no sandbox products are copied to the live
      store.** Arun adds the live products into the tree-3 categories (docs/LIVE-CATEGORY-IDS.md) and
      assigns the Catalyst channel; scripts only post-process those products per category.
- [ ] **Category paths match the nav/footer config.** The storefront links to these paths, so the
      live categories need the same URLs (or update the configs): - `/cabinets` (Cabinets parent), `/cabinets/<collection>` (Avon, Dover, …) - `/closets`, `/appliances`, `/windows` - Later: `/countertops`, `/bath`, `/siding`, `/doors`, `/kitchen/sinks`, `/kitchen/faucets`,
      accessories subcategories — currently `#` in [menu-config.ts](../lib/navigation/menu-config.ts)
      and [footer-config.ts](../lib/navigation/footer-config.ts); fill in as the pages exist.
- [ ] **Tokens.** Store hash, Storefront API token (plus unauthenticated token), a management
      API token with **read + write** on `/v3/catalog` (used as `CATALYST_ACCESS_TOKEN` by the
      seed scripts and the cabinet admin panel), and the app client id/secret if customer login is used.

---

## 2. Catalog data — the main work

### 2a. Cabinets (categories + metafields)

- [ ] Create the **Cabinets parent** and one **child category per collection** (Avon, Dover, …) in
      the channel's tree. Note every id.
- [ ] (Arun) Add each collection's live products (RTA and Assembled variants, accessories) to its category
      **and** to the channel.
- [ ] Set the **`Program` product custom field** (`Assembled` / `RTA`, both for accessories) —
      the data half of the program filter:
      `python scripts/set-program-custom-field.py --category <collection-id> --dry-run` then run for
      real. (Reads `BIGCOMMERCE_STORE_HASH` + `CATALYST_ACCESS_TOKEN` from `.env.local`.)
- [ ] Seed the **parent-level** metafields (attribute master-lists + program FAQ):
      `python scripts/seed-cabinet-metafields.py parent --category <cabinets-parent-id>`
- [ ] Seed each **collection's** metafields (pricing, delivery, spec selections, FAQ, content,
      gallery): `python scripts/seed-cabinet-metafields.py collection --category <id> --preset avon`
      — then replace the demo values with real content in `/cabinet-admin` (Collections tab).
- [ ] Seed the **product-level** metafields if you want them in bulk: `merch.program_sibling`
      (the RTA ↔ Assembled twin) and `pdp.features` via `scripts/cabinets_pilot.py` after editing its
      `LARAVEL` block and collection names. Otherwise author per product in `/cabinet-admin`
      (Products tab).
- [ ] Verify every field against the schema in CABINET-METAFIELDS.md — all writes must use
      `permission_set: write_and_sf_access` or the storefront cannot read them (the scripts do this).

### 2b. Every product (PDP + cards)

Custom fields the storefront reads on any product (all optional; absent = feature hidden):

- [ ] `__is_bestseller`, `__is_trending`, `__is_new` = `yes` → badges / pills on cards and PDP.
- [ ] `__sale` (percentage) → the "Up to N% off" disc on cards.
- [ ] `__fulfillment` → the delivery/pickup box in the PDP purchase panel.
- [ ] `__delivery` → the first trust-block row on the PDP ("Same Day Pickup") and the card line.
- [ ] `__bought_last_month` → "N bought in past month". Sandbox values are dummies; on live, wire
      the scheduled order tally described in [BOUGHT-COUNT-SYNC.md](BOUGHT-COUNT-SYNC.md) or leave
      the field empty (badge hides).
- [ ] Product metafields for rich PDP content: `features/grid`, `faq/list`,
      `product_info/features` (see PDP notes in CABINET-METAFIELDS.md §"On PRODUCTS").

Keep every double-underscore field: the PDP spec table filters them out on purpose.

### 2c. Store settings (control panel)

- [ ] **Search facets** — Program / Type / Door Style / Size / ADA per CABINET-FACETS.md. Which
      facets appear is a store setting, not code. Without the Program facet the collection grid
      can't be filtered by program.
- [ ] **Display stock levels** — required for the "In / Only N in stock / Out" PDP badge.
- [ ] **Reviews** enabled (rating on cards/PDP), **newsletter** enabled (footer form posts to the
      store's subscribe mutation).
- [ ] Store logo + social links (the footer reads both from store settings).

---

## 3. Code — the one constant

- [ ] `CABINETS_CATEGORY_ID` in [lib/cabinets/cabinet-lines-data.ts](../lib/cabinets/cabinet-lines-data.ts)
      **and** `CABINETS_PARENT_CATEGORY_ID` in
      [lib/cabinet-admin/collection-shape-const.ts](../lib/cabinet-admin/collection-shape-const.ts)
      → the live Cabinets parent id. Both must match. Collection ids are discovered automatically.
- [ ] `next.config.ts` redirects: the old `/cabinets/shop/*` redirects are `permanent: false`; flip
      to `true` (308) at launch. Add any legacy-URL redirects from the old site here or in
      BigCommerce.
- [ ] Nav/footer `#` placeholders → real paths as pages come online (see §1).

---

## 4. Environment (live deployment)

Server-only unless prefixed `NEXT_PUBLIC_`.

| Var                                                                             | Purpose                                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `BIGCOMMERCE_STORE_HASH`                                                        | Live store                                                                |
| `BIGCOMMERCE_CHANNEL_ID`                                                        | The Catalyst channel                                                      |
| `BIGCOMMERCE_STOREFRONT_TOKEN` / `BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN` | Storefront GraphQL                                                        |
| `BIGCOMMERCE_ACCESS_TOKEN`                                                      | Management API (Catalyst core)                                            |
| `CATALYST_ACCESS_TOKEN`                                                         | Read + write management token for metafields (scripts + `/cabinet-admin`) |
| `BIGCOMMERCE_CLIENT_ID` / `BIGCOMMERCE_CLIENT_SECRET`                           | Customer login (if used)                                                  |
| `AUTH_SECRET` (+ `AUTH_TRUST_HOST=true` behind a proxy)                         | Session signing                                                           |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `EK_ADMIN_EMAILS`                 | `/cabinet-admin` Google sign-in + staff allowlist                         |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` / `MICROSOFT_TENANT_ID`        | `/cabinet-admin` Microsoft 365 sign-in for EK staff (pending EK's app registration) |
| `MAKESWIFT_SITE_API_KEY`                                                        | Makeswift site (reuse the sandbox key to keep all edits)                  |
| `NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME`                                          | Image CDN host                                                            |
| `DEFAULT_REVALIDATE_TARGET`, `TRAILING_SLASH`, `ENABLE_ADMIN_ROUTE`             | As in sandbox                                                             |
| Upstash / KV vars                                                               | Only if the KV logger / cache is used                                     |

- [ ] Google Cloud console: add `https://<live-domain>/api/admin-auth/callback/google` to
      Authorized redirect URIs and the bare domain to JavaScript origins.
- [ ] Makeswift: if reusing the site key, nothing to do — every slot, page and header/footer
      override carries over. If using a new site, the builder starts empty and every band shows its
      code fallback until re-edited.

---

## 5. Deploy and verify

- [ ] `pnpm exec catalyst project create` (or `link`) against the live store, then `pnpm run deploy`
      → a preview hostname. **Do not** repoint the channel yet (DEPLOYMENT.md §5–6).
- [ ] Home `/` and `/pro`: hero, tabs show live products, best-seller collection cards show live
      10×10 prices, footer newsletter posts successfully.
- [ ] `/cabinets/assembled-cabinets` and `/cabinets/rta-cabinets`: collection cards + program FAQ.
- [ ] Each collection `?program=assembled` and `?program=rta`: header, swatches, pricing, specs,
      assembly videos, FAQ, disclaimer; grid filters by Program.
- [ ] A cabinet PDP and a non-cabinet PDP (e.g. a window): badges, stock badge, fulfillment box,
      bought count, features grid, FAQ, related products.
- [ ] Category pages `/windows`, `/appliances`, `/closets`: filters, sort, breadcrumb, Makeswift
      top/bottom slots.
- [ ] Nav: every link resolves (no `#` on launch-critical items), mega-menus open, overflow "…"
      and mobile menu work, Homeowner/Pro switch persists.
- [ ] `/cabinet-admin`: sign in with an allowlisted account; a save round-trips and the collection
      page updates.
- [ ] Search, cart, checkout, account on the live channel.
- [ ] Then: `pnpm exec catalyst deploy --update-site-url` to repoint the channel, and flip the
      redirects to permanent.

---

## Order of operations (short form)

1. Channel tree + product channel assignment → 2. cabinet categories, `Program` custom field,
   metafield seeding, PDP custom fields → 3. store settings (facets, stock display) →
2. `CABINETS_CATEGORY_ID` + env vars + Google redirect URI → 5. preview deploy + verification →
3. repoint the channel, permanent redirects.
