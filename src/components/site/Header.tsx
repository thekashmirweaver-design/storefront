"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { useEffect, useState } from "react";

import { useCommerce } from "@/lib/commerce/client";
import { formatBrandTagline } from "@/lib/commerce/mappers/metadata";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { brand, cart, wishlist, setCartOpen, setSearchOpen } = useCommerce();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const nav = brand.headerNav;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          transparent
            ? "bg-transparent border-b border-transparent"
            : "bg-background/85 backdrop-blur-md border-b border-border/40 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)]"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10 py-4 sm:py-5 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center shrink-0 min-w-0">
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-display text-xl sm:text-2xl tracking-[0.25em] sm:tracking-[0.3em] text-cream truncate">
                {brand.name}
              </span>
              <span className="hidden sm:block text-[0.55rem] tracking-[0.35em] text-gold/80 mt-0.5 truncate">
                {formatBrandTagline(brand.tagline)}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center justify-center gap-10">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-[0.7rem] tracking-[0.25em] uppercase transition-colors relative py-2 ${
                  pathname === n.href || pathname.startsWith(`${n.href}/`)
                    ? "text-gold"
                    : "text-foreground/80 hover:text-gold"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3.5 sm:gap-5 text-foreground/80 justify-end">
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:text-gold transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/wishlist"
              className="hover:text-gold transition-colors hidden sm:flex relative"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-primary-foreground text-[0.55rem] h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              className="hover:text-gold transition-colors hidden sm:block"
              aria-label="Account"
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="hover:text-gold transition-colors relative"
              aria-label="Bag"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-primary-foreground text-[0.55rem] h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="lg:hidden hover:text-gold"
              aria-label="Menu"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border bg-background">
            <nav className="flex flex-col px-6 py-4">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-xs tracking-[0.25em] uppercase text-foreground/80 hover:text-gold border-b border-border/40"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="py-3 text-xs tracking-[0.25em] uppercase text-foreground/80 hover:text-gold border-b border-border/40"
              >
                Wishlist
              </Link>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="py-3 text-xs tracking-[0.25em] uppercase text-foreground/80 hover:text-gold"
              >
                Account
              </Link>
            </nav>
          </div>
        )}
      </header>
      {!isHome && <div className="h-[73px] sm:h-[81px]" aria-hidden />}
    </>
  );
}
