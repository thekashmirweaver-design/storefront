import { createStorefrontApiClient } from "@shopify/storefront-api-client";

import { getShopifyConfig } from "../config";
import { applyMarketContextToQuery, type ShopifyMarketContext } from "./market-context";

export type ShopifyClient = {
  request: <T = unknown>(
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<{ data?: T; errors?: unknown }>;
};

function buildClient(context: ShopifyMarketContext): ShopifyClient {
  const { storeDomain, storefrontAccessToken, apiVersion } = getShopifyConfig();
  const client = createStorefrontApiClient({
    storeDomain,
    apiVersion,
    publicAccessToken: storefrontAccessToken,
  });

  return {
    request: (query, options) => client.request(applyMarketContextToQuery(query, context), options),
  };
}

/** Per-request Storefront client with cookie/env `@inContext`. */
export async function getShopifyClient(): Promise<ShopifyClient> {
  const { resolveShopifyMarketContext } = await import("./market-context.server");
  const context = await resolveShopifyMarketContext();
  return buildClient(context);
}

/** Explicit market context (e.g. localization bootstrap). */
export function getShopifyClientForContext(context: ShopifyMarketContext): ShopifyClient {
  return buildClient(context);
}
