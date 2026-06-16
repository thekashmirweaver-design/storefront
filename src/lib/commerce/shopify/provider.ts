import type { CommerceProvider } from "../provider";
import type { ContactFormInput, ProductFilters, CommerceArticle } from "../types";
import { MockCommerceProvider } from "../mock/provider";
import { mockBrand } from "../mock/brand";
import { mockFaqs } from "../mock/data/faqs";
import { createShopifyClient } from "./client";
import {
  applyClientFilters,
  mapShopifyArticle,
  mapShopifyCollection,
  mapShopifyProduct,
  type ShopifyCollectionNode,
  type ShopifyProductNode,
} from "./mappers";
import {
  ARTICLE_BY_HANDLE_QUERY,
  BLOG_ARTICLES_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
  SEARCH_QUERY,
} from "./queries";

const BLOG_HANDLE = process.env.SHOPIFY_BLOG_HANDLE ?? "news";

/** Catalog reads from Shopify; brand/forms/faqs fall back to mock until Phase 2. */
export class ShopifyCommerceProvider implements CommerceProvider {
  readonly name = "shopify" as const;
  private client = createShopifyClient();
  private mockDelegate = new MockCommerceProvider();

  async getBrand() {
    return mockBrand;
  }

  async getProducts(filters?: ProductFilters) {
    const { data, errors } = await this.client.request(PRODUCTS_QUERY, {
      variables: { first: 50 },
    });
    if (errors) throw new Error(`Shopify getProducts: ${JSON.stringify(errors)}`);
    const nodes = (data?.products?.nodes ?? []) as ShopifyProductNode[];
    return applyClientFilters(nodes.map(mapShopifyProduct), filters);
  }

  async getProductBySlug(slug: string) {
    const { data, errors } = await this.client.request(PRODUCT_BY_HANDLE_QUERY, {
      variables: { handle: slug },
    });
    if (errors) throw new Error(`Shopify getProductBySlug: ${JSON.stringify(errors)}`);
    const node = data?.product as ShopifyProductNode | null | undefined;
    return node ? mapShopifyProduct(node) : null;
  }

  async getProductSlugs() {
    const products = await this.getProducts();
    return products.map((p) => p.slug);
  }

  async getRelatedProducts(slug: string, limit = 4) {
    return this.mockDelegate.getRelatedProducts(slug, limit);
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
    const { data, errors } = await this.client.request(COLLECTION_BY_HANDLE_QUERY, {
      variables: { handle: slug, first: 50 },
    });
    if (errors) throw new Error(`Shopify getCollectionBySlug: ${JSON.stringify(errors)}`);
    const node = data?.collection as ShopifyCollectionNode | null | undefined;
    if (!node) return null;
    const collection = mapShopifyCollection(node);
    const products = applyClientFilters(
      (node.products?.nodes ?? []).map(mapShopifyProduct),
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

    const { data, errors } = await this.client.request(SEARCH_QUERY, {
      variables: { query: q, first: 20 },
    });
    if (errors) throw new Error(`Shopify search: ${JSON.stringify(errors)}`);

    const products = ((data?.products?.nodes ?? []) as ShopifyProductNode[]).map(mapShopifyProduct);
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

  async getSitemapEntries() {
    return this.mockDelegate.getSitemapEntries();
  }

  async subscribeNewsletter(email: string) {
    return this.mockDelegate.subscribeNewsletter(email);
  }

  async submitContact(form: ContactFormInput) {
    return this.mockDelegate.submitContact(form);
  }
}
