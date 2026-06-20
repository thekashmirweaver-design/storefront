import "server-only";

import crypto from "node:crypto";

import { revalidateTag } from "next/cache";

import {
  SHOPIFY_CACHE_TAGS,
  shopifyArticleTag,
  shopifyCollectionTag,
  shopifyProductTag,
} from "./cache-tags";

const PRODUCT_TOPICS = new Set([
  "products/create",
  "products/update",
  "products/delete",
]);

const COLLECTION_TOPICS = new Set([
  "collections/create",
  "collections/update",
  "collections/delete",
]);

const ARTICLE_TOPICS = new Set([
  "articles/create",
  "articles/update",
  "articles/delete",
]);

type ShopifyWebhookPayload = {
  handle?: string;
  admin_graphql_api_id?: string;
};

export function getShopifyWebhookSecret(): string | undefined {
  return process.env.SHOPIFY_WEBHOOK_SECRET?.trim() || undefined;
}

export function verifyShopifyWebhookHmac(
  rawBody: string,
  hmacHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!hmacHeader) return false;

  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const digestBuffer = Buffer.from(digest, "utf8");
  const headerBuffer = Buffer.from(hmacHeader, "utf8");

  if (digestBuffer.length !== headerBuffer.length) return false;
  return crypto.timingSafeEqual(digestBuffer, headerBuffer);
}

function revalidateCatalogTags() {
  revalidateTag(SHOPIFY_CACHE_TAGS.catalog, "max");
}

function revalidateProductTags(handle?: string) {
  revalidateTag(SHOPIFY_CACHE_TAGS.products, "max");
  revalidateCatalogTags();
  if (handle) revalidateTag(shopifyProductTag(handle), "max");
}

function revalidateCollectionTags(handle?: string) {
  revalidateTag(SHOPIFY_CACHE_TAGS.collections, "max");
  revalidateCatalogTags();
  if (handle) revalidateTag(shopifyCollectionTag(handle), "max");
}

function revalidateArticleTags(handle?: string) {
  revalidateTag(SHOPIFY_CACHE_TAGS.articles, "max");
  revalidateCatalogTags();
  if (handle) revalidateTag(shopifyArticleTag(handle), "max");
}

/** Map Shopify webhook topics to Next.js cache tag revalidation. */
export function handleShopifyWebhookTopic(topic: string, payload: ShopifyWebhookPayload): string[] {
  const handle = typeof payload.handle === "string" ? payload.handle : undefined;
  const revalidated: string[] = [];

  if (PRODUCT_TOPICS.has(topic)) {
    revalidateProductTags(handle);
    revalidated.push(
      SHOPIFY_CACHE_TAGS.products,
      SHOPIFY_CACHE_TAGS.catalog,
      ...(handle ? [shopifyProductTag(handle)] : []),
    );
    return revalidated;
  }

  if (COLLECTION_TOPICS.has(topic)) {
    revalidateCollectionTags(handle);
    revalidated.push(
      SHOPIFY_CACHE_TAGS.collections,
      SHOPIFY_CACHE_TAGS.catalog,
      ...(handle ? [shopifyCollectionTag(handle)] : []),
    );
    return revalidated;
  }

  if (ARTICLE_TOPICS.has(topic)) {
    revalidateArticleTags(handle);
    revalidated.push(
      SHOPIFY_CACHE_TAGS.articles,
      SHOPIFY_CACHE_TAGS.catalog,
      ...(handle ? [shopifyArticleTag(handle)] : []),
    );
    return revalidated;
  }

  return revalidated;
}
