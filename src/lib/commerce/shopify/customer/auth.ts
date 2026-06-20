import "server-only";

import { getCustomerAccountConfig, getCustomerAccountLogoutUrl } from "./config";
import { getCustomerAccountDiscovery } from "./discovery";
import {
  clearCustomerSessionCookies,
  clearOAuthCookies,
  readCustomerSessionCookies,
  setCustomerSessionCookies,
} from "./session-cookie";
import type { CustomerTokenResponse } from "./types";

const TOKEN_REFRESH_BUFFER_MS = 60_000;

function basicAuthHeader(clientId: string, clientSecret: string): string {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${credentials}`;
}

async function requestToken(
  tokenEndpoint: string,
  body: URLSearchParams,
  useConfidentialAuth: boolean,
): Promise<CustomerTokenResponse> {
  const { clientId, clientSecret } = getCustomerAccountConfig();
  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
    "user-agent": "the-kashmir-weaver/1.0",
  };

  if (useConfidentialAuth && clientSecret) {
    headers.Authorization = basicAuthHeader(clientId, clientSecret);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    headers.origin = siteUrl;
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Customer Account token exchange failed (${response.status}): ${detail}`);
  }

  return response.json() as Promise<CustomerTokenResponse>;
}

export async function exchangeAuthorizationCode(input: {
  code: string;
  codeVerifier: string;
}): Promise<CustomerTokenResponse> {
  const { storeDomain, clientId, clientSecret, callbackUrl } = getCustomerAccountConfig();
  const { openId } = await getCustomerAccountDiscovery(storeDomain);

  const body = new URLSearchParams();
  body.append("grant_type", "authorization_code");
  body.append("client_id", clientId);
  body.append("redirect_uri", callbackUrl);
  body.append("code", input.code);
  body.append("code_verifier", input.codeVerifier);

  return requestToken(openId.token_endpoint, body, Boolean(clientSecret));
}

export async function refreshCustomerAccessToken(
  refreshToken: string,
): Promise<CustomerTokenResponse> {
  const { storeDomain, clientId, clientSecret } = getCustomerAccountConfig();
  const { openId } = await getCustomerAccountDiscovery(storeDomain);

  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("client_id", clientId);
  body.append("refresh_token", refreshToken);

  return requestToken(openId.token_endpoint, body, Boolean(clientSecret));
}

export async function persistCustomerTokenResponse(tokens: CustomerTokenResponse): Promise<void> {
  await setCustomerSessionCookies({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token,
    expiresIn: tokens.expires_in,
  });
}

export async function getValidCustomerAccessToken(): Promise<string | null> {
  const session = await readCustomerSessionCookies();
  if (!session.accessToken) return null;

  const expiresSoon =
    session.expiresAt != null && session.expiresAt - TOKEN_REFRESH_BUFFER_MS <= Date.now();

  if (!expiresSoon) return session.accessToken;
  if (!session.refreshToken) return null;

  try {
    const tokens = await refreshCustomerAccessToken(session.refreshToken);
    await persistCustomerTokenResponse(tokens);
    return tokens.access_token;
  } catch {
    await clearCustomerSessionCookies();
    return null;
  }
}

export async function clearCustomerSession(): Promise<void> {
  await clearCustomerSessionCookies();
  await clearOAuthCookies();
}

export async function getCustomerLogoutUrl(): Promise<string | null> {
  const session = await readCustomerSessionCookies();
  if (!session.idToken) return null;

  const { storeDomain } = getCustomerAccountConfig();
  const { openId } = await getCustomerAccountDiscovery(storeDomain);
  if (!openId.end_session_endpoint) return null;

  const url = new URL(openId.end_session_endpoint);
  url.searchParams.set("id_token_hint", session.idToken);
  url.searchParams.set("post_logout_redirect_uri", getCustomerAccountLogoutUrl());
  return url.toString();
}
