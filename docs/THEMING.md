# Theming Catalyst — a guide for Stencil developers

This explains **where colors, fonts, and spacing live** in this Catalyst storefront, how the
layers cascade (this is the part that trips people up), and **exactly which files to edit for the
Category (PLP) and Product (PDP) pages**.

Written assuming you know Stencil. Read the "Mental model shift" section first — Catalyst is not
Stencil-with-React, the theming model is genuinely different.

---

## 0. Division of labor: local dev (code) vs Makeswift (builder)

This project's working model: **the theme is built in code; Makeswift is the client's page-assembly
layer on top of it.** These are two independent systems with a clean boundary — they are *not* two
ways to do the same job.

| | **Local dev (code) — you** | **Makeswift builder — client, later** |
| --- | --- | --- |
| Governs | How things *look* by default: tokens, component library, page structure | *Which* registered components go *where*, and their content |
| Colors / fonts | ✅ Set here (`globals.css`, `base-colors.tsx`, `app/fonts.ts`) | ⚠️ Leave the theme panel **unset** (see warning below) |
| Spacing | ✅ Tailwind classes in components (§5) | ❌ Not exposed |
| Component look/markup | ✅ Edit / create in `vibes/`, then register | ❌ Can only *place* what you registered |
| Landing pages | — | ✅ Build freely via the catch-all route |
| Promo blocks on PLP/PDP/home | Provide the `<Slot>` (code) | ✅ Fill the slot (builder) |

**Why the split works:** Makeswift can only place components **you registered** and only override
tokens **you exposed**. Your code is the foundation; the builder is assembly on top. Build the
foundation well and the client's builder experience is good for free.

**The two mechanisms that make "client builds pages later" work — both already present here:**

1. **Registered components** — [lib/makeswift/components.ts](../lib/makeswift/components.ts) registers
   16 components (`product-card`, `product-detail`, `card`, `carousel`, `slideshow`, `section`,
   `site-header`, `site-footer`, …). *Registering is a code task; using is a builder task.* To give
   the client a new building block: build it in `vibes/`, wrap + register it under
   `lib/makeswift/components/`, add its import to `components.ts`.
2. **The catch-all landing-page route** —
   [app/[locale]/(default)/[...rest]/page.tsx](../app/[locale]/(default)/[...rest]/page.tsx) renders
   `<Page>` from Makeswift for *any* path the client creates in the builder (e.g. `/summer-sale`),
   with **zero new code**. This is the landing-page workflow.
3. **`<Slot>`s on fixed pages** — structured pages (category/product/home) embed bounded editable
   regions (e.g. category page's `category-{id}-top-content` / `-bottom-content` slots) so the client
   can drop promos in **without** being able to break the product grid.

> ⚠️ **While building the theme in code, keep Makeswift's *theme panel* (site-theme fonts/colors)
> unset/default.** Those are cascade **layer 3** and silently override your code tokens (§2). The
> builder's *page composition* (landing pages, slots, content) is fair game for the client; the
> builder's *theme values* should stay empty so code stays the single source of truth for the theme.
> If a code token edit "won't take," someone set it in the theme panel — clear it there.

**Rule of thumb:** *look & structure → code. Composition & content → Makeswift.*

---

## 1. Mental model shift from Stencil

| Stencil concept | Catalyst equivalent |
| --- | --- |
| `config.json` theme editor / "Theme Settings" in the control panel | Two things: **CSS variable tokens** in code (`globals.css` / `base-colors.tsx`) **and** the **Makeswift visual builder** (runtime overrides) |
| SCSS partials (`_settings.scss`, `theme.scss`) | **Tailwind utility classes** + **CSS variables** (HSL tokens) |
| Handlebars templates (`templates/pages/product.html`) | **React Server Components**: `app/[locale]/(default)/.../page.tsx` |
| Stencil "regions" / widgets / Page Builder | **Makeswift `<Slot>`** components + the Makeswift builder |
| `{{theme_settings.color-textBase}}` | `hsl(var(--foreground))` etc. |
| Stencil objects/props passed to Handlebars | `Streamable<T>` props passed from `page.tsx` into `vibes/` components |

Key difference: **there is no single theme file.** Design tokens are declared in code, but they can
be **overridden at runtime by the Makeswift builder**. And **spacing is not tokenized at all** — it
lives as literal Tailwind classes inside each component. More on all three below.

---

## 2. The theming layers and what wins (read this before editing anything)

Colors and fonts are driven by **CSS custom properties** (variables) on `:root`. The same `:root`
variables are declared in **three** places, injected in this source order inside the page. **Later
in the cascade wins**, so the precedence is:

```
1. globals.css                         (lowest priority)
      ↓ overridden by
2. <BaseColors />  (base-colors.tsx)   — rendered in <head>, same values as globals.css
      ↓ overridden by
3. Makeswift runtime theme provider    (HIGHEST priority — only when set in the builder)
```

Where this is wired — [app/[locale]/layout.tsx](../app/[locale]/layout.tsx#L148-L153):

```tsx
import '../../globals.css';              // layer 1 — imported at top of module
// ...
<html className={clsx(fonts.map((f) => f.variable))}>   // registers next/font vars
  <head>
    <SiteTheme />   {/* renders <BaseColors/> (layer 2) then the Makeswift provider (layer 3) */}
  </head>
```

[lib/makeswift/components/site-theme/index.tsx](../lib/makeswift/components/site-theme/index.tsx)
renders both layer 2 and layer 3:

```tsx
<BaseColors />                                  {/* layer 2: <style data-makeswift="theme-base-colors"> */}
<Component type={COMPONENT_TYPE} … />           {/* layer 3: <style data-makeswift="theme"> from builder */}
```

### ⚠️ The gotcha that will waste your afternoon

**If a value is set in the Makeswift builder, editing the code tokens does nothing** — layer 3 wins.
Symptoms: you change `--primary` in `globals.css`, save, and the color on screen doesn't move.

- If your store's Makeswift site has theme values configured → **change them in the Makeswift
  builder**, not in code.
- If it does not → **edit the code tokens** (below) and they take effect.

To check what layer 3 is emitting: open the rendered page's DevTools and look for
`<style data-makeswift="theme">` in `<head>`. If it declares `--primary`, `--foreground`, font
families, etc., the builder is the source of truth for those.

---

## 3. Colors — where to edit

### Global color tokens (affect the whole site)

Colors are HSL **triplets without the `hsl()` wrapper** (e.g. `96 100% 68%`). The `hsl(...)`
wrapper is added in `tailwind.config.js`. This is why you write `--primary: 96 100% 68%;`, not
`hsl(96 100% 68%)`.

Edit in **both** of these so code and the "default" match (they hold identical values by design):

1. [globals.css](../globals.css) — the `:root` block (layer 1).
2. [lib/makeswift/components/site-theme/base-colors.tsx](../lib/makeswift/components/site-theme/base-colors.tsx) — the `colors` object (layer 2, **the one that actually renders** in `<head>`; if you only edit `globals.css` and not this, layer 2 overrides you right back).

The semantic tokens available:

| Token | Meaning (Stencil analogue) |
| --- | --- |
| `--primary` | Brand/action color (`color-primary`) |
| `--accent` | Secondary brand accent |
| `--background` / `--foreground` | Page bg / default text |
| `--success` `--error` `--warning` `--info` | Status colors |
| `--contrast-100 … --contrast-500` | Neutral grays, light→dark (borders, muted text, secondary bg) |

`tailwind.config.js` maps these to utilities: `bg-primary`, `text-foreground`, `border-contrast-100`,
`text-contrast-500`, etc. It also auto-derives `primary-highlight` / `primary-shadow` via
`color-mix()`, so you rarely define tints manually.

### Component-scoped color overrides (target one component, e.g. just the PDP)

Every `vibes/` component documents its **own** namespaced CSS variables that **fall back to the
global tokens**. This is the clean way to restyle one area without touching global tokens. Each
component file has a JSDoc block listing them. Example from
[vibes/soul/sections/product-detail/index.tsx](../vibes/soul/sections/product-detail/index.tsx#L80-L95):

```css
:root {
  --product-detail-border: hsl(var(--contrast-100));
  --product-detail-subtitle-font-family: var(--font-family-mono);
  --product-detail-title-font-family: var(--font-family-heading);
  --product-detail-primary-text: hsl(var(--foreground));
  --product-detail-secondary-text: hsl(var(--contrast-500));
}
```

To override, add these vars to a `:root` block in `globals.css` (or scope them under a class). You
are overriding the *component's* variable, not the global one — so other components stay unaffected.

---

## 4. Fonts — where to edit

Three-step chain (different from colors — the font *files* are loaded separately from the *token
mapping*):

1. **Load the font** — [app/fonts.ts](../app/fonts.ts) uses `next/font/google`. Each font exposes a
   CSS variable like `--font-family-inter`, `--font-family-dm-serif-text`, `--font-family-roboto-mono`.
   The `fonts` array is spread onto `<html>` in the layout, making those vars available.
   *To add a font*, import it here (from `next/font/google` or `next/font/local`), give it a
   `variable`, and add it to the `fonts` array.

2. **Map semantic roles to a font** — the app consumes three *semantic* font tokens:
   `--font-family-heading`, `--font-family-body`, `--font-family-mono`. These get their real values
   from the **Makeswift font tokens** (layer 3), emitted by
   [lib/makeswift/components/site-theme/client.tsx](../lib/makeswift/components/site-theme/client.tsx)
   via `fontTokensToCssVars`. The control is defined in `lib/makeswift/controls/font-tokens`.
   **In practice: the heading/body/mono → actual-font mapping is set in the Makeswift builder.**
   If you need it hardcoded, add e.g. `--font-family-heading: var(--font-family-dm-serif-text);` to
   `:root` in `globals.css` (but remember layer 3 will override it if the builder has a value).

3. **Use it** — `tailwind.config.js` exposes `font-heading`, `font-body`, `font-mono` utilities,
   and the `@tailwindcss/typography` `prose` styles already point `h1..h6` at `--font-family-heading`
   and `p` at `--font-family-body`.

Font sizes are tokens too: `--font-size-xs … --font-size-9xl` in `globals.css` / `tailwind.config.js`,
used as `text-xs … text-9xl`.

---

## 5. Spacing — this is NOT a token, edit the component directly

**Important and counter-intuitive coming from Stencil's SCSS spacing maps:** there is **no global
spacing token**. Padding, margins, gaps, and max-widths are **hardcoded Tailwind utility classes
inside each `vibes/` component**, and they use **container-query breakpoints** (`@xl:`, `@4xl:` —
note the `@`, these respond to the *container's* width, not the viewport).

Example — the PDP outer wrapper in
[vibes/soul/sections/product-detail/index.tsx](../vibes/soul/sections/product-detail/index.tsx):

```tsx
<div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
```

To change PDP spacing, you **edit those classes in the component file**. There is no central knob.
The same pattern (`px-* py-* gap-* max-w-*` with `@`-breakpoints) applies to every section.

If you want a spacing change to apply site-wide consistently, you either edit each component or add a
spacing scale to `tailwind.config.js theme.extend.spacing` and adopt it — but out of the box, spacing
is per-component.

---

## 6. Category (PLP) page — exact files

**Route / data:** [app/[locale]/(default)/(faceted)/category/[slug]/page.tsx](../app/[locale]/(default)/(faceted)/category/[slug]/page.tsx)
— fetches faceted search, builds `Streamable`s, and renders **`<ProductsListSection>`**. It also renders
Makeswift `<Slot>`s for "top content" and "bottom content" (editable in the builder, not code).

**Presentation (edit these to restyle):**

| What you want to change | File |
| --- | --- |
| Overall PLP layout: filters panel + grid, sort bar, breadcrumbs, spacing | [vibes/soul/sections/products-list-section/index.tsx](../vibes/soul/sections/products-list-section/index.tsx) |
| The product grid / list itself + empty-state colors & fonts | [vibes/soul/sections/product-list/index.tsx](../vibes/soul/sections/product-list/index.tsx) — vars like `--product-list-*` |
| Each product card (image, title, price, hover, light/dark variants) | [vibes/soul/primitives/product-card/index.tsx](../vibes/soul/primitives/product-card/index.tsx) — vars like `--product-card-focus`, `--product-card-light-title`, `--product-card-font-family` |
| Filters sidebar (facets, checkboxes, ranges) | `vibes/soul/sections/products-list-section/filters-panel.tsx` |
| Sort dropdown | `vibes/soul/sections/products-list-section/sorting.tsx` |
| Breadcrumbs | `vibes/soul/sections/breadcrumbs/` |

**Product-card color override example** (put in `globals.css` `:root` to recolor cards store-wide):

```css
:root {
  --product-card-light-title: hsl(var(--foreground));
  --product-card-light-background: hsl(var(--contrast-100));
  --product-card-focus: hsl(var(--primary));
  --product-card-font-family: var(--font-family-body);
}
```

> Note: the Brand pages and Search results reuse the **same** `ProductsListSection`, so restyling it
> updates all three (category, brand, search).

---

## 7. Product (PDP) page — exact files

**Route / data:** [app/[locale]/(default)/product/[slug]/page.tsx](../app/[locale]/(default)/product/[slug]/page.tsx)
— builds all the product `Streamable`s and renders three things: `<ProductDetail>`, a
`<FeaturedProductCarousel>` (related products), and `<Reviews>`.

**One wrinkle:** the PDP imports `ProductDetail` from
[lib/makeswift/components/product-detail](../lib/makeswift/components/product-detail/index.tsx), which is a
**Makeswift wrapper** around the vibes section (so it's editable in the builder). The actual UI/markup
you edit for styling still lives in the vibes section below.

**Presentation (edit these to restyle):**

| What you want to change | File |
| --- | --- |
| The whole PDP: gallery, title, price, options/variants, add-to-cart, accordions, spacing | [vibes/soul/sections/product-detail/index.tsx](../vibes/soul/sections/product-detail/index.tsx) — vars: `--product-detail-border`, `--product-detail-title-font-family`, `--product-detail-subtitle-font-family`, `--product-detail-primary-text`, `--product-detail-secondary-text` |
| PDP outer padding / vertical rhythm | Same file — the `px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20` classes (spacing is hardcoded, see §5) |
| "Related products" carousel | [vibes/soul/sections/featured-product-carousel/index.tsx](../vibes/soul/sections/featured-product-carousel/index.tsx) + the `product-card` primitive |
| Reviews block | [vibes/soul/sections/reviews/index.tsx](../vibes/soul/sections/reviews/index.tsx) |
| Breadcrumbs | `vibes/soul/sections/breadcrumbs/` |

**PDP color/font override example:**

```css
:root {
  --product-detail-title-font-family: var(--font-family-heading);
  --product-detail-primary-text: hsl(var(--foreground));
  --product-detail-secondary-text: hsl(var(--contrast-500));
  --product-detail-border: hsl(var(--contrast-100));
}
```

---

## 8. Decision cheat-sheet

- **Change a color/font everywhere** → `globals.css` **and** `base-colors.tsx` (colors) / `app/fonts.ts` +
  font tokens (fonts). ⚠️ Check the Makeswift builder isn't overriding it (§2).
- **Restyle just the PDP or just the cards, keep the rest** → override that component's namespaced
  `--component-*` CSS variables in `globals.css`. Read the JSDoc block at the top of the component
  file for the full list.
- **Change spacing / padding / gaps** → edit the Tailwind classes **inside the component file**
  (§5). There is no token.
- **Change markup / structure / add elements** → edit the `vibes/` section `index.tsx`. Keep data
  fetching in `page.tsx`; keep presentation in `vibes/`.
- **Values seem set by non-developers / won't budge from code** → they're in the **Makeswift
  builder** (layer 3). Edit there.

---

## 9. After editing — how to see it

Requires **Node 24** (`nvm use 24`) — the app 500s on older Node (see `CLAUDE.md`).

```bash
nvm use 24
pnpm run dev        # http://localhost:3000
```

Tailwind's `content` globs already include `app/`, `components/`, and `vibes/`, so class changes in
those hot-reload. CSS-variable changes in `globals.css` / `base-colors.tsx` also hot-reload.
