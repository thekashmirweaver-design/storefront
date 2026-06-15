"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { products, type Product } from "./products";

export type CartItem = { slug: string; qty: number };

type StoreState = {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  addToCart: (slug: string, qty?: number) => void;
  removeFromCart: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  inWishlist: (slug: string) => boolean;
};

const StoreCtx = createContext<StoreState | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(load<CartItem[]>("gulriza:cart", []));
    setWishlist(load<string[]>("gulriza:wishlist", []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("gulriza:cart", JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem("gulriza:wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = (slug: string, qty = 1) =>
    setCart((c) => {
      const existing = c.find((i) => i.slug === slug);
      if (existing) return c.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i));
      return [...c, { slug, qty }];
    });
  const removeFromCart = (slug: string) => setCart((c) => c.filter((i) => i.slug !== slug));
  const setQty = (slug: string, qty: number) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((i) => i.slug !== slug)
        : c.map((i) => (i.slug === slug ? { ...i, qty } : i)),
    );
  const clearCart = () => setCart([]);
  const toggleWishlist = (slug: string) =>
    setWishlist((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug]));
  const inWishlist = (slug: string) => wishlist.includes(slug);

  return (
    <StoreCtx.Provider
      value={{
        cart,
        wishlist,
        cartOpen,
        searchOpen,
        setCartOpen,
        setSearchOpen,
        addToCart,
        removeFromCart,
        setQty,
        clearCart,
        toggleWishlist,
        inWishlist,
      }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
