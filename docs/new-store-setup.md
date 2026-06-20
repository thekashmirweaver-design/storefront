# New store setup guide

How to spin up a **new brand** from this Next.js headless storefront template (originally built for **The Kashmir Weaver**). This doc covers effort, Shopify Admin work, codebase changes, deployment, every route, social touchpoints, and how data flows between Shopify and the app.

**Related docs:**

- [commerce-layer.md](./commerce-layer.md) — architecture and provider toggle
- [shopify-store-setup.md](./shopify-store-setup.md) — tokens, partner app, verification commands
- [shopify-driven-roadmap.md](./shopify-driven-roadmap.md) — what was built for Kashmir Weaver (phases 0–8)
- [shopify-storefront-api-reference.md](./shopify-storefront-api-reference.md) — GraphQL map

---

## Executive summary

### Effort estimate (honest)

| Scenario | Who | Time | Outcome |
|----------|-----|------|---------|
| **Mock-only rebrand** | Dev with repo access | **4–8 hours** | Full UI in `pnpm dev:mock` with new logo, copy, mock catalog — no Shopify |
| **Minimum viable Shopify store** | Dev familiar with Shopify CLI | **2–3 days** | Live catalog, brand chrome, cart/checkout, forms — seed script + env + Vercel |
| **Production-ready new brand** | Dev + merchant content | **4–6 days** | Above + custom catalog/content, Customer Account login on prod URL, webhooks, markets, checkout branding |
| **First-time headless Shopify** | New to Partner apps / Storefront API | **5–8 days** | Same as production-ready, plus learning curve for scopes, OAuth, seed failures |

**Day-by-day breakdown (typical production path):**

| Day | Focus | Hours |
|-----|-------|-------|
| 1 | New Shopify dev store, clone/configure Partner app, `.env.local`, `pnpm verify:shopify` | 6–8h |
| 2 | Fork seed data (`seed-shopify-catalog-data.mjs`), run `pnpm seed:shopify`, fix menus/metafields | 6–8h |
| 3 | Mock + Shopify brand assets (`public/images/`), remove Kashmir strings, theme CSS if needed | 4–6h |
| 4 | Customer Account API URLs, webhooks, Vercel env, `pnpm build:shopify` | 4–6h |
| 5 | Content in Admin (metaobjects, blog), smoke tests, checkout/login branding in Admin | 4–8h |
| 6 (buffer) | Markets, analytics, legal copy review, production login smoke on live domain | 4–6h |

**What you do *not* need to rebuild:** React pages, cart drawer, commerce layer, OAuth routes, webhook handler — those are template-ready. **What you must customize:** seed profile, mock data, env vars, Partner app identity, Shopify Admin content, and brand assets.

---

## Prerequisites

### Accounts & tools

- [Shopify Partner account](https://partners.shopify.com) (for dev store + custom app)
- Node.js 20+ and **pnpm** (`pnpm install` at repo root)
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) 4.x (`shopify auth login`)
- Git hosting (GitHub/GitLab) and [Vercel](https://vercel.com) (or similar) for production
- Optional: ngrok or Vercel preview URL for **Customer Account OAuth** (HTTPS required; localhost login is not supported)

### Skills

- Basic Shopify Admin (products, collections, Settings → Markets)
- Reading `.env` files and running npm scripts
- Comfortable editing JSON seed data or Shopify metafields

### Repo orientation

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router pages and API routes |
| `src/lib/commerce/` | Provider-agnostic commerce boundary (mock ↔ Shopify) |
| `src/components/site/` | Storefront UI (Header, Footer, PDP, cart, etc.) |
| `scripts/` | Seed, verify, smoke, checkout branding |
| `src/assets/` | Local product/editorial images uploaded by seed script |
| `public/images/` | Static logo/favicon served by Next.js |
| `docs/` | Architecture and setup guides |

**Partner app (not in this repo):** Kashmir Weaver uses `kashmir-weaver-probe` at `SHOPIFY_PARTNER_APP_DIR` (default `/tmp/shopify-probe/kashmir-weaver-probe`). For a new store you **clone and rename** that app (new `client_id`, scopes, metaobject definitions in `shopify.app.toml`).

---

## Part A: Shopify store setup

### A1. Create the dev store

1. Partner Dashboard → **Stores** → **Add store** → Development store.
2. Note `YOUR-STORE.myshopify.com`.
3. Set store contact email (used by seed for policies and contact metafields).

**Store plan note:** App development stores (`Basic App Development`) often block `checkoutBrandingUpsert` via API. Checkout/login branding still works via **Admin → Settings → Checkout → Customize** (manual).

### A2. Headless channel + Storefront token

1. **Admin → Sales channels → Headless** → create storefront.
2. Copy **store domain** and **Storefront API access token** → `.env.local`:

```bash
COMMERCE_PROVIDER=shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_...
SHOPIFY_STOREFRONT_API_VERSION=2025-07
SHOPIFY_BLOG_HANDLE=news
```

Or create token via CLI (see [shopify-store-setup.md](./shopify-store-setup.md)).

**Recommended Storefront scopes:** product/collection listings, content, metaobjects, checkout write/read, product inventory (optional but enables qty caps).

Verify:

```bash
pnpm verify:shopify
```

### A3. Partner app (Admin API, metaobjects, webhooks)

1. Copy `kashmir-weaver-probe` to a new directory (e.g. `your-brand-probe`).
2. Update `shopify.app.toml`:
   - App name, `client_id`, application URL
   - **Scopes** (minimum set from [shopify-store-setup.md](./shopify-store-setup.md#partner-app-scopes-admin-api--seed))
   - **`[metaobjects.app.*]`** definitions for FAQ + editorial types (must match seed constants)
   - **`[webhooks]`** → `{NEXT_PUBLIC_SITE_URL}/api/webhooks/shopify`
   - **`[customer_authentication]`** redirect/logout/origin URLs (production + preview if needed)
3. Deploy and install:

```bash
cd /path/to/your-brand-probe
shopify app deploy --allow-updates
shopify app dev -s your-store.myshopify.com   # first install + scope approval
```

4. Set in `.env.local`:

```bash
SHOPIFY_PARTNER_APP_DIR=/path/to/your-brand-probe
```

Re-approve the app in **Admin → Apps** whenever scopes or metaobject definitions change.

### A4. Markets (optional, Phase 8)

1. **Admin → Settings → Markets** — enable countries/currencies you sell to.
2. Env defaults (first visit before cookie):

```bash
NEXT_PUBLIC_SHOPIFY_COUNTRY=US
NEXT_PUBLIC_SHOPIFY_LANGUAGE=EN
```

Verify:

```bash
pnpm verify:shopify:markets
```

Header **MarketSelector** persists `shopify_country` / `shopify_language` cookies; Storefront queries use `@inContext`.

### A5. Seed the store

The seed script is the fastest way to populate Admin with everything the app expects.

```bash
# Full seed (catalog + brand + FAQs + editorial + policies + menus + wishlist metafield)
pnpm seed:shopify

# Partial seeds (after first run or for iteration)
pnpm seed:shopify -- --brand-only
pnpm seed:shopify -- --policies-only
pnpm seed:shopify -- --faqs-only
pnpm seed:shopify -- --editorial-only
pnpm seed:shopify -- --checkout-branding-only   # Plus/classic dev stores only
pnpm seed:shopify -- --enrich-only              # update existing, skip creates
```

**Requires:** `SHOPIFY_ADMIN_ACCESS_TOKEN` **or** `SHOPIFY_PARTNER_APP_DIR` + Shopify CLI logged in.

**Before seeding a new brand:** edit [`scripts/seed-shopify-catalog-data.mjs`](../scripts/seed-shopify-catalog-data.mjs) — collections, products, `VENDOR`, `buildShopMetafields()`, `navigationMenus`, editorial metaobjects, FAQ entries, policy HTML, and image paths under `src/assets/`.

Post-seed verification:

```bash
pnpm verify:shopify
pnpm verify:shopify:policies
pnpm verify:shopify:inventory    # optional
pnpm smoke:shopify:forms         # newsletter + contact → Admin Customers
```

### A6. Customer Account API

1. Deploy partner app with `[customer_authentication]` URLs matching `NEXT_PUBLIC_SITE_URL`.
2. Copy **Client ID** → `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`.
3. Ensure Customer Account scopes on app: `customer_read_orders`, `customer_read_customers`, `customer_write_customers`.
4. Seed wishlist metafield: `pnpm seed:shopify` (creates `custom.wishlist` on customers).

**Alternative:** configure via **Headless → Customer Account API** in Admin (see [shopify-store-setup.md](./shopify-store-setup.md)).

Login smoke (expect 307 redirect):

```bash
curl -sS -D - -o /dev/null "https://YOUR-SITE/api/auth/customer/login"
```

### A7. Webhooks (production)

1. Set `SHOPIFY_WEBHOOK_SECRET` to Partner app **API secret key**.
2. Deploy partner app so webhooks point at `{NEXT_PUBLIC_SITE_URL}/api/webhooks/shopify`.
3. Smoke locally:

```bash
pnpm test:shopify:webhook
```

Topics handled: product/collection/article create/update/delete → Next.js `revalidateTag` for catalog cache.

### A8. Checkout branding

| Store type | Approach |
|------------|----------|
| App dev store (Basic App Development) | **Admin only** — Settings → Checkout → Customize; Settings → Customer accounts → Customize |
| Plus sandbox / classic Partner dev store | `pnpm checkout:branding` or `pnpm seed:shopify -- --checkout-branding-only` |

Colors align with [`app/globals.css`](../app/globals.css): background `#1f1c19`, text `#efe8dc`, gold `#c4a052`.

---

## Part B: Codebase changes

### B1. Environment

Copy [`.env.example`](../.env.example) → `.env.local`:

| Variable | New store action |
|----------|------------------|
| `COMMERCE_PROVIDER` | `shopify` for integration; keep `mock` for UI-only work |
| `NEXT_PUBLIC_SITE_URL` | Your production domain (metadata, sitemap, OAuth, webhooks) |
| `SHOPIFY_STORE_DOMAIN` | New store `.myshopify.com` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | New Headless token |
| `SHOPIFY_PARTNER_APP_DIR` | Path to **your** cloned partner app |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | From your partner app / Headless |
| `SHOPIFY_WEBHOOK_SECRET` | Partner app API secret (production) |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Optional direct Admin token (production forms; unset locally to use CLI) |
| `NEXT_PUBLIC_GA_ID` | Optional GA4 |

**Do not commit** `.env.local` or `.env.vercel.production`.

### B2. Seed profile (Shopify content source)

Primary file: [`scripts/seed-shopify-catalog-data.mjs`](../scripts/seed-shopify-catalog-data.mjs)

| Section | What to change |
|---------|----------------|
| `VENDOR` | Brand vendor name on products |
| `collections` / `products` | Handles, titles, prices, tags, Color variants |
| `articles` | Blog posts for `SHOPIFY_BLOG_HANDLE` |
| `buildShopMetafields()` | Brand id, tagline, contact, **social URLs**, SEO, newsletter, `copy_json` |
| `navigationMenus` | Header/footer links (must use Next.js paths like `/shop`, not theme URLs) |
| `buildShopPolicies()` | Legal HTML (or edit in Admin after seed) |
| Editorial exports | `homepageHero`, `ourStoryPage`, `craftsmanshipPage`, etc. |
| `editorialImages` | Point to new files in `src/assets/` |

Keep mock data in sync for `pnpm dev:mock`:

- [`src/lib/commerce/mock/brand-config.ts`](../src/lib/commerce/mock/brand-config.ts)
- [`src/lib/commerce/mock/data/`](../src/lib/commerce/mock/data/) — products, collections, articles, faqs, editorial

### B3. Brand assets

| Asset | Location | Used by |
|-------|----------|---------|
| Logo (Next.js public) | `public/images/your-logo.png` | Mock mode; seed uploads to Shopify Files for `custom.logo_url` |
| Favicon | `app/favicon.ico` | Browser tab |
| Product/editorial photos | `src/assets/*` | Seed script → Shopify CDN |
| Legacy Kashmir files | `public/images/kashmir-weaver-logo.png` | Replace or remove references |

Update default logo fallback in [`src/lib/commerce/shopify/brand.ts`](../src/lib/commerce/shopify/brand.ts) line ~212 if you change the public logo path.

Checkout branding script uses `public/images/kashmir-weaver-logo.png` by default — change in [`scripts/seed-shopify-catalog.mjs`](../scripts/seed-shopify-catalog.mjs) (`checkoutLogoPath`).

### B4. Theme / CSS (optional rebrand)

Visual system lives in [`app/globals.css`](../app/globals.css):

- CSS variables: `--background`, `--gold`, `--ink`, `--cream`
- Fonts in [`app/layout.tsx`](../app/layout.tsx): Cormorant Garamond (display), Jost (sans)

Changing gold/cream palette does **not** require Shopify changes unless you also want matching checkout branding.

[`src/lib/commerce/brand/config.ts`](../src/lib/commerce/brand/config.ts) only holds **shared** constants (`brandLegalRoutes`, `defaultLogoDimensions`) — not full brand copy.

### B5. Remove Kashmir-specific strings

Search and replace across repo:

```bash
rg -i "kashmir|thekashmirweaver|the-kashmir-weaver" --glob '!docs/new-store-setup.md'
```

**High-priority files:**

| File | Kashmir-specific content |
|------|-------------------------|
| `package.json` | `"name": "the-kashmir-weaver"` |
| `README.md` | Project title and description |
| `.env.example` | Example `NEXT_PUBLIC_SITE_URL` |
| `mock/brand-config.ts` | Full demo brand |
| `seed-shopify-catalog-data.mjs` | All seeded Admin content |
| `mock/data/*` | Catalog and editorial copy |
| `app/contact/page.tsx` | Hardcoded metadata description ("Kashmir") |
| `app/journal/[slug]/page.tsx` | Fallback article body + **placeholder share links** |
| `src/components/site/TrustBanner.tsx` | Unused component with hardcoded Kashmir trust copy |

**Low priority (template tokens):** `{origin}`, `{productNoun}`, `{name}` in `copy_json` — replace values in seed/mock, not code.

### B6. Mock mode for dev without Shopify

```bash
cp .env.example .env.local
# COMMERCE_PROVIDER=mock (default)
pnpm dev:mock
```

Mock mode uses:

- Static catalog in `src/lib/commerce/mock/data/`
- Brand from `mockBrandConfig`
- Cart/wishlist in `localStorage`
- No Shopify credentials; `pnpm build:mock` works in CI

Use mock for UI/theming; use `pnpm dev:shopify` as integration truth before go-live.

### B7. Package scripts reference

| Command | Purpose |
|---------|---------|
| `pnpm dev:mock` / `pnpm dev:shopify` | Dev servers |
| `pnpm build:mock` / `pnpm build:shopify` | Production builds |
| `pnpm seed:shopify` | Admin seed (see flags above) |
| `pnpm verify:shopify` | Storefront connection + catalog/brand checks |
| `pnpm verify:shopify:policies` | Legal policies + footer URLs |
| `pnpm verify:shopify:inventory` | Inventory scope / tracking |
| `pnpm verify:shopify:markets` | Markets / `@inContext` |
| `pnpm smoke:shopify:forms` | Newsletter + contact forms |
| `pnpm test:shopify:webhook` | Webhook HMAC handler |
| `pnpm checkout:branding` | Checkout API branding (eligible stores) |
| `pnpm test:money` | Money formatting unit tests |
| `pnpm lint` / `pnpm format` | Code quality |

---

## Part C: Vercel / GitHub deployment

### C1. Repository

1. Fork/clone template to your org.
2. Remove Kashmir branding (Part B5).
3. Connect repo to Vercel.

### C2. Vercel project settings

[`vercel.json`](../vercel.json) pins:

```json
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm build:shopify",
  "framework": "nextjs"
}
```

Production **must** use `build:shopify` and set all Shopify env vars in Vercel → Settings → Environment Variables.

### C3. Required production env vars

Minimum for a live storefront:

```
COMMERCE_PROVIDER=shopify
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_BLOG_HANDLE=news
```

Recommended for full feature set:

```
SHOPIFY_ADMIN_ACCESS_TOKEN=...          # forms (or rely on partner app — not ideal on Vercel)
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=...
SHOPIFY_WEBHOOK_SECRET=...
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET=...  # if confidential client
NEXT_PUBLIC_SHOPIFY_COUNTRY=US
NEXT_PUBLIC_SHOPIFY_LANGUAGE=EN
NEXT_PUBLIC_GA_ID=G-...
```

**Critical:** `NEXT_PUBLIC_SITE_URL` must match:

- Partner app `[customer_authentication]` redirect/logout/origin
- Webhook URL in `shopify.app.toml`
- Sitemap and JSON-LD `metadataBase`

Redeploy partner app if the production domain changes.

### C4. Deploy checklist

```bash
pnpm build:shopify          # local gate
pnpm verify:shopify         # against production store credentials
pnpm verify:shopify:policies
pnpm smoke:shopify:forms    # with production Admin token
```

After deploy:

1. Hit `/`, `/shop`, PDP, cart → checkout redirect
2. `/account` login on **production URL** (not localhost)
3. Edit a product in Admin → confirm storefront updates (webhooks + cache)
4. Footer newsletter + `/contact` → check **Admin → Customers**

### C5. Custom domain

1. Vercel → Domains → add `yourdomain.com`.
2. Update `NEXT_PUBLIC_SITE_URL`.
3. Redeploy partner app with new URLs in `[customer_authentication]` and webhooks.

---

## Part D: Component & page inventory

### App routes (`app/`)

| Route | File | Primary data source | Customize for new brand |
|-------|------|---------------------|-------------------------|
| `/` | `app/page.tsx` | `getHomepageEditorial()`, `getHomepageCollectionSections()` | Editorial metaobjects; first 3 collections in Admin |
| `/shop` | `app/shop/page.tsx` | `getProducts()`, `getCollections()`, `brand.copy.pages.shop` | Catalog seed; shop subtitle in `copy_json` |
| `/product/[slug]` | `app/product/[slug]/page.tsx` | Product, related, policies, shop metafields | Product/collection metafields; PDP badges |
| `/collections` | `app/collections/page.tsx` | — | Redirects to `/#collections` (no content) |
| `/collections/[slug]` | `app/collections/[slug]/page.tsx` | Collection + products | Collection handles, hero metafields |
| `/wishlist` | `app/wishlist/page.tsx` | Client wishlist (localStorage / customer metafield) | None (generic) |
| `/account` | `app/account/page.tsx` | Customer Account API + `brand.copy.pages.account` | OAuth env; account copy tokens |
| `/journal` | `app/journal/page.tsx` | `getArticles()`, `getJournalIndexContent()` | Blog + journal hero shop metafields |
| `/journal/[slug]` | `app/journal/[slug]/page.tsx` | Article by slug | Blog articles; **wire share links** (currently `#`) |
| `/our-story` | `app/our-story/page.tsx` | `getOurStoryContent()` | `$app:our_story` metaobject |
| `/craftsmanship` | `app/craftsmanship/page.tsx` | `getCraftsmanshipContent()` | `$app:craftsmanship` + steps |
| `/contact` | `app/contact/page.tsx` | `brand.contact` | Contact metafields; metadata description in page file |
| `/faqs` | `app/faqs/page.tsx` | `getFaqs()` | `$app:faq` metaobjects |
| `/privacy` | `app/privacy/page.tsx` | `getShopPolicies()` | Policy seed / Admin legal |
| `/terms` | `app/terms/page.tsx` | `getShopPolicies()` | Policy seed / Admin legal |
| `/terms-of-service` | `app/terms-of-service/page.tsx` | Likely alias/redirect | Check if linked from anywhere |
| `sitemap.xml` | `app/sitemap.ts` | `getSitemapEntries()` | Live handles + `NEXT_PUBLIC_SITE_URL` |
| `robots.txt` | `app/robots.ts` | `brand.siteUrl` | Site URL env |

### API routes

| Route | Purpose | Env / Shopify |
|-------|---------|---------------|
| `POST /api/webhooks/shopify` | Cache revalidation | `SHOPIFY_WEBHOOK_SECRET` |
| `GET /api/auth/customer/login` | OAuth PKCE start | Customer Account client ID |
| `GET /api/auth/customer/callback` | OAuth callback | `NEXT_PUBLIC_SITE_URL` |
| `POST /api/auth/customer/logout` | Session logout | Same |

### Site components (`src/components/site/`)

| Component | Role | Data source |
|-----------|------|-------------|
| `Header` | Nav, search, cart, wishlist, market selector | `brand.headerNav`, cart context |
| `Footer` | Logo, menus, social, newsletter, legal links | `brand.*` |
| `BrandLockup` / `BrandLogo` / `BrandName` | Header logo + split name | `brand.logo`, `brand.name`, `brand.tagline` |
| `CartDrawer` | Line items, checkout CTA | Storefront Cart API or mock cart |
| `SearchDialog` | Predictive search | Storefront `predictiveSearch` |
| `ProductClient` | PDP gallery, ATC, accordions | Product + policies + shop settings |
| `ProductListing` / `ProductFilters` | Shop/collection grids | Products + derived facets |
| `HomeCollectionSections` | Homepage collection blocks | Collections + preview products |
| `CollectionHero` / `CollectionPreview` | Collection storytelling | Collection metafields |
| `JournalClient` | Journal index + filters | Articles + journal hero |
| `AccountClient` | Login, orders, profile | Customer Account API |
| `ContactClient` | Contact form | `brand.contact` + Admin form actions |
| `FaqList` | FAQ accordion | FAQ metaobjects |
| `MarketSelector` | Country/currency picker | Storefront localization |
| `AnalyticsScripts` | GA4 / pixel placeholder | `NEXT_PUBLIC_GA_ID` |
| `Marquee` | Homepage ticker | Editorial metaobject |
| `TrustBanner` | Hardcoded trust strip | **Not used on any page** — optional delete/repurpose |

### Layout shell

[`app/layout.tsx`](../app/layout.tsx) loads `commerce.getBrand()` once for `Header`, `Footer`, metadata, `CommerceProvider`, and optional localization.

---

## Part E: Social & brand touchpoints

Every place brand identity, social links, or share UI appears.

### E1. Shopify shop metafields (Shopify mode)

Namespace `custom` — seeded by `pnpm seed:shopify -- --brand-only`:

| Metafield key | Type | Consumed by |
|---------------|------|-------------|
| `social_facebook` | url | `Footer` |
| `social_youtube` | url | `Footer` |
| `social_instagram` | url | `Footer` |
| `social_pinterest` | url | `Footer` |
| `logo_url` | url | Header, Footer, checkout branding |
| `brand_tagline` | single line | Header lockup, Footer |
| `contact_*` | various | `ContactClient` |
| `seo_*` | various | `generateMetadata`, OG tags |
| `footer_description` | multi-line | Footer brand blurb |
| `newsletter_*` | various | Footer form |
| `copy_json` | json | Tokenized page copy (`{name}`, `{origin}`, `{productNoun}`) |

Social metafields are **optional** in Shopify mode (empty = icon hidden). Other brand metafields are **required** — missing values throw `CommerceConfigError` on build.

### E2. Mock brand config (mock mode)

[`src/lib/commerce/mock/brand-config.ts`](../src/lib/commerce/mock/brand-config.ts):

```ts
social: {
  facebook: "https://facebook.com/...",
  youtube: "https://youtube.com/...",
  instagram: "https://instagram.com/...",
  pinterest: "https://pinterest.com/...",
}
```

Also defines `headerNav`, `footerMenus`, `seo`, `contact`, `newsletter`, and `copy` pages/messages.

### E3. Footer (live social links)

[`src/components/site/Footer.tsx`](../src/components/site/Footer.tsx):

- Renders Facebook, YouTube, Instagram, Pinterest from `brand.social`
- Filters out empty URLs
- Opens in new tab (`rel="noopener noreferrer"`)
- **Customize:** metafields (Shopify) or `mockBrandConfig.social` (mock)

### E4. Header

[`src/components/site/Header.tsx`](../src/components/site/Header.tsx) — **no social icons**. Brand via `BrandLockup` only.

### E5. SEO / Open Graph / Twitter

[`src/lib/commerce/mappers/metadata.ts`](../src/lib/commerce/mappers/metadata.ts):

- Root metadata from `brand.seo.*`
- `twitter.card: summary_large_image` (no `@handle` — add if needed)
- Per-page OG on homepage, PDP, journal, etc.

### E6. Journal article share row (placeholder)

[`app/journal/[slug]/page.tsx`](../app/journal/[slug]/page.tsx) lines ~118–125:

- Shows Facebook, Twitter, Instagram, Mail icons
- **All `href="#"`** — not wired to article URL or brand social accounts
- **Action for new store:** implement share URLs or remove section

### E7. Logo surfaces

| Surface | Source |
|---------|--------|
| Header `BrandLockup` | `brand.logo` |
| Footer | `BrandLogo` + `BrandName` |
| Checkout (Shopify-hosted) | Admin Customize or `checkoutBrandingUpsert` |
| Customer Account login (Shopify-hosted) | Admin → Customer accounts → Customize |
| JSON-LD / Product schema | `brand.name`, `brand.siteUrl` |

### E8. Copyright & legal

- Footer: `© {year} {brand.name}`
- Privacy/Terms: [`brandLegalRoutes`](../src/lib/commerce/brand/config.ts) → `/privacy`, `/terms` (on-site pages rendering Shopify policy HTML)
- Shopify-hosted policy URLs also available on `brand` from Storefront (footer could use either pattern)

### E9. Tokenized copy (not social, but brand voice)

`brand.copy.pages.*` and `brand.copy.messages.*` interpolate `{name}`, `{origin}`, `{productNoun}` via [`brand-display` mappers](../src/lib/commerce/mappers/brand-display.ts) on:

- Homepage legacy section (body from editorial metaobject, may duplicate `copy_json`)
- Shop page header
- Account register/login strings
- PDP authenticity promise
- Our Story / Craftsmanship intros

Edit in Shopify `copy_json` metafield or mock `brand-config.ts`.

### E10. Analytics (optional)

[`AnalyticsScripts`](../src/components/site/AnalyticsScripts.tsx) — GA4 when `NEXT_PUBLIC_GA_ID` set. Separate from social; configure Meta Pixel etc. in Shopify Admin if needed.

---

## Part F: Shopify ↔ app connection map

### Architecture diagram

```mermaid
flowchart TB
  subgraph nextjs [Next.js App]
    Pages[app pages]
    Components[src/components/site]
    Commerce[src/lib/commerce]
    API[app/api]
  end

  subgraph mock [COMMERCE_PROVIDER=mock]
    MockData[mock/data + brand-config.ts]
    LS[localStorage cart/wishlist]
  end

  subgraph shopify [COMMERCE_PROVIDER=shopify]
    SF[Storefront API GraphQL]
    Admin[Admin API GraphQL]
    CA[Customer Account API OAuth]
  end

  Pages --> Commerce
  Components --> Commerce
  Commerce --> MockData
  Commerce --> SF
  Commerce --> Admin
  API --> CA
  API --> Admin
  SF --> Products
  SF --> Collections
  SF --> Cart
  SF --> Menus
  SF --> Metaobjects
  SF --> Blog
  SF --> Policies
  Admin --> Seed[pnpm seed:shopify]
  Admin --> Forms[Newsletter + Contact]
  Admin --> Webhooks[Webhook registrations]
  Webhooks --> API
  CA --> Account[/account orders wishlist]
  LS --> Components
```

### API usage matrix

| Feature | API | Auth | Key files |
|---------|-----|------|-----------|
| Catalog read | Storefront | `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | `shopify/provider.ts`, `queries.ts` |
| Brand, menus | Storefront | Storefront token | `shopify/brand.ts` |
| Cart / checkout | Storefront | Storefront token + httpOnly cookie | `shopify/cart.ts` |
| FAQs, editorial | Storefront metaobjects | Storefront token | `shopify/faqs.ts`, `editorial.ts` |
| Newsletter, contact | Admin | Admin token or CLI | `shopify/forms.server.ts`, `admin.ts` |
| Seed / policies / menus | Admin | CLI via partner app | `scripts/seed-shopify-catalog.mjs` |
| Customer login, orders | Customer Account | OAuth PKCE | `shopify/customer/*`, `app/api/auth/customer/*` |
| Wishlist (logged in) | Customer Account | Session + `custom.wishlist` | `commerce-context.tsx` |
| Cache invalidation | Webhooks → Admin events | HMAC secret | `app/api/webhooks/shopify/route.ts` |
| Markets | Storefront `@inContext` | Storefront + cookies | `market-context.ts`, `localization.ts` |

### Navigation menus (Admin → app)

| Handle | Role | Seeded in |
|--------|------|-----------|
| `main-menu` | Header nav | `navigationMenus[0]` in seed data |
| `footer` | Footer columns (nested items) | `navigationMenus[1]` |

Must match [`SHOPIFY_MAIN_MENU_HANDLE` / `SHOPIFY_FOOTER_MENU_HANDLE`](../src/lib/commerce/shopify/brand.ts).

### Metafields summary

**Shop (`custom` namespace):** see Part E1 + journal hero keys (`journal_hero_*`), PDP globals (`authenticity_promise`, `shipping_badge_text`, `returns_badge_text`).

**Collection (`custom`):** `hero_headline`, `hero_tagline`, `cta_label`.

**Product (`custom`):** `care_instructions`, `dimensions`, `product_highlights`, `shipping_returns_text`, `authenticity_promise`, `inventory_quantity`.

**Customer (`custom`):** `wishlist` (JSON, Customer Account READ_WRITE).

### App-owned metaobjects (partner `shopify.app.toml`)

| Type | Purpose |
|------|---------|
| `$app:faq` | FAQ entries |
| `$app:homepage_hero` | Homepage hero |
| `$app:homepage_value_prop` | Value prop icons row |
| `$app:homepage_marquee_item` | Marquee strings |
| `$app:homepage_legacy` | Legacy section |
| `$app:homepage_quote` | Closing quote |
| `$app:our_story` | Our Story page |
| `$app:craftsmanship` | Craftsmanship intro |
| `$app:craftsmanship_step` | Process steps |

Storefront access: `access.storefront = "public_read"` on each definition.

### Toggle

```bash
COMMERCE_PROVIDER=mock   # default — no Shopify
COMMERCE_PROVIDER=shopify  # requires Storefront env vars; build fails if missing
```

See [commerce-layer.md](./commerce-layer.md) for import rules and client/server split.

---

## Part G: What we built for The Kashmir Weaver

Chronological summary from [shopify-driven-roadmap.md](./shopify-driven-roadmap.md) (phases 0–8 complete on `dev`).

### Pre-roadmap (2026-06-19)

- Commerce layer with mock/Shopify toggle
- Storefront API connection + `pnpm verify:shopify`
- Editorial homepage with collection hero sections
- `/collections` → `/#collections`; collection detail routes
- Mock catalog aligned to purekashmir.com-style collections (Jamawar, Kani, Reversible)
- Collection-scoped color/price filters

### Phase 0 — Foundation (2026-06-19 / 20)

- 3 collections, 9 flagship products, blog `news` + 3 articles
- Collection/product metafields, staged image uploads
- `pnpm seed:shopify` + extended verify script

### Phase 1 — Catalog fidelity (2026-06-19 / 20)

- Variant Color → filter swatches
- Related products, dynamic sitemap, `collectionSlug`, `categoryLabel`
- PDP metafields + shop-level badge metafields
- Journal categories from article tags
- All four shop legal policies seeded

### Phase 2 — Cart & checkout (2026-06-20)

- Storefront Cart API, httpOnly `cartId` cookie, `checkoutUrl` redirect
- Inventory-aware quantity caps (optional scope)
- Cart error toasts (Sonner)

### Phase 3 — Brand, nav, footer (2026-06-20)

- 18+ shop metafields + `main-menu` / `footer` menus
- Strict `getShopifyBrand()` — no silent fallbacks
- Header/Footer consume `commerce.getBrand()`

### Phase 4 — FAQs & policies (2026-06-20)

- `$app:faq` metaobjects (6 entries)
- PDP Shipping & Returns from shop policies
- Footer legal links via Storefront policy URLs

### Phase 5 — Forms (2026-06-20)

- Newsletter → Admin `customerCreate` + marketing consent + tag `newsletter`
- Contact → customer note + tag `contact-form`

### Phase 6 — Accounts & wishlist (2026-06-20)

- Customer Account OAuth PKCE (`/api/auth/customer/*`)
- Order history on `/account`
- Guest wishlist in localStorage; logged-in sync to `custom.wishlist` metafield

### Phase 7 — Editorial CMS (2026-06-20)

- Homepage hero, value props, marquee, legacy, quote metaobjects
- Our Story + Craftsmanship pages from metaobjects
- Journal index hero from shop metafields

### Phase 8 — Operations (2026-06-20)

- Webhooks → `revalidateTag` catalog cache
- Predictive search
- Markets / multi-currency + header country picker
- Sold-out badges, PDP description dedupe
- Optional GA4 via env
- Checkout branding CLI documented (blocked on app-dev store plan)

### Current production target

- Store: `the-kashmir-weaver-nncjdd3t.myshopify.com`
- Site URL: `https://thekashmirweaver.com`
- Vercel project: `the-kashmir-weaver` (`build:shopify`)
- Partner app: `kashmir-weaver-probe` (external directory)

---

## Part H: Expectations → Results

| Expectation | Result in this template | Notes for new store |
|-------------|---------------------------|---------------------|
| Clone repo and run locally without Shopify | ✅ `pnpm dev:mock` | Update mock brand + data |
| Single env var toggles data source | ✅ `COMMERCE_PROVIDER` | Documented in commerce-layer |
| Product catalog from Shopify | ✅ Storefront API | Run seed or manual Admin catalog |
| Collection pages with hero copy | ✅ Collection metafields | Seed definitions required |
| Homepage collection previews | ✅ First 3 collections | Reorder/publish in Admin |
| Homepage marketing hero/CMS | ✅ App metaobjects | `--editorial-only` seed |
| Cart → Shopify checkout | ✅ Storefront Cart API | Needs checkout scopes |
| Brand/nav/footer without deploys | ✅ Shop metafields + menus | `--brand-only`; strict validation |
| Social links in footer | ✅ Four networks from metafields | Optional URLs; no header social |
| Newsletter signup | ✅ Admin customer + consent | Needs Admin token or CLI on server |
| Contact form | ✅ Admin customer notes | Same as newsletter |
| Customer login & orders | ✅ Customer Account OAuth | HTTPS prod URL required |
| Wishlist persist after login | ✅ Customer metafield JSON | Seed `custom.wishlist` |
| FAQs editable in Admin | ✅ `$app:faq` metaobjects | Partner app deploy |
| Legal policies on PDP/footer | ✅ Shop policies | `--policies-only` |
| On-site `/privacy` `/terms` | ✅ Renders policy HTML | Footer also supports Shopify URLs |
| Blog / journal | ✅ Storefront blog | `SHOPIFY_BLOG_HANDLE` |
| Article social share buttons | ⚠️ UI only (`href="#"`) | Wire URLs for new store |
| Journal share to brand Instagram | ❌ Not implemented | Only placeholder icons |
| Twitter card @brand | ❌ Not configured | Only `summary_large_image` |
| Checkout branding via API | ⚠️ Plan-dependent | Admin Customize works everywhere |
| Catalog updates without redeploy | ✅ Webhooks + cache tags | Set `SHOPIFY_WEBHOOK_SECRET` |
| Multi-currency | ✅ Markets + cookies | Configure Admin Markets |
| GA4 | ✅ Optional env | `NEXT_PUBLIC_GA_ID` |
| TrustBanner on pages | ❌ Component unused | Hardcoded Kashmir copy |
| Zero code for new product types | ⚠️ Partial | Layout fixed; metafields optional |
| Full rebrand in &lt; 1 hour | ❌ Unrealistic | Seed + assets + env + app clone ≈ 2+ days |
| CI build without secrets | ✅ `pnpm build:mock` | Vercel prod uses `build:shopify` |

---

## Quick start checklist (new brand)

- [ ] Fork repo; update `package.json` name and README
- [ ] Create Shopify dev store + Headless channel
- [ ] Clone/rename Partner app; deploy; install on store
- [ ] Edit `seed-shopify-catalog-data.mjs` + mock data + `public/images/`
- [ ] `.env.local` with all vars; `pnpm verify:shopify`
- [ ] `pnpm seed:shopify`; re-run partial seeds as needed
- [ ] `pnpm dev:shopify` — walk all routes
- [ ] Configure Customer Account URLs for production domain
- [ ] Vercel env + deploy; `pnpm smoke:shopify:forms` on prod
- [ ] Admin checkout/customer account branding
- [ ] Wire journal share links (optional)

---

*Last updated: 2026-06-20 — reflects phases 0–8 complete per shopify-driven-roadmap.md.*
