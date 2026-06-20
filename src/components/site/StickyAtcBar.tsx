"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { formatProductPrice, productHasCompareAt } from "@/components/site/listing-state";
import type { CommerceProduct } from "@/lib/commerce";
import { useCommerce } from "@/lib/commerce/client";

type StickyAtcBarProps = {
  product: CommerceProduct;
  qty: number;
  observeRef: React.RefObject<HTMLElement | null>;
};

export function StickyAtcBar({ product, qty, observeRef }: StickyAtcBarProps) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const { addToCart, setCartOpen } = useCommerce();
  const soldOut = !product.availableForSale;

  useEffect(() => {
    const target = observeRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      threshold: 0,
      rootMargin: "-80px 0px 0px 0px",
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [observeRef]);

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-4 safe-area-pb"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-cream truncate">{product.name}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-sm text-gold">
            {formatProductPrice(product.price.amount, product.price.currencyCode)}
          </p>
          {productHasCompareAt(product) && product.compareAtPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatProductPrice(
                product.compareAtPrice.amount,
                product.compareAtPrice.currencyCode,
              )}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          if (soldOut) {
            toast("Join the waitlist", {
              description: "We'll notify you when this piece returns.",
            });
            return;
          }
          addToCart(product.slug, qty);
          setCartOpen(true);
          toast.success(`${product.name} added to bag`);
        }}
        className="shrink-0 bg-gold text-primary-foreground px-6 py-3 text-[0.65rem] tracking-[0.25em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {soldOut ? "Notify Me" : "Add to Bag"}
      </button>
    </div>
  );
}
