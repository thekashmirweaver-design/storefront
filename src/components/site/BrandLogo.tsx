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

export function BrandLogo({ logo, size = "md", className }: BrandLogoProps) {
  const dimension = size === "lg" ? 56 : size === "md" ? 48 : 40;

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full overflow-hidden bg-ink",
        sizeClasses[size],
        className,
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
  );
}
