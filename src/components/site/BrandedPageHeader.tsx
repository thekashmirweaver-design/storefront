"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/site/BrandLogo";
import { BrandName } from "@/components/site/BrandName";
import { Eyebrow } from "@/components/site/Eyebrow";
import type { BrandConfig } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

type BrandedPageHeaderProps = {
  brand: BrandConfig;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function BrandedPageHeader({
  brand,
  eyebrow,
  title,
  description,
  className,
}: BrandedPageHeaderProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <Link href="/" className="flex flex-col items-center gap-4 mb-8">
        <BrandLogo logo={brand.logo} size="lg" />
        <BrandName name={brand.name} size="lg" className="items-center" />
      </Link>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-4 font-display text-4xl md:text-5xl text-cream">{title}</h1>
      {description ? (
        <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}
