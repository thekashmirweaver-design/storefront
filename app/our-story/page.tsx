import type { Metadata } from "next";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Eyebrow, DiamondDivider } from "@/components/site/Eyebrow";
import { commerce, buildPageMetadata } from "@/lib/commerce";

export async function generateMetadata(): Promise<Metadata> {
  const [brand, content] = await Promise.all([commerce.getBrand(), commerce.getOurStoryContent()]);
  return buildPageMetadata(brand, {
    title: "Our Story",
    description: `From the highlands of Kashmir to your shoulders — the story of ${brand.name}'s heritage and craft.`,
    openGraph: {
      description: "The story of a centuries-old craft.",
      images: [
        {
          url: content.hero.image.src,
          width: content.hero.image.width,
          height: content.hero.image.height,
        },
      ],
    },
  });
}

export default async function OurStoryPage() {
  const content = await commerce.getOurStoryContent();

  return (
    <>
      <section className="relative h-[520px] overflow-hidden">
        <OptimizedImage
          src={content.hero.image.src}
          alt={content.hero.image.alt ?? ""}
          fill
          sizes="100vw"
          className="object-cover"
          width={content.hero.image.width}
          height={content.hero.image.height}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 h-full flex flex-col items-center justify-center text-center pt-20">
          <Eyebrow className="justify-center">{content.hero.eyebrow}</Eyebrow>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-cream max-w-3xl">
            {content.hero.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-display italic text-2xl text-cream leading-relaxed">
          &ldquo;{content.quote}&rdquo;
        </p>
        <DiamondDivider className="mt-10" />
      </section>

      <section className="mx-auto max-w-[1200px] px-6 md:px-10 pb-24 grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative aspect-[4/5] overflow-hidden">
          <OptimizedImage
            src={content.heritage.image.src}
            alt={content.heritage.image.alt ?? ""}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            width={content.heritage.image.width}
            height={content.heritage.image.height}
          />
        </div>
        <div>
          <Eyebrow>{content.heritage.eyebrow}</Eyebrow>
          <h2 className="mt-4 font-display text-4xl text-cream">{content.heritage.title}</h2>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">{content.heritage.body}</p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            {content.heritage.bodyExtra}
          </p>
        </div>
      </section>

      <section className="border-y border-border/40 bg-ink py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid lg:grid-cols-2 gap-14 items-center">
          <div className="order-2 lg:order-1">
            <Eyebrow>{content.sustainability.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl text-cream">{content.sustainability.title}</h2>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              {content.sustainability.body}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden order-1 lg:order-2">
            <OptimizedImage
              src={content.sustainability.image.src}
              alt={content.sustainability.image.alt ?? ""}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              width={content.sustainability.image.width}
              height={content.sustainability.image.height}
            />
          </div>
        </div>
      </section>
    </>
  );
}
