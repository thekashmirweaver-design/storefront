"use client";

import { ProductListing } from "@/components/site/ProductListing";
import type { CommerceColor, CommerceProduct } from "@/lib/commerce";

export function CollectionListing({
  products,
  colorCatalog,
  collectionSlug,
}: {
  products: CommerceProduct[];
  colorCatalog?: CommerceColor[];
  collectionSlug: string;
}) {
  return (
    <ProductListing
      products={products}
      colorCatalog={colorCatalog}
      lockedCollection={collectionSlug}
      totalCount={products.length}
    />
  );
}
