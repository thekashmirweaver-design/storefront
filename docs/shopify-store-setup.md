# Shopify store setup

This Next.js app connects to Shopify via the **Storefront API** (headless). It does not use a Shopify theme or Hydrogen — only env vars and the commerce layer in `src/lib/commerce/shopify/`.

## Quick verify

```bash
pnpm verify:shopify
```

Or with Shopify CLI (confirms your CLI account can reach the store):

```bash
shopify store info --store the-kashmir-weaver-nncjdd3t.myshopify.com
```

## Required env vars

Copy [`.env.example`](../.env.example) to `.env.local` and set:

| Variable | Description |
|---|---|
| `COMMERCE_PROVIDER` | `shopify` |
| `SHOPIFY_STORE_DOMAIN` | `your-store.myshopify.com` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Public Storefront API token |

Optional:

| Variable | Default | Description |
|---|---|---|
| `SHOPIFY_STOREFRONT_API_VERSION` | `2025-01` | API version pin |
| `SHOPIFY_BLOG_HANDLE` | `news` | Blog handle for articles |

## Get a Storefront access token

### Option A — Shopify Admin (Headless channel)

1. Open **Shopify Admin → Sales channels → Headless**.
2. Create or open your storefront.
3. Copy the **Storefront API access token** and **store domain** into `.env.local`.

### Option B — Shopify CLI + Partner app (recommended for dev)

Use when you already have a Partner app with unauthenticated Storefront scopes (e.g. `unauthenticated_read_product_listings`).

1. Log in and authenticate the store:

   ```bash
   shopify auth login
   shopify store auth --store YOUR-STORE.myshopify.com \
     --scopes read_products,write_products,read_content,write_content
   ```

2. Install your app on the dev store (from the app directory):

   ```bash
   shopify app dev -s YOUR-STORE.myshopify.com
   ```

3. Create a Storefront token:

   ```bash
   shopify app execute -s YOUR-STORE.myshopify.com \
     -q 'mutation StorefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) { storefrontAccessTokenCreate(input: $input) { userErrors { message } storefrontAccessToken { accessToken title } } }' \
     -v '{"input":{"title":"GULRIZA Next.js Storefront"}}'
   ```

4. Paste the `accessToken` into `SHOPIFY_STOREFRONT_ACCESS_TOKEN` in `.env.local`.

5. Verify:

   ```bash
   pnpm verify:shopify
   ```

## Run the app

```bash
pnpm dev:shopify    # development
pnpm build:shopify  # production build with Shopify provider
```

## Seed the catalog (Phase 0)

Populate collections, products, and hero metafields from the mock catalog:

```bash
pnpm seed:shopify
```

Uses `shopify app execute` via Partner app at `SHOPIFY_PARTNER_APP_DIR` (default: `/tmp/shopify-probe/kashmir-weaver-probe`), or set `SHOPIFY_ADMIN_ACCESS_TOKEN` for direct Admin API access. The app needs `write_products`, `read_publications`, and `write_publications` scopes.

The script fills **all catalog fields** used by the Next.js storefront — titles, HTML descriptions, SEO, vendor, tags, Color variant, SKU, compare-at price, collection hero metafields, product metafields (`care_instructions`, `dimensions`), and **multiple images per product** uploaded from `src/assets/`.

Re-run safely — existing handles are updated in place (images replaced).

## Current store

| Field | Value |
|---|---|
| Store | The Kashmir Weaver |
| Domain | `the-kashmir-weaver-nncjdd3t.myshopify.com` |
| Shop ID | `81934581977` |
| Type | Dev store |

## Troubleshooting

**`UNAUTHORIZED` from Storefront API**

The token was revoked or copied incorrectly. Create a new token (see above) and update `.env.local`.

**`CommerceConfigError` on build**

`COMMERCE_PROVIDER=shopify` is set but `SHOPIFY_STORE_DOMAIN` or `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is missing.

**Empty product catalog**

The API connection can succeed while the store has no published products. Add products in Shopify Admin and ensure they are available to the Online Store / Headless channel.

**Shopify CLI: “App is not installed”**

Run `shopify app dev -s YOUR-STORE.myshopify.com` from your Partner app directory to install and grant scopes.

**Admin API token (`SHOPIFY_ADMIN_ACCESS_TOKEN`)**

Only needed for future Phase 2 features (newsletter, contact). Create a custom app in Shopify Admin with the scopes you need and paste the Admin API access token into `.env.local`.

## Storefront API reference

For a full map of Storefront queries, mutations, fields, and scopes used by this app (plus Phase 3+ planned usage), see **[shopify-storefront-api-reference.md](./shopify-storefront-api-reference.md)**.

See also: [commerce-layer.md](./commerce-layer.md) · [shopify-driven-roadmap.md](./shopify-driven-roadmap.md) (phased plan + progress)
