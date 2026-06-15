import type { Metadata } from "next";
import { Suspense } from "react";

import { ShopClient } from "@/components/site/ShopClient";
import { commerce, commerceColors, buildPageMetadata } from "@/lib/commerce";

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
  const products = await commerce.getProducts();

  return (
    <Suspense
      fallback={<div className="py-24 text-center text-muted-foreground">Loading shop…</div>}
    >
      <ShopClient products={products} colors={commerceColors} />
    </Suspense>
  );
}
