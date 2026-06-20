import "server-only";

import { cache } from "react";

import { readMarketCookies } from "./market-cookie";
import {
  DEFAULT_SHOPIFY_MARKET,
  getShopifyMarketContextFromEnv,
  type ShopifyMarketContext,
} from "./market-context";

/** Per-request market context: cookie → env → store default (US/EN). */
export const resolveShopifyMarketContext = cache(async (): Promise<ShopifyMarketContext> => {
  const env = getShopifyMarketContextFromEnv();
  const fallback: ShopifyMarketContext = {
    country: env.country ?? DEFAULT_SHOPIFY_MARKET.country,
    language: env.language ?? DEFAULT_SHOPIFY_MARKET.language,
  };

  try {
    const cookieValues = await readMarketCookies();
    return {
      country: cookieValues.country?.toUpperCase() ?? fallback.country,
      language: cookieValues.language?.toUpperCase() ?? fallback.language,
    };
  } catch {
    // Static generation / build-time paths have no request cookies.
    return fallback;
  }
});
