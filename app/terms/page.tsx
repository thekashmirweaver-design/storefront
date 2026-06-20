import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/site/LegalPageLayout";
import { buildPageMetadata } from "@/lib/commerce";
import { commerce } from "@/lib/commerce/server";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildPageMetadata(brand, {
    title: "Terms & Conditions",
    description: "Terms of service for shopping with us online.",
    openGraph: {
      description: "Terms and conditions for our online store.",
    },
  });
}

export default async function TermsPage() {
  const [brand, policies] = await Promise.all([commerce.getBrand(), commerce.getShopPolicies()]);

  return (
    <LegalPageLayout
      brand={brand}
      eyebrow="Legal"
      title="Terms & Conditions"
      html={policies.termsOfServiceHtml}
      emptyMessage="Our terms of service are being updated."
    />
  );
}
