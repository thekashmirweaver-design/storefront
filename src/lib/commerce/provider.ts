import type {
  BrandConfig,
  CommerceArticle,
  CommerceCart,
  CommerceCollection,
  CommerceFaq,
  CommerceProduct,
  CommerceSearchResult,
  CommerceShopPolicies,
  CommerceSitemapEntry,
  CommerceStorefrontSettings,
  ContactFormInput,
  ProductFilters,
} from "./types";

export interface CommerceProvider {
  readonly name: "mock" | "shopify";

  getBrand(): Promise<BrandConfig>;

  getProducts(filters?: ProductFilters): Promise<CommerceProduct[]>;
  getProductBySlug(slug: string): Promise<CommerceProduct | null>;
  getProductSlugs(): Promise<string[]>;
  getRelatedProducts(slug: string, limit?: number): Promise<CommerceProduct[]>;

  getCollections(): Promise<CommerceCollection[]>;
  getCollectionBySlug(
    slug: string,
    filters?: ProductFilters,
  ): Promise<{
    collection: CommerceCollection;
    products: CommerceProduct[];
  } | null>;
  getCollectionSlugs(): Promise<string[]>;

  getArticles(category?: string): Promise<CommerceArticle[]>;
  getArticleBySlug(slug: string): Promise<CommerceArticle | null>;
  getArticleSlugs(): Promise<string[]>;

  search(query: string): Promise<CommerceSearchResult>;

  getFaqs(): Promise<CommerceFaq[]>;

  getStorefrontSettings(): Promise<CommerceStorefrontSettings>;
  getShopPolicies(): Promise<CommerceShopPolicies>;

  getSitemapEntries(): Promise<CommerceSitemapEntry[]>;

  subscribeNewsletter(email: string): Promise<{ ok: boolean; message: string }>;
  submitContact(form: ContactFormInput): Promise<{ ok: boolean; message: string }>;
}

/** Client-side cart UI; Shopify cart persistence uses server actions + httpOnly cookie. */
export interface CommerceCartProvider {
  getCart(): CommerceCart;
  addToCart(slug: string, qty?: number): void;
  removeFromCart(slug: string): void;
  setQty(slug: string, qty: number): void;
  clearCart(): void;
  checkout(): void;
}

/** Client-side wishlist operations. */
export interface CommerceWishlistProvider {
  getWishlist(): string[];
  toggleWishlist(slug: string): void;
  inWishlist(slug: string): boolean;
}
