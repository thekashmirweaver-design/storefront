import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HomeCollectionSections } from "@/components/site/HomeCollectionSections";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Eyebrow, DiamondDivider } from "@/components/site/Eyebrow";
import { Marquee } from "@/components/site/Marquee";
import { editorialIcon } from "@/lib/commerce/editorial-icons";
import { commerce, buildPageMetadata, getHomepageCollectionSections } from "@/lib/commerce";

export async function generateMetadata(): Promise<Metadata> {
  const [brand, editorial] = await Promise.all([
    commerce.getBrand(),
    commerce.getHomepageEditorial(),
  ]);

  return buildPageMetadata(brand, {
    title: editorial.seo.title,
    description: editorial.seo.description,
    openGraph: {
      title: `${brand.name} — ${editorial.seo.title}`,
      description: editorial.hero.description.replace(/\n/g, " "),
      images: [
        {
          url: editorial.hero.image.src,
          width: editorial.hero.image.width,
          height: editorial.hero.image.height,
        },
      ],
    },
  });
}

export default async function HomePage() {
  const [editorial, collectionSections] = await Promise.all([
    commerce.getHomepageEditorial(),
    getHomepageCollectionSections(),
  ]);

  return (
    <>
      <section className="relative min-h-[640px] sm:min-h-[720px] lg:min-h-[860px] overflow-hidden">
        <OptimizedImage
          src={editorial.hero.image.src}
          alt={editorial.hero.image.alt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] lg:object-[right_center]"
          width={editorial.hero.image.width}
          height={editorial.hero.image.height}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 pt-36 sm:pt-44 lg:pt-52 pb-20 lg:pb-24">
          <div className="max-w-xl">
            <Eyebrow>{editorial.hero.eyebrow}</Eyebrow>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05]">
              {editorial.hero.headlineLine1}
              <br />
              {editorial.hero.headlineLine2}
            </h1>
            <p className="mt-6 sm:mt-7 text-sm sm:text-base text-foreground/80 leading-relaxed max-w-md whitespace-pre-line">
              {editorial.hero.description}
            </p>
            <Link
              href={editorial.hero.ctaHref}
              className="mt-8 sm:mt-10 inline-flex items-center gap-3 border border-gold/70 px-6 sm:px-8 py-3.5 sm:py-4 text-[0.7rem] tracking-[0.3em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-colors"
            >
              {editorial.hero.ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-y-8 divide-x divide-border/40">
          {editorial.valueProps.map(({ icon, label }) => {
            const Icon = editorialIcon(icon);
            return (
              <div key={label} className="flex flex-col items-center text-center px-4">
                <Icon className="h-7 w-7 text-gold" strokeWidth={1.2} />
                <p className="mt-3 text-[0.65rem] tracking-[0.25em] uppercase text-foreground/80 leading-relaxed max-w-[10rem]">
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <HomeCollectionSections sections={collectionSections} />

      <Marquee items={editorial.marqueeItems} />

      <section className="relative border-t border-border/40 overflow-hidden bg-background">
        <OptimizedImage
          src={editorial.legacy.image.src}
          alt={editorial.legacy.image.alt ?? ""}
          fill
          sizes="100vw"
          className="object-cover object-[65%_center] lg:object-[right_center]"
          width={editorial.legacy.image.width}
          height={editorial.legacy.image.height}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background from-0% via-background/95 via-35% to-transparent to-65% lg:via-40% lg:to-70%" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent lg:from-transparent lg:via-transparent" />

        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 py-24 lg:py-28">
          <div className="max-w-xl lg:max-w-[48%]">
            <Eyebrow>{editorial.legacy.eyebrow}</Eyebrow>
            <h2 className="mt-5 font-display text-4xl md:text-5xl text-cream leading-tight">
              {editorial.legacy.titleLine1}
              <br />
              {editorial.legacy.titleLine2}
            </h2>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-lg">
              {editorial.legacy.body}
            </p>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 lg:grid-cols-2 xl:grid-cols-4">
              {editorial.legacy.pillars.map(({ icon, title, description }) => {
                const Icon = editorialIcon(icon);
                return (
                  <div key={title}>
                    <Icon className="h-6 w-6 text-gold" strokeWidth={1.2} />
                    <h4 className="mt-3 text-[0.65rem] tracking-[0.25em] uppercase text-cream">
                      {title}
                    </h4>
                    <p className="mt-2 text-[0.7rem] text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="text-gold/40 text-5xl font-display leading-none">&ldquo;</div>
          <p className="font-display italic text-2xl md:text-3xl text-cream leading-relaxed mt-2">
            {editorial.quote.line1}
            <br />
            {editorial.quote.line2}
          </p>
          <DiamondDivider className="mt-10" />
        </div>
      </section>
    </>
  );
}
