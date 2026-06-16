"use client";

import { Eyebrow } from "@/components/site/Eyebrow";
import { ProductListing } from "@/components/site/ProductListing";
import type { CommerceCollection, CommerceColor, CommerceProduct } from "@/lib/commerce";

export function ShopClient({
  products,
  colors,
  collections,
}: {
  products: CommerceProduct[];
  colors: CommerceColor[];
  collections: CommerceCollection[];
}) {
  return (
    <>
      <section className="border-b border-border/40 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16">
          <Eyebrow>Shop</Eyebrow>
          <h1 className="mt-4 font-display text-5xl text-cream">All Products</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Explore our complete range of handcrafted GULRIZA pashmina.
          </p>
        </div>
      </section>

      <ProductListing products={products} colors={colors} collections={collections} />
    </>
  );
}
