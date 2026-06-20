"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { isShopifyProvider } from "./config";
import { commerce } from "./server";
import {
  addVariantToShopifyCart,
  clearShopifyCart,
  getShopifyCart,
  removeShopifyCartLine,
  updateShopifyCartBuyerIdentity,
  updateShopifyCartLine,
} from "./shopify/cart";
import { writeMarketCookies } from "./shopify/market-cookie";
import { SHOPIFY_CACHE_TAGS } from "./shopify/cache-tags";
import { fetchShopifyLocalization } from "./shopify/localization";
import { getShopifyCartIdFromCookie } from "./shopify/cart-cookie";
import type {
  CommerceCart,
  CommerceCartActionResult,
  CommerceLocalization,
  ContactFormInput,
  ProductFilters,
  CommerceCustomerSession,
  CommerceOrder,
} from "./types";

export async function searchCommerce(query: string) {
  return commerce.search(query);
}

export async function getProductsAction(filters?: ProductFilters) {
  return commerce.getProducts(filters);
}

export async function getProductBySlugAction(slug: string) {
  return commerce.getProductBySlug(slug);
}

export async function getProductsBySlugsAction(slugs: string[]) {
  const products = await Promise.all(slugs.map((slug) => commerce.getProductBySlug(slug)));
  return products.filter((p): p is NonNullable<typeof p> => p != null);
}

export async function subscribeNewsletterAction(email: string) {
  if (isShopifyProvider()) {
    const { subscribeShopifyNewsletter } = await import("./shopify/forms.server");
    return subscribeShopifyNewsletter(email);
  }
  return commerce.subscribeNewsletter(email);
}

export async function submitContactAction(form: ContactFormInput) {
  if (isShopifyProvider()) {
    const { submitShopifyContact } = await import("./shopify/forms.server");
    return submitShopifyContact(form);
  }
  return commerce.submitContact(form);
}

export async function getBrandAction() {
  return commerce.getBrand();
}

export async function getColorsAction() {
  const { mockColors } = await import("./mock/data/products");
  return mockColors;
}

export async function getRelatedProductsAction(slug: string, limit = 4) {
  return commerce.getRelatedProducts(slug, limit);
}

export async function getCollectionsAction() {
  return commerce.getCollections();
}

export async function getCartAction(): Promise<CommerceCart | null> {
  if (!isShopifyProvider()) return null;
  return getShopifyCart();
}

export async function addToCartAction(
  variantId: string,
  quantity = 1,
): Promise<CommerceCartActionResult> {
  if (!isShopifyProvider()) return { cart: null, warnings: [] };
  if (!variantId) throw new Error("addToCartAction requires a Shopify variant ID");
  return addVariantToShopifyCart(variantId, quantity);
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number,
): Promise<CommerceCartActionResult> {
  if (!isShopifyProvider()) return { cart: null, warnings: [] };
  return updateShopifyCartLine(lineId, quantity);
}

export async function removeCartLineAction(lineId: string): Promise<CommerceCartActionResult> {
  if (!isShopifyProvider()) return { cart: null, warnings: [] };
  return removeShopifyCartLine(lineId);
}

export async function clearCartAction(): Promise<CommerceCartActionResult> {
  if (!isShopifyProvider()) return { cart: null, warnings: [] };
  return clearShopifyCart();
}

export async function getCustomerSessionAction(): Promise<CommerceCustomerSession> {
  if (!isShopifyProvider()) return { authenticated: false };
  const { isCustomerAccountConfigured } = await import("./shopify/customer/config");
  if (!isCustomerAccountConfigured()) return { authenticated: false };

  const { isCustomerAuthenticated } = await import("./shopify/customer/client");
  const authenticated = await isCustomerAuthenticated();
  if (!authenticated) return { authenticated: false };

  const { getCustomerProfile } = await import("./shopify/customer/account");
  return getCustomerProfile();
}

export async function getCustomerOrdersAction(): Promise<CommerceOrder[]> {
  if (!isShopifyProvider()) return [];
  const { isCustomerAccountConfigured } = await import("./shopify/customer/config");
  if (!isCustomerAccountConfigured()) return [];

  const { isCustomerAuthenticated } = await import("./shopify/customer/client");
  if (!(await isCustomerAuthenticated())) return [];

  const { getCustomerOrders } = await import("./shopify/customer/account");
  return getCustomerOrders();
}

export async function getCustomerWishlistAction(): Promise<string[] | null> {
  if (!isShopifyProvider()) return null;
  const { isCustomerAccountConfigured } = await import("./shopify/customer/config");
  if (!isCustomerAccountConfigured()) return null;

  const { isCustomerAuthenticated } = await import("./shopify/customer/client");
  if (!(await isCustomerAuthenticated())) return null;

  const { getCustomerWishlistSlugs } = await import("./shopify/customer/account");
  return getCustomerWishlistSlugs();
}

export async function mergeCustomerWishlistAction(localSlugs: string[]): Promise<string[] | null> {
  if (!isShopifyProvider()) return null;
  const { isCustomerAccountConfigured } = await import("./shopify/customer/config");
  if (!isCustomerAccountConfigured()) return null;

  const { isCustomerAuthenticated } = await import("./shopify/customer/client");
  if (!(await isCustomerAuthenticated())) return null;

  const { mergeCustomerWishlistSlugs } = await import("./shopify/customer/account");
  return mergeCustomerWishlistSlugs(localSlugs);
}

export async function toggleCustomerWishlistAction(slug: string): Promise<string[] | null> {
  if (!isShopifyProvider()) return null;
  const { isCustomerAccountConfigured } = await import("./shopify/customer/config");
  if (!isCustomerAccountConfigured()) return null;

  const { isCustomerAuthenticated } = await import("./shopify/customer/client");
  if (!(await isCustomerAuthenticated())) return null;

  const { toggleCustomerWishlistSlug } = await import("./shopify/customer/account");
  return toggleCustomerWishlistSlug(slug);
}

export async function getLocalizationAction(): Promise<CommerceLocalization | null> {
  if (!isShopifyProvider()) return null;
  return fetchShopifyLocalization();
}

export async function setMarketAction(countryCode: string, languageCode?: string): Promise<void> {
  if (!isShopifyProvider()) return;

  const localization = await fetchShopifyLocalization();
  const normalizedCountry = countryCode.trim().toUpperCase();
  const country = localization.countries.find((c) => c.isoCode === normalizedCountry);
  if (!country) {
    throw new Error(`Unsupported country: ${countryCode}`);
  }

  const language =
    languageCode?.trim().toUpperCase() ??
    localization.languages[0]?.isoCode ??
    localization.market.language;

  await writeMarketCookies(normalizedCountry, language);

  const cartId = await getShopifyCartIdFromCookie();
  if (cartId) {
    await updateShopifyCartBuyerIdentity(cartId);
  }

  revalidateTag(SHOPIFY_CACHE_TAGS.catalog, "max");
  revalidateTag(SHOPIFY_CACHE_TAGS.products, "max");
  revalidatePath("/", "layout");
}
