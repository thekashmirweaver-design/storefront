"use client";

import Link from "next/link";
import { Minus, Plus, Check, Leaf, Hexagon, Feather, Heart, Truck, RotateCcw } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/site/ProductCard";
import { AnimatedDisclosure } from "@/components/site/AnimatedDisclosure";
import { ProductGallery } from "@/components/site/ProductGallery";
import { StickyAtcBar } from "@/components/site/StickyAtcBar";
import { formatProductPrice, productHasCompareAt } from "@/components/site/listing-state";
import type { CommerceProduct } from "@/lib/commerce";
import { getCartActionErrorMessage } from "@/lib/commerce/cart-errors";
import {
  getProductMaxQuantity,
  getCartProductQuantity,
  isProductSoldOut,
  isLowStock,
  lowStockHint,
  clampToMaxQuantity,
} from "@/lib/commerce/inventory";
import type { ProductDetailContent } from "@/lib/commerce/product-detail";
import { useCommerce } from "@/lib/commerce/client";

const HIGHLIGHT_ICONS = [Leaf, Hexagon, Feather, Check];

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AnimatedDisclosure
      className="border-b border-border/40 py-4"
      triggerClassName="py-0"
      contentClassName="pt-3 text-xs text-muted-foreground leading-relaxed"
      title={<span className="text-[0.7rem] tracking-[0.25em] uppercase text-cream">{title}</span>}
    >
      {children}
    </AnimatedDisclosure>
  );
}

export function ProductClient({
  product,
  related,
  colorVariants,
  collectionTitle,
  detailContent,
}: {
  product: CommerceProduct;
  related: CommerceProduct[];
  colorVariants: CommerceProduct[];
  collectionTitle?: string;
  detailContent: ProductDetailContent;
}) {
  const [qty, setQty] = useState(1);
  const atcRef = useRef<HTMLDivElement>(null);
  const { addToCart, setCartOpen, toggleWishlist, inWishlist, cart, shopifyCart, cartMode, market } =
    useCommerce();
  const liked = inWishlist(product.slug);
  const soldOut = isProductSoldOut(product);
  const cartQty = getCartProductQuantity(cartMode, cart, shopifyCart, product);
  const maxQty = getProductMaxQuantity(product, cartQty);
  const canAddMore = maxQty == null || maxQty > 0;
  const atMaxQty = maxQty != null && qty >= maxQty;

  useEffect(() => {
    if (maxQty == null || maxQty <= 0) return;
    setQty((current) => clampToMaxQuantity(current, maxQty));
  }, [maxQty]);

  const colorName = product.colorName ?? product.name.split(" ").slice(-1)[0];

  const handleAddToCart = async () => {
    if (soldOut) {
      toast("Join the waitlist", { description: "We'll notify you when this piece returns." });
      return;
    }
    if (!canAddMore) {
      toast.warning("Bag updated", {
        description:
          product.quantityAvailable === 1
            ? "Only 1 available — already in your bag."
            : `Only ${product.quantityAvailable} available — your bag has the maximum.`,
      });
      return;
    }
    try {
      await addToCart(product.slug, qty, product.variantId);
      setCartOpen(true);
      toast.success(`${product.name} added to bag`, { description: `Quantity: ${qty}` });
    } catch (error) {
      toast.error("Could not add to bag", {
        description: getCartActionErrorMessage(
          error,
          "This product is unavailable for checkout right now.",
        ),
      });
    }
  };

  const showInlineDescription =
    detailContent.shopifyMode && !product.descriptionHtml && Boolean(product.description);

  const showDescriptionAccordion =
    Boolean(product.descriptionHtml) ||
    (!detailContent.shopifyMode && Boolean(product.description)) ||
    !detailContent.shopifyMode;

  const showDetailsAccordion =
    Boolean(product.dimensions) || Boolean(product.careInstructions) || !detailContent.shopifyMode;

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-10">
        <nav className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
          <Link href="/" className="hover:text-gold">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/shop" className="hover:text-gold">
            Shop
          </Link>
          {product.collectionSlug && collectionTitle && (
            <>
              {" "}
              /{" "}
              <Link href={`/collections/${product.collectionSlug}`} className="hover:text-gold">
                {collectionTitle}
              </Link>
            </>
          )}{" "}
          / <span className="text-gold">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-12">
        <div>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <aside className="space-y-5">
          <div>
            <h1 className="font-display text-4xl text-cream">{product.name}</h1>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground mt-2">
              {product.categoryLabel}
            </p>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-xl text-gold">
                {formatProductPrice(
                  product.price.amount,
                  product.price.currencyCode,
                  market?.locale,
                )}
              </p>
              {productHasCompareAt(product) && product.compareAtPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatProductPrice(
                    product.compareAtPrice.amount,
                    product.compareAtPrice.currencyCode,
                    market?.locale,
                  )}
                </p>
              )}
            </div>
            {soldOut && (
              <p className="mt-2 text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
                Currently unavailable
              </p>
            )}
          </div>

          {showInlineDescription && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {detailContent.highlights.length > 0 && (
            <ul className="space-y-2 text-xs text-foreground/80">
              {detailContent.highlights.map((text, index) => {
                const Icon = HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length];
                return (
                  <li key={text} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-gold" strokeWidth={1.2} /> {text}
                  </li>
                );
              })}
            </ul>
          )}

          {colorVariants.length > 1 && (
            <div>
              <p className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-2">
                Color: <span className="text-muted-foreground capitalize">{colorName}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colorVariants.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/product/${p.slug}`}
                    title={p.name}
                    aria-label={p.name}
                    aria-current={p.slug === product.slug ? "true" : undefined}
                    className={`h-7 w-7 rounded-full border ${p.slug === product.slug ? "ring-2 ring-gold ring-offset-2 ring-offset-background" : "border-border hover:ring-2 hover:ring-gold/50"}`}
                    style={{ background: p.colorHex }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.dimensions && (
            <div>
              <p className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-2">Size</p>
              <p className="text-xs text-muted-foreground">{product.dimensions}</p>
            </div>
          )}

          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-2">Quantity</p>
            <div className="flex items-center border border-border w-fit">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-2 text-muted-foreground hover:text-gold"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-5 text-sm text-cream">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(clampToMaxQuantity(qty + 1, maxQty))}
                disabled={atMaxQty || !canAddMore}
                className="p-2 text-muted-foreground hover:text-gold disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {isLowStock(product.quantityAvailable) && (
              <p className="mt-2 text-[0.65rem] text-muted-foreground">
                {lowStockHint(product.quantityAvailable!)}
              </p>
            )}
          </div>

          <div ref={atcRef} className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={soldOut || !canAddMore}
              className="w-full bg-gold text-primary-foreground py-3.5 text-[0.7rem] tracking-[0.3em] uppercase hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {soldOut ? "Notify Me" : "Add to Bag"}
            </button>
            <button
              type="button"
              onClick={() => {
                toggleWishlist(product.slug);
                toast(liked ? "Removed from wishlist" : "Saved to wishlist");
              }}
              className="w-full border border-border py-3.5 text-[0.7rem] tracking-[0.3em] uppercase text-cream hover:border-gold hover:text-gold transition-colors flex items-center justify-center gap-2"
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-gold text-gold" : ""}`} />{" "}
              {liked ? "Saved" : "Add to Wishlist"}
            </button>
          </div>

          {(detailContent.shippingBadgeText || detailContent.returnsBadgeText) && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[0.65rem] tracking-wider text-muted-foreground">
              {detailContent.shippingBadgeText && (
                <span className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-gold" strokeWidth={1.2} />
                  {detailContent.shippingBadgeText}
                </span>
              )}
              {detailContent.returnsBadgeText && (
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-3.5 w-3.5 text-gold" strokeWidth={1.2} />
                  {detailContent.returnsBadgeText}
                </span>
              )}
            </div>
          )}

          <div className="pt-4">
            {showDescriptionAccordion && (
              <Accordion title="Description">
                {product.descriptionHtml ? (
                  <div
                    className="prose prose-invert prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                ) : (
                  <>
                    {product.description}
                    {!detailContent.shopifyMode &&
                      " Made from the under-fleece of the Changthangi goat from the Himalayas, this piece is a true heirloom."}
                  </>
                )}
              </Accordion>
            )}
            {showDetailsAccordion && (
              <Accordion title="Details & Care">
                {product.dimensions && (
                  <p className="mb-2">
                    <span className="text-cream">Dimensions:</span> {product.dimensions}
                  </p>
                )}
                {product.careInstructions && <p>{product.careInstructions}</p>}
                {!detailContent.shopifyMode && !product.careInstructions && (
                  <p>Dry clean only. Store folded with cedar to preserve the fiber.</p>
                )}
              </Accordion>
            )}
            {detailContent.shippingReturnsBody && (
              <Accordion title="Shipping & Returns">
                {detailContent.shippingReturnsIsHtml ? (
                  <div
                    className="prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: detailContent.shippingReturnsBody }}
                  />
                ) : (
                  detailContent.shippingReturnsBody
                )}
              </Accordion>
            )}
            {detailContent.authenticityPromise && (
              <Accordion title="Our Promise">{detailContent.authenticityPromise}</Accordion>
            )}
          </div>
        </aside>
      </section>

      <StickyAtcBar product={product} qty={qty} observeRef={atcRef} canAddMore={canAddMore} />

      {related.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 pb-28 lg:pb-20">
          <h2 className="font-display text-3xl text-cream mb-10">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
