import { Hexagon, Leaf, Mountain } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { Icon: Leaf, title: "100% Natural Pashmina", description: "Pure. Soft. Authentic." },
  { Icon: Hexagon, title: "Handwoven in Kashmir", description: "Crafted by skilled artisans." },
  { Icon: Mountain, title: "Ethical & Sustainable", description: "For people and planet." },
];

export function TrustBanner({ className }: { className?: string }) {
  return (
    <section className={cn("border-t border-border/40 bg-ink py-10", className)}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-border/40">
        {items.map(({ Icon, title, description }) => (
          <div key={title} className="flex items-center gap-4 md:px-6">
            <Icon className="h-8 w-8 text-gold shrink-0" strokeWidth={1.2} />
            <div>
              <p className="text-[0.7rem] tracking-[0.25em] uppercase text-cream">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
