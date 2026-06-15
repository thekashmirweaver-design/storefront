import type { MetadataRoute } from "next";

import { collections } from "@/lib/collections";
import { articles, products } from "@/lib/products";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gulriza.com";

const staticPages = [
  "",
  "/shop",
  "/collections",
  "/our-story",
  "/craftsmanship",
  "/journal",
  "/contact",
  "/faqs",
  "/wishlist",
  "/account",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  for (const product of products) {
    entries.push({
      url: `${siteUrl}/product/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  for (const collection of collections) {
    entries.push({
      url: `${siteUrl}/collections/${collection.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  for (const article of articles) {
    entries.push({
      url: `${siteUrl}/journal/${article.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
