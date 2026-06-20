import "server-only";

import { cookies } from "next/headers";

export const CUSTOMER_ACCESS_TOKEN_COOKIE = "shopify_customer_access_token";
export const CUSTOMER_REFRESH_TOKEN_COOKIE = "shopify_customer_refresh_token";
export const CUSTOMER_ID_TOKEN_COOKIE = "shopify_customer_id_token";
export const CUSTOMER_EXPIRES_AT_COOKIE = "shopify_customer_expires_at";

export const OAUTH_STATE_COOKIE = "shopify_oauth_state";
export const OAUTH_NONCE_COOKIE = "shopify_oauth_nonce";
export const OAUTH_CODE_VERIFIER_COOKIE = "shopify_oauth_code_verifier";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const OAUTH_MAX_AGE = 60 * 10; // 10 minutes

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function setOAuthCookies(input: {
  state: string;
  nonce: string;
  codeVerifier: string;
}): Promise<void> {
  const cookieStore = await cookies();
  const options = cookieOptions(OAUTH_MAX_AGE);
  cookieStore.set(OAUTH_STATE_COOKIE, input.state, options);
  cookieStore.set(OAUTH_NONCE_COOKIE, input.nonce, options);
  cookieStore.set(OAUTH_CODE_VERIFIER_COOKIE, input.codeVerifier, options);
}

export async function readOAuthCookies(): Promise<{
  state: string | null;
  nonce: string | null;
  codeVerifier: string | null;
}> {
  const cookieStore = await cookies();
  return {
    state: cookieStore.get(OAUTH_STATE_COOKIE)?.value ?? null,
    nonce: cookieStore.get(OAUTH_NONCE_COOKIE)?.value ?? null,
    codeVerifier: cookieStore.get(OAUTH_CODE_VERIFIER_COOKIE)?.value ?? null,
  };
}

export async function clearOAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_STATE_COOKIE);
  cookieStore.delete(OAUTH_NONCE_COOKIE);
  cookieStore.delete(OAUTH_CODE_VERIFIER_COOKIE);
}

export async function setCustomerSessionCookies(input: {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}): Promise<void> {
  const cookieStore = await cookies();
  const options = cookieOptions(SESSION_MAX_AGE);
  const expiresAt = String(Date.now() + input.expiresIn * 1000);

  cookieStore.set(CUSTOMER_ACCESS_TOKEN_COOKIE, input.accessToken, options);
  cookieStore.set(CUSTOMER_REFRESH_TOKEN_COOKIE, input.refreshToken, options);
  cookieStore.set(CUSTOMER_ID_TOKEN_COOKIE, input.idToken, options);
  cookieStore.set(CUSTOMER_EXPIRES_AT_COOKIE, expiresAt, options);
}

export async function readCustomerSessionCookies(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number | null;
}> {
  const cookieStore = await cookies();
  const expiresRaw = cookieStore.get(CUSTOMER_EXPIRES_AT_COOKIE)?.value;
  return {
    accessToken: cookieStore.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: cookieStore.get(CUSTOMER_REFRESH_TOKEN_COOKIE)?.value ?? null,
    idToken: cookieStore.get(CUSTOMER_ID_TOKEN_COOKIE)?.value ?? null,
    expiresAt: expiresRaw ? Number(expiresRaw) : null,
  };
}

export async function clearCustomerSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(CUSTOMER_REFRESH_TOKEN_COOKIE);
  cookieStore.delete(CUSTOMER_ID_TOKEN_COOKIE);
  cookieStore.delete(CUSTOMER_EXPIRES_AT_COOKIE);
}
