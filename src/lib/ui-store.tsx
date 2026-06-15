"use client";

import { createContext, useContext, type ReactNode } from "react";

type UiStoreState = {
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
};

const UiStoreCtx = createContext<UiStoreState | null>(null);

export function UiStoreProvider({
  children,
  cartOpen,
  searchOpen,
  setCartOpen,
  setSearchOpen,
}: {
  children: ReactNode;
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
}) {
  return (
    <UiStoreCtx.Provider value={{ cartOpen, searchOpen, setCartOpen, setSearchOpen }}>
      {children}
    </UiStoreCtx.Provider>
  );
}

export function useUiStore() {
  const ctx = useContext(UiStoreCtx);
  if (!ctx) throw new Error("useUiStore must be used within CommerceProvider");
  return ctx;
}
