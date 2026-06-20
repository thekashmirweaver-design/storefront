import type { CommerceCollection } from "./types";

export function collectionEyebrow(collection: CommerceCollection): string {
  return collection.title;
}

export function collectionHeadline(collection: CommerceCollection): string {
  return collection.heroHeadline ?? collection.title;
}

export function collectionCtaLabel(collection: CommerceCollection): string {
  if (collection.ctaLabel) return collection.ctaLabel;
  return `Explore ${collection.title}`;
}

function hasStoryCopy(collection: CommerceCollection): boolean {
  return Boolean(collection.description?.trim() || collection.descriptionHtml?.trim());
}

export function collectionShowItalicTagline(collection: CommerceCollection): boolean {
  return hasStoryCopy(collection) && Boolean(collection.tagline);
}

export function collectionBodyText(collection: CommerceCollection): string | undefined {
  const description = collection.description?.trim();
  if (description) return description;
  if (!hasStoryCopy(collection) && collection.tagline) return collection.tagline;
  return undefined;
}

export function collectionBodyHtml(collection: CommerceCollection): string | undefined {
  return collection.descriptionHtml?.trim() || undefined;
}

export function collectionMetaDescription(collection: CommerceCollection): string {
  return collection.description?.trim() || collection.tagline || collection.title;
}
