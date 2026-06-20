import "server-only";

import { getSiteUrl } from "@/lib/site-url";

import { getCustomerAccountConfig } from "./config";
import { getCustomerAccountDiscovery } from "./discovery";
import { getValidCustomerAccessToken } from "./auth";

type CustomerGraphqlError = { message: string };

type CustomerGraphqlResult<T> = {
  data?: T;
  errors?: CustomerGraphqlError[];
};

export async function customerAccountRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const accessToken = await getValidCustomerAccessToken();
  if (!accessToken) {
    throw new Error("Customer Account API requires an authenticated session");
  }

  const { storeDomain } = getCustomerAccountConfig();
  const { api } = await getCustomerAccountDiscovery(storeDomain);
  const endpoint = api.graphql_api;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
      Origin: getSiteUrl(),
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = (await response.json()) as CustomerGraphqlResult<T>;

  if (!response.ok) {
    throw new Error(
      `Customer Account API request failed (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  if (body.errors?.length) {
    throw new Error(body.errors.map((error) => error.message).join("; "));
  }

  if (!body.data) {
    throw new Error("Customer Account API returned no data");
  }

  return body.data;
}

export async function isCustomerAuthenticated(): Promise<boolean> {
  const token = await getValidCustomerAccessToken();
  return Boolean(token);
}
