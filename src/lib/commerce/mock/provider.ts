import { staticImageToCommerceImage } from "../mappers/image";
import type { CommerceProvider } from "../provider";
import type {
  CommerceArticle,
  CommerceCollection,
  CommerceProduct,
  CommerceSitemapEntry,
  ContactFormInput,
  ProductFilters,
} from "../types";
import { mockBrand } from "./brand";
import { mockArticles } from "./data/articles";
import { mockCollections } from "./data/collections";
import { mockFaqs } from "./data/faqs";
import { mockProducts } from "./data/products";

const CURRENCY = "USD";

function toCommerceProduct(record: (typeof mockProducts)[number]): CommerceProduct {
  return {
    id: record.slug,
    slug: record.slug,
    name: record.name,
    category: record.category,
    categoryLabel: record.categoryLabel,
    price: { amount: record.price, currencyCode: CURRENCY },
    images: [staticImageToCommerceImage(record.image, record.name)],
    colorHex: record.colorHex,
    description: record.description,
    availableForSale: true,
    variantId: `mock-variant-${record.slug}`,
  };
}

function applyProductFilters(
  products: CommerceProduct[],
  filters?: ProductFilters,
): CommerceProduct[] {
  let list = [...products];

  if (filters?.categories?.length) {
    const cats = new Set(filters.categories);
    list = list.filter((p) => cats.has(p.category));
  }
  if (filters?.colors?.length) {
    const colors = new Set(filters.colors);
    list = list.filter((p) => colors.has(p.colorHex));
  }
  if (filters?.maxPrice != null) {
    list = list.filter((p) => p.price.amount <= filters.maxPrice!);
  }

  switch (filters?.sort) {
    case "price-asc":
      list.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "price-desc":
      list.sort((a, b) => b.price.amount - a.price.amount);
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  return list;
}

const allProducts = mockProducts.map(toCommerceProduct);

function toCommerceCollection(record: (typeof mockCollections)[number]): CommerceCollection {
  return {
    slug: record.slug,
    title: record.title,
    tagline: record.tagline,
    category: record.category,
    image: staticImageToCommerceImage(record.image, record.title),
  };
}

function toCommerceArticle(record: (typeof mockArticles)[number]): CommerceArticle {
  return {
    slug: record.slug,
    title: record.title,
    category: record.category,
    date: record.date,
    excerpt: record.excerpt,
    cover: staticImageToCommerceImage(record.cover, record.title),
  };
}

export class MockCommerceProvider implements CommerceProvider {
  readonly name = "mock" as const;

  async getBrand() {
    return mockBrand;
  }

  async getProducts(filters?: ProductFilters) {
    return applyProductFilters(allProducts, filters);
  }

  async getProductBySlug(slug: string) {
    return allProducts.find((p) => p.slug === slug) ?? null;
  }

  async getProductSlugs() {
    return allProducts.map((p) => p.slug);
  }

  async getCollections() {
    return mockCollections.map(toCommerceCollection);
  }

  async getCollectionBySlug(slug: string, filters?: ProductFilters) {
    const record = mockCollections.find((c) => c.slug === slug);
    if (!record) return null;
    const collection = toCommerceCollection(record);
    const products = applyProductFilters(
      mockProducts.filter((p) => p.collectionSlug === slug).map(toCommerceProduct),
      filters,
    );
    return { collection, products };
  }

  async getCollectionSlugs() {
    return mockCollections.map((c) => c.slug);
  }

  async getArticles(category?: string) {
    const articles = mockArticles.map(toCommerceArticle);
    if (!category) return articles;
    return articles.filter((a) => a.category === category);
  }

  async getArticleBySlug(slug: string) {
    const record = mockArticles.find((a) => a.slug === slug);
    return record ? toCommerceArticle(record) : null;
  }

  async getArticleSlugs() {
    return mockArticles.map((a) => a.slug);
  }

  async search(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { products: [], collections: [], articles: [] };
    }

    const products = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q),
    );
    const collections = (await this.getCollections()).filter(
      (c) => c.title.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q),
    );
    const articles = (await this.getArticles()).filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    );

    return { products, collections, articles };
  }

  async getFaqs() {
    return mockFaqs;
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { ok: false, message: "Please enter a valid email" };
    }
    return { ok: true, message: "Welcome to the GULRIZA atelier." };
  }

  async submitContact(form: ContactFormInput) {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return { ok: false, message: "Please fill in all required fields" };
    }
    return { ok: true, message: "Thank you — we will be in touch shortly." };
  }
}
