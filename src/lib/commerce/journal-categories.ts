import type { CommerceArticle } from "./types";

/** Unique article categories from Shopify tags (first tag per article), sorted for nav. */
export function deriveJournalCategories(articles: CommerceArticle[]): string[] {
  const categories = new Set<string>();
  for (const article of articles) {
    const label = article.category?.trim();
    if (label) categories.add(label);
  }
  return [...categories].sort((a, b) => a.localeCompare(b));
}

export function journalCategoryFilterOptions(articles: CommerceArticle[]): string[] {
  return ["All", ...deriveJournalCategories(articles)];
}
