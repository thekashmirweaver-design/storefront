import "server-only";

import type { CustomerAccountApiConfig, CustomerOpenIdConfig } from "./types";

const discoveryCache = new Map<
  string,
  { openId: CustomerOpenIdConfig; api: CustomerAccountApiConfig }
>();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Customer Account discovery failed (${response.status}) for ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function getCustomerAccountDiscovery(storeDomain: string) {
  const cached = discoveryCache.get(storeDomain);
  if (cached) return cached;

  const [openId, api] = await Promise.all([
    fetchJson<CustomerOpenIdConfig>(`https://${storeDomain}/.well-known/openid-configuration`),
    fetchJson<CustomerAccountApiConfig>(`https://${storeDomain}/.well-known/customer-account-api`),
  ]);

  const value = { openId, api };
  discoveryCache.set(storeDomain, value);
  return value;
}
