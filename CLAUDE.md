# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single BigCommerce **Catalyst** storefront (`@bigcommerce/catalyst-makeswift`) — a Next.js 16 App Router app using React Server Components, the BigCommerce GraphQL Storefront API, Makeswift visual editing, and Auth.js. Unlike the upstream Catalyst monorepo (where the app lives in `/core`), this is an extracted single app at the repo root — the AGENTS.md references to `/core` do not apply; all paths below are repo-root relative.

## Toolchain — this matters

- **Node.js 24 is required** (`engines.node: ">=24.0.0"`). Not a soft requirement: the auth proxy in [proxies/with-auth.ts](proxies/with-auth.ts) constructs `new URLPattern(...)`, and `URLPattern` is only a native global on Node 24 (it is `undefined` on Node 18/20/22). On older Node, either Next refuses to start (18) or the proxy throws and **every route returns HTTP 500** (20/22). If pages 500 with `URLPattern is not a constructor`, the running Node version is wrong — `nvm use 24`.
- **pnpm** is the package manager (`pnpm@10.32.1` via corepack). `npm run` works for scripts but use `pnpm install`.

## Commands

```bash
pnpm run dev        # generate GraphQL schema/types, then next dev (Turbopack) on :3000
pnpm run build      # generate, then catalyst build
pnpm start          # catalyst start (serve production build)
pnpm run generate   # regenerate GraphQL schema + gql.tada types from BigCommerce
pnpm run lint       # eslint . --ext .js,.jsx,.ts,.tsx
pnpm run typecheck  # next typegen implied via prelint; runs tsc --noEmit
pnpm run deploy     # generate, then catalyst deploy
```

`dev`, `build`, and `deploy` all run `generate` first. **`generate` reads `.env.local`** (via `dotenv -e .env.local`) and fails without `BIGCOMMERCE_STORE_HASH` — a valid `.env.local` is required even to start the dev server. Copy `.env.example` to `.env.local` and fill in store hash, channel ID, storefront tokens, `AUTH_SECRET`, and `MAKESWIFT_SITE_API_KEY`.

### Tests

Playwright is configured (`playwright.config.ts`, `testDir: ./tests`) but **there is no `test` script in package.json**. Run directly with `pnpm exec playwright test`, a single file with `pnpm exec playwright test tests/ui/<file>`, and a single test with `-g "<test name>"`. Test infrastructure lives in `tests/` (`fixtures/`, `lib/`, `routes.ts`, `ui/`, `visual-regression/`).

## Architecture

### Proxy stack replaces file-based routing

The single most important thing to understand. [proxy.ts](proxy.ts) composes an ordered proxy chain (`proxies/` dir) that runs on nearly every request (see the `matcher` in proxy.ts — everything except `api`, `admin`, static assets, sitemap/robots):

```
withAuth → withMakeswift → withIntl → withAnalyticsCookies → withChannelId → withGraphqlProxy → withRoutes
```

`withRoutes` ([proxies/with-routes.ts](proxies/with-routes.ts)) is the key one: it **queries the BigCommerce GraphQL API to resolve the incoming URL** to an entity (product / category / brand / blog / page), then rewrites to the internal Next route (e.g. `/my-product` → `/en/product/123`) and handles BigCommerce-configured redirects. Content structure is driven by the BigCommerce backend, not the filesystem — do not assume a URL maps to a file under `app/`.

### `page.tsx` vs `vibes/` — data vs presentation

Strict separation, enforced by convention:

- **`app/**/page.tsx`** — does all data fetching, auth, and API-response transformation. Wraps async work in `Streamable.from(...)` and passes streamables down as props.
- **`vibes/soul/`** — the styleable UI design system. Components **accept `Streamable<T>` props** and render them; they contain no data fetching or business logic. Structure: `primitives/` (buttons, cards, forms), `sections/` (composed page sections), `form/`, `lib/`.
- **`components/`** — app-specific business/logic components (distinct from the reusable `vibes/` design system).

Never fetch data inside `vibes/`; never put presentation/styling logic in `page.tsx`.

### Streamable + PPR

Data flows as `Streamable<T> = T | Promise<T>` ([vibes/soul/lib/streamable.tsx](vibes/soul/lib/streamable.tsx)). `page.tsx` creates streamables with `Streamable.from(factory)`; components consume them via the `<Stream value={...} fallback={...}>` component or `useStreamable()`. This pairs with Next.js Partial Prerendering so static shell renders immediately and dynamic data streams in. Reuse a streamable by awaiting it in another factory — the promise is deduped, not re-fetched.

### GraphQL client

All BigCommerce Storefront API access goes through the centralized client in [client/](client/) (`client/graphql.ts`, `client/index.ts`) — never hand-roll fetches to the API. The client resolves channel ID per-locale ([channels.config.ts](channels.config.ts) maps locale → channel, defaulting to `BIGCOMMERCE_CHANNEL_ID`), attaches auth tokens, forwards IP for personalization, logs queries in dev, and handles auth-redirect errors. Types are generated by **gql.tada** into `bigcommerce-graphql.d.ts` / `bigcommerce.graphql` — these are generated artifacts; regenerate with `pnpm run generate` rather than editing by hand.

Use React's `cache()` for per-request memoization of server-side fetches (React invalidates it each request).

## Conventions

- Import aliases: `~/*` → repo root, `@/vibes/*` → `vibes/*` (see [tsconfig.json](tsconfig.json)). Import design-system components from `@/vibes/soul/...`.
- Routes live under `app/[locale]/` — i18n is baked into the route structure; locale is a path segment. Messages in `messages/`, i18n config in `i18n/`.
- The `/admin` route redirects to the BigCommerce control panel only when `ENABLE_ADMIN_ROUTE=true`.
