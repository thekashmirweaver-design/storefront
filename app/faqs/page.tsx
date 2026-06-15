import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";

import { Eyebrow } from "@/components/site/Eyebrow";
import { commerce, buildPageMetadata } from "@/lib/commerce";

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
      <div className="mt-12 divide-y divide-border/40 border-y border-border/40">
        {faqs.map((f) => (
          <details key={f.question} className="py-6 group">
            <summary className="flex justify-between items-start gap-6 cursor-pointer list-none">
              <span className="font-display text-xl text-cream">{f.question}</span>
              <ChevronDown className="h-4 w-4 mt-1.5 text-gold shrink-0 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
