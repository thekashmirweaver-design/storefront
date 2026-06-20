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
import { brandConfig } from "../brand/config";
import { brandText } from "../brand/text";
import { mockBrand } from "./brand";
import { mockArticles } from "./data/articles";
import { mockCollections } from "./data/collections";
import {
  mockCraftsmanshipContent,
  mockHomepageEditorial,
  mockJournalIndexContent,
  mockOurStoryContent,
} from "./data/editorial";
import { mockFaqs } from "./data/faqs";
import { mockProducts } from "./data/products";
import {
  applyBrandToCraftsmanshipContent,
  applyBrandToHomepageEditorial,
  applyBrandToOurStoryContent,
} from "../editorial-brand";

const CURRENCY = "USD";

function toCommerceProduct(record: (typeof mockProducts)[number]): CommerceProduct {
  const primary = staticImageToCommerceImage(record.image, record.name);
  const compareAtAmount = Math.round(record.price * 1.12);
  const quantityAvailable = record.quantityAvailable;
  const soldOutBySlug = record.slug.length % 17 === 0;
  const soldOutByStock = quantityAvailable != null && quantityAvailable <= 0;
  return {
    id: record.slug,
    slug: record.slug,
    name: record.name,
    category: record.category,
    categoryLabel: record.categoryLabel,
    collectionSlug: record.collectionSlug,
    price: { amount: record.price, currencyCode: CURRENCY },
    compareAtPrice:
      compareAtAmount > record.price
        ? { amount: compareAtAmount, currencyCode: CURRENCY }
        : undefined,
    images: [primary, { ...primary, alt: `${record.name} alternate view` }],
    colorHex: record.colorHex,
    description: record.description,
    availableForSale: !soldOutBySlug && !soldOutByStock,
    quantityAvailable,
    variantId: `mock-variant-${record.slug}`,
    dimensions: "70 x 200 cm",
    careInstructions: "Dry clean only. Store folded with cedar to preserve the fiber.",
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
  if (filters?.collectionSlugs?.length) {
    const slugs = new Set(filters.collectionSlugs);
    list = list.filter((p) => p.collectionSlug && slugs.has(p.collectionSlug));
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
    heroHeadline: record.heroHeadline,
    tagline: record.tagline,
    description: record.description,
    ctaLabel: record.ctaLabel,
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
    excerpt: brandText(record.excerpt, brandConfig),
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

  async getRelatedProducts(slug: string, limit = 4) {
    const product = await this.getProductBySlug(slug);
    if (!product) return [];

    const sameCollection = allProducts.filter(
      (p) => p.slug !== slug && p.collectionSlug === product.collectionSlug,
    );
    if (sameCollection.length >= limit) return sameCollection.slice(0, limit);

    const sameCategory = allProducts.filter(
      (p) =>
        p.slug !== slug &&
        p.category === product.category &&
        !sameCollection.some((s) => s.slug === p.slug),
    );
    return [...sameCollection, ...sameCategory].slice(0, limit);
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
    return mockFaqs.map((faq) => ({
      ...faq,
      answer: brandText(faq.answer, brandConfig),
    }));
  }

  async getHomepageEditorial() {
    return applyBrandToHomepageEditorial(mockHomepageEditorial, brandConfig);
  }

  async getOurStoryContent() {
    return applyBrandToOurStoryContent(mockOurStoryContent, brandConfig);
  }

  async getCraftsmanshipContent() {
    return applyBrandToCraftsmanshipContent(mockCraftsmanshipContent, brandConfig);
  }

  async getJournalIndexContent() {
    return mockJournalIndexContent;
  }

  async getStorefrontSettings() {
    return {
      authenticityPromise: brandText(
        brandConfig.copy.pages.product.authenticityPromise,
        brandConfig,
      ),
      shippingBadgeText: "Complimentary express shipping",
      returnsBadgeText: "Free 30-day returns",
    };
  }

  async getShopPolicies() {
    return {
      shippingPolicyHtml:
        "<p>Complimentary worldwide express shipping on all orders. Delivery typically within 5–10 business days.</p>",
      refundPolicyHtml:
        "<p>Free returns within 30 days of delivery. Items must be unworn with original packaging.</p>",
    };
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
    return { ok: true, message: brandText(brandConfig.copy.messages.newsletterWelcome, brandConfig) };
  }

  async submitContact(form: ContactFormInput) {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return { ok: false, message: "Please fill in all required fields" };
    }
    return { ok: true, message: "Thank you — we will be in touch shortly." };
  }
}
