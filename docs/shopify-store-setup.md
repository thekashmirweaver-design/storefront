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
- **Checkout branding (optional):** `read_checkout_branding_settings`, `write_checkout_branding_settings`
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

**Admin API for forms (`SHOPIFY_ADMIN_ACCESS_TOKEN` or partner app CLI)**

Newsletter and contact forms call Admin GraphQL (`customerCreate`, `customerEmailMarketingConsentUpdate`, `customerUpdate`, `tagsAdd`) from the Next.js server via [`admin.ts`](../src/lib/commerce/shopify/admin.ts).

**Option A — direct token (production):** Set `SHOPIFY_ADMIN_ACCESS_TOKEN` in `.env.local` from a custom app or offline Partner app token with `read_customers` + `write_customers`.

**Option B — partner app CLI (local dev, same as seed):** Set `SHOPIFY_PARTNER_APP_DIR` (default `/tmp/shopify-probe/kashmir-weaver-probe`). When no admin token is set, `admin.ts` falls back to `shopify app execute` — requires Shopify CLI logged in and partner app installed with customer scopes.

Setup for Option B:

1. Deploy partner app scopes — see [Partner app scopes](#partner-app-scopes-admin-api--seed) above (`shopify app deploy --allow-updates` from the partner app dir).
2. Re-approve on the dev store if prompted — open the app from **Shopify Admin → Apps**, or run `shopify app dev -s YOUR-STORE.myshopify.com` once and accept new permissions.
3. Verify: `pnpm verify:shopify` should not warn about missing admin access.

Optional: `SHOPIFY_ADMIN_API_VERSION` (default `2025-07`).

**Newsletter:** creates or updates a customer with `emailMarketingConsent` = `SUBSCRIBED` and tag `newsletter`.

**Contact:** creates or updates a customer with tag `contact-form` and an appended note containing name, email, subject, and message. View submissions in **Shopify Admin → Customers** (filter by tag).

## Customer Account API (Phase 6)

Login, order history, and wishlist sync use the **Customer Account API** with OAuth PKCE. Routes live under `app/api/auth/customer/`; session and API helpers in `src/lib/commerce/shopify/customer/`.

### Env vars

| Variable | Required | Description |
|---|---|---|
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | Yes | OAuth client ID (see below) |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET` | No | Only for confidential clients |
| `SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION` | No | Default `2025-04` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Must match registered callback/logout/origin URLs |

Callback, logout, and JavaScript origin URLs are derived from `NEXT_PUBLIC_SITE_URL` in code — do not set separate callback env vars.

### Option A — Partner app `customer_authentication` (automatable via CLI)

Recommended for local dev with the partner app at `SHOPIFY_PARTNER_APP_DIR`.

1. Add to the partner app `shopify.app.toml`:

   ```toml
   [customer_authentication]
   redirect_uris = ["{NEXT_PUBLIC_SITE_URL}/api/auth/customer/callback"]
   javascript_origins = ["{NEXT_PUBLIC_SITE_URL}"]
   logout_urls = ["{NEXT_PUBLIC_SITE_URL}/account"]
   ```

2. Deploy: `shopify app build && shopify app deploy --allow-updates` (from the partner app directory).

Partner app scopes also need **Customer Account API** scopes (separate from Admin `read_customers`):

`customer_read_orders`, `customer_read_customers`, `customer_write_customers`

After adding them to `shopify.app.toml`, deploy and **re-approve the app on the dev store** (Shopify Admin → Apps → your app → approve updated permissions). Without this, OAuth shows *“The client credentials provided are invalid or missing.”*

### Troubleshooting: “client credentials invalid or missing” on login

| Cause | Fix |
|-------|-----|
| Missing `customer_read_*` scopes on app install | Deploy partner app with scopes above; re-approve app on store |
| Wrong client ID | Use partner app Client ID from `shopify app info` **after** `[customer_authentication]` deploy, **or** Headless channel Client ID (Option B below) |
| `redirect_uri` mismatch | `NEXT_PUBLIC_SITE_URL` must match `[customer_authentication].redirect_uris` exactly (re-deploy if ngrok URL changed) |

1. **Shopify Admin → Sales channels → Headless** → your storefront → **Customer Account API**.
2. Copy **Client ID** from Credentials.
3. Under **Application setup**, register:
   - Callback: `{NEXT_PUBLIC_SITE_URL}/api/auth/customer/callback`
   - Logout: `{NEXT_PUBLIC_SITE_URL}/account`
   - JavaScript origin: `{NEXT_PUBLIC_SITE_URL}`

### Wishlist metafield

Seed the `custom.wishlist` customer metafield definition (JSON, `customerAccount: READ_WRITE`):

```bash
pnpm seed:shopify
```

The definition step runs at the start of the seed; re-run is safe if `custom.wishlist (exists)` is logged.

### Verify

```bash
pnpm build:shopify
pnpm dev:shopify
curl -sS -D - -o /dev/null http://localhost:3000/api/auth/customer/login   # expect 307 → shopify.com/authentication/...
```

Then open `/account` and complete sign-in through the **same URL** as `NEXT_PUBLIC_SITE_URL` (ngrok or production). **Do not use `http://localhost:3000` for account login** — Shopify requires HTTPS callbacks; OAuth cookies and `redirect_uri` must match the registered tunnel URL.

## Checkout branding

Checkout runs on Shopify-hosted pages (`cart.checkoutUrl`). Brand the experience to match the storefront cream/gold theme.

### Option A — Seed script (Admin API)

When the partner app includes `read_checkout_branding_settings` and `write_checkout_branding_settings`, the full seed applies colors and logo via `checkoutBrandingUpsert`:

```bash
pnpm seed:shopify
pnpm seed:shopify -- --checkout-branding-only
```

Colors align with `app/globals.css` (`#1f1c19` background, `#efe8dc` text, `#c4a052` gold). Logo uses the shop `custom.logo_url` metafield (uploaded to Shopify Files first).

Requires a **Shopify Plus sandbox**, **Plus production store**, or a classic **Partner development store** plan. **App development stores** (Admin plan name **Basic App Development**, `shopify store info` → `"plan": "basic"`) often return `ACCESS_DENIED` on `checkoutBrandingUpsert` even when scopes are installed.

If `.env.local` sets `SHOPIFY_ADMIN_ACCESS_TOKEN`, the seed uses that token instead of the partner app. Unset it (or omit the variable) so `shopify app execute` runs from `SHOPIFY_PARTNER_APP_DIR` (`/tmp/shopify-probe/kashmir-weaver-probe`).

### Option A2 — Shopify CLI (no Admin UI)

Use the partner app directory and Shopify CLI 4.x:

```bash
STORE=the-kashmir-weaver-nncjdd3t.myshopify.com
APP=/tmp/shopify-probe/kashmir-weaver-probe

# Eligibility (API blockers show up here before you seed)
shopify store info -s "$STORE" --json
cd "$APP" && shopify app info
shopify app deploy --allow-updates   # non-interactive shells need this flag

# Checkout profile id for mutations
shopify app execute -s "$STORE" -q '{ checkoutProfiles(first: 5) { nodes { id name isPublished } } }'

# Store-scoped auth + mutation (account owner; needs eligible store plan)
shopify store auth -s "$STORE" --scopes read_checkout_branding_settings,write_checkout_branding_settings,write_files,read_files
shopify store execute -s "$STORE" --allow-mutations \
  -q 'mutation { checkoutBrandingUpsert(checkoutProfileId: "gid://shopify/CheckoutProfile/ID", checkoutBrandingInput: { designSystem: { colors: { global: { brand: "#c4a052", accent: "#c4a052" } } } }) { userErrors { message } } }'

# Full logo + colors (uploads `public/images/kashmir-weaver-logo.png`, sets `custom.logo_url`)
env -u SHOPIFY_ADMIN_ACCESS_TOKEN SHOPIFY_PARTNER_APP_DIR="$APP" pnpm seed:shopify -- --checkout-branding-only

# Or use the dedicated CLI script (same mutation as checkoutBrandingUpsert docs)
pnpm checkout:branding
```

`shopify app dev` re-grants scopes on install but does **not** change store plan eligibility. There is no CLI command to “enable” checkout branding on an ineligible store; theme CLI does not configure checkout branding. If CLI/API stays blocked, use Option B or move catalog to a Plus sandbox / classic dev store.

### Option B — Shopify Admin (manual)

1. **Shopify Admin → Settings → Checkout → Customize**
2. **Branding → Logo** — upload the same logo as `custom.logo_url` (square PNG/JPG, not SVG)
3. **Colors** — suggested palette:
   - Background: `#1f1c19` (ink)
   - Text: `#efe8dc` (cream)
   - Buttons / accents: `#c4a052` (gold)
   - Button text: `#1f1c19`
4. Save and preview checkout from the cart drawer **Continue to checkout** button

Customer Account sign-in pages can also be styled under **Settings → Customer accounts → Customize** for a consistent logo and colors.

## Phase 8 — Catalog webhooks (cache revalidation)

When `COMMERCE_PROVIDER=shopify`, catalog reads are cached with Next.js tags (`shopify-products`, `shopify-collections`, `shopify-articles`, `shopify-catalog`). Shopify webhooks call `POST /api/webhooks/shopify` to invalidate stale data after Admin edits.

### Env

| Variable | Description |
|---|---|
| `SHOPIFY_WEBHOOK_SECRET` | HMAC signing secret — Partner app **API secret key** or custom webhook secret from Admin |

### Option A — Partner app webhooks (recommended)

The `kashmir-weaver-probe` Partner app declares webhook subscriptions in `shopify.app.toml` pointing at `{NEXT_PUBLIC_SITE_URL}/api/webhooks/shopify`. After deploy:

```bash
cd /tmp/shopify-probe/kashmir-weaver-probe
shopify app deploy
```

Set `SHOPIFY_WEBHOOK_SECRET` to the app **API secret key** (same value Shopify uses to sign app webhooks).

### Option B — Custom Admin webhooks

1. **Shopify Admin → Settings → Notifications → Webhooks → Create webhook**
2. URL: `https://thekashmirweaver.com/api/webhooks/shopify`
3. Topics: product and collection create/update/delete (article topics via Admin custom webhooks only — not supported in Partner app subscriptions)
4. Copy the webhook signing secret into `SHOPIFY_WEBHOOK_SECRET`

### Verify

```bash
# Expect 401 without valid HMAC
curl -i -X POST "$NEXT_PUBLIC_SITE_URL/api/webhooks/shopify" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: products/update" \
  -d '{"handle":"example-product"}'
```

After a real product save in Admin, the storefront should reflect changes without waiting for the 1h catalog ISR fallback.

## Storefront API reference

For a full map of Storefront queries, mutations, fields, and scopes used by this app (plus Phase 3+ planned usage), see **[shopify-storefront-api-reference.md](./shopify-storefront-api-reference.md)**.

See also: [commerce-layer.md](./commerce-layer.md) · [shopify-driven-roadmap.md](./shopify-driven-roadmap.md) (phased plan + progress)
