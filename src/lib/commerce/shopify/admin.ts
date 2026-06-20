import { CommerceConfigError } from "../errors";

const DEFAULT_PARTNER_APP_DIR = "/tmp/shopify-probe/kashmir-weaver-probe";

export type ShopifyAdminConfig = {
  storeDomain: string;
  adminAccessToken?: string;
  apiVersion: string;
  partnerAppDir?: string;
};

export function getShopifyPartnerAppDir(): string {
  return process.env.SHOPIFY_PARTNER_APP_DIR ?? DEFAULT_PARTNER_APP_DIR;
}

export function getShopifyAdminConfig(): ShopifyAdminConfig | null {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2025-07";

  if (!storeDomain) return null;

  if (adminAccessToken) {
    return { storeDomain, adminAccessToken, apiVersion };
  }

  return { storeDomain, apiVersion, partnerAppDir: getShopifyPartnerAppDir() };
}

export function requireShopifyAdminConfig(): ShopifyAdminConfig {
  const config = getShopifyAdminConfig();
  if (!config) {
    throw new CommerceConfigError(
      "Shopify Admin API requires SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_PARTNER_APP_DIR (shopify CLI).",
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
  const config = requireShopifyAdminConfig();

  if (config.adminAccessToken) {
    const url = `https://${config.storeDomain}/admin/api/${config.apiVersion}/graphql.json`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": config.adminAccessToken,
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

  const { executeShopifyAdminCli } = await import("./admin-cli.server");
  return executeShopifyAdminCli<T>(
    config.storeDomain,
    config.partnerAppDir!,
    query,
    variables,
  );
}
