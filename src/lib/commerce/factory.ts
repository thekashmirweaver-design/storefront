import { validateCommerceConfig, getCommerceProviderName } from "./config";
import type { CommerceProvider } from "./provider";
import { MockCommerceProvider } from "./mock/provider";
import { ShopifyCommerceProvider } from "./shopify/provider";

let instance: CommerceProvider | null = null;

export function getCommerceProvider(): CommerceProvider {
  if (instance) return instance;

  validateCommerceConfig();
  const name = getCommerceProviderName();

  instance = name === "shopify" ? new ShopifyCommerceProvider() : new MockCommerceProvider();
  return instance;
}

/** Server-side commerce singleton. */
export const commerce = getCommerceProvider();
