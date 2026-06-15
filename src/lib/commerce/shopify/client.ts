import { createStorefrontApiClient } from "@shopify/storefront-api-client";

import { getShopifyConfig } from "../config";

export function createShopifyClient() {
  const { storeDomain, storefrontAccessToken, apiVersion } = getShopifyConfig();
  return createStorefrontApiClient({
    storeDomain,
    apiVersion,
    publicAccessToken: storefrontAccessToken,
  });
}
