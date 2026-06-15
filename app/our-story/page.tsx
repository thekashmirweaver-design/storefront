import type { Metadata } from "next";

import heroImg from "@/assets/hero-portrait.jpg";
import mountainImg from "@/assets/journal-mountain.jpg";
import legacyImg from "@/assets/legacy-stilllife.jpg";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Eyebrow, DiamondDivider } from "@/components/site/Eyebrow";
import { commerce, buildPageMetadata } from "@/lib/commerce";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildPageMetadata(brand, {
    title: "Our Story",
    description: `From the highlands of Kashmir to your shoulders — the story of ${brand.name}'s heritage and craft.`,
    openGraph: {
      description: "The story of a centuries-old craft.",
      images: [{ url: heroImg.src, width: heroImg.width, height: heroImg.height }],
    },
  });
}

export default function OurStoryPage() {
  return (
    <>
      <section className="relative h-[520px] overflow-hidden">
        <OptimizedImage src={mountainImg} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 h-full flex flex-col items-center justify-center text-center pt-20">
          <Eyebrow className="justify-center">Our Story</Eyebrow>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-cream max-w-3xl">
            From the Highlands of Kashmir, Woven with Love
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-display italic text-2xl text-cream leading-relaxed">
          &ldquo;Gulriza&rdquo; means the one who scatters flowers — and that is how we believe
          every shawl should be made: with patience, with grace, with beauty in every thread.
        </p>
        <DiamondDivider className="mt-10" />
      </section>

      <section className="mx-auto max-w-[1200px] px-6 md:px-10 pb-24 grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative aspect-[4/5] overflow-hidden">
          <OptimizedImage
            src={legacyImg}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <Eyebrow>Heritage</Eyebrow>
          <h2 className="mt-4 font-display text-4xl text-cream">A Craft Centuries in the Making</h2>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            For over six hundred years, the artisans of Kashmir have hand-woven pashmina from the
            soft under-fleece of the Changthangi goat. GULRIZA carries forward this lineage —
            partnering directly with families of weavers, dyers and spinners who have practiced the
            craft across generations.
          </p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Every shawl is signed and numbered by the weaver who made it. No two are ever identical.
          </p>
        </div>
      </section>

      <section className="border-y border-border/40 bg-ink py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid lg:grid-cols-2 gap-14 items-center">
          <div className="order-2 lg:order-1">
            <Eyebrow>Sustainability</Eyebrow>
            <h2 className="mt-4 font-display text-4xl text-cream">Made Slowly. Made Honestly.</h2>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Our fiber is gathered each spring, only when the goats naturally shed. Our dyes are
              derived from plants and minerals. Our weavers are paid living wages. We make a small
              number of pieces each season, and we make them to last for decades.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden order-1 lg:order-2">
            <OptimizedImage
              src={mountainImg}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
