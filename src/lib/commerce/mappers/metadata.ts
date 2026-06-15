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

export function formatPageTitle(brand: BrandConfig, segment: string): string {
  return brand.seo.titleTemplate.replace("%s", segment);
}

export type PageMetadataOptions = {
  title: string;
  description?: string;
  openGraph?: {
    title?: string;
    description?: string;
    images?: NonNullable<NonNullable<Metadata["openGraph"]>["images"]>;
  };
};

export function buildPageMetadata(brand: BrandConfig, options: PageMetadataOptions): Metadata {
  const { title, description, openGraph } = options;

  return {
    title,
    description,
    openGraph: {
      title: openGraph?.title ?? formatPageTitle(brand, title),
      description: openGraph?.description ?? description,
      ...(openGraph?.images ? { images: openGraph.images } : {}),
    },
  };
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
