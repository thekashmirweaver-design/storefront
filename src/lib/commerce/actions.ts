"use server";

import { isShopifyProvider } from "./config";
import { commerce } from "./index";
import {
  addVariantToShopifyCart,
  clearShopifyCart,
  getShopifyCart,
  removeShopifyCartLine,
  updateShopifyCartLine,
} from "./shopify/cart";
import type { CommerceCart, CommerceCartActionResult, ContactFormInput, ProductFilters } from "./types";

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
