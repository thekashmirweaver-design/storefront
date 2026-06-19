import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCardPreview } from "@/components/site/ProductCardPreview";
import type { CommerceCollection, CommerceProduct } from "@/lib/commerce";

export function CollectionPreview({
  collection,
  products,
}: {
  collection: CommerceCollection;
  products: CommerceProduct[];
}) {
  return (
    <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-14 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <h3 className="font-display text-3xl sm:text-4xl text-cream">{collection.title}</h3>
        <Link
          href={`/collections/${collection.slug}`}
          className="text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold inline-flex items-center gap-2 transition-colors"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {products.map((product) => (
            <ProductCardPreview key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Pieces from this collection will appear here once published in Shopify.
        </p>
      )}
    </section>
  );
}
