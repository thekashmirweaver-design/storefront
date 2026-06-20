import "server-only";

import { getSiteUrl } from "@/lib/site-url";

import { CommerceConfigError } from "../../errors";

export const WISHLIST_METAFIELD_NAMESPACE = "custom";
export const WISHLIST_METAFIELD_KEY = "wishlist";

export { getSiteUrl };

export function getCustomerAccountCallbackUrl(): string {
  return `${getSiteUrl()}/api/auth/customer/callback`;
}

export function getCustomerAccountLogoutUrl(): string {
  return `${getSiteUrl()}/account`;
}

export function isCustomerAccountConfigured(): boolean {
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim(),
  );
}

export function getCustomerAccountConfig() {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET?.trim();

  if (!storeDomain || !clientId) {
    throw new CommerceConfigError(
      "Customer Account API requires SHOPIFY_STORE_DOMAIN and SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID.",
    );
  }

  return {
    storeDomain,
    clientId,
    clientSecret,
    apiVersion: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION ?? "2025-04",
    callbackUrl: getCustomerAccountCallbackUrl(),
    logoutUrl: getCustomerAccountLogoutUrl(),
  };
}
