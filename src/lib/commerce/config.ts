import { CommerceConfigError } from "./errors";

export type CommerceProviderName = "mock" | "shopify";

export function getCommerceProviderName(): CommerceProviderName {
  const value = process.env.COMMERCE_PROVIDER ?? "mock";
  if (value !== "mock" && value !== "shopify") {
    throw new CommerceConfigError(
      `Invalid COMMERCE_PROVIDER "${value}". Expected "mock" or "shopify".`,
    );
  }
  return value;
}

export function isShopifyProvider(): boolean {
  return getCommerceProviderName() === "shopify";
}

export function validateCommerceConfig(): void {
  if (getCommerceProviderName() !== "shopify") return;

  const missing: string[] = [];
  if (!process.env.SHOPIFY_STORE_DOMAIN) missing.push("SHOPIFY_STORE_DOMAIN");
  if (!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) missing.push("SHOPIFY_STOREFRONT_ACCESS_TOKEN");

  if (missing.length > 0) {
    throw new CommerceConfigError(`COMMERCE_PROVIDER=shopify requires: ${missing.join(", ")}`);
  }
}

export function getShopifyConfig() {
  validateCommerceConfig();
  return {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
    storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
    apiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01",
  };
}
