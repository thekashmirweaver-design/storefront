"use client";

import { CommerceProvider, type CommerceCartMode } from "@/lib/commerce/client";
import type { BrandConfig, CommerceLocalization, CommerceMarketContext } from "@/lib/commerce";
import { Toaster } from "@/components/ui/sonner";

export function Providers({
  brand,
  cartMode,
  market = null,
  localization = null,
  children,
}: {
  brand: BrandConfig;
  cartMode: CommerceCartMode;
  market?: CommerceMarketContext | null;
  localization?: CommerceLocalization | null;
  children: React.ReactNode;
}) {
  return (
    <CommerceProvider brand={brand} cartMode={cartMode} market={market} localization={localization}>
      {children}
      <Toaster />
    </CommerceProvider>
  );
}
