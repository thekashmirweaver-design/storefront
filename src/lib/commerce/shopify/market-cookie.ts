import "server-only";

import { cookies } from "next/headers";

export const SHOPIFY_COUNTRY_COOKIE = "shopify_country";
export const SHOPIFY_LANGUAGE_COOKIE = "shopify_language";

const MARKET_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type MarketCookieValues = {
  country?: string;
  language?: string;
};

export async function readMarketCookies(): Promise<MarketCookieValues> {
  const cookieStore = await cookies();
  return {
    country: cookieStore.get(SHOPIFY_COUNTRY_COOKIE)?.value,
    language: cookieStore.get(SHOPIFY_LANGUAGE_COOKIE)?.value,
  };
}

export async function writeMarketCookies(country: string, language: string): Promise<void> {
  const cookieStore = await cookies();
  const opts = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MARKET_COOKIE_MAX_AGE,
  };
  cookieStore.set(SHOPIFY_COUNTRY_COOKIE, country.toUpperCase(), opts);
  cookieStore.set(SHOPIFY_LANGUAGE_COOKIE, language.toUpperCase(), opts);
}
