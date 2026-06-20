"use client";

import { CommerceProvider, type CommerceCartMode } from "@/lib/commerce/client";
import type { BrandConfig } from "@/lib/commerce";
import { Toaster } from "@/components/ui/sonner";

export function Providers({
  brand,
  cartMode,
  children,
}: {
  brand: BrandConfig;
  cartMode: CommerceCartMode;
  children: React.ReactNode;
}) {
  return (
    <CommerceProvider brand={brand} cartMode={cartMode}>
      {children}
      <Toaster />
    </CommerceProvider>
  );
}
