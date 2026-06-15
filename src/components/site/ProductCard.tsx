import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { useStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, inWishlist, setCartOpen } = useStore();
  const liked = inWishlist(product.slug);

  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-card">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.slug); toast(liked ? "Removed from wishlist" : "Saved to wishlist"); }}
          aria-label="Wishlist"
          className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center bg-background/70 backdrop-blur-sm hover:text-gold transition-colors"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-gold text-gold" : "text-cream"}`} strokeWidth={1.4} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); addToCart(product.slug, 1); setCartOpen(true); }}
          className="absolute bottom-0 left-0 right-0 bg-gold text-primary-foreground py-3 text-[0.65rem] tracking-[0.3em] uppercase translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
        </button>
      </div>
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block pt-4 space-y-1">
        <h3 className="font-display text-lg text-cream group-hover:text-gold transition-colors">{product.name}</h3>
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">{product.categoryLabel}</p>
        <p className="text-sm text-gold pt-1">${product.price}</p>
      </Link>
    </div>
  );
}
