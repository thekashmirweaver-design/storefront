"use client";

import Link from "next/link";
import {
  ChevronDown,
  Minus,
  Plus,
  Check,
  Leaf,
  Hexagon,
  Feather,
  Heart,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/site/ProductCard";
import { ProductGallery } from "@/components/site/ProductGallery";
import { StickyAtcBar } from "@/components/site/StickyAtcBar";
import { formatProductPrice } from "@/components/site/listing-state";
import type { CommerceProduct } from "@/lib/commerce";
import { useCommerce } from "@/lib/commerce/client";

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="border-b border-border/40 py-4 group">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-[0.7rem] tracking-[0.25em] uppercase text-cream">{title}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-open:rotate-180 transition-transform" />
      </summary>
      <div className="pt-3 text-xs text-muted-foreground leading-relaxed">{children}</div>
    </details>
  );
}

export function ProductClient({
  product,
  related,
  colorVariants,
  collectionTitle,
}: {
  product: CommerceProduct;
  related: CommerceProduct[];
  colorVariants: CommerceProduct[];
  collectionTitle?: string;
}) {
  const [qty, setQty] = useState(1);
  const atcRef = useRef<HTMLDivElement>(null);
  const { addToCart, setCartOpen, toggleWishlist, inWishlist } = useCommerce();
  const liked = inWishlist(product.slug);
  const soldOut = !product.availableForSale;

  const colorName =
    colorVariants
      .find((v) => v.slug === product.slug)
      ?.name.split(" ")
      .slice(-1)[0] ?? product.name.split(" ").slice(-1)[0];

  const handleAddToCart = () => {
    if (soldOut) {
      toast("Join the waitlist", { description: "We'll notify you when this piece returns." });
      return;
    }
    addToCart(product.slug, qty);
    setCartOpen(true);
    toast.success(`${product.name} added to bag`, { description: `Quantity: ${qty}` });
  };

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
            <p className="text-xl text-gold mt-4">
              {formatProductPrice(product.price.amount, product.price.currencyCode)}
            </p>
            {soldOut && (
              <p className="mt-2 text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
                Currently unavailable
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          <ul className="space-y-2 text-xs text-foreground/80">
            {[
              { Icon: Leaf, t: "100% Pure Pashmina" },
              { Icon: Hexagon, t: "Handwoven in Kashmir" },
              { Icon: Feather, t: "Ethically Made" },
              { Icon: Check, t: "Limited Production" },
            ].map(({ Icon, t }) => (
              <li key={t} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gold" strokeWidth={1.2} /> {t}
              </li>
            ))}
          </ul>

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

          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-2">Size</p>
            <p className="text-xs text-muted-foreground">70 x 200 cm</p>
          </div>

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
                onClick={() => setQty(qty + 1)}
                className="p-2 text-muted-foreground hover:text-gold"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div ref={atcRef} className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={soldOut}
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

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[0.65rem] tracking-wider text-muted-foreground">
            <span className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-gold" strokeWidth={1.2} />
              Complimentary express shipping
            </span>
            <span className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-gold" strokeWidth={1.2} />
              Free 30-day returns
            </span>
          </div>

          <div className="pt-4">
            <Accordion title="Description">
              {product.description} Made from the under-fleece of the Changthangi goat from the
              Himalayas, this piece is a true heirloom.
            </Accordion>
            <Accordion title="Details & Care">
              Dimensions: 70 x 200 cm. Dry clean only. Store folded with cedar to preserve the
              fiber.
            </Accordion>
            <Accordion title="Shipping & Returns">
              Complimentary worldwide express shipping. Free returns within 30 days.
            </Accordion>
            <Accordion title="Our Promise">
              Every GULRIZA pashmina is signed by the master weaver and accompanied by a certificate
              of authenticity.
            </Accordion>
          </div>
        </aside>
      </section>

      <StickyAtcBar product={product} qty={qty} observeRef={atcRef} />

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
