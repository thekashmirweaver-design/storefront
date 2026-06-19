import Link from "next/link";

import { formatProductPrice } from "@/components/site/listing-state";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import type { CommerceProduct } from "@/lib/commerce";

export function ProductCardPreview({ product }: { product: CommerceProduct }) {
  const primary = product.images[0];

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-card">
        {primary ? (
          <OptimizedImage
            src={primary.src}
            alt={primary.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            width={primary.width}
            height={primary.height}
          />
        ) : null}
      </div>
      <div className="pt-4 space-y-1">
        <h3 className="font-display text-lg text-cream group-hover:text-gold transition-colors leading-snug">
          {product.name}
        </h3>
        <p className="text-sm text-gold">
          {formatProductPrice(product.price.amount, product.price.currencyCode)}
        </p>
      </div>
    </Link>
  );
}
