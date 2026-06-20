import { createStorefrontApiClient } from "@shopify/storefront-api-client";

import { getShopifyConfig } from "../config";
import { applyMarketContextToQuery } from "./market-context";

export function createShopifyClient() {
  const { storeDomain, storefrontAccessToken, apiVersion } = getShopifyConfig();
  const client = createStorefrontApiClient({
    storeDomain,
    apiVersion,
    publicAccessToken: storefrontAccessToken,
  });

  return {
    request: (query: string, options?: { variables?: Record<string, unknown> }) =>
      client.request(applyMarketContextToQuery(query), options),
  };
}
