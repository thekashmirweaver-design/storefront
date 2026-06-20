import type { CommerceProvider } from "../provider";
import type {
  ContactFormInput,
  ProductFilters,
  CommerceArticle,
  CommerceSitemapEntry,
} from "../types";
import { MockCommerceProvider } from "../mock/provider";
import { getShopifyBrand } from "./brand";
import { mockFaqs } from "../mock/data/faqs";
import { createShopifyClient } from "./client";
import {
  applyClientFilters,
  mapShopifyArticle,
  mapShopifyCollection,
  mapShopifyProduct,
  mapShopifyShopPolicies,
  mapShopifyStorefrontSettings,
  type ShopifyCollectionNode,
  type ShopifyProductNode,
} from "./mappers";
import { requestWithInventoryFallback } from "./inventory-scope";
import {
  ARTICLE_BY_HANDLE_QUERY,
  BLOG_ARTICLES_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTION_BY_HANDLE_QUERY_NO_INVENTORY,
  COLLECTIONS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_BY_HANDLE_QUERY_NO_INVENTORY,
  PRODUCT_RECOMMENDATIONS_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY_NO_INVENTORY,
  PRODUCTS_QUERY,
  PRODUCTS_QUERY_NO_INVENTORY,
  SEARCH_QUERY,
  SEARCH_QUERY_NO_INVENTORY,
  SHOP_CONTEXT_QUERY,
} from "./queries";

const BLOG_HANDLE = process.env.SHOPIFY_BLOG_HANDLE ?? "news";

/** Catalog reads from Shopify; brand from Storefront when available; forms/faqs fall back to mock until Phase 5+. */
export class ShopifyCommerceProvider implements CommerceProvider {
  readonly name = "shopify" as const;
  private client = createShopifyClient();
  private mockDelegate = new MockCommerceProvider();

  async getBrand() {
    return getShopifyBrand();
  }

  async getProducts(filters?: ProductFilters) {
    const { data, errors } = await requestWithInventoryFallback<{
      products?: { nodes?: ShopifyProductNode[] };
    }>(
      this.client,
      PRODUCTS_QUERY,
      PRODUCTS_QUERY_NO_INVENTORY,
      { variables: { first: 50 } },
    );
    if (errors) throw new Error(`Shopify getProducts: ${JSON.stringify(errors)}`);
    const nodes = (data?.products?.nodes ?? []) as ShopifyProductNode[];
    return applyClientFilters(
      nodes.map((n) => mapShopifyProduct(n)),
      filters,
    );
  }

  async getProductBySlug(slug: string) {
    const { data, errors } = await requestWithInventoryFallback<{ product?: ShopifyProductNode | null }>(
      this.client,
      PRODUCT_BY_HANDLE_QUERY,
      PRODUCT_BY_HANDLE_QUERY_NO_INVENTORY,
      { variables: { handle: slug } },
    );
    if (errors) throw new Error(`Shopify getProductBySlug: ${JSON.stringify(errors)}`);
    const node = data?.product as ShopifyProductNode | null | undefined;
    return node ? mapShopifyProduct(node) : null;
  }

  async getProductSlugs() {
    const products = await this.getProducts();
    return products.map((p) => p.slug);
  }

  async getRelatedProducts(slug: string, limit = 4) {
    const product = await this.getProductBySlug(slug);
    if (!product) return [];

    const fromRecommendations = await this.fetchProductRecommendations(product.id, slug, limit);
    if (fromRecommendations.length >= limit) return fromRecommendations;

    const seen = new Set([slug, ...fromRecommendations.map((p) => p.slug)]);
    const siblings = product.collectionSlug
      ? await this.fetchCollectionSiblings(
          product.collectionSlug,
          seen,
          limit - fromRecommendations.length,
        )
      : [];

    return [...fromRecommendations, ...siblings].slice(0, limit);
  }

  private async fetchProductRecommendations(productId: string, slug: string, limit: number) {
    try {
      const { data, errors } = await requestWithInventoryFallback<{
        productRecommendations?: ShopifyProductNode[];
      }>(
        this.client,
        PRODUCT_RECOMMENDATIONS_QUERY,
        PRODUCT_RECOMMENDATIONS_QUERY_NO_INVENTORY,
        { variables: { productId } },
      );
      if (errors) return [];
      const nodes = (data?.productRecommendations ?? []) as ShopifyProductNode[];
      return nodes
        .filter((n) => n.handle !== slug)
        .slice(0, limit)
        .map((n) => mapShopifyProduct(n));
    } catch {
      return [];
    }
  }

  private async fetchCollectionSiblings(
    collectionSlug: string,
    excludeSlugs: Set<string>,
    limit: number,
  ) {
    const data = await this.getCollectionBySlug(collectionSlug);
    if (!data || limit <= 0) return [];
    return data.products.filter((p) => !excludeSlugs.has(p.slug)).slice(0, limit);
  }

  async getCollections() {
    const { data, errors } = await this.client.request(COLLECTIONS_QUERY, {
      variables: { first: 20 },
    });
    if (errors) throw new Error(`Shopify getCollections: ${JSON.stringify(errors)}`);
    const nodes = (data?.collections?.nodes ?? []) as ShopifyCollectionNode[];
    return nodes.map(mapShopifyCollection);
  }

  async getCollectionBySlug(slug: string, filters?: ProductFilters) {
    const { data, errors } = await requestWithInventoryFallback<{
      collection?: ShopifyCollectionNode | null;
    }>(
      this.client,
      COLLECTION_BY_HANDLE_QUERY,
      COLLECTION_BY_HANDLE_QUERY_NO_INVENTORY,
      { variables: { handle: slug, first: 50 } },
    );
    if (errors) throw new Error(`Shopify getCollectionBySlug: ${JSON.stringify(errors)}`);
    const node = data?.collection as ShopifyCollectionNode | null | undefined;
    if (!node) return null;
    const collection = mapShopifyCollection(node);
    const products = applyClientFilters(
      (node.products?.nodes ?? []).map((n) => mapShopifyProduct(n, { collectionSlug: slug })),
      filters,
    );
    return { collection, products };
  }

  async getCollectionSlugs() {
    const collections = await this.getCollections();
    return collections.map((c) => c.slug);
  }

  async getArticles(category?: string) {
    const { data, errors } = await this.client.request(BLOG_ARTICLES_QUERY, {
      variables: { blogHandle: BLOG_HANDLE, first: 50 },
    });
    if (errors) throw new Error(`Shopify getArticles: ${JSON.stringify(errors)}`);
    const nodes = data?.blog?.articles?.nodes ?? [];
    const articles: CommerceArticle[] = nodes.map((n: Parameters<typeof mapShopifyArticle>[0]) =>
      mapShopifyArticle(n),
    );
    if (!category) return articles;
    return articles.filter((a) => a.category === category);
  }

  async getArticleBySlug(slug: string) {
    const { data, errors } = await this.client.request(ARTICLE_BY_HANDLE_QUERY, {
      variables: { blogHandle: BLOG_HANDLE, articleHandle: slug },
    });
    if (errors) throw new Error(`Shopify getArticleBySlug: ${JSON.stringify(errors)}`);
    const node = data?.blog?.articleByHandle;
    return node ? mapShopifyArticle(node) : null;
  }

  async getArticleSlugs() {
    const articles = await this.getArticles();
    return articles.map((a) => a.slug);
  }

  async search(query: string) {
    const q = query.trim();
    if (!q) return { products: [], collections: [], articles: [] };

    const { data, errors } = await requestWithInventoryFallback<{
      products?: { nodes?: ShopifyProductNode[] };
      collections?: { nodes?: ShopifyCollectionNode[] };
    }>(
      this.client,
      SEARCH_QUERY,
      SEARCH_QUERY_NO_INVENTORY,
      { variables: { query: q, first: 20 } },
    );
    if (errors) throw new Error(`Shopify search: ${JSON.stringify(errors)}`);

    const products = ((data?.products?.nodes ?? []) as ShopifyProductNode[]).map((n) =>
      mapShopifyProduct(n),
    );
    const collections = ((data?.collections?.nodes ?? []) as ShopifyCollectionNode[]).map(
      mapShopifyCollection,
    );

    const articles = (await this.getArticles()).filter(
      (a) =>
        a.title.toLowerCase().includes(q.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(q.toLowerCase()),
    );

    return { products, collections, articles };
  }

  async getFaqs() {
    return mockFaqs;
  }

  async getStorefrontSettings() {
    const { data, errors } = await this.client.request(SHOP_CONTEXT_QUERY);
    if (errors) throw new Error(`Shopify getStorefrontSettings: ${JSON.stringify(errors)}`);
    return mapShopifyStorefrontSettings(data?.shop);
  }

  async getShopPolicies() {
    const { data, errors } = await this.client.request(SHOP_CONTEXT_QUERY);
    if (errors) throw new Error(`Shopify getShopPolicies: ${JSON.stringify(errors)}`);
    return mapShopifyShopPolicies(data?.shop);
  }

  async getSitemapEntries() {
    const staticPages = [
      "",
      "/shop",
      "/collections",
      "/journal",
      "/our-story",
      "/craftsmanship",
      "/contact",
      "/faqs",
      "/wishlist",
      "/account",
    ];

    const entries: CommerceSitemapEntry[] = staticPages.map((path) => ({
      path: path || "/",
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }));

    for (const slug of await this.getProductSlugs()) {
      entries.push({ path: `/product/${slug}`, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const slug of await this.getCollectionSlugs()) {
      entries.push({ path: `/collections/${slug}`, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const slug of await this.getArticleSlugs()) {
      entries.push({ path: `/journal/${slug}`, changeFrequency: "monthly", priority: 0.6 });
    }

    return entries;
  }

  async subscribeNewsletter(email: string) {
    return this.mockDelegate.subscribeNewsletter(email);
  }

  async submitContact(form: ContactFormInput) {
    return this.mockDelegate.submitContact(form);
  }
}
