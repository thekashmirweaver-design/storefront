import { unstable_cache } from "next/cache";

import { mockFaqs } from "../mock/data/faqs";
import type { CommerceFaq } from "../types";
import { SHOPIFY_CACHE_TAGS } from "./cache-tags";
import { getShopifyClient } from "./client";
import { FAQS_QUERY } from "./queries";

/** App-owned metaobject type — must match partner app `shopify.app.toml` and seed script. */
export const SHOPIFY_FAQ_METAOBJECT_TYPE = "$app:faq";

const FAQS_REVALIDATE_SECONDS = 300;

type ShopifyFaqNode = {
  handle: string;
  question?: { value?: string | null } | null;
  answer?: { value?: string | null } | null;
  showOnFaqPage?: { value?: string | null } | null;
};

type ShopifyFaqsResponse = {
  metaobjects?: { nodes?: ShopifyFaqNode[] } | null;
};

function isShownOnFaqPage(node: ShopifyFaqNode): boolean {
  const raw = node.showOnFaqPage?.value?.trim().toLowerCase();
  return raw !== "false";
}

export function mapShopifyFaqs(data: ShopifyFaqsResponse): CommerceFaq[] {
  const nodes = data.metaobjects?.nodes ?? [];

  return nodes
    .filter(isShownOnFaqPage)
    .sort((a, b) => a.handle.localeCompare(b.handle))
    .map((node) => ({
      question: node.question?.value?.trim() ?? "",
      answer: node.answer?.value?.trim() ?? "",
    }))
    .filter((faq) => faq.question && faq.answer);
}

async function fetchShopifyFaqs(): Promise<CommerceFaq[]> {
  const client = await getShopifyClient();
  const { data, errors } = await client.request(FAQS_QUERY, {
    variables: { type: SHOPIFY_FAQ_METAOBJECT_TYPE, first: 50 },
  });

  if (errors) {
    throw new Error(`Shopify getFaqs: ${JSON.stringify(errors)}`);
  }

  const faqs = mapShopifyFaqs((data ?? {}) as ShopifyFaqsResponse);
  return faqs.length ? faqs : mockFaqs;
}

export async function getShopifyFaqs(): Promise<CommerceFaq[]> {
  try {
    return await unstable_cache(fetchShopifyFaqs, ["shopify-faqs", "v1"], {
      revalidate: FAQS_REVALIDATE_SECONDS,
      tags: [SHOPIFY_CACHE_TAGS.faqs],
    })();
  } catch {
    return mockFaqs;
  }
}
