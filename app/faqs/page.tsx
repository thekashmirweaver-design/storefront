import type { Metadata } from "next";

import { Eyebrow } from "@/components/site/Eyebrow";
import { FaqList } from "@/components/site/FaqList";
import { buildPageMetadata } from "@/lib/commerce";
import { commerce } from "@/lib/commerce/server";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildPageMetadata(brand, {
    title: "FAQs",
    description: "Frequently asked questions about shipping, returns, care and authenticity.",
    openGraph: {
      description: "Frequently asked questions.",
    },
  });
}

export default async function FaqsPage() {
  const faqs = await commerce.getFaqs();

  return (
    <section className="mx-auto max-w-3xl px-6 md:px-10 py-24">
      <Eyebrow>Support</Eyebrow>
      <h1 className="mt-4 font-display text-5xl text-cream">Frequently Asked</h1>
      <FaqList faqs={faqs} />
    </section>
  );
}
