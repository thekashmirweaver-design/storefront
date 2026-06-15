"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { BrandConfig, CommerceProduct } from "../types";
import { UiStoreProvider } from "@/lib/ui-store";
import { getProductsBySlugsAction } from "../actions";

export type CartItem = { slug: string; qty: number };

type CommerceContextValue = {
  brand: BrandConfig;
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
  resolveProducts: (slugs: string[]) => Promise<CommerceProduct[]>;
};

const CommerceCtx = createContext<CommerceContextValue | null>(null);

const CART_KEY = "gulriza:cart";
const WISHLIST_KEY = "gulriza:wishlist";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CommerceProvider({ brand, children }: { brand: BrandConfig; children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(load<CartItem[]>(CART_KEY, []));
    setWishlist(load<string[]>(WISHLIST_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((slug: string, qty = 1) => {
    setCart((c) => {
      const existing = c.find((i) => i.slug === slug);
      if (existing) return c.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i));
      return [...c, { slug, qty }];
    });
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setCart((c) => c.filter((i) => i.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setCart((c) =>
      qty <= 0
        ? c.filter((i) => i.slug !== slug)
        : c.map((i) => (i.slug === slug ? { ...i, qty } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((slug: string) => {
    setWishlist((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug]));
  }, []);

  const inWishlist = useCallback((slug: string) => wishlist.includes(slug), [wishlist]);

  const resolveProducts = useCallback(async (slugs: string[]) => {
    if (!slugs.length) return [];
    return getProductsBySlugsAction(slugs);
  }, []);

  const value = useMemo(
    () => ({
      brand,
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
      resolveProducts,
    }),
    [
      brand,
      cart,
      wishlist,
      cartOpen,
      searchOpen,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      toggleWishlist,
      inWishlist,
      resolveProducts,
    ],
  );

  return (
    <CommerceCtx.Provider value={value}>
      <UiStoreProvider
        cartOpen={cartOpen}
        searchOpen={searchOpen}
        setCartOpen={setCartOpen}
        setSearchOpen={setSearchOpen}
      >
        {children}
      </UiStoreProvider>
    </CommerceCtx.Provider>
  );
}

export function useCommerce() {
  const ctx = useContext(CommerceCtx);
  if (!ctx) throw new Error("useCommerce must be used within CommerceProvider");
  return ctx;
}

export function useCommerceCart() {
  const { cart, addToCart, removeFromCart, setQty, clearCart, resolveProducts } = useCommerce();
  return { cart, addToCart, removeFromCart, setQty, clearCart, resolveProducts };
}

export function useCommerceWishlist() {
  const { wishlist, toggleWishlist, inWishlist } = useCommerce();
  return { wishlist, toggleWishlist, inWishlist };
}
