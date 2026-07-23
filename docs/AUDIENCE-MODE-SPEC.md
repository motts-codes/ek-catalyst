# Audience Mode (Homeowner / Pro) — Build Spec

> **Status: AGREED DIRECTION — pre-build.** Merges the initial brief
> ([AUDIENCE-MODE-BRIEF.md](./AUDIENCE-MODE-BRIEF.md)) with the CliqStudios-informed nav
> recommendation. This is the working spec we build from. Remaining `⚠ DECIDE` items are marked.

## 1. Core architecture (agreed)

- **Two audiences:** Homeowner (default) and **Pro** (label: "Pro"; trade path `/pro`).
- **Toggle** top-right of the header (segmented control, `HOMEOWNER | PRO`).
- **One shared menu config** with **mode overrides** (promote-to-L1 for RTA/Assembled, slot swaps
  for Inspiration↔Clearance and Resources↔Pro Program). **Never two hand-maintained menu trees** —
  the rendered menus differ per audience, but the source of truth is unified so modes cannot drift.
- **The catalog is shared:** category pages and PDPs live at single canonical URLs, same for both
  audiences (mode only restyles the shell there via cookie). No per-mode duplicate content.
- **What the toggle changes:** (a) home page, (b) hero/theming, (c) the *landing target* of menu
  links — homeowner → education/landing pages, pro → category pages directly, (d) audience-specific
  L1 slots, (e) pro mode promotes RTA/Assembled to L1.

### 1.1 RTA / Assembled = real categories (DECIDED)

RTA and Assembled are **real categories** under Cabinets (`/cabinets/rta/`, `/cabinets/assembled/`),
**not** filter values. This makes "promote to L1" a pure presentation reordering of real category
nodes — RTA's URL is `/cabinets/rta/` whether shown at L1 (pro) or nested under Cabinets (homeowner).
Same node, same children, different mount point. No structural seam.

> These categories **do not exist yet** in the Catalyst tree (tree 3 currently has only Appliances
> and Windows). They must be created (in tree 3, channel-assigned) as part of this work. See
> [BIGCOMMERCE-SETUP.md](./BIGCOMMERCE-SETUP.md).

## 2. Routing & mode state (agreed)

- Homeowner at `/`; Pro home + pro landing content under `/pro/...`.
- Category pages & PDPs: single canonical URLs, **never duplicated per mode**.
- Toggle click = navigate to the other home + set cookie.
- Returning visitor with pro cookie hitting `/` → **server-side redirect to `/pro`**.
- First visit: **Homeowner always**, EXCEPT pre-select Pro when: arriving on any `/pro` URL, from a
  trade campaign (UTM `?aud=pro`), or (Phase 2) a logged-in contractor account.
- **Cookie:** name `ek_audience`, value `homeowner|pro`, **90 days, refreshed every visit**.
- **Analytics: `audience_mode` dimension on every event from day 1** (Phase 1, not a nice-to-have —
  impossible to backfill).

## 3. Header anatomy (agreed)

```
utility strip   → Call · [mode-aware links] · [HOMEOWNER|PRO toggle]
main header row → logo · search · account · cart · [persistent CTA]
nav row         → L1 items (mega-menu on Cabinets; dropdowns elsewhere)
(promo strip)   → campaign-time only, dismissible — NOT permanent chrome
```

- **Search / account / cart move to the main header row** (thin utility strip).
- **Industry selector (Retail · Factory Outlet · Multifamily · Wholesale · Commercial) REMOVED from
  the header** → moves to footer. The toggle becomes THE segmentation control. *(Resolving this is
  a Phase-1 header decision — the current site's divisions strip conflicts with the new toggle.)*
- Campaign/promo pages and the six individual showroom links **removed from nav** → promo strip /
  one "Find a Showroom" link.

### 3.1 Utility bar links (mode-aware)
```
Homeowner:  Call 860-247-1000    Free Samples | 0% Financing | Showrooms | [Homeowner|Pro]
Pro:        Call 860-247-1000    Free Samples | Download Catalog | Showrooms | [Homeowner|Pro]
```
Fallback if simplicity wins: one static set — Free Samples | 0% Financing | Download Catalog | Showrooms.

## 4. Navigation

### 4.1 Homeowner (default)
```
Cabinets · Countertops · Appliances · Windows · Kitchen & Bath · Inspiration · Resources   [Free Design Consult]
```
| L1 | L2 | L1 click target |
| --- | --- | --- |
| **Cabinets** (mega-menu) | Shop by Construction (RTA / Assembled + "what's the difference?" link) · Shop by Color · Shop by Style · Best Sellers · Hardware & Handles · Tiles & Backsplash · Accessories · Clearance · *panel promo: Free Samples + Free Design* | cabinets landing page |
| **Countertops** | Granite · Quartz · Laminate · Prefabricated · How to choose | landing page |
| **Appliances** | Ranges & Cooktops · Fridges · Dishwashers · Microwaves · Range Hoods · Wall Ovens · Washers & Dryers · All | category |
| **Kitchen & Bath** | Sinks (Single/Double/Farmhouse/Workstation) · Faucets · Bath (Vanity Tops, Basins, Bath Faucets) · Garbage Disposals | category |
| **Windows** | Replacement (Double Hung/Slider/Hopper) · New Construction · Accessories | landing page |
| **Inspiration** | Gallery/Featured Projects · Best-Selling Designs · Reviews · Blog | gallery |
| **Resources** | How It Works · Free Samples · Financing · Measuring Guide · FAQs · About Us · Guarantee | — |
| CTA | **Free Design Consult** (persistent) | booking |

"Company" folds into Resources + footer. Sinks/Faucets/Bath consolidated under **Kitchen & Bath**.

### 4.2 Pro
```
RTA · Assembled · Countertops · Appliances · Windows · Kitchen & Bath · Clearance · Pro Program   [Get a Quote]
```
Same config, mode overrides:
- **RTA & Assembled at L1** (replace "Cabinets") → direct category links. Dropdown each: door-style /
  color for that construction type · In-Stock/Quick-Ship · shared **Hardware & Accessories** group
  (repeated in both panels so pros don't guess).
- **Inspiration → Clearance** at L1.
- **Resources → Pro Program** (rename of "Benefits"). L2: Program & Tiers · Spec Sheets & Downloads ·
  Catalogs · Delivery & Lead Times · Purchase Orders · Showrooms · Support.
- **CTA → "Get a Quote."**
- Every menu click → **category page directly** (no landing pages).
- 8 L1 max; if heavy, fold **Kitchen & Bath** (never RTA/Assembled).

### 4.3 Menu config node shape (the engineering primitive) ⚠ pin down in build
Because RTA/Assembled are real categories, a menu node is `{ label, href (category path), children,
landingHref? }`. Mode overrides operate on this ONE tree:
- **promoteToL1** (pro): hoist the RTA and Assembled nodes out of Cabinets to top level.
- **slotSwap** (pro): Inspiration→Clearance, Resources→Pro Program.
- **linkTarget** (homeowner): certain L1 clicks route to `landingHref` (landing page) instead of
  `href` (category); pro always uses `href`.
The rendered per-mode menus are derived from this — no second tree.

## 5. Homeowner landing pages (agreed)
- **4 at launch:** Cabinets, Countertops, Windows, and an **RTA-vs-Assembled explainer** (linked from
  the Cabinets panel).
- Appliances and Sinks/Faucets → straight to category even for homeowners (no education page).
- **Content in Makeswift** (marketing iterates weekly); menu structure stays in code.
- Publicly reachable/indexable (SEO assets); pros just skip them via nav.

## 6. Theming (agreed)
- **Same brand red both modes.**
- Pro differentiation: darker/graphite header treatment + imagery (job sites, pallets, crews) + copy
  tone (price/speed/stock).
- **Tokens that flip:** header background, hero image/copy, accent-secondary, promo-strip content.
- **Never flip:** logo, footer, cart/checkout, category/PDP styling.

## 7. Pro home page blocks (for home-page phase)
Hero (contractor value prop: price/speed/stock) → Quick Shop tiles (RTA/Assembled/Countertops/
Windows) → Lead times & delivery promise → Pro Program teaser w/ tiers → Clearance strip →
Showroom/will-call → trade testimonials.

## 8. Phase plan (agreed)
1. **Mode foundation** — cookie + `/pro` routing + toggle + **analytics dimension** + **industry-
   selector removal decision** (header change everything sits in).
2. **Menu** — one config + mode overrides (§4.3). Shared skeleton first, then pro swaps.
3. **Home pages** — pro home is the bigger lift (§7); homeowner home closer to a refresh.
4. **Homeowner landing pages** — 4 Makeswift pages.
5. **(Phase 2) Trade commerce** — pricing, contractor program (CliqStudios tier model as template),
   login gating + verification.

## 8a. Countertops — call-to-order (not shoppable)

Countertops **cannot be bought online** — customers call to place an order. Decisions:
- **Menu placement:** grouped **inside Kitchen & Bath** (not an L1 shop item), **both** modes.
  Done in `menu-config.ts`.
- **PDP / card CTA:** countertop products get a **"Call to place order"** button **instead of Add
  to Cart / View Options.** ⚠ Not built yet — needs a card/PDP CTA variant. Likely keyed off a
  product flag (custom field, e.g. `__call_to_order = yes`) so any call-to-order product picks it
  up, same pattern as the marketing flags. Revisit when countertop products/pages exist.

## 9. Still to decide before / during build  ⚠
- [ ] **Category creation:** create Cabinets → RTA/Assembled (+ color/style children) and Kitchen &
  Bath structure in tree 3. Needs your product/category plan. **This gates the menu build.**
- [ ] **Utility bar:** mode-aware links vs one static set (§3.1).
- [ ] **"Cabinets" browse-all in pro mode:** confirmed rare / omitted — record as accepted tradeoff.
- [ ] **Toggle label + copy:** "HOMEOWNER | PRO" confirmed? Helper text?
- [ ] **Cross-mode seeds:** homeowner "Are you a contractor? →" + pro escape hatch (where?).
- [ ] **Mobile:** toggle position in drawer, mega-menu collapse, persistent CTA on mobile.
- [ ] **Lead-time badges** for pro (static "ships in X days") — in scope for menu/category or later?

## Appendix — full teardown & rationale
The competitive teardown (CliqStudios mechanics, benchmarks, rejected nav alternatives, tier table)
lives in the review response that produced this spec. Key rejected alternatives recorded:
- *"Kitchen & Home" umbrella* (buries Countertops/Windows) → narrowed to Kitchen & Bath.
- *Amazon-style thin all-categories second bar* → rejected (~7 categories, not 30+).
- *Two independent menu trees* → rejected for one shared config with overrides.
