import { splitBrandName } from "@/lib/commerce/mappers/brand-display";
import { cn } from "@/lib/utils";

type BrandNameProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const tracking = {
  sm: "tracking-[0.24em] sm:tracking-[0.25em]",
  md: "tracking-[0.24em] sm:tracking-[0.26em]",
  lg: "tracking-[0.25em]",
} as const;

const sizeStyles = {
  sm: {
    primary: "text-[0.6rem] sm:text-[0.65rem]",
    secondary: "text-[0.75rem] sm:text-[0.85rem]",
  },
  md: {
    primary: "text-[0.65rem] sm:text-[0.7rem]",
    secondary: "text-sm sm:text-base",
  },
  lg: {
    primary: "text-xs",
    secondary: "text-lg",
  },
} as const;

export function BrandName({ name, size = "md", className }: BrandNameProps) {
  const { primary, secondary } = splitBrandName(name);

  return (
    <div className={cn("flex flex-col items-start leading-none min-w-0", className)}>
      <span
        className={cn("font-display text-cream", sizeStyles[size].primary, tracking[size])}
      >
        {primary}
      </span>
      {secondary ? (
        <span
          className={cn(
            "font-display text-cream font-medium mt-0.5 sm:mt-1",
            sizeStyles[size].secondary,
            tracking[size],
          )}
        >
          {secondary}
        </span>
      ) : null}
    </div>
  );
}
