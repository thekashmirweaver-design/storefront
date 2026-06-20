import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/site/LegalPageLayout";
import { buildPageMetadata } from "@/lib/commerce";
import { commerce } from "@/lib/commerce/server";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildPageMetadata(brand, {
    title: "Privacy Policy",
    description: "How we collect, use, and protect your personal information.",
    openGraph: {
      description: "Privacy policy for our online store.",
    },
  });
}

export default async function PrivacyPage() {
  const [brand, policies] = await Promise.all([commerce.getBrand(), commerce.getShopPolicies()]);

  return (
    <LegalPageLayout
      brand={brand}
      eyebrow="Legal"
      title="Privacy Policy"
      html={policies.privacyPolicyHtml}
      emptyMessage="Our privacy policy is being updated."
    />
  );
}
