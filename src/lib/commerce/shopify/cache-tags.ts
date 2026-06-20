/** Next.js cache tags for Shopify-backed data (used with unstable_cache + revalidateTag). */
export const SHOPIFY_CACHE_TAGS = {
  brand: "shopify-brand",
  faqs: "shopify-faqs",
  editorial: "shopify-editorial",
  catalog: "shopify-catalog",
  products: "shopify-products",
  collections: "shopify-collections",
  articles: "shopify-articles",
} as const;

export type ShopifyCacheTag = (typeof SHOPIFY_CACHE_TAGS)[keyof typeof SHOPIFY_CACHE_TAGS];

export function shopifyProductTag(handle: string): string {
  return `shopify-product:${handle}`;
}

export function shopifyCollectionTag(handle: string): string {
  return `shopify-collection:${handle}`;
}

export function shopifyArticleTag(handle: string): string {
  return `shopify-article:${handle}`;
}

/** Default ISR window for catalog reads when webhooks are not configured. */
export const CATALOG_REVALIDATE_SECONDS = 3600;
