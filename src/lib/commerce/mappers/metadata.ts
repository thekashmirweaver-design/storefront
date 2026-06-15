import type { Metadata } from "next";

import type { BrandConfig } from "../types";

/** "Timeless. Natural. Luxurious." → "TIMELESS · NATURAL · LUXURIOUS" */
export function formatBrandTagline(tagline: string): string {
  return tagline
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
}

export function buildMetadataFromBrand(brand: BrandConfig): Metadata {
  return {
    metadataBase: new URL(brand.siteUrl),
    title: {
      default: brand.seo.defaultTitle,
      template: brand.seo.titleTemplate,
    },
    description: brand.seo.defaultDescription,
    authors: [{ name: brand.name }],
    openGraph: {
      title: brand.seo.ogTitle,
      description: brand.seo.ogDescription,
      type: "website",
      siteName: brand.name,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
