import type { MetadataRoute } from "next";

import { commerce } from "@/lib/commerce/server";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const brand = await commerce.getBrand();

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${brand.siteUrl}/sitemap.xml`,
  };
}
