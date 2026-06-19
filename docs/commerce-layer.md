# Commerce Layer

GULRIZA uses a **ports-and-adapters** commerce boundary under `src/lib/commerce/`. The UI never talks to Shopify or mock data files directly — it goes through one API that can be swapped with an environment variable.

## Toggle

| Variable | Values | Default |
|---|---|---|
| `COMMERCE_PROVIDER` | `mock` \| `shopify` | `mock` |

Copy [`.env.example`](../.env.example) to `.env.local` and adjust as needed.

### Mock mode (default)

- Uses static catalog data in `src/lib/commerce/mock/data/`
- Brand config in `src/lib/commerce/mock/brand.ts`
- Cart and wishlist stored in `localStorage` on the client
- No Shopify credentials required
- `pnpm build` and CI work out of the box

### Shopify mode

Requires these env vars (build **fails** if any are missing):

```
COMMERCE_PROVIDER=shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
```

Optional:

```
SHOPIFY_STOREFRONT_API_VERSION=2025-01
SHOPIFY_BLOG_HANDLE=news
NEXT_PUBLIC_SITE_URL=https://gulriza.com
```

**Phase 1 Shopify scope:** catalog reads (products, collections, articles, search) use the Storefront API. Brand, FAQs, newsletter, contact, cart, and wishlist still use mock behavior until Phase 2.

## Scripts

```bash
pnpm dev:mock      # dev with mock provider
pnpm dev:shopify   # dev with shopify provider (needs credentials)
pnpm build:mock    # production build, mock
pnpm build:shopify # production build, shopify (needs credentials)
```

## Architecture

```
app/ + src/components/
        │
        ▼
@/lib/commerce          ← server: commerce singleton, types, actions
@/lib/commerce/client   ← client: CommerceProvider, cart/wishlist hooks
        │
        ├── mock/MockCommerceProvider
        └── shopify/ShopifyCommerceProvider → Storefront API
```

### Server vs client

| Context | Import | Usage |
|---|---|---|
| Server Components, `generateMetadata`, sitemap | `@/lib/commerce` | `import { commerce } from "@/lib/commerce"` |
| Client components (cart, wishlist, search UI) | `@/lib/commerce/client` | `useCommerce()`, `useCommerceCart()`, `useCommerceWishlist()` |
| Client → server calls | `@/lib/commerce/actions` | `searchCommerce()`, `getProductsAction()`, etc. |

### UI state split

- **`CommerceProvider`** (`src/lib/commerce/client/commerce-context.tsx`) — brand, cart, wishlist, drawer open state
- **`ui-store.tsx`** — thin wrapper for cart/search drawer toggles (used inside `CommerceProvider`)

## Import rules (enforced by ESLint)

In `app/**` and `src/components/**`, do **not** import:

| Blocked path | Use instead |
|---|---|
| `@/lib/products` | `@/lib/commerce` |
| `@/lib/collections` | `@/lib/commerce` |
| `@/lib/store` | `@/lib/commerce/client` |

Legacy files (`src/lib/products.ts`, `collections.ts`, `store.tsx`) remain as deprecated re-exports for migration scripts only.

## Public API

### Server singleton

```ts
import { commerce, buildMetadataFromBrand } from "@/lib/commerce";

const brand = await commerce.getBrand();
const products = await commerce.getProducts({ sort: "price-asc" });
const product = await commerce.getProductBySlug("ivory-whisper");
const { collection, products } = await commerce.getCollectionBySlug("signature");
const articles = await commerce.getArticles();
const results = await commerce.search("ivory");
const faqs = await commerce.getFaqs();
const entries = await commerce.getSitemapEntries();
```

### Server actions

```ts
import {
  searchCommerce,
  getProductsAction,
  getProductBySlugAction,
  subscribeNewsletterAction,
  submitContactAction,
} from "@/lib/commerce/actions";
```

### Client hooks

```tsx
import { CommerceProvider, useCommerce } from "@/lib/commerce/client";

// Root layout passes brand from server:
<CommerceProvider brand={brand}>{children}</CommerceProvider>

// In client components:
const { addToCart, toggleWishlist, brand } = useCommerce();
```

## Domain types

Provider-agnostic DTOs live in `src/lib/commerce/types.ts`. Key types:

- **`CommerceProduct`** — `id`, `slug`, `name`, `price`, `images[]` (URL strings), `variantId`, etc.
- **`CommerceImage`** — `{ src, alt?, width?, height? }` (not `StaticImageData`)
- **`BrandConfig`** — single source for name, tagline, SEO, nav, footer menus, contact

Product images in the UI use `product.images[0].src` with `OptimizedImage`.

## Brand single source of truth

`commerce.getBrand()` drives:

- `app/layout.tsx` metadata (`buildMetadataFromBrand`)
- `Header` — logo, name, tagline, `headerNav`
- `Footer` — logo, menus, social links, newsletter
- `ContactClient` — atelier address, email, phone, hours

Edit mock values in `src/lib/commerce/mock/brand.ts`. Shopify brand mapping from shop metafields is planned for Phase 2.

## File layout

```
src/lib/commerce/
  index.ts              # public server exports
  types.ts
  provider.ts           # CommerceProvider interface
  factory.ts            # commerce singleton
  config.ts             # env validation
  errors.ts
  actions.ts            # server actions
  mappers/
    metadata.ts         # brand → Next Metadata
    image.ts
  mock/
    provider.ts
    brand.ts
    data/               # products, collections, articles, faqs
  shopify/
    client.ts
    provider.ts
    mappers.ts
    queries.ts
  client/
    commerce-context.tsx
    index.ts
```

## Phase 2 (not yet implemented)

See **[shopify-driven-roadmap.md](./shopify-driven-roadmap.md)** for the full phased plan, progress tracking, and what to mark done when each phase ships.

- Shopify Cart API (replace localStorage cart)
- Wishlist via customer metafields
- Newsletter / contact via Shopify Flow or webhooks
- Brand from shop metafields + Menu API
- Dynamic Shopify sitemap entries

## Troubleshooting

**Build fails with `CommerceConfigError`**

You set `COMMERCE_PROVIDER=shopify` without `SHOPIFY_STORE_DOMAIN` and/or `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. Add them to `.env.local` or switch back to `mock`.

**ESLint: "Use @/lib/commerce instead"**

Replace `@/lib/products` or `@/lib/collections` with `commerce` methods or props passed from a server page.

**Shopify images not loading**

Ensure `next.config.ts` includes `remotePatterns` for `cdn.shopify.com` (already configured).
