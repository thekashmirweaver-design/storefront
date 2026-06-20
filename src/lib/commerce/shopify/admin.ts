import { CommerceConfigError } from "../errors";

export type ShopifyAdminConfig = {
  storeDomain: string;
  adminAccessToken: string;
  apiVersion: string;
};

export function getShopifyAdminConfig(): ShopifyAdminConfig | null {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2025-07";

  if (!storeDomain || !adminAccessToken) return null;

  return { storeDomain, adminAccessToken, apiVersion };
}

export function requireShopifyAdminConfig(): ShopifyAdminConfig {
  const config = getShopifyAdminConfig();
  if (!config) {
    throw new CommerceConfigError(
      "Shopify forms require SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN (write_customers scope).",
    );
  }
  return config;
}

type AdminGraphqlError = { message: string };

type AdminRequestResult<T> = {
  data?: T;
  errors?: AdminGraphqlError[];
};

export async function shopifyAdminRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const { storeDomain, adminAccessToken, apiVersion } = requireShopifyAdminConfig();
  const url = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = (await response.json()) as AdminRequestResult<T>;

  if (body.errors?.length) {
    throw new Error(body.errors.map((error) => error.message).join("; "));
  }

  if (!body.data) {
    throw new Error("Shopify Admin API returned no data");
  }

  return body.data;
}
