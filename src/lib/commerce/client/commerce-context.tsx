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

import type { BrandConfig, CommerceCart, CommerceCartWarning, CommerceProduct } from "../types";
import { brandStorageKey } from "../brand/text";
import { formatCartWarningMessage } from "../cart-errors";
import {
  clampToMaxQuantity,
  getProductMaxQuantity,
  getRemainingQuantity,
  getShopifyCartVariantQuantity,
} from "../inventory";
import { UiStoreProvider } from "@/lib/ui-store";
import { toast } from "sonner";
import {
  addToCartAction,
  clearCartAction,
  getCartAction,
  getCustomerWishlistAction,
  getProductBySlugAction,
  getProductsBySlugsAction,
  mergeCustomerWishlistAction,
  removeCartLineAction,
  toggleCustomerWishlistAction,
  updateCartLineAction,
} from "../actions";

export type CartItem = { slug: string; qty: number };

export type CommerceCartMode = "mock" | "shopify";

type CommerceContextValue = {
  brand: BrandConfig;
  cartMode: CommerceCartMode;
  cart: CartItem[];
  shopifyCart: CommerceCart | null;
  cartLoading: boolean;
  wishlist: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  addToCart: (slug: string, qty?: number, variantId?: string) => Promise<void>;
  removeFromCart: (slugOrLineId: string) => Promise<void>;
  setQty: (slugOrLineId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (slug: string) => Promise<void>;
  inWishlist: (slug: string) => boolean;
  resolveProducts: (slugs: string[]) => Promise<CommerceProduct[]>;
};

const CommerceCtx = createContext<CommerceContextValue | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function showCartWarnings(warnings: CommerceCartWarning[]) {
  for (const warning of warnings) {
    toast.warning("Bag updated", { description: formatCartWarningMessage(warning) });
  }
}

function mockStockWarning(requested: number, actual: number): CommerceCartWarning | null {
  if (actual >= requested) return null;
  return {
    code: "MERCHANDISE_NOT_ENOUGH_STOCK",
    message: `Only ${actual} available — your bag was updated to match stock.`,
  };
}

export function CommerceProvider({
  brand,
  cartMode = "mock",
  children,
}: {
  brand: BrandConfig;
  cartMode?: CommerceCartMode;
  children: ReactNode;
}) {
  const isShopifyCart = cartMode === "shopify";
  const cartKey = brandStorageKey(brand, "cart");
  const wishlistKey = brandStorageKey(brand, "wishlist");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shopifyCart, setShopifyCart] = useState<CommerceCart | null>(null);
  const [cartLoading, setCartLoading] = useState(isShopifyCart);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistAuthenticated, setWishlistAuthenticated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isShopifyCart) {
      setCart(load<CartItem[]>(cartKey, []));
    }
    setWishlist(load<string[]>(wishlistKey, []));
    setHydrated(true);
  }, [cartKey, wishlistKey, isShopifyCart]);

  useEffect(() => {
    if (!isShopifyCart || !hydrated) return;

    let cancelled = false;
    setCartLoading(true);
    getCartAction()
      .then((nextCart) => {
        if (!cancelled) setShopifyCart(nextCart);
      })
      .finally(() => {
        if (!cancelled) setCartLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, isShopifyCart]);

  useEffect(() => {
    if (!isShopifyCart || !hydrated) return;

    let cancelled = false;

    getCustomerWishlistAction()
      .then(async (remoteWishlist) => {
        if (cancelled) return;

        if (remoteWishlist == null) {
          setWishlistAuthenticated(false);
          return;
        }

        setWishlistAuthenticated(true);
        const localWishlist = load<string[]>(wishlistKey, []);
        if (localWishlist.length) {
          const merged = await mergeCustomerWishlistAction(localWishlist);
          if (!cancelled && merged) {
            setWishlist(merged);
            return;
          }
        }

        setWishlist(remoteWishlist);
      })
      .catch(() => {
        if (!cancelled) setWishlistAuthenticated(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, isShopifyCart, wishlistKey]);

  useEffect(() => {
    if (!isShopifyCart && hydrated) localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey, hydrated, isShopifyCart]);

  useEffect(() => {
    if (!hydrated || (isShopifyCart && wishlistAuthenticated)) return;
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  }, [wishlist, wishlistKey, hydrated, isShopifyCart, wishlistAuthenticated]);

  const addToCart = useCallback(
    async (slug: string, qty = 1, variantId?: string) => {
      if (isShopifyCart) {
        if (!variantId) {
          throw new Error("Shopify cart requires a variant ID");
        }

        const product = await getProductBySlugAction(slug);
        const stockMax = product ? getProductMaxQuantity(product) : null;
        const existingQty = getShopifyCartVariantQuantity(shopifyCart, variantId);
        const remaining = getRemainingQuantity(stockMax, existingQty);

        if (remaining === 0) {
          showCartWarnings([
            {
              code: "MERCHANDISE_NOT_ENOUGH_STOCK",
              message:
                stockMax === 1
                  ? "Only 1 available — already in your bag."
                  : `Only ${stockMax} available — your bag has the maximum.`,
            },
          ]);
          return;
        }

        const cappedQty = remaining != null ? Math.min(qty, remaining) : qty;
        const warning = mockStockWarning(existingQty + qty, existingQty + cappedQty);
        if (warning) showCartWarnings([warning]);

        setCartLoading(true);
        try {
          const { cart: nextCart, warnings } = await addToCartAction(variantId, cappedQty);
          setShopifyCart(nextCart);
          if (warnings.length) showCartWarnings(warnings);
        } finally {
          setCartLoading(false);
        }
        return;
      }

      const product = await getProductBySlugAction(slug);
      const maxQty = product ? getProductMaxQuantity(product) : null;
      const existingQty = cart.find((i) => i.slug === slug)?.qty ?? 0;
      const requestedTotal = existingQty + qty;
      const cappedTotal = clampToMaxQuantity(requestedTotal, maxQty);
      const warning = mockStockWarning(requestedTotal, cappedTotal);
      if (warning) showCartWarnings([warning]);

      setCart((c) => {
        const existing = c.find((i) => i.slug === slug);
        if (existing) return c.map((i) => (i.slug === slug ? { ...i, qty: cappedTotal } : i));
        return [...c, { slug, qty: cappedTotal }];
      });
    },
    [isShopifyCart, cart, shopifyCart],
  );

  const removeFromCart = useCallback(
    async (slugOrLineId: string) => {
      if (isShopifyCart) {
        setCartLoading(true);
        try {
          const { cart: nextCart, warnings } = await removeCartLineAction(slugOrLineId);
          setShopifyCart(nextCart);
          if (warnings.length) showCartWarnings(warnings);
        } finally {
          setCartLoading(false);
        }
        return;
      }

      setCart((c) => c.filter((i) => i.slug !== slugOrLineId));
    },
    [isShopifyCart],
  );

  const setQty = useCallback(
    async (slugOrLineId: string, qty: number) => {
      if (isShopifyCart) {
        setCartLoading(true);
        try {
          const { cart: nextCart, warnings } = await updateCartLineAction(slugOrLineId, qty);
          setShopifyCart(nextCart);
          if (warnings.length) showCartWarnings(warnings);
        } finally {
          setCartLoading(false);
        }
        return;
      }

      if (qty <= 0) {
        setCart((c) => c.filter((i) => i.slug !== slugOrLineId));
        return;
      }

      const product = await getProductBySlugAction(slugOrLineId);
      const maxQty = product ? getProductMaxQuantity(product) : null;
      const cappedQty = clampToMaxQuantity(qty, maxQty);
      const warning = mockStockWarning(qty, cappedQty);
      if (warning) showCartWarnings([warning]);

      setCart((c) => c.map((i) => (i.slug === slugOrLineId ? { ...i, qty: cappedQty } : i)));
    },
    [isShopifyCart],
  );

  const clearCart = useCallback(async () => {
    if (isShopifyCart) {
      setCartLoading(true);
      try {
        const { cart: nextCart, warnings } = await clearCartAction();
        setShopifyCart(nextCart);
        if (warnings.length) showCartWarnings(warnings);
      } finally {
        setCartLoading(false);
      }
      return;
    }

    setCart([]);
  }, [isShopifyCart]);

  const toggleWishlist = useCallback(
    async (slug: string) => {
      if (isShopifyCart && wishlistAuthenticated) {
        const previous = wishlist;
        const optimistic = previous.includes(slug)
          ? previous.filter((item) => item !== slug)
          : [...previous, slug];
        setWishlist(optimistic);

        try {
          const next = await toggleCustomerWishlistAction(slug);
          if (next) setWishlist(next);
        } catch {
          setWishlist(previous);
          toast.error("Could not update wishlist");
        }
        return;
      }

      setWishlist((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug]));
    },
    [isShopifyCart, wishlistAuthenticated, wishlist],
  );

  const inWishlist = useCallback((slug: string) => wishlist.includes(slug), [wishlist]);

  const resolveProducts = useCallback(async (slugs: string[]) => {
    if (!slugs.length) return [];
    return getProductsBySlugsAction(slugs);
  }, []);

  const value = useMemo(
    () => ({
      brand,
      cartMode,
      cart,
      shopifyCart,
      cartLoading,
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
      cartMode,
      cart,
      shopifyCart,
      cartLoading,
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
  const {
    cart,
    shopifyCart,
    cartMode,
    cartLoading,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    resolveProducts,
  } = useCommerce();
  return {
    cart,
    shopifyCart,
    cartMode,
    cartLoading,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    resolveProducts,
  };
}

export function useCommerceWishlist() {
  const { wishlist, toggleWishlist, inWishlist } = useCommerce();
  return { wishlist, toggleWishlist, inWishlist };
}
