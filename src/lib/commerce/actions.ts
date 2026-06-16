"use server";

import { commerce } from "./index";
import type { ContactFormInput, ProductFilters } from "./types";

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
  return commerce.subscribeNewsletter(email);
}

export async function submitContactAction(form: ContactFormInput) {
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
