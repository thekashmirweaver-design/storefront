import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="aspect-[4/5] overflow-hidden bg-card">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="pt-4 space-y-1">
        <h3 className="font-display text-lg text-cream group-hover:text-gold transition-colors">{product.name}</h3>
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">{product.categoryLabel}</p>
        <p className="text-sm text-gold pt-1">${product.price}</p>
      </div>
    </Link>
  );
}
