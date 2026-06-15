import { Link, useRouterState } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { useState } from "react";
import logoAsset from "@/assets/gulriza-logo.png.asset.json";
import { useStore } from "@/lib/store";

const nav = [
  { label: "Shop", to: "/shop" },
  { label: "Collections", to: "/collections" },
  { label: "Our Story", to: "/our-story" },
  { label: "Craftsmanship", to: "/craftsmanship" },
  { label: "Journal", to: "/journal" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const { cart, wishlist, setCartOpen, setSearchOpen } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <header className={`${isHome ? "absolute" : "relative"} top-0 left-0 right-0 z-40 bg-background/70 backdrop-blur-md border-b border-border/30`}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10 py-4 sm:py-5 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          <img
            src={logoAsset.url}
            alt="GULRIZA"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg shadow-[0_6px_20px_-4px_rgba(201,162,76,0.45),0_2px_6px_rgba(0,0,0,0.4)] ring-1 ring-gold/30 bg-ink/40 p-1 backdrop-blur-sm"
          />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-display text-lg sm:text-xl tracking-[0.25em] sm:tracking-[0.3em] text-cream truncate">GULRIZA</span>
            <span className="hidden sm:block text-[0.55rem] tracking-[0.35em] text-gold/80 mt-0.5 truncate">TIMELESS · NATURAL · LUXURIOUS</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center justify-center gap-10">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[0.7rem] tracking-[0.25em] uppercase text-foreground/80 hover:text-gold transition-colors relative py-2"
              activeProps={{ className: "text-[0.7rem] tracking-[0.25em] uppercase text-gold py-2 relative" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3.5 sm:gap-5 text-foreground/80 justify-end">
          <button onClick={() => setSearchOpen(true)} className="hover:text-gold transition-colors" aria-label="Search"><Search className="h-4 w-4" /></button>
          <Link to="/wishlist" className="hover:text-gold transition-colors hidden sm:flex relative" aria-label="Wishlist">
            <Heart className="h-4 w-4" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-primary-foreground text-[0.55rem] h-4 min-w-4 px-1 rounded-full flex items-center justify-center">{wishlist.length}</span>
            )}
          </Link>
          <Link to="/account" className="hover:text-gold transition-colors hidden sm:block" aria-label="Account"><User className="h-4 w-4" /></Link>
          <button onClick={() => setCartOpen(true)} className="hover:text-gold transition-colors relative" aria-label="Bag">
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-primary-foreground text-[0.55rem] h-4 min-w-4 px-1 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </button>
          <button className="lg:hidden hover:text-gold" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-6 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-xs tracking-[0.25em] uppercase text-foreground/80 hover:text-gold border-b border-border/40"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/wishlist" onClick={() => setOpen(false)} className="py-3 text-xs tracking-[0.25em] uppercase text-foreground/80 hover:text-gold border-b border-border/40">Wishlist</Link>
            <Link to="/account" onClick={() => setOpen(false)} className="py-3 text-xs tracking-[0.25em] uppercase text-foreground/80 hover:text-gold">Account</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
