"use client";

import { CommerceProvider } from "@/lib/commerce/client";
import type { BrandConfig } from "@/lib/commerce";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ brand, children }: { brand: BrandConfig; children: React.ReactNode }) {
  return (
    <CommerceProvider brand={brand}>
      {children}
      <Toaster />
    </CommerceProvider>
  );
}
