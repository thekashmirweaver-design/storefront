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


## Partner app scopes (Admin API / seed)

The Partner app at `SHOPIFY_PARTNER_APP_DIR` (default: `/tmp/shopify-probe/kashmir-weaver-probe`) must declare these scopes in `shopify.app.toml` and be deployed to the dev store (`shopify app deploy --allow-updates`), then re-approved on the store if Shopify prompts for new permissions:

- **Catalog & content:** `write_products`, `read_publications`, `write_publications`, `read_content`, `write_content`, `write_online_store_navigation`, `read_locations`, `write_inventory`, `read_metaobjects`, `write_metaobjects`
- **Customers (forms):** `read_customers`, `write_customers`
- **Policies & privacy:** `write_legal_policies`, `read_privacy_settings`, `write_privacy_settings`
- **Storefront (unauthenticated):** `unauthenticated_read_product_listings`, `unauthenticated_read_collection_listings`, `unauthenticated_read_content`, `unauthenticated_read_metaobjects`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`, `unauthenticated_read_product_inventory`

`read_customers` and `write_customers` are required for newsletter signup and contact form submissions (Phase 5). `write_online_store_navigation` is required for seeding the Online Store main menu. `read_metaobjects` and `write_metaobjects` are required for seeding FAQ metaobjects (`pnpm seed:shopify -- --faqs-only`). The FAQ metaobject definition lives in the partner app `shopify.app.toml` (`[metaobjects.app.faq]`) with `access.storefront = "public_read"` — deploy the app after changing that file (`shopify app deploy --allow-updates`), then re-approve scopes on the dev store if prompted. `read_locations` is required for locations/inventory seeding (Admin API `locations` field). `write_inventory` is required for inventory activation during seed (`inventoryActivate` and related Admin API mutations). `unauthenticated_read_product_inventory` exposes inventory on the Storefront API for product pages.

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

Required for **newsletter and contact forms** (Phase 5) when running `pnpm dev:shopify`. The Next.js server calls Admin GraphQL (`customerCreate`, `customerEmailMarketingConsentUpdate`, `customerUpdate`, `tagsAdd`) — it does not use `shopify app execute` at request time.

1. Deploy partner app scopes (`read_customers`, `write_customers`) — see [Partner app scopes](#partner-app-scopes-admin-api--seed) above.
2. Create a **custom app** in Shopify Admin (or use an offline token from your installed Partner app) with `read_customers` and `write_customers`.
3. Paste the Admin API access token into `.env.local` as `SHOPIFY_ADMIN_ACCESS_TOKEN`.

Optional: `SHOPIFY_ADMIN_API_VERSION` (default `2025-07`).

**Newsletter:** creates or updates a customer with `emailMarketingConsent` = `SUBSCRIBED` and tag `newsletter`.

**Contact:** creates or updates a customer with tag `contact-form` and an appended note containing name, email, subject, and message. View submissions in **Shopify Admin → Customers** (filter by tag).

## Storefront API reference

For a full map of Storefront queries, mutations, fields, and scopes used by this app (plus Phase 3+ planned usage), see **[shopify-storefront-api-reference.md](./shopify-storefront-api-reference.md)**.

See also: [commerce-layer.md](./commerce-layer.md) · [shopify-driven-roadmap.md](./shopify-driven-roadmap.md) (phased plan + progress)
