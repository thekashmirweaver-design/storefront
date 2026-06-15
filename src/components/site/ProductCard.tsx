"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import type { CommerceProduct } from "@/lib/commerce";
import { useCommerce } from "@/lib/commerce/client";

export function ProductCard({ product }: { product: CommerceProduct }) {
  const { addToCart, toggleWishlist, inWishlist, setCartOpen } = useCommerce();
  const liked = inWishlist(product.slug);
  const image = product.images[0];

  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-card">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          {image && (
            <OptimizedImage
              src={image.src}
              alt={image.alt ?? product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              width={image.width}
              height={image.height}
            />
          )}
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.slug);
            toast(liked ? "Removed from wishlist" : "Saved to wishlist");
          }}
          aria-label="Wishlist"
          className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center bg-background/70 backdrop-blur-sm hover:text-gold transition-colors"
        >
          <Heart
            className={`h-4 w-4 ${liked ? "fill-gold text-gold" : "text-cream"}`}
            strokeWidth={1.4}
          />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            addToCart(product.slug, 1);
            setCartOpen(true);
          }}
          className="absolute bottom-0 left-0 right-0 bg-gold text-primary-foreground py-3 text-[0.65rem] tracking-[0.3em] uppercase translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
        </button>
      </div>
      <Link href={`/product/${product.slug}`} className="block pt-4 space-y-1">
        <h3 className="font-display text-lg text-cream group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
          {product.categoryLabel}
        </p>
        <p className="text-sm text-gold pt-1">${product.price.amount}</p>
      </Link>
    </div>
  );
}
