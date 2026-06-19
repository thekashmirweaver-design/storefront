"use client";

import { AnimatedDisclosure } from "@/components/site/AnimatedDisclosure";

type Faq = {
  question: string;
  answer: string;
};

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="mt-12 divide-y divide-border/40 border-y border-border/40">
      {faqs.map((f) => (
        <AnimatedDisclosure
          key={f.question}
          className="py-6"
          triggerClassName="items-start gap-6"
          iconClassName="h-4 w-4 mt-1.5 text-gold"
          contentClassName="mt-4 text-sm text-muted-foreground leading-relaxed"
          title={<span className="font-display text-xl text-cream">{f.question}</span>}
        >
          {f.answer}
        </AnimatedDisclosure>
      ))}
    </div>
  );
}
