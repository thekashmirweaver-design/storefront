import { OptimizedImage } from "@/components/site/OptimizedImage";
import type { CommerceImage } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  logo: CommerceImage;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-9 sm:h-10 sm:w-10",
  md: "h-11 w-11 sm:h-12 sm:w-12",
  lg: "h-14 w-14",
} as const;

const ringInset = {
  sm: "inset-[1.5px]",
  md: "inset-[1.5px]",
  lg: "inset-[2px]",
} as const;

export function BrandLogo({ logo, size = "md", className }: BrandLogoProps) {
  const dimension = size === "lg" ? 56 : size === "md" ? 48 : 40;

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full animate-logo-glow-pulse motion-reduce:animate-none",
        sizeClasses[size],
        className,
      )}
    >
      <div
        className="absolute inset-0 rounded-full animate-logo-glow-spin motion-reduce:animate-none bg-[conic-gradient(from_0deg,transparent_0deg,color-mix(in_oklch,var(--gold)_12%,transparent)_50deg,color-mix(in_oklch,var(--gold)_90%,transparent)_110deg,color-mix(in_oklch,var(--gold)_35%,transparent)_160deg,transparent_220deg,transparent_360deg)]"
        aria-hidden
      />
      <div
        className={cn(
          "absolute rounded-full overflow-hidden bg-ink ring-1 ring-gold/15",
          ringInset[size],
        )}
      >
        <OptimizedImage
          src={logo.src}
          alt={logo.alt ?? "Brand logo"}
          width={logo.width ?? dimension}
          height={logo.height ?? dimension}
          className="h-full w-full object-cover object-center"
        />
      </div>
    </div>
  );
}
