import type { Metadata } from "next";
import { Suspense } from "react";

import { ShopClient } from "@/components/site/ShopClient";
import { commerceColors, buildPageMetadata } from "@/lib/commerce";
import { commerce } from "@/lib/commerce/server";
import { isShopifyProvider } from "@/lib/commerce/config";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildPageMetadata(brand, {
    title: "Shop All Pashminas",
    description: "Explore our complete range of handcrafted Kashmiri pashmina shawls.",
    openGraph: {
      description: "Explore our complete range of handcrafted pashmina.",
    },
  });
}

export default async function ShopPage() {
  const [products, collections] = await Promise.all([
    commerce.getProducts(),
    commerce.getCollections(),
  ]);

  return (
    <Suspense
      fallback={<div className="py-24 text-center text-muted-foreground">Loading shop…</div>}
    >
      <ShopClient
        products={products}
        colors={isShopifyProvider() ? [] : commerceColors}
        collections={collections}
      />
    </Suspense>
  );
}
