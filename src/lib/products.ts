/** @deprecated Import from @/lib/commerce instead. */
export { mockProducts as products, mockColors as colors } from "./commerce/mock/data/products";
export { mockArticles as articles } from "./commerce/mock/data/articles";

import { mockProducts } from "./commerce/mock/data/products";
import { mockArticles } from "./commerce/mock/data/articles";

/** @deprecated Use commerce.getProductBySlug */
export function getProductBySlug(slug: string) {
  return mockProducts.find((p) => p.slug === slug);
}

/** @deprecated Use commerce.getArticleBySlug */
export function getArticleBySlug(slug: string) {
  return mockArticles.find((a) => a.slug === slug);
}

export type Product = (typeof mockProducts)[number];
