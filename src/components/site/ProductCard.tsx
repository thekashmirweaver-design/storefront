"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import { formatProductPrice } from "@/components/site/listing-state";
import type { CommerceProduct } from "@/lib/commerce";
import { useCommerce } from "@/lib/commerce/client";

function categoryBadgeLabel(category: CommerceProduct["category"]): string | null {
  if (category === "limited") return "Limited";
  if (category === "bridal") return "Bridal";
  if (category === "lightweight") return "Lightweight";
  return null;
}

export function ProductCard({ product }: { product: CommerceProduct }) {
  const { addToCart, toggleWishlist, inWishlist, setCartOpen } = useCommerce();
  const liked = inWishlist(product.slug);
  const primary = product.images[0];
  const secondary = product.images[1];
  const hasAltImage = Boolean(secondary && primary && secondary.src !== primary.src);
  const soldOut = !product.availableForSale;
  const badge = categoryBadgeLabel(product.category);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (soldOut) {
      toast("Out of stock", { description: "This piece is currently unavailable." });
      return;
    }
    addToCart(product.slug, 1);
    setCartOpen(true);
    toast.success(`${product.name} added to bag`);
  };

  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-card">
        <Link href={`/product/${product.slug}`} className="block h-full w-full relative">
          {primary && (
            <OptimizedImage
              src={primary.src}
              alt={primary.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover motion-reduce:transition-none motion-reduce:transform-none ${
                hasAltImage
                  ? "transition-opacity duration-500 group-hover:opacity-0"
                  : "transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
              }`}
              width={primary.width}
              height={primary.height}
            />
          )}
          {hasAltImage && secondary && (
            <OptimizedImage
              src={secondary.src}
              alt={secondary.alt ?? `${product.name} alternate`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 motion-reduce:transition-none"
              width={secondary.width}
              height={secondary.height}
            />
          )}
        </Link>

        {badge && (
          <span className="absolute top-3 left-3 px-2 py-0.5 text-[0.55rem] tracking-[0.2em] uppercase bg-background/80 backdrop-blur-sm text-cream border border-border/50">
            {badge}
          </span>
        )}

        {soldOut && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center pointer-events-none">
            <span className="px-4 py-2 text-[0.65rem] tracking-[0.25em] uppercase bg-background/90 text-cream border border-border">
              Sold Out
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.slug);
            toast(liked ? "Removed from wishlist" : "Saved to wishlist");
          }}
          aria-label="Wishlist"
          className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center bg-background/70 backdrop-blur-sm hover:text-gold transition-colors z-10"
        >
          <Heart
            className={`h-4 w-4 ${liked ? "fill-gold text-gold" : "text-cream"}`}
            strokeWidth={1.4}
          />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleQuickAdd(e);
          }}
          className={`absolute bottom-0 left-0 right-0 bg-gold text-primary-foreground py-3 text-[0.65rem] tracking-[0.3em] uppercase flex items-center justify-center gap-2 z-10 transition-transform duration-300 ease-out motion-reduce:transition-none translate-y-0 md:translate-y-full md:group-hover:translate-y-0 ${soldOut ? "opacity-80" : ""}`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {soldOut ? "Sold Out" : "Quick Add"}
        </button>
      </div>

      <Link href={`/product/${product.slug}`} className="block pt-4 space-y-1">
        <h3 className="font-display text-lg text-cream group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
          {product.categoryLabel}
        </p>
        <p className="text-sm text-gold pt-1">
          {formatProductPrice(product.price.amount, product.price.currencyCode)}
        </p>
      </Link>
    </div>
  );
}
