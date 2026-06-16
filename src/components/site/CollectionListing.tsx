"use client";

import { ProductListing } from "@/components/site/ProductListing";
import type { CommerceColor, CommerceProduct } from "@/lib/commerce";

export function CollectionListing({
  products,
  colors,
  collectionSlug,
}: {
  products: CommerceProduct[];
  colors: CommerceColor[];
  collectionSlug: string;
}) {
  return (
    <ProductListing
      products={products}
      colors={colors}
      lockedCollection={collectionSlug}
      totalCount={products.length}
    />
  );
}
