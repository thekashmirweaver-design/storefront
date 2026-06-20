# Shopify Storefront API reference (GULRIZA)

This document maps every **Shopify Storefront API** operation used by the GULRIZA Next.js headless storefront to official Shopify docs and app code locations.

Official reference: [Storefront API — latest](https://shopify.dev/docs/api/storefront/latest)

Related docs:

- [Shopify store setup](./shopify-store-setup.md) — tokens, env, verification
- [Commerce layer](./commerce-layer.md) — provider toggle and architecture
- [Shopify-driven roadmap](./shopify-driven-roadmap.md) — phased migration plan

---

## API version

The app pins the Storefront API version via `SHOPIFY_STOREFRONT_API_VERSION` (default **`2025-01`**). See [`src/lib/commerce/config.ts`](../src/lib/commerce/config.ts).

Requests go to:

```text
https://{SHOPIFY_STORE_DOMAIN}/api/{SHOPIFY_STOREFRONT_API_VERSION}/graphql.json
```

The client is [`@shopify/storefront-api-client`](../src/lib/commerce/shopify/client.ts). Verification scripts call the same endpoint directly.

---

## Usage by roadmap phase

| Phase | Storefront API today | Planned (Phase 3+) |
|-------|---------------------|-------------------|
| 0–1 Catalog | `products`, `product`, `collections`, `collection`, `productRecommendations`, product/collection `metafield`, blog/articles | — |
| 1 PDP / trust | `shop` policies + shop/product metafields via `ShopContext` | — |
| 2 Cart | `cart`, `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`, `checkoutUrl`, mutation `warnings` | — |
| 3 Brand / nav | `shop` metafields, `menu(handle:)`, policy URLs | — |
| 4 FAQs | `metaobjects(type: "$app:faq")` | FAQs via app-owned metaobjects | [`faqs.ts`](../src/lib/commerce/shopify/faqs.ts) `FAQS_QUERY`; `getFaqs()` |
| Search | `products(query:)` + `collections(query:)`; articles filtered client-side | Phase 8: predictive `search` query |

Inventory-aware queries use paired `*NoInventory` variants when `quantityAvailable` returns `ACCESS_DENIED` — see [Inventory scope](#inventory-scope-unauthenticated_read_product_inventory).

---

## Products

| App feature | Storefront operation | Doc link | Code location |
|-------------|---------------------|----------|---------------|
| Shop listing (`/shop`) | `products` query | [products](https://shopify.dev/docs/api/storefront/latest/queries/products) | [`queries.ts`](../src/lib/commerce/shopify/queries.ts) `PRODUCTS_QUERY`; [`provider.ts`](../src/lib/commerce/shopify/provider.ts) `getProducts()` |
| PDP (`/product/[slug]`) | `product(handle:)` query | [product](https://shopify.dev/docs/api/storefront/latest/queries/product) | `PRODUCT_BY_HANDLE_QUERY`; `getProductBySlug()` |
| Related products | `productRecommendations(productId:)` | [productRecommendations](https://shopify.dev/docs/api/storefront/latest/queries/productRecommendations) | `PRODUCT_RECOMMENDATIONS_QUERY`; `fetchProductRecommendations()` |
| Sitemap product URLs | `products` (handles only via listing) | [products](https://shopify.dev/docs/api/storefront/latest/queries/products) | `getProductSlugs()` → `getProducts()` |
| Color filters / swatches | `Product.options`, `optionValues`, `swatch.color` | [Product](https://shopify.dev/docs/api/storefront/latest/objects/Product) · [SelectedOption](https://shopify.dev/docs/api/storefront/latest/objects/SelectedOption) | `PRODUCT_FRAGMENT`; [`mappers.ts`](../src/lib/commerce/shopify/mappers.ts) |
| Category / collection slug | `Product.tags`, `productType`, `collections(first: 1)` | [Product](https://shopify.dev/docs/api/storefront/latest/objects/Product) · [CollectionConnection](https://shopify.dev/docs/api/storefront/latest/connections/CollectionConnection) | `PRODUCT_FRAGMENT`; `mapShopifyProduct()` |
| PDP copy (care, dimensions, highlights) | `Product.metafield(namespace: "custom", key: …)` | [Metafield](https://shopify.dev/docs/api/storefront/latest/objects/Metafield) · [HasMetafields](https://shopify.dev/docs/api/storefront/latest/interfaces/HasMetafields) | Keys: `care_instructions`, `dimensions`, `product_highlights`, `shipping_returns_text`, `authenticity_promise`, `inventory_quantity` |
| Live quantity caps (PDP) | `ProductVariant.quantityAvailable` | [ProductVariant — quantityAvailable](https://shopify.dev/docs/api/storefront/latest/objects/ProductVariant#field-ProductVariant.fields.quantityAvailable) | `PRODUCT_FRAGMENT`; requires scope — see [Inventory scope](#inventory-scope-unauthenticated_read_product_inventory) |
| Fallback when inventory scope missing | Same queries without `quantityAvailable` | — | `PRODUCT_*_NO_INVENTORY` variants; [`inventory-scope.ts`](../src/lib/commerce/shopify/inventory-scope.ts) |
| Connection verify | `products`, nested `options`, `variants`, `collections`, `tags` | [products](https://shopify.dev/docs/api/storefront/latest/queries/products) | [`verify-shopify-connection.mjs`](../scripts/verify-shopify-connection.mjs) |
| Inventory verify | `product(handle:)` + `variants.quantityAvailable` + metafield | [product](https://shopify.dev/docs/api/storefront/latest/queries/product) | [`verify-shopify-inventory.mjs`](../scripts/verify-shopify-inventory.mjs) |

---

## Collections

| App feature | Storefront operation | Doc link | Code location |
|-------------|---------------------|----------|---------------|
| Collection index / homepage sections | `collections` query | [collections](https://shopify.dev/docs/api/storefront/latest/queries/collections) | `COLLECTIONS_QUERY`; `getCollections()` |
| Collection PDP (`/collections/[slug]`) | `collection(handle:)` + nested `products` | [collection](https://shopify.dev/docs/api/storefront/latest/queries/collection) | `COLLECTION_BY_HANDLE_QUERY`; `getCollectionBySlug()` |
| Hero copy (headline, tagline, CTA) | `Collection.metafield` (`custom.hero_headline`, `hero_tagline`, `cta_label`) | [Metafield](https://shopify.dev/docs/api/storefront/latest/objects/Metafield) | `COLLECTION_METAFIELD_FRAGMENT`; `mapShopifyCollection()` |
| Sitemap collection URLs | `collections` (handles) | [collections](https://shopify.dev/docs/api/storefront/latest/queries/collections) | `getCollectionSlugs()` |
| Connection verify | `collections` + `image` | [collections](https://shopify.dev/docs/api/storefront/latest/queries/collections) | `verify-shopify-connection.mjs` |

---

## Cart

| App feature | Storefront operation | Doc link | Code location |
|-------------|---------------------|----------|---------------|
| Load cart from cookie | `cart(id:)` query | [cart](https://shopify.dev/docs/api/storefront/latest/queries/cart) | [`cart-queries.ts`](../src/lib/commerce/shopify/cart-queries.ts) `CART_QUERY`; [`cart.ts`](../src/lib/commerce/shopify/cart.ts) `fetchCartById()` |
| First add to bag | `cartCreate` mutation | [cartCreate](https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate) | `CART_CREATE_MUTATION`; `cartCreate()` |
| Add line to existing cart | `cartLinesAdd` mutation | [cartLinesAdd](https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesAdd) | `CART_LINES_ADD_MUTATION`; `cartLinesAdd()` |
| Update line quantity | `cartLinesUpdate` mutation | [cartLinesUpdate](https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesUpdate) | `CART_LINES_UPDATE_MUTATION`; `cartLinesUpdate()` |
| Remove line | `cartLinesRemove` mutation | [cartLinesRemove](https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesRemove) | `CART_LINES_REMOVE_MUTATION`; `cartLinesRemove()` |
| Hosted checkout redirect | `Cart.checkoutUrl` | [Cart — checkoutUrl](https://shopify.dev/docs/api/storefront/latest/objects/Cart#field-Cart.fields.checkoutUrl) | `CART_FRAGMENT`; [`CartDrawer.tsx`](../src/components/site/CartDrawer.tsx) |
| Drawer subtotal | `Cart.cost.subtotalAmount`, line `cost.totalAmount` | [CartCost](https://shopify.dev/docs/api/storefront/latest/objects/CartCost) · [CartLineCost](https://shopify.dev/docs/api/storefront/latest/objects/CartLineCost) | `mapShopifyCart()` |
| Inventory warnings on add/update | Mutation payload `warnings` (`code`, `message`, `target`) | [CartWarning](https://shopify.dev/docs/api/storefront/latest/objects/CartWarning) | Cart mutations; [`cart-errors.ts`](../src/lib/commerce/cart-errors.ts) |
| Mutation validation errors | `userErrors` on cart mutations | [CartUserError](https://shopify.dev/docs/api/storefront/latest/objects/CartUserError) | `assertNoUserErrors()` in `cart.ts` |
| Line merchandise / qty cap | `CartLine.merchandise` → `ProductVariant.quantityAvailable` | [CartLine](https://shopify.dev/docs/api/storefront/latest/objects/CartLine) | `CART_FRAGMENT`; inventory fallback via `CART_*_NO_INVENTORY` |
| Server actions | — (orchestrates above) | — | [`actions.ts`](../src/lib/commerce/actions.ts); client [`commerce-context.tsx`](../src/lib/commerce/client/commerce-context.tsx) |

**Required Storefront scopes (cart):** `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts` (see [roadmap Phase 2](./shopify-driven-roadmap.md#phase-2--cart-and-checkout)).

---

## Shop policies

Policies are **seeded via Admin API** (`shopPolicyUpdate`) but **read via Storefront** for PDP accordions and future footer links.

| App feature | Storefront operation | Doc link | Code location |
|-------------|---------------------|----------|---------------|
| PDP Shipping & Returns accordion | `shop.shippingPolicy.body`, `shop.refundPolicy.body` | [Shop — shippingPolicy](https://shopify.dev/docs/api/storefront/latest/objects/Shop#field-Shop.fields.shippingPolicy) · [ShopPolicy](https://shopify.dev/docs/api/storefront/latest/objects/ShopPolicy) | `SHOP_CONTEXT_QUERY`; `getShopPolicies()` → [`product-detail.ts`](../src/lib/commerce/product-detail.ts) |
| Privacy / Terms (read, footer TBD Phase 4) | `shop.privacyPolicy.body`, `shop.termsOfService.body` | [Shop](https://shopify.dev/docs/api/storefront/latest/objects/Shop) | `SHOP_CONTEXT_QUERY`; `mapShopifyShopPolicies()` |
| Policy verify script | `shop { shippingPolicy, refundPolicy, privacyPolicy, termsOfService }` | [shop](https://shopify.dev/docs/api/storefront/latest/queries/shop) | [`verify-shopify-policies.mjs`](../scripts/verify-shopify-policies.mjs) |

---

## Shop metafields (PDP badges & settings)

| App feature | Storefront operation | Doc link | Code location |
|-------------|---------------------|----------|---------------|
| Global PDP badges / authenticity | `shop.metafield(namespace: "custom", key: …)` | [Shop](https://shopify.dev/docs/api/storefront/latest/objects/Shop) · [Metafield](https://shopify.dev/docs/api/storefront/latest/objects/Metafield) | `SHOP_CONTEXT_QUERY`; keys: `authenticity_promise`, `shipping_badge_text`, `returns_badge_text`, `shipping_returns_text` |
| PDP page settings | Same query → `getStorefrontSettings()` | [shop](https://shopify.dev/docs/api/storefront/latest/queries/shop) | [`provider.ts`](../src/lib/commerce/shopify/provider.ts); [`app/product/[slug]/page.tsx`](../app/product/[slug]/page.tsx) |
| Phase 3 (brand chrome) | Extend `shop.metafield` for tagline, contact, social, SEO, logo, newsletter, footer copy | [`brand.ts`](../src/lib/commerce/shopify/brand.ts) `getShopifyBrand()` |
| Phase 3 (navigation) | `menu(handle:)` — handles `main-menu`, `footer` | [`queries.ts`](../src/lib/commerce/shopify/queries.ts) `SHOP_BRAND_QUERY`; seeded via Admin `menuCreate` / `menuUpdate` |
| Phase 3 (legal links) | `shop.privacyPolicy.url`, `shop.termsOfService.url` | `getShopifyBrand()` → `brand.legal` |

---

## Blog / articles (Journal)

Blog handle defaults to `news` (`SHOPIFY_BLOG_HANDLE`).

| App feature | Storefront operation | Doc link | Code location |
|-------------|---------------------|----------|---------------|
| Journal index (`/journal`) | `blog(handle:).articles` | [blog](https://shopify.dev/docs/api/storefront/latest/queries/blog) · [ArticleConnection](https://shopify.dev/docs/api/storefront/latest/connections/ArticleConnection) | `BLOG_ARTICLES_QUERY`; `getArticles()` |
| Article detail (`/journal/[slug]`) | `blog(handle:).articleByHandle(handle:)` | [blog](https://shopify.dev/docs/api/storefront/latest/queries/blog) | `ARTICLE_BY_HANDLE_QUERY`; `getArticleBySlug()` |
| Category tabs / sidebar | `Article.tags` | [Article](https://shopify.dev/docs/api/storefront/latest/objects/Article) | `mapShopifyArticle()`; [`JournalClient.tsx`](../src/components/site/JournalClient.tsx) |
| Sitemap article URLs | `getArticleSlugs()` | [blog](https://shopify.dev/docs/api/storefront/latest/queries/blog) | `provider.ts` |
| Connection verify | `blog` + `articles` + `tags` | [blog](https://shopify.dev/docs/api/storefront/latest/queries/blog) | `verify-shopify-connection.mjs` |

---

## Search

| App feature | Storefront operation | Doc link | Code location |
|-------------|---------------------|----------|---------------|
| Product + collection search | `products(first:, query:)` and `collections(first:, query:)` in one request | [products](https://shopify.dev/docs/api/storefront/latest/queries/products) · [collections](https://shopify.dev/docs/api/storefront/latest/queries/collections) | `SEARCH_QUERY`; `search()` in `provider.ts` |
| Article search | Client-side filter on cached articles (no Storefront `search` query yet) | [search](https://shopify.dev/docs/api/storefront/latest/queries/search) (Phase 8 predictive) | `search()` — filters `getArticles()` results |
| Inventory fallback | `SEARCH_QUERY_NO_INVENTORY` | — | `inventory-scope.ts` |

---

## Inventory scope (`unauthenticated_read_product_inventory`)

| Topic | Detail |
|-------|--------|
| **Scope** | [`unauthenticated_read_product_inventory`](https://shopify.dev/docs/api/usage/access-scopes#unauthenticated-access-scopes) on the Storefront access token |
| **Enables** | `ProductVariant.quantityAvailable` on products and cart line merchandise |
| **Without scope** | GraphQL returns `ACCESS_DENIED` for `quantityAvailable`; app retries with `*_NO_INVENTORY` query variants |
| **Fallback signal** | [`inventory-scope.ts`](../src/lib/commerce/shopify/inventory-scope.ts) `errorsDenyInventoryRead()` |
| **Alternate signal** | Product metafield `custom.inventory_quantity` (always readable; used when scope missing) |
| **Verify** | `node scripts/verify-shopify-inventory.mjs [product-handle]` |
| **Enable in Admin** | Partner app / Headless channel → add scope → re-install if needed; see [store setup](./shopify-store-setup.md) |

Other catalog scopes in use: `unauthenticated_read_product_listings` (required for variants/products), `unauthenticated_read_product_tags` (for `Product.tags`).

---

## Brand, navigation & chrome (Phase 3)

| App feature | Storefront operation | Doc link | Code location |
|-------------|---------------------|----------|---------------|
| Brand name, tagline, contact, social, SEO, newsletter, footer copy | `shop.name` + `shop.metafield(namespace: "custom", key: …)` | [Shop](https://shopify.dev/docs/api/storefront/latest/objects/Shop) · [Metafield](https://shopify.dev/docs/api/storefront/latest/objects/Metafield) | `SHOP_BRAND_QUERY`; [`brand.ts`](../src/lib/commerce/shopify/brand.ts) |
| Header nav | `menu(handle: "main-menu")` | [menu](https://shopify.dev/docs/api/storefront/latest/queries/menu) | `getShopifyBrand()` → `headerNav`; fallback [`brandConfig`](../src/lib/commerce/brand/config.ts) |
| Footer link columns | `menu(handle: "footer")` nested `MenuItem` | [Menu](https://shopify.dev/docs/api/storefront/latest/objects/Menu) · [MenuItem](https://shopify.dev/docs/api/storefront/latest/objects/MenuItem) | `getShopifyBrand()` → `footerMenus` |
| Logo | shop metafield `custom.logo_url` | [Metafield](https://shopify.dev/docs/api/storefront/latest/objects/Metafield) | `brand.logo` |
| Footer privacy / terms links | `shop.privacyPolicy.url`, `shop.termsOfService.url` | [ShopPolicy](https://shopify.dev/docs/api/storefront/latest/objects/ShopPolicy) | `brand.legal` |

**Menu writes (seed only):** Admin GraphQL `menuCreate` / `menuUpdate` in [`seed-shopify-catalog.mjs`](../scripts/seed-shopify-catalog.mjs). Scope: `write_online_store_navigation`.

---

## Phase 3 planned: navigation & brand (Admin API, not Storefront today)

_Header/footer navigation reads use Storefront `menu` (implemented). Admin API is used only for seeding menu structure._

| App feature | API | Doc link | Code location |
|-------------|-----|----------|---------------|
| Menu seed writes | Admin `menuCreate` / `menuUpdate` | [menuCreate (Admin)](https://shopify.dev/docs/api/admin-graphql/latest/mutations/menuCreate) | [`seed-shopify-catalog.mjs`](../scripts/seed-shopify-catalog.mjs) |
| Shop metafield seed writes | Admin `metafieldsSet` | [metafieldsSet (Admin)](https://shopify.dev/docs/api/admin-graphql/latest/mutations/metafieldsSet) | seed script |

**Env:** Admin token or partner app for seed; Storefront token for runtime reads.

---

## Query / mutation inventory (unique operations)

Distinct Storefront GraphQL operations referenced in app code and scripts:

| # | Type | Operation | Primary file |
|---|------|-----------|--------------|
| 1 | Query | `products` | `queries.ts` |
| 2 | Query | `product` | `queries.ts` |
| 3 | Query | `productRecommendations` | `queries.ts` |
| 4 | Query | `collections` | `queries.ts` |
| 5 | Query | `collection` | `queries.ts` |
| 6 | Query | `blog` / `articles` | `queries.ts` |
| 7 | Query | `articleByHandle` | `queries.ts` |
| 8 | Query | `menu` | `queries.ts`, `brand.ts` |
| 9 | Query | `shop` | `queries.ts`, verify scripts |
| 10 | Query | `cart` | `cart-queries.ts` |
| 11 | Mutation | `cartCreate` | `cart-queries.ts` |
| 12 | Mutation | `cartLinesAdd` | `cart-queries.ts` |
| 13 | Mutation | `cartLinesUpdate` | `cart-queries.ts` |
| 14 | Mutation | `cartLinesRemove` | `cart-queries.ts` |

**Total: 14 mapped Storefront operations** (10 queries + 4 mutations). Search reuses `products` and `collections` with the `query` argument; verify scripts add no new root fields beyond those listed.

Paired `*NoInventory` query strings are implementation variants of the same operations, not separate API surface area.

---

## Not Storefront API (for clarity)

These touch Shopify but use **Admin GraphQL** or CLI — documented here only to avoid confusion:

| Concern | API | Example |
|---------|-----|---------|
| Catalog seeding | Admin | [`seed-shopify-catalog.mjs`](../scripts/seed-shopify-catalog.mjs) — `productCreate`, `collectionCreate`, `metafieldsSet`, etc. |
| Legal policy **writes** | Admin | `shopPolicyUpdate` in seed script |
| Menu **writes** (Phase 3) | Admin | Online Store navigation |
| Customer accounts (Phase 6) | Customer Account API | OAuth PKCE — not Storefront |
