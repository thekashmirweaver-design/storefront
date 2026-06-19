import Link from "next/link";

import { BrandLogo } from "@/components/site/BrandLogo";
import { splitBrandName } from "@/lib/commerce/mappers/brand-display";
import { formatBrandTagline } from "@/lib/commerce/mappers/metadata";
import type { BrandConfig } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

type BrandLockupProps = {
  brand: BrandConfig;
  showTagline?: boolean;
  className?: string;
};

const tracking = "tracking-[0.24em] sm:tracking-[0.25em]";

export function BrandLockup({ brand, showTagline = true, className }: BrandLockupProps) {
  const { primary, secondary } = splitBrandName(brand.name);

  return (
    <Link
      href="/"
      className={cn(
        "inline-grid shrink-0 min-w-0 grid-cols-[auto_max-content] grid-rows-[auto_auto] gap-x-2.5 sm:gap-x-3",
        showTagline && "sm:grid-rows-[auto_auto_auto]",
        className,
      )}
    >
      <BrandLogo
        logo={brand.logo}
        size="sm"
        className="col-start-1 row-start-1 row-end-3 self-center"
      />

      <span
        className={cn(
          "col-start-2 row-start-1 font-display text-[0.6rem] sm:text-[0.65rem] text-cream leading-none",
          tracking,
        )}
      >
        {primary}
      </span>

      {secondary ? (
        <span
          className={cn(
            "col-start-2 row-start-2 font-display text-[0.75rem] sm:text-[0.85rem] text-cream font-medium leading-none mt-0.5 sm:mt-1",
            tracking,
          )}
        >
          {secondary}
        </span>
      ) : null}

      {showTagline ? (
        <span
          className={cn(
            "hidden sm:block col-start-2 row-start-3 font-sans text-[0.5rem] text-gold/75 leading-none mt-1",
            tracking,
          )}
        >
          {formatBrandTagline(brand.tagline)}
        </span>
      ) : null}
    </Link>
  );
}
