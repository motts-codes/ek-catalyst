# Deploying Catalyst — a guide for Stencil developers

How to ship this storefront, and why it is nothing like `stencil push`.

Written for someone coming from Stencil. Read §1 first — the mental model is the part that transfers
least.

---

## 1. The big shift: there is no "theme push"

In **Stencil**, `stencil push` uploads a **theme bundle** to your store's *My Themes*, and you
**apply** it in the control panel. The theme runs *inside* BigCommerce's hosting.

**Catalyst is not a theme.** It is a complete **Next.js application that runs outside BigCommerce**.
Your "theme" changes (tokens, `vibes/` components, page structure, bug fixes) are just app code.
There is no bundle and nothing to "apply." Instead:

> `catalyst deploy` **builds the whole app** (via the OpenNext adapter) and **ships it to
> Cloudflare**, managed by BigCommerce as an **"infrastructure project."** The store connects to it
> by pointing a **channel's site URL** at the deployed hostname.

This project is wired for **BigCommerce Native Hosting → Cloudflare** (the `catalyst` and `wrangler`
CLIs; `catalyst deploy` targets Cloudflare). It is **CLI-driven** — not git-push-to-deploy, and not
Vercel. (Any `.vercel/` directory you see elsewhere on disk belongs to a *different* project, not
this repo.)

### Stencil → Catalyst cheat-sheet

| Stencil | Catalyst (this project) |
| --- | --- |
| `stencil push` (upload theme bundle) | `pnpm run deploy` → `catalyst deploy` (build + ship app to Cloudflare) |
| Apply theme in control panel *My Themes* | `catalyst deploy --update-site-url` (repoint a channel's site URL) |
| `stencil start` / `stencil bundle` | `pnpm run dev` (local) / `pnpm run build` |
| Runs *inside* BigCommerce hosting | Runs *outside* — Cloudflare, linked as a BC "infrastructure project" |
| Theme = the deliverable | App = the deliverable; the store just points a channel at it |

---

## 2. Prerequisites

- **Node 24** — `nvm use 24`. The app fails on older Node (see [CLAUDE.md](../CLAUDE.md)); the CLI
  should be run on the same version.
- A valid `.env.local` (store hash, channel ID, `CATALYST_ACCESS_TOKEN`, storefront tokens). The
  CLI auto-reads the target store from here.
- BigCommerce credentials you can log in with when the CLI prompts.

Configuration priority the CLI uses: `flags > --env-path file > process.env > .env.local
(auto-loaded) > .bigcommerce/project.json`.

---

## 3. First time only — link the infrastructure project

This project is **not linked yet** (there is no `.bigcommerce/project.json`). Before the first
deploy, create the infrastructure project. This is the first-time path and is different from the
steady-state deploy.

```bash
nvm use 24
pnpm exec catalyst project create
```

What it does: walks you through a **BigCommerce login**, creates a new infrastructure project, links
it to this local project, and writes `.bigcommerce/project.json` (the link file).

If a project already exists for this store and you just need to connect to it:

```bash
pnpm exec catalyst project link                 # interactive: select or create
pnpm exec catalyst project link --project-uuid <UUID>   # or link directly by UUID
pnpm exec catalyst project list                 # see existing projects for the store
```

> `catalyst project delete` is **irreversible** — it permanently deletes the infrastructure project.
> Do not run it unless you are certain.

---

## 4. Every deploy after that

This is the `stencil push` equivalent.

```bash
nvm use 24
pnpm run deploy      # = npm run generate && catalyst deploy → builds (OpenNext) and ships to Cloudflare
```

It builds and deploys, then returns a **hostname**. Useful flags on `catalyst deploy`:

| Flag | Purpose |
| --- | --- |
| `--dry-run` | Build the bundle without uploading/deploying (safe rehearsal) |
| `--prebuilt` | Skip the build; deploy existing `.bigcommerce/dist/` output |
| `--secret KEY=VALUE` | Set/override a deploy secret for this run (repeatable) |
| `--update-site-url` | After deploy, prompt to repoint a channel's site URL (see §5) |

---

## 5. Connecting the storefront (the "apply" step) — and is it safe?

**Key reassurance:** a plain `catalyst deploy` does **not** hijack your sandbox's live URL. It only
produces a hostname you can preview. The live storefront switches over **only** when you repoint the
channel:

```bash
pnpm exec catalyst deploy --update-site-url
```

So the safe pattern is: **deploy → preview the hostname → repoint the channel only when ready.** You
can iterate on preview deploys without touching what customers see.

---

## 6. Other useful commands

```bash
pnpm exec catalyst logs          # logs from the deployed app
pnpm exec catalyst domains       # manage custom domains for the project
pnpm exec catalyst env add       # persistent deploy secrets (sent on every deploy)
pnpm exec catalyst env           # manage those persistent env vars
```

For CI / team deploys, move secrets from `.env.local` into `catalyst env` so deploys don't depend on
a local file. Persistent env vars are sent automatically on every `catalyst deploy`, so you no longer
need to pass `--secret` each time.

---

## 7. Quick reference

```bash
# one-time setup
nvm use 24
pnpm exec catalyst project create        # link (BigCommerce login) → writes .bigcommerce/project.json

# rehearse without shipping
pnpm exec catalyst deploy --dry-run

# ship
pnpm run deploy                          # build + deploy to Cloudflare → returns a hostname

# go live (repoint the channel to the new hostname)
pnpm exec catalyst deploy --update-site-url
```
