import type { CommerceProvider } from "../provider";
import type {
  ContactFormInput,
  ProductFilters,
  CommerceArticle,
  CommerceSitemapEntry,
} from "../types";
import { brandText } from "../brand/text";
import {
  applyBrandToCraftsmanshipContent,
  applyBrandToHomepageEditorial,
  applyBrandToOurStoryContent,
} from "../editorial-brand";
import { withShopifyCache } from "./cache";
import {
  SHOPIFY_CACHE_TAGS,
  shopifyArticleTag,
  shopifyCollectionTag,
  shopifyProductTag,
} from "./cache-tags";
import { getShopifyBrand } from "./brand";
import {
  getShopifyCraftsmanshipContent,
  getShopifyHomepageEditorial,
  getShopifyJournalIndexContent,
  getShopifyOurStoryContent,
} from "./editorial";
import { getShopifyFaqs } from "./faqs";
import { getShopifyClient, getShopifyClientForContext } from "./client";
import type { ShopifyMarketContext } from "./market-context";
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
  PREDICTIVE_SEARCH_QUERY,
  PREDICTIVE_SEARCH_QUERY_NO_INVENTORY,
  SEARCH_QUERY,
  SEARCH_QUERY_NO_INVENTORY,
  SHOP_CONTEXT_QUERY,
} from "./queries";

const BLOG_HANDLE = process.env.SHOPIFY_BLOG_HANDLE ?? "news";

/** Catalog reads from Shopify; brand + FAQs from Storefront when available; forms via Admin API. */
export class ShopifyCommerceProvider implements CommerceProvider {
  readonly name = "shopify" as const;

  private async resolveMarket(): Promise<{ key: string; context: ShopifyMarketContext }> {
    const { resolveShopifyMarketContext } = await import("./market-context.server");
    const context = await resolveShopifyMarketContext();
    return { key: `${context.country}-${context.language}`, context };
  }

  async getBrand() {
    return getShopifyBrand();
  }

  async getProducts(filters?: ProductFilters) {
    const { key: marketKey, context: marketContext } = await this.resolveMarket();
    const nodes = await withShopifyCache(
      ["shopify-products", marketKey, "v4"],
      [SHOPIFY_CACHE_TAGS.products, SHOPIFY_CACHE_TAGS.catalog],
      async () => {
        const client = getShopifyClientForContext(marketContext);
        const { data, errors } = await requestWithInventoryFallback<{
          products?: { nodes?: ShopifyProductNode[] };
        }>(client, PRODUCTS_QUERY, PRODUCTS_QUERY_NO_INVENTORY, { variables: { first: 50 } });
        if (errors) throw new Error(`Shopify getProducts: ${JSON.stringify(errors)}`);
        return (data?.products?.nodes ?? []) as ShopifyProductNode[];
      },
    );
    return applyClientFilters(
      nodes.map((n) => mapShopifyProduct(n)),
      filters,
    );
  }

  async getProductBySlug(slug: string) {
    const { key: marketKey, context: marketContext } = await this.resolveMarket();
    const node = await withShopifyCache(
      ["shopify-product", slug, marketKey, "v4"],
      [SHOPIFY_CACHE_TAGS.products, SHOPIFY_CACHE_TAGS.catalog, shopifyProductTag(slug)],
      async () => {
        const client = getShopifyClientForContext(marketContext);
        const { data, errors } = await requestWithInventoryFallback<{
          product?: ShopifyProductNode | null;
        }>(client, PRODUCT_BY_HANDLE_QUERY, PRODUCT_BY_HANDLE_QUERY_NO_INVENTORY, {
          variables: { handle: slug },
        });
        if (errors) throw new Error(`Shopify getProductBySlug: ${JSON.stringify(errors)}`);
        return (data?.product as ShopifyProductNode | null | undefined) ?? null;
      },
    );
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
      const client = await getShopifyClient();
      const { data, errors } = await requestWithInventoryFallback<{
        productRecommendations?: ShopifyProductNode[];
      }>(client, PRODUCT_RECOMMENDATIONS_QUERY, PRODUCT_RECOMMENDATIONS_QUERY_NO_INVENTORY, {
        variables: { productId },
      });
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
    const { key: marketKey, context: marketContext } = await this.resolveMarket();
    const nodes = await withShopifyCache(
      ["shopify-collections", marketKey, "v4"],
      [SHOPIFY_CACHE_TAGS.collections, SHOPIFY_CACHE_TAGS.catalog],
      async () => {
        const client = getShopifyClientForContext(marketContext);
        const { data, errors } = await client.request<{
          collections?: { nodes?: ShopifyCollectionNode[] };
        }>(COLLECTIONS_QUERY, {
          variables: { first: 20 },
        });
        if (errors) throw new Error(`Shopify getCollections: ${JSON.stringify(errors)}`);
        return (data?.collections?.nodes ?? []) as ShopifyCollectionNode[];
      },
    );
    return nodes.map(mapShopifyCollection);
  }

  async getCollectionBySlug(slug: string, filters?: ProductFilters) {
    const { key: marketKey, context: marketContext } = await this.resolveMarket();
    const node = await withShopifyCache(
      ["shopify-collection", slug, marketKey, "v4"],
      [SHOPIFY_CACHE_TAGS.collections, SHOPIFY_CACHE_TAGS.catalog, shopifyCollectionTag(slug)],
      async () => {
        const client = getShopifyClientForContext(marketContext);
        const { data, errors } = await requestWithInventoryFallback<{
          collection?: ShopifyCollectionNode | null;
        }>(client, COLLECTION_BY_HANDLE_QUERY, COLLECTION_BY_HANDLE_QUERY_NO_INVENTORY, {
          variables: { handle: slug, first: 50 },
        });
        if (errors) throw new Error(`Shopify getCollectionBySlug: ${JSON.stringify(errors)}`);
        return (data?.collection as ShopifyCollectionNode | null | undefined) ?? null;
      },
    );
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
    const { key: marketKey, context: marketContext } = await this.resolveMarket();
    const nodes = await withShopifyCache(
      ["shopify-articles", BLOG_HANDLE, marketKey, "v4"],
      [SHOPIFY_CACHE_TAGS.articles, SHOPIFY_CACHE_TAGS.catalog],
      async () => {
        const client = getShopifyClientForContext(marketContext);
        const { data, errors } = await client.request<{
          blog?: { articles?: { nodes?: Parameters<typeof mapShopifyArticle>[0][] } };
        }>(BLOG_ARTICLES_QUERY, {
          variables: { blogHandle: BLOG_HANDLE, first: 50 },
        });
        if (errors) throw new Error(`Shopify getArticles: ${JSON.stringify(errors)}`);
        return data?.blog?.articles?.nodes ?? [];
      },
    );
    const articles: CommerceArticle[] = nodes.map((n: Parameters<typeof mapShopifyArticle>[0]) =>
      mapShopifyArticle(n),
    );
    if (!category) return articles;
    return articles.filter((a) => a.category === category);
  }

  async getArticleBySlug(slug: string) {
    const { key: marketKey, context: marketContext } = await this.resolveMarket();
    const node = await withShopifyCache(
      ["shopify-article", BLOG_HANDLE, slug, marketKey, "v4"],
      [SHOPIFY_CACHE_TAGS.articles, SHOPIFY_CACHE_TAGS.catalog, shopifyArticleTag(slug)],
      async () => {
        const client = getShopifyClientForContext(marketContext);
        const { data, errors } = await client.request<{
          blog?: { articleByHandle?: Parameters<typeof mapShopifyArticle>[0] | null };
        }>(ARTICLE_BY_HANDLE_QUERY, {
          variables: { blogHandle: BLOG_HANDLE, articleHandle: slug },
        });
        if (errors) throw new Error(`Shopify getArticleBySlug: ${JSON.stringify(errors)}`);
        return data?.blog?.articleByHandle ?? null;
      },
    );
    return node ? mapShopifyArticle(node) : null;
  }

  async getArticleSlugs() {
    const articles = await this.getArticles();
    return articles.map((a) => a.slug);
  }

  async search(query: string) {
    const q = query.trim();
    if (!q) return { products: [], collections: [], articles: [] };

    const predictive = await this.searchPredictive(q);
    if (predictive) return predictive;

    return this.searchLegacy(q);
  }

  /** Storefront predictiveSearch for type-ahead; returns null when unsupported. */
  private async searchPredictive(q: string) {
    try {
      const { key: marketKey, context: marketContext } = await this.resolveMarket();
      const data = await withShopifyCache(
        ["shopify-predictive-search", q.toLowerCase(), marketKey, "v4"],
        [SHOPIFY_CACHE_TAGS.catalog, SHOPIFY_CACHE_TAGS.products, SHOPIFY_CACHE_TAGS.collections],
        async () => {
          const client = getShopifyClientForContext(marketContext);
          const { data: searchData, errors } = await requestWithInventoryFallback<{
            predictiveSearch?: {
              products?: ShopifyProductNode[];
              collections?: ShopifyCollectionNode[];
              articles?: {
                handle: string;
                title: string;
                excerpt?: string | null;
                publishedAt?: string | null;
                tags?: string[];
                image?: { url: string; altText?: string | null; width?: number; height?: number };
              }[];
            };
          }>(client, PREDICTIVE_SEARCH_QUERY, PREDICTIVE_SEARCH_QUERY_NO_INVENTORY, {
            variables: { query: q, limit: 10 },
          });
          if (errors) throw new Error(`Shopify predictiveSearch: ${JSON.stringify(errors)}`);
          return searchData;
        },
      );

      const result = data?.predictiveSearch;
      if (!result) return null;

      const products = (result.products ?? []).map((n) => mapShopifyProduct(n));
      const collections = (result.collections ?? []).map(mapShopifyCollection);
      const articles = (result.articles ?? []).map((node) => mapShopifyArticle(node));

      return { products, collections, articles };
    } catch {
      return null;
    }
  }

  /** Fallback when predictiveSearch is unavailable. */
  private async searchLegacy(q: string) {
    const { key: marketKey, context: marketContext } = await this.resolveMarket();
    const data = await withShopifyCache(
      ["shopify-search", q.toLowerCase(), marketKey, "v4"],
      [SHOPIFY_CACHE_TAGS.catalog, SHOPIFY_CACHE_TAGS.products, SHOPIFY_CACHE_TAGS.collections],
      async () => {
        const client = getShopifyClientForContext(marketContext);
        const { data: searchData, errors } = await requestWithInventoryFallback<{
          products?: { nodes?: ShopifyProductNode[] };
          collections?: { nodes?: ShopifyCollectionNode[] };
        }>(client, SEARCH_QUERY, SEARCH_QUERY_NO_INVENTORY, { variables: { query: q, first: 20 } });
        if (errors) throw new Error(`Shopify search: ${JSON.stringify(errors)}`);
        return searchData;
      },
    );

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
    const [faqs, brand] = await Promise.all([getShopifyFaqs(), this.getBrand()]);
    return faqs.map((faq) => ({
      ...faq,
      answer: brandText(faq.answer, brand),
    }));
  }

  async getHomepageEditorial() {
    const [content, brand] = await Promise.all([getShopifyHomepageEditorial(), this.getBrand()]);
    return applyBrandToHomepageEditorial(content, brand);
  }

  async getOurStoryContent() {
    const [content, brand] = await Promise.all([getShopifyOurStoryContent(), this.getBrand()]);
    return applyBrandToOurStoryContent(content, brand);
  }

  async getCraftsmanshipContent() {
    const [content, brand] = await Promise.all([getShopifyCraftsmanshipContent(), this.getBrand()]);
    return applyBrandToCraftsmanshipContent(content, brand);
  }

  async getJournalIndexContent() {
    return getShopifyJournalIndexContent();
  }

  async getStorefrontSettings() {
    const client = await getShopifyClient();
    const { data, errors } = await client.request<{ shop?: Parameters<typeof mapShopifyStorefrontSettings>[0] }>(
      SHOP_CONTEXT_QUERY,
    );
    if (errors) throw new Error(`Shopify getStorefrontSettings: ${JSON.stringify(errors)}`);
    return mapShopifyStorefrontSettings(data?.shop);
  }

  async getShopPolicies() {
    const client = await getShopifyClient();
    const { data, errors } = await client.request<{ shop?: Parameters<typeof mapShopifyShopPolicies>[0] }>(
      SHOP_CONTEXT_QUERY,
    );
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
      "/privacy",
      "/terms",
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

  async subscribeNewsletter(_email: string) {
    return {
      ok: false,
      message: "Use subscribeNewsletterAction — Shopify forms run via server actions",
    };
  }

  async submitContact(_form: ContactFormInput) {
    return {
      ok: false,
      message: "Use submitContactAction — Shopify forms run via server actions",
    };
  }
}
