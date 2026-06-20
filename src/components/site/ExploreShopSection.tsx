import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { headers } from "next/headers";

import fallbackImg from "@/assets/collection-classic.jpg";
import { Eyebrow } from "@/components/site/Eyebrow";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { brandText } from "@/lib/commerce";
import { collectionCtaLabel, collectionHeadline } from "@/lib/commerce/collection-copy";
import { commerce } from "@/lib/commerce/server";
import {
  excludeCollectionSlugFromPath,
  shouldShowExploreShopSection,
} from "@/lib/site/explore-shop-section";

export async function ExploreShopSection() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  if (!shouldShowExploreShopSection(pathname)) {
    return null;
  }

  const excludeSlug = excludeCollectionSlugFromPath(pathname);
  const [brand, collections] = await Promise.all([commerce.getBrand(), commerce.getCollections()]);
  const featured = collections.filter((collection) => collection.slug !== excludeSlug);

  if (!featured.length) {
    return (
      <section className="border-t border-border/40 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 text-center">
          <Eyebrow className="justify-center">Discover</Eyebrow>
          <h2 className="mt-4 font-display text-4xl text-cream">Explore the Collection</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            {brandText(brand.copy.pages.shop.subtitle, brand)}
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-3 border border-gold/60 px-8 py-3.5 text-[0.7rem] tracking-[0.3em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-colors"
          >
            Shop All Pashminas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-border/40 bg-ink">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20">
        <div className="max-w-2xl">
          <Eyebrow>Discover</Eyebrow>
          <h2 className="mt-4 font-display text-4xl md:text-5xl text-cream">
            Explore the Collection
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {brandText(brand.copy.pages.shop.subtitle, brand)}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((collection) => {
            const image = collection.image?.src ?? fallbackImg;
            return (
              <Link
                key={collection.slug}
                href={`/collections/${collection.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden border border-border/40"
              >
                <OptimizedImage
                  src={image}
                  alt={collection.image?.alt ?? collection.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[0.65rem] tracking-[0.25em] uppercase text-gold">
                    {collection.title}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-cream leading-snug">
                    {collectionHeadline(collection)}
                  </h3>
                  <span className="mt-4 inline-flex items-center gap-2 text-[0.65rem] tracking-[0.25em] uppercase text-cream/90 group-hover:text-gold transition-colors">
                    {collectionCtaLabel(collection)} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 border border-gold/60 px-8 py-3.5 text-[0.7rem] tracking-[0.3em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-colors"
          >
            Shop All Pashminas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/#collections"
            className="inline-flex items-center gap-3 px-2 py-3.5 text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground hover:text-gold transition-colors"
          >
            View on homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
