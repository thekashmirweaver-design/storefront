import type { Metadata } from "next";

import { AccountClient } from "@/components/site/AccountClient";
import { commerce, buildPageMetadata } from "@/lib/commerce";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildPageMetadata(brand, {
    title: "Account",
    description: "Sign in to manage your orders and saved pieces.",
  });
}

export default function AccountPage() {
  return <AccountClient />;
}
