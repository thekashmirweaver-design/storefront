import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountClient } from "@/components/site/AccountClient";
import { commerce, buildPageMetadata } from "@/lib/commerce";
import { isShopifyProvider } from "@/lib/commerce/config";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildPageMetadata(brand, {
    title: "Account",
    description: "Sign in to manage your orders and saved pieces.",
  });
}

export default async function AccountPage() {
  let accountEnabled = false;

  if (isShopifyProvider()) {
    const { isCustomerAccountConfigured } = await import("@/lib/commerce/shopify/customer/config");
    accountEnabled = isCustomerAccountConfigured();
  }

  return (
    <Suspense
      fallback={<div className="py-24 text-center text-sm text-muted-foreground">Loading…</div>}
    >
      <AccountClient accountEnabled={accountEnabled} />
    </Suspense>
  );
}
