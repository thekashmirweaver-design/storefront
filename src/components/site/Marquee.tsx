import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  className?: string;
  /** Full loop duration in seconds */
  duration?: number;
};

function MarqueeTrack({
  items,
  id,
  ariaHidden,
}: {
  items: string[];
  id: string;
  ariaHidden?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={ariaHidden || undefined}>
      {items.map((item, i) => (
        <span key={`${id}-${item}-${i}`} className="inline-flex items-center gap-8">
          <span className="font-display text-sm md:text-base tracking-[0.22em] uppercase text-cream/90 whitespace-nowrap">
            {item}
          </span>
          <span className="text-gold/70 text-[0.45rem]" aria-hidden>
            ◆
          </span>
        </span>
      ))}
    </div>
  );
}

export function Marquee({ items, className, duration = 45 }: MarqueeProps) {
  return (
    <div
      className={cn("overflow-hidden border-y border-border/50 bg-ink py-4 md:py-5", className)}
      aria-label="Brand highlights"
    >
      <div
        className="flex w-max animate-marquee-rtl motion-reduce:animate-none"
        style={{ animationDuration: `${duration}s` }}
      >
        <MarqueeTrack items={items} id="a" />
        <MarqueeTrack items={items} id="b" ariaHidden />
      </div>
    </div>
  );
}
