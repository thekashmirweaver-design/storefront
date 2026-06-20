import Link from "next/link";

import { ArticleBody } from "@/components/site/ArticleBody";
import { BrandedPageHeader } from "@/components/site/BrandedPageHeader";
import type { BrandConfig } from "@/lib/commerce/types";

type LegalPageLayoutProps = {
  brand: BrandConfig;
  eyebrow: string;
  title: string;
  html?: string;
  emptyMessage: string;
};

export function LegalPageLayout({
  brand,
  eyebrow,
  title,
  html,
  emptyMessage,
}: LegalPageLayoutProps) {
  return (
    <article className="mx-auto max-w-3xl px-6 md:px-10 py-24">
      <BrandedPageHeader brand={brand} eyebrow={eyebrow} title={title} />

      <div className="mt-12 border-t border-border/40 pt-10">
        {html ? (
          <ArticleBody html={html} />
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {emptyMessage}{" "}
            <Link href="/contact" className="text-gold hover:underline">
              Contact us
            </Link>{" "}
            if you need assistance.
          </p>
        )}
      </div>
    </article>
  );
}
