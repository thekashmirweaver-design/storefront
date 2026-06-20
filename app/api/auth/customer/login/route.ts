import { NextResponse } from "next/server";

import {
  getCustomerAccountConfig,
  isCustomerAccountConfigured,
} from "@/lib/commerce/shopify/customer/config";
import { getCustomerAccountDiscovery } from "@/lib/commerce/shopify/customer/discovery";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthState,
} from "@/lib/commerce/shopify/customer/pkce";
import { setOAuthCookies } from "@/lib/commerce/shopify/customer/session-cookie";

export async function GET() {
  if (!isCustomerAccountConfigured()) {
    return NextResponse.json({ error: "Customer Account API is not configured" }, { status: 503 });
  }

  const { storeDomain, clientId, callbackUrl } = getCustomerAccountConfig();
  const { openId } = await getCustomerAccountDiscovery(storeDomain);

  const state = generateOAuthState();
  const nonce = generateOAuthState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  await setOAuthCookies({ state, nonce, codeVerifier });

  const authorizationUrl = new URL(openId.authorization_endpoint);
  authorizationUrl.searchParams.set("scope", "openid email customer-account-api:full");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("nonce", nonce);
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authorizationUrl);
}
