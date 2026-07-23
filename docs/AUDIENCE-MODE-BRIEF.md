# Audience Mode (Homeowner / Trade) — Initial Brief

> **Status: DRAFT for review.** This captures the vision discussed so far, the decisions made, and
> the open questions. Review, edit inline, and expand — then we turn it into a build spec.

## 1. The idea

Express Kitchens serves **two audiences** with different information needs and buying cycles:

- **Homeowner** (default) — needs education first: what a product/collection is, samples, design
  consultation, inspiration. Longer, discovery-led journey **before** purchase.
- **Trade / Contractor** — knows what they want: direct shopping, pricing, special/contractor
  pricing, contractor program. Shorter, transactional journey.

A **toggle** in the menu switches "audience mode." **Homeowner is the default.** The choice
**persists across visits** (cookie, ~2 weeks).

## 2. What changes when you switch mode

| Aspect | Homeowner | Trade |
| --- | --- | --- |
| **Home page** | education / discovery led | pricing, direct shopping, contractor program |
| **Menu — Level 1** | Cabinets · Countertops · Appliances · Windows · Resources · Gallery · Company · *Free Design Quote* · (shop/cart icons) | RTA · Assembled · Countertops · Appliances · Windows · Benefits · Company · (toggle) |
| **Menu — Level 2** | organized for discovery (e.g. Cabinets → Shop by Construction [RTA/Assembled], by Finish, by Color, Cabinet Hardware…) | construction type surfaced at **L1** (RTA / Assembled are top-level) |
| **Theming** | homeowner menu color, hero bg/image, content | different menu color, hero, content |
| **Clicking a menu item** (e.g. "RTA") | → a rich **landing/education page** (what it is, collections, free samples, design consult), then into the catalog | → **straight to the shopping category page** |

### The key boundary (important)

Audience mode shapes the **journey into** the catalog, but the **catalog itself is shared**:

- **Category pages and PDPs are the SAME for both audiences.**
- What differs: home page, menu structure, the **homeowner-only intermediate landing pages**, and
  theming.

So the commerce core stays common; mode is a "shell + entry-path" concern. (Trade-specific pricing
/ contractor program is a **later phase** — see §7.)

## 3. Decisions made so far

- Menu **content lives in code** (a config the developer edits), not Makeswift — *for the menu
  structure*. (Marketing landing-page content may still be Makeswift — see open questions.)
- We are writing the **full spec before building**.
- Homeowner = default mode. Trade preference remembered via cookie (~2 weeks).

## 4. Open questions (please answer inline)

### A. Mode representation & routing  ⚠️ biggest decision
- [ ] **Cookie-only (same URLs)** vs **path-based (`/trade` or `/pro`) + cookie**?
  - *Cookie-only:* one URL set; a cookie flips menu/home/theme. Simplest, but the two experiences
    share a URL — harder to link directly to the Trade home, and needs care with SEO + caching.
  - *Path-based + cookie (my recommendation):* Homeowner at root `/`, Trade at `/trade`. Cookie
    remembers preference and auto-redirects returning Trade visitors. Best for SEO, direct links,
    and clean caching — each audience is a real, linkable page.
  - **Your call / notes:** _____
- [ ] First-visit behavior: default to Homeowner always? Any signal that pre-selects Trade
  (e.g. logged-in contractor account)? **Notes:** _____
- [ ] Cookie duration confirm (2 weeks?) and name. **Notes:** _____

### B. Menu
- [ ] Confirm the **exact L1 list** for each audience (drafts in §2 — final order + labels?).
- [ ] Full **L2 structure** per audience — for each L1 item, what are the groups/links? (Cabinets
      example given; need the rest.)
- [ ] **Utility bar** (thin top strip): call number, downloads, showrooms, free samples — same for
      both audiences or different? Where does the **audience toggle** live — utility bar or main nav?
- [ ] Mega-menu vs simple dropdown per L1 item — images? promo area? (per category or shared panel?)

### C. Homeowner landing / education pages (the "RTA detail page" type)
- [ ] One per **what**? (per construction type? per category? per L1 item?) How many at launch?
- [ ] Content home: **Makeswift** (editable by marketing, recommended for these) or **code**?
- [ ] Do Trade users ever see these, or always skip straight to the category page?

### D. Theming per audience
- [ ] Which tokens change: menu color, hero background, hero image, accent color, fonts? List them.
- [ ] Is Trade a **different accent color** or the **same brand red** with different imagery/tone?
- [ ] Any shared elements that must NOT change (logo, footer)?

### E. Scope of "mode" (how far it reaches)
- [ ] **Now:** home + menu + landing pages + theming. Category/PDP shared. ✅ (confirmed)
- [ ] **Later:** trade pricing, contractor-program gating, login. Confirm these are Phase 2+.

## 5. What's shared vs mode-specific (summary)

| Shared (same both modes) | Mode-specific |
| --- | --- |
| Category pages | Home page |
| PDP (product pages) | Top nav menu (structure + theme) |
| Cart / checkout | Homeowner landing/education pages |
| Footer (?) | Hero colors / images |
| Logo (?) | Utility bar contents (?) |

## 6. Proposed phased build (for discussion)

1. **Mode foundation** — how mode is stored (cookie ± path), read on the server, and switched
   (the toggle). Everything else depends on this.
2. **Menu** — the two menu structures in code, wired to mode + theming per mode.
3. **Home pages** — two home experiences (likely Makeswift-driven content, mode-selected).
4. **Homeowner landing pages** — the RTA-style education pages (Makeswift?).
5. **(Later) Trade commerce** — pricing, contractor program, login gating.

## 7. Out of scope for now (later phases)

- Trade/contractor pricing, special pricing, login-gated pricing.
- Contractor program signup/management.
- Category reorganization at the data level (we handle differing *menu* org in the menu config; the
  underlying BigCommerce category tree stays as-is).

---

### Questions for you
1. Answer the open questions in §4 (especially **A — routing**, the foundational one).
2. Anything in §2 wrong or missing?
3. Is the phased build (§6) the right order for you?
