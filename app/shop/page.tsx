import type { Metadata } from "next";
import { Suspense } from "react";

import { ShopClient } from "@/components/site/ShopClient";
import { commerce, commerceColors } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Shop All Pashminas",
  description: "Explore our complete range of handcrafted Kashmiri pashmina shawls.",
  openGraph: {
    title: "Shop All Pashminas — GULRIZA",
    description: "Explore our complete range of handcrafted pashmina.",
  },
};

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
