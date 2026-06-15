import type { MetadataRoute } from "next";

import { commerce } from "@/lib/commerce";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brand = await commerce.getBrand();
  const entries = await commerce.getSitemapEntries();
  const now = new Date();

  return entries.map((entry) => ({
    url: `${brand.siteUrl}${entry.path === "/" ? "" : entry.path}`,
    lastModified: entry.lastModified ?? now,
    changeFrequency: entry.changeFrequency ?? "monthly",
    priority: entry.priority ?? 0.8,
  }));
}
