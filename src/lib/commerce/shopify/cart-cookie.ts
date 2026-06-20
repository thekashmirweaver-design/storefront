import { cookies } from "next/headers";

export const SHOPIFY_CART_COOKIE = "shopify_cart_id";

const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export async function getShopifyCartIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SHOPIFY_CART_COOKIE)?.value ?? null;
}

export async function setShopifyCartIdCookie(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SHOPIFY_CART_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

export async function clearShopifyCartIdCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SHOPIFY_CART_COOKIE);
}
