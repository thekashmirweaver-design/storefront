import type { Metadata } from "next";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Eyebrow, DiamondDivider } from "@/components/site/Eyebrow";
import { commerce, buildPageMetadata } from "@/lib/commerce";

export async function generateMetadata(): Promise<Metadata> {
  const [brand, content] = await Promise.all([
    commerce.getBrand(),
    commerce.getCraftsmanshipContent(),
  ]);
  return buildPageMetadata(brand, {
    title: "Craftsmanship",
    description: "The slow, patient art of weaving pashmina by hand in Kashmir.",
    openGraph: {
      description: "The slow, patient art of weaving pashmina by hand.",
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

export default async function CraftsmanshipPage() {
  const content = await commerce.getCraftsmanshipContent();

  return (
    <>
      <section className="relative h-[460px] overflow-hidden">
        <OptimizedImage
          src={content.hero.image.src}
          alt={content.hero.image.alt ?? ""}
          fill
          sizes="100vw"
          className="object-cover"
          width={content.hero.image.width}
          height={content.hero.image.height}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/40" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 h-full flex flex-col items-center justify-center text-center pt-20">
          <Eyebrow className="justify-center">{content.hero.eyebrow}</Eyebrow>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-cream max-w-3xl">
            {content.hero.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">{content.intro}</p>
        <DiamondDivider className="mt-10" />
      </section>

      <section className="mx-auto max-w-[1100px] px-6 md:px-10 pb-24 space-y-16">
        {content.steps.map((step) => (
          <div
            key={step.number}
            className="grid lg:grid-cols-[120px_1fr] gap-6 items-start border-b border-border/40 pb-12 last:border-0"
          >
            <div className="font-display text-5xl text-gold/70">{step.number}</div>
            <div>
              <h3 className="font-display text-3xl text-cream">{step.title}</h3>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="border-t border-border/40 bg-ink">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-24 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative aspect-[4/5] overflow-hidden">
            <OptimizedImage
              src={content.careGuide.image.src}
              alt={content.careGuide.image.alt ?? ""}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              width={content.careGuide.image.width}
              height={content.careGuide.image.height}
            />
          </div>
          <div>
            <Eyebrow>{content.careGuide.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl text-cream">{content.careGuide.title}</h2>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
              {content.careGuide.tips.map((tip) => (
                <li key={tip}>— {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
