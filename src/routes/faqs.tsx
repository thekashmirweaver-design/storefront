import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — GULRIZA" },
      { name: "description", content: "Frequently asked questions about shipping, returns, care and authenticity." },
      { property: "og:title", content: "FAQs — GULRIZA" },
      { property: "og:description", content: "Frequently asked questions." },
    ],
  }),
  component: Faqs,
});

const faqs = [
  { q: "Is each pashmina truly handwoven?", a: "Yes. Every GULRIZA piece is handwoven on a wooden handloom in Kashmir. A single shawl can take three to four weeks to complete." },
  { q: "How do I authenticate my pashmina?", a: "Each piece arrives with a signed certificate listing the master weaver, the loom, and the date of completion." },
  { q: "Do you ship worldwide?", a: "We offer complimentary express shipping worldwide. Most orders arrive within 5–7 business days." },
  { q: "What is your return policy?", a: "Unworn pieces may be returned within 30 days for a full refund. We cover return shipping." },
  { q: "How do I care for my pashmina?", a: "Dry clean only, and store folded with cedar. See our Care Guide on the Craftsmanship page." },
  { q: "Will the color fade?", a: "Our natural dyes are colorfast when properly cared for. Avoid prolonged direct sunlight." },
];

function Faqs() {
  return (
    <section className="mx-auto max-w-3xl px-6 md:px-10 py-24">
      <Eyebrow>Support</Eyebrow>
      <h1 className="mt-4 font-display text-5xl text-cream">Frequently Asked</h1>
      <div className="mt-12 divide-y divide-border/40 border-y border-border/40">
        {faqs.map((f) => (
          <details key={f.q} className="py-6 group">
            <summary className="flex justify-between items-start gap-6 cursor-pointer list-none">
              <span className="font-display text-xl text-cream">{f.q}</span>
              <ChevronDown className="h-4 w-4 mt-1.5 text-gold shrink-0 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
