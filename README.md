# Headless Shopify Storefront Template

Next.js App Router storefront with a provider-agnostic commerce layer. Run locally with static mock data, or connect to Shopify Storefront API for catalog, cart, search, customer accounts, and webhooks.

**Reference implementation:** The repo ships configured for [The Kashmir Weaver](https://thekashmirweaver.com) — use it as a working example, then rebrand for your own store.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev              # mock provider (no Shopify credentials)
# or
pnpm dev:shopify      # live Shopify catalog (set env vars first)
```

Default mode is **mock** (`COMMERCE_PROVIDER=mock`). See [`.env.example`](.env.example) for Shopify tokens, Customer Account OAuth, webhooks, and markets.

## Architecture

Catalog, brand, cart, and search flow through `src/lib/commerce/` behind a single toggle:

| `COMMERCE_PROVIDER` | Backend |
|---|---|
| `mock` (default) | Local static data — fast UI development |
| `shopify` | Shopify Storefront API (+ Admin API for forms, seed, webhooks) |

Details: **[docs/commerce-layer.md](docs/commerce-layer.md)**

## Documentation

| Guide | Purpose |
|---|---|
| [new-store-setup.md](docs/new-store-setup.md) | Fork this template for a new brand (effort, routes, deployment) |
| [shopify-store-setup.md](docs/shopify-store-setup.md) | Partner app, tokens, verification commands |
| [shopify-driven-roadmap.md](docs/shopify-driven-roadmap.md) | Phased Shopify integration (reference build) |
| [commerce-layer.md](docs/commerce-layer.md) | Provider boundary, env vars, data flow |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` / `pnpm dev:mock` | Dev server with mock provider |
| `pnpm dev:shopify` | Dev server with Shopify provider |
| `pnpm build` / `pnpm build:shopify` | Production build (mock or Shopify) |
| `pnpm verify:shopify` | Test Storefront API connection |
| `pnpm seed:shopify` | Seed catalog, menus, and metafields from `scripts/seed-shopify-catalog-data.mjs` |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |

Additional verify/smoke scripts: `verify:shopify:policies`, `verify:shopify:inventory`, `smoke:shopify:forms`, `checkout:branding` — see `package.json`.

## Prerequisites

Node.js 20+, pnpm, and (for Shopify mode) a Partner dev store plus [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) 4.x.
