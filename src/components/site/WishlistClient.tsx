"use client";

import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Eyebrow } from "@/components/site/Eyebrow";
import type { CommerceProduct } from "@/lib/commerce";
import { useCommerce } from "@/lib/commerce/client";

export function WishlistClient() {
  const { wishlist, toggleWishlist, addToCart, setCartOpen, resolveProducts } = useCommerce();
  const [products, setProducts] = useState<CommerceProduct[]>([]);

  useEffect(() => {
    if (!wishlist.length) {
      setProducts([]);
      return;
    }
    resolveProducts(wishlist).then(setProducts);
  }, [wishlist, resolveProducts]);

  const items = useMemo(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return wishlist.map((s) => bySlug.get(s)).filter((p): p is CommerceProduct => !!p);
  }, [wishlist, products]);

  return (
    <>
      <section className="border-b border-border/40 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16">
          <Eyebrow>Saved</Eyebrow>
          <h1 className="mt-4 font-display text-5xl text-cream">Your Wishlist</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "piece" : "pieces"} saved.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-16">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-10 w-10 text-gold/50 mx-auto mb-4" strokeWidth={1} />
            <p className="text-sm text-muted-foreground mb-6">
              You haven&apos;t saved anything yet.
            </p>
            <Link
              href="/shop"
              className="border border-gold/60 px-6 py-3 text-[0.7rem] tracking-[0.3em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-colors"
            >
              Explore the Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {items.map((p) => {
              const image = p.images[0];
              return (
                <div key={p.slug} className="group relative">
                  <button
                    onClick={() => {
                      toggleWishlist(p.slug);
                      toast("Removed from wishlist");
                    }}
                    aria-label="Remove"
                    className="absolute top-3 right-3 z-10 h-9 w-9 flex items-center justify-center bg-background/70 backdrop-blur-sm text-cream hover:text-gold"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/product/${p.slug}`}
                    className="block relative aspect-[4/5] overflow-hidden bg-card"
                  >
                    {image && (
                      <OptimizedImage
                        src={image.src}
                        alt={image.alt ?? p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        width={image.width}
                        height={image.height}
                      />
                    )}
                  </Link>
                  <div className="pt-4 space-y-1">
                    <h3 className="font-display text-lg text-cream">{p.name}</h3>
                    <p className="text-sm text-gold">${p.price.amount}</p>
                    <button
                      onClick={() => {
                        addToCart(p.slug, 1);
                        setCartOpen(true);
                      }}
                      className="mt-3 w-full border border-border py-2.5 text-[0.65rem] tracking-[0.3em] uppercase text-cream hover:border-gold hover:text-gold transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Add to Bag
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
