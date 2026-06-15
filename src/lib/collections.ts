/** @deprecated Import from @/lib/commerce instead. */
export { mockCollections as collections } from "./commerce/mock/data/collections";
export { getArticleCover } from "./commerce/mock/data/articles";

import { mockCollections } from "./commerce/mock/data/collections";

/** @deprecated Use commerce.getCollectionBySlug */
export function getCollectionBySlug(slug: string) {
  const c = mockCollections.find((col) => col.slug === slug);
  if (!c) return undefined;
  return {
    slug: c.slug,
    title: c.title,
    tagline: c.tagline,
    cat: c.category,
  };
}

export type Collection = {
  slug: string;
  title: string;
  tagline: string;
  cat: string;
};
