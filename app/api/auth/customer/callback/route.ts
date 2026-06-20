import { NextResponse } from "next/server";

import {
  exchangeAuthorizationCode,
  persistCustomerTokenResponse,
} from "@/lib/commerce/shopify/customer/auth";
import { isCustomerAccountConfigured } from "@/lib/commerce/shopify/customer/config";
import {
  clearOAuthCookies,
  readOAuthCookies,
} from "@/lib/commerce/shopify/customer/session-cookie";

function redirectToAccount(request: Request, query = "") {
  const url = new URL(`/account${query}`, request.url);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  if (!isCustomerAccountConfigured()) {
    return redirectToAccount(request, "?error=not_configured");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    await clearOAuthCookies();
    return redirectToAccount(request, `?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return redirectToAccount(request, "?error=missing_code");
  }

  const oauth = await readOAuthCookies();
  if (!oauth.state || oauth.state !== state || !oauth.codeVerifier) {
    await clearOAuthCookies();
    return redirectToAccount(request, "?error=invalid_state");
  }

  try {
    const tokens = await exchangeAuthorizationCode({
      code,
      codeVerifier: oauth.codeVerifier,
    });
    await persistCustomerTokenResponse(tokens);
    await clearOAuthCookies();
    return redirectToAccount(request, "?signed_in=1");
  } catch {
    await clearOAuthCookies();
    return redirectToAccount(request, "?error=token_exchange_failed");
  }
}
