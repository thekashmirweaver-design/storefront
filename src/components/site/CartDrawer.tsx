"use client";

import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import { formatProductPrice } from "@/components/site/listing-state";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { CommerceProduct } from "@/lib/commerce";
import { getCartActionErrorMessage } from "@/lib/commerce/cart-errors";
import { getProductMaxQuantity } from "@/lib/commerce/inventory";
import { useCommerce } from "@/lib/commerce/client";

export function CartDrawer() {
  const {
    brand,
    cartMode,
    cart,
    shopifyCart,
    cartLoading,
    cartOpen,
    setCartOpen,
    setQty,
    removeFromCart,
    clearCart,
    resolveProducts,
    market,
  } = useCommerce();
  const priceLocale = market?.locale;
  const isShopifyCart = cartMode === "shopify";
  const [products, setProducts] = useState<CommerceProduct[]>([]);

  useEffect(() => {
    if (isShopifyCart) return;
    const slugs = cart.map((i) => i.slug);
    if (!slugs.length) {
      setProducts([]);
      return;
    }
    resolveProducts(slugs).then(setProducts);
  }, [cart, isShopifyCart, resolveProducts]);

  const productBySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);

  const mockItems = cart
    .map((i) => {
      const product = productBySlug.get(i.slug);
      return product ? { ...i, product } : null;
    })
    .filter((i): i is { slug: string; qty: number; product: CommerceProduct } => i != null);

  const shopifyItems = shopifyCart?.lines.filter((line) => line.product) ?? [];
  const itemCount = isShopifyCart ? shopifyItems.length : mockItems.length;
  const subtotal = isShopifyCart
    ? shopifyCart?.subtotal
    : {
        amount: mockItems.reduce((s, i) => s + i.product.price.amount * i.qty, 0),
        currencyCode: mockItems[0]?.product.price.currencyCode ?? "USD",
      };
  const checkoutUrl = isShopifyCart ? shopifyCart?.checkoutUrl : null;

  const handleQtyChange = async (lineId: string, qty: number) => {
    try {
      await setQty(lineId, qty);
    } catch (error) {
      toast.error("Could not update quantity", {
        description: getCartActionErrorMessage(error, "Please try again."),
      });
    }
  };

  const handleCheckout = () => {
    if (isShopifyCart) {
      if (!checkoutUrl) {
        toast.error("Checkout unavailable", {
          description: "Please try again in a moment.",
        });
        return;
      }
      window.location.href = checkoutUrl;
      return;
    }

    toast.success("Order placed", {
      description: "This demo store doesn't process real payments.",
    });
    void clearCart();
    setCartOpen(false);
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-background border-l border-border p-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-5 border-b border-border/40">
          <SheetTitle className="font-display text-2xl text-cream text-left">
            Your Bag ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {cartLoading && isShopifyCart && itemCount === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6 text-sm text-muted-foreground">
            Loading your bag…
          </div>
        ) : itemCount === 0 ? (
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
              {isShopifyCart
                ? shopifyItems.map((line) => {
                    const product = line.product!;
                    const image = product.images[0];
                    const maxQty = getProductMaxQuantity(product);
                    const atMaxQty = maxQty != null && line.quantity >= maxQty;
                    const lineTotal =
                      line.lineTotal ??
                      ({
                        amount: product.price.amount * line.quantity,
                        currencyCode: product.price.currencyCode,
                      } as const);

                    return (
                      <div key={line.id} className="flex gap-4">
                        <Link
                          href={`/product/${line.productSlug}`}
                          onClick={() => setCartOpen(false)}
                          className="block w-20 h-24 bg-card overflow-hidden shrink-0 relative"
                        >
                          {image && (
                            <OptimizedImage
                              src={image.src}
                              alt={image.alt ?? product.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                              width={image.width}
                              height={image.height}
                            />
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <Link
                              href={`/product/${line.productSlug}`}
                              onClick={() => setCartOpen(false)}
                              className="font-display text-base text-cream hover:text-gold"
                            >
                              {product.name}
                            </Link>
                            <button
                              onClick={() => void removeFromCart(line.id)}
                              className="text-muted-foreground hover:text-gold shrink-0"
                              aria-label="Remove"
                              disabled={cartLoading}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                            {product.categoryLabel}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-border">
                              <button
                                onClick={() => void handleQtyChange(line.id, line.quantity - 1)}
                                className="p-1.5 text-muted-foreground hover:text-gold"
                                disabled={cartLoading}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-3 text-xs text-cream">{line.quantity}</span>
                              <button
                                onClick={() => void handleQtyChange(line.id, line.quantity + 1)}
                                className="p-1.5 text-muted-foreground hover:text-gold disabled:opacity-40 disabled:pointer-events-none"
                                disabled={cartLoading || atMaxQty}
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-sm text-gold">
                              {formatProductPrice(
                                lineTotal.amount,
                                lineTotal.currencyCode,
                                priceLocale,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                : mockItems.map((i) => {
                    const image = i.product.images[0];
                    const maxQty = getProductMaxQuantity(i.product);
                    const atMaxQty = maxQty != null && i.qty >= maxQty;
                    return (
                      <div key={i.slug} className="flex gap-4">
                        <Link
                          href={`/product/${i.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="block w-20 h-24 bg-card overflow-hidden shrink-0 relative"
                        >
                          {image && (
                            <OptimizedImage
                              src={image.src}
                              alt={image.alt ?? i.product.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                              width={image.width}
                              height={image.height}
                            />
                          )}
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
                              onClick={() => void removeFromCart(i.slug)}
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
                                onClick={() => void setQty(i.slug, i.qty - 1)}
                                className="p-1.5 text-muted-foreground hover:text-gold"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-3 text-xs text-cream">{i.qty}</span>
                              <button
                                onClick={() => void setQty(i.slug, i.qty + 1)}
                                className="p-1.5 text-muted-foreground hover:text-gold disabled:opacity-40 disabled:pointer-events-none"
                                disabled={atMaxQty}
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-sm text-gold">
                              {formatProductPrice(
                                i.product.price.amount * i.qty,
                                i.product.price.currencyCode,
                                priceLocale,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>

            <div className="border-t border-border/40 px-6 py-5 space-y-4">
              <div className="flex justify-between text-sm text-cream">
                <span className="text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-gold">
                  {formatProductPrice(
                    subtotal?.amount ?? 0,
                    subtotal?.currencyCode ?? "USD",
                    priceLocale,
                  )}
                </span>
              </div>
              <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                {isShopifyCart
                  ? `You'll complete your order on our secure ${brand.name} checkout powered by Shopify. Shipping and taxes are calculated there.`
                  : "Shipping and taxes calculated at checkout."}
              </p>
              <button
                onClick={handleCheckout}
                disabled={isShopifyCart && (cartLoading || !checkoutUrl)}
                className="w-full bg-gold text-primary-foreground py-3.5 text-[0.7rem] tracking-[0.3em] uppercase hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isShopifyCart ? "Continue to checkout" : "Checkout"}
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
