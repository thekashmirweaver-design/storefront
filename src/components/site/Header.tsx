import { Link, useRouterState } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import logoAsset from "@/assets/gulriza-logo.png.asset.json";

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

  return (
    <header className={`${isHome ? "absolute" : "relative"} top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm`}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-5 grid grid-cols-[auto_1fr_auto] items-center gap-6">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logoAsset.url} alt="GULRIZA" className="h-9 w-9" />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-xl tracking-[0.3em] text-cream">GULRIZA</span>
            <span className="hidden sm:block text-[0.55rem] tracking-[0.35em] text-gold/80 mt-0.5">TIMELESS · NATURAL · LUXURIOUS</span>
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

        <div className="flex items-center gap-5 text-foreground/80 justify-end">
          <button className="hover:text-gold transition-colors" aria-label="Search"><Search className="h-4 w-4" /></button>
          <button className="hover:text-gold transition-colors hidden sm:block" aria-label="Account"><User className="h-4 w-4" /></button>
          <button className="hover:text-gold transition-colors" aria-label="Bag"><ShoppingBag className="h-4 w-4" /></button>
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
          </nav>
        </div>
      )}
    </header>
  );
}
