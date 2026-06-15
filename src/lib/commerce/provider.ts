import type {
  BrandConfig,
  CommerceArticle,
  CommerceCart,
  CommerceCollection,
  CommerceFaq,
  CommerceProduct,
  CommerceSearchResult,
  CommerceSitemapEntry,
  ContactFormInput,
  ProductFilters,
} from "./types";

export interface CommerceProvider {
  readonly name: "mock" | "shopify";

  getBrand(): Promise<BrandConfig>;

  getProducts(filters?: ProductFilters): Promise<CommerceProduct[]>;
  getProductBySlug(slug: string): Promise<CommerceProduct | null>;
  getProductSlugs(): Promise<string[]>;

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

  getSitemapEntries(): Promise<CommerceSitemapEntry[]>;

  subscribeNewsletter(email: string): Promise<{ ok: boolean; message: string }>;
  submitContact(form: ContactFormInput): Promise<{ ok: boolean; message: string }>;
}

/** Client-side cart operations (mock localStorage / future Shopify Cart API). */
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
