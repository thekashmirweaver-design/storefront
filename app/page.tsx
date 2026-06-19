import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Hexagon,
  Feather,
  Mountain,
  Hand,
  Home as HomeIcon,
  Heart,
  Infinity as InfinityIcon,
} from "lucide-react";

import heroImg from "@/assets/hero-portrait.jpg";
import legacyImg from "@/assets/legacy-stilllife.jpg";
import { HomeCollectionSections } from "@/components/site/HomeCollectionSections";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Eyebrow, DiamondDivider } from "@/components/site/Eyebrow";
import { Marquee } from "@/components/site/Marquee";
import { commerce, buildPageMetadata, getHomepageCollectionSections, brandText } from "@/lib/commerce";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  const title = "The Finest Pashmina, Woven by Heritage";

  return buildPageMetadata(brand, {
    title,
    description:
      "Luxuriously soft. Exceptionally rare. Handwoven Kashmiri pashmina shawls crafted from 100% natural fibers.",
    openGraph: {
      title: `${brand.name} — ${title}`,
      description: "Luxuriously soft. Exceptionally rare. A timeless wrap of elegance and comfort.",
      images: [{ url: heroImg.src, width: heroImg.width, height: heroImg.height }],
    },
  });
}

const marqueeItems = [
  "Timeless Elegance",
  "100% Pure Pashmina",
  "Handwoven in Kashmir",
  "Limited Production",
  "Ethically Sourced",
  "Certificate of Authenticity",
  "Complimentary Worldwide Shipping",
];

const valueProps = [
  { Icon: Leaf, label: "100% Natural Yarn" },
  { Icon: Hexagon, label: "Handwoven in Kashmir" },
  { Icon: Feather, label: "Ultra Soft & Lightweight" },
  { Icon: Mountain, label: "Sustainable & Ethical" },
];

const legacyPillars = [
  { Icon: Hand, title: "Heritage Craft", desc: "Centuries-old Kashmiri artistry" },
  { Icon: HomeIcon, title: "Pristine Origin", desc: "Sourced from the Himalayan highlands" },
  { Icon: Heart, title: "Made with Care", desc: "Every piece is woven with love and precision" },
  { Icon: InfinityIcon, title: "Timeless Beauty", desc: "Designed to be treasured forever" },
];

export default async function HomePage() {
  const brand = await commerce.getBrand();
  const collectionSections = await getHomepageCollectionSections();

  return (
    <>
      <section className="relative min-h-[640px] sm:min-h-[720px] lg:min-h-[860px] overflow-hidden">
        <OptimizedImage
          src={heroImg}
          alt="Woman elegantly styling a Kashmiri pashmina shawl"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] lg:object-[right_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 pt-36 sm:pt-44 lg:pt-52 pb-20 lg:pb-24">
          <div className="max-w-xl">
            <Eyebrow>Exquisite by Nature</Eyebrow>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05]">
              The Finest Pashmina
              <br />
              Woven by Heritage
            </h1>
            <p className="mt-6 sm:mt-7 text-sm sm:text-base text-foreground/80 leading-relaxed max-w-md">
              Luxuriously soft. Exceptionally rare.
              <br className="hidden sm:block" /> A timeless wrap of elegance and comfort.
            </p>
            <Link
              href="/#collections"
              className="mt-8 sm:mt-10 inline-flex items-center gap-3 border border-gold/70 px-6 sm:px-8 py-3.5 sm:py-4 text-[0.7rem] tracking-[0.3em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-colors"
            >
              Explore Collections <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-y-8 divide-x divide-border/40">
          {valueProps.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center px-4">
              <Icon className="h-7 w-7 text-gold" strokeWidth={1.2} />
              <p className="mt-3 text-[0.65rem] tracking-[0.25em] uppercase text-foreground/80 leading-relaxed max-w-[10rem]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <HomeCollectionSections sections={collectionSections} />

      <Marquee items={marqueeItems} />

      <section className="relative border-t border-border/40 overflow-hidden bg-background">
        <OptimizedImage
          src={legacyImg}
          alt="Rolled pashmina with gift box"
          fill
          sizes="100vw"
          className="object-cover object-[65%_center] lg:object-[right_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background from-0% via-background/95 via-35% to-transparent to-65% lg:via-40% lg:to-70%" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent lg:from-transparent lg:via-transparent" />

        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 py-24 lg:py-28">
          <div className="max-w-xl lg:max-w-[48%]">
            <Eyebrow>Rooted in Heritage · Made to Last</Eyebrow>
            <h2 className="mt-5 font-display text-4xl md:text-5xl text-cream leading-tight">
              A Legacy Woven
              <br />
              Through Time
            </h2>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-lg">
              {brandText(brand.copy.pages.home.legacyBody, brand)}
            </p>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 lg:grid-cols-2 xl:grid-cols-4">
              {legacyPillars.map(({ Icon, title, desc }) => (
                <div key={title}>
                  <Icon className="h-6 w-6 text-gold" strokeWidth={1.2} />
                  <h4 className="mt-3 text-[0.65rem] tracking-[0.25em] uppercase text-cream">
                    {title}
                  </h4>
                  <p className="mt-2 text-[0.7rem] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="text-gold/40 text-5xl font-display leading-none">&ldquo;</div>
          <p className="font-display italic text-2xl md:text-3xl text-cream leading-relaxed mt-2">
            Pashmina is not just worn, it is felt.
            <br />A part of you, wherever you go.
          </p>
          <DiamondDivider className="mt-10" />
        </div>
      </section>
    </>
  );
}
