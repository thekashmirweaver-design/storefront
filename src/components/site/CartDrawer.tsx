"use client";

import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStore, getProduct } from "@/lib/store";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, clearCart } = useStore();
  const items = cart
    .map((i) => ({ ...i, product: getProduct(i.slug) }))
    .filter(
      (
        i,
      ): i is { slug: string; qty: number; product: NonNullable<ReturnType<typeof getProduct>> } =>
        !!i.product,
    );
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-background border-l border-border p-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-5 border-b border-border/40">
          <SheetTitle className="font-display text-2xl text-cream text-left">
            Your Bag ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingBag className="h-10 w-10 text-gold/50 mb-4" strokeWidth={1} />
            <p className="text-sm text-muted-foreground mb-6">Your bag is empty.</p>
            <Link
              href="/shop"
              onClick={() => setCartOpen(false)}
              className="border border-gold/60 px-6 py-3 text-[0.7rem] tracking-[0.3em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.map((i) => (
                <div key={i.slug} className="flex gap-4">
                  <Link
                    href={`/product/${i.slug}`}
                    onClick={() => setCartOpen(false)}
                    className="block w-20 h-24 bg-card overflow-hidden shrink-0 relative"
                  >
                    <OptimizedImage
                      src={i.product.image}
                      alt={i.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/product/${i.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="font-display text-base text-cream hover:text-gold"
                      >
                        {i.product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(i.slug)}
                        className="text-muted-foreground hover:text-gold shrink-0"
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                      {i.product.categoryLabel}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => setQty(i.slug, i.qty - 1)}
                          className="p-1.5 text-muted-foreground hover:text-gold"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs text-cream">{i.qty}</span>
                        <button
                          onClick={() => setQty(i.slug, i.qty + 1)}
                          className="p-1.5 text-muted-foreground hover:text-gold"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm text-gold">${i.product.price * i.qty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/40 px-6 py-5 space-y-4">
              <div className="flex justify-between text-sm text-cream">
                <span className="text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-gold">${subtotal}</span>
              </div>
              <p className="text-[0.65rem] text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <button
                onClick={() => {
                  toast.success("Order placed", {
                    description: "This demo store doesn't process real payments.",
                  });
                  clearCart();
                  setCartOpen(false);
                }}
                className="w-full bg-gold text-primary-foreground py-3.5 text-[0.7rem] tracking-[0.3em] uppercase hover:bg-gold-soft transition-colors"
              >
                Checkout
              </button>
              <button
                onClick={() => setCartOpen(false)}
                className="w-full border border-border py-3 text-[0.7rem] tracking-[0.3em] uppercase text-cream hover:border-gold hover:text-gold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
