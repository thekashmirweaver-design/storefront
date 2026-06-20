# The Kashmir Weaver

Next.js storefront for The Kashmir Weaver — handwoven Kashmiri pashmina.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Default commerce mode is **mock** (no Shopify credentials needed).

## Commerce layer

Catalog, brand, cart, and search go through a provider-agnostic layer toggled by `COMMERCE_PROVIDER`:

- **`mock`** — local static data (default)
- **`shopify`** — Shopify Storefront API for catalog reads

Full documentation: **[docs/commerce-layer.md](docs/commerce-layer.md)**

Shopify integration roadmap (phased, with progress tracking): **[docs/shopify-driven-roadmap.md](docs/shopify-driven-roadmap.md)**

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server (mock provider) |
| `pnpm dev:mock` | Dev with mock provider |
| `pnpm dev:shopify` | Dev with Shopify provider |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |

## Environment

See [`.env.example`](.env.example) for all variables.
