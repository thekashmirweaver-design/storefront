import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Hexagon, Feather, Mountain, Hand, Home as HomeIcon, Heart, Infinity as InfinityIcon } from "lucide-react";
import heroImg from "@/assets/hero-portrait.jpg";
import legacyImg from "@/assets/legacy-stilllife.jpg";
import classicImg from "@/assets/collection-classic.jpg";
import lightweightImg from "@/assets/collection-lightweight.jpg";
import wovenImg from "@/assets/collection-woven.jpg";
import seasonalImg from "@/assets/collection-seasonal.jpg";
import { Eyebrow, DiamondDivider } from "@/components/site/Eyebrow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GULRIZA — The Finest Pashmina, Woven by Heritage" },
      { name: "description", content: "Luxuriously soft. Exceptionally rare. Handwoven Kashmiri pashmina shawls crafted from 100% natural fibers." },
      { property: "og:title", content: "GULRIZA — The Finest Pashmina, Woven by Heritage" },
      { property: "og:description", content: "Luxuriously soft. Exceptionally rare. A timeless wrap of elegance and comfort." },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: Home,
});

const collections = [
  { title: "Classic Pashminas", desc: "Timeless designs for every occasion.", img: classicImg, to: "/collections/signature" },
  { title: "Lightweight Pashminas", desc: "Featherlight elegance, all year long.", img: lightweightImg, to: "/collections/lightweight" },
  { title: "Woven Intricacy", desc: "Artistry in every intricate weave.", img: wovenImg, to: "/collections" },
  { title: "Seasonal Edit", desc: "Curated hues for the season.", img: seasonalImg, to: "/collections" },
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

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[760px] lg:min-h-[860px] overflow-hidden">
        <img src={heroImg} alt="Woman wrapped in a Kashmiri pashmina shawl at dusk" width={1920} height={1088}
          className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 pt-48 lg:pt-52 pb-24">
          <div className="max-w-xl">
            <Eyebrow>Exquisite by Nature</Eyebrow>
            <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05]">
              The Finest Pashmina<br />Woven by Heritage
            </h1>
            <p className="mt-7 text-base text-foreground/80 leading-relaxed max-w-md">
              Luxuriously soft. Exceptionally rare.<br />
              A timeless wrap of elegance and comfort.
            </p>
            <Link to="/collections"
              className="mt-10 inline-flex items-center gap-3 border border-gold/70 px-8 py-4 text-[0.7rem] tracking-[0.3em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-colors">
              Explore Collection <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="border-y border-border/50 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-y-8 divide-x divide-border/40">
          {valueProps.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center px-4">
              <Icon className="h-7 w-7 text-gold" strokeWidth={1.2} />
              <p className="mt-3 text-[0.65rem] tracking-[0.25em] uppercase text-foreground/80 leading-relaxed max-w-[10rem]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <Eyebrow>Discover Timeless Elegance</Eyebrow>
            <h2 className="mt-4 font-display text-4xl md:text-5xl text-cream">Our Collections</h2>
          </div>
          <Link to="/collections" className="text-[0.7rem] tracking-[0.3em] uppercase text-gold hover:text-cream inline-flex items-center gap-2">
            View All Collections <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {collections.map((c) => (
            <Link key={c.title} to={c.to} className="group block">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={c.img} alt={c.title} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
              </div>
              <div className="pt-5 text-center">
                <h3 className="text-[0.75rem] tracking-[0.25em] uppercase text-cream group-hover:text-gold transition-colors">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-2">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LEGACY SPLIT */}
      <section className="border-t border-border/40 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Eyebrow>Rooted in Heritage · Made to Last</Eyebrow>
            <h2 className="mt-5 font-display text-4xl md:text-5xl text-cream leading-tight">A Legacy Woven<br />Through Time</h2>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-lg">
              From the highlands of Kashmir to the hands of skilled artisans, every GULRIZA pashmina is a story of tradition, patience and unmatched craftsmanship. Woven with care. Cherished for a lifetime.
            </p>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
              {legacyPillars.map(({ Icon, title, desc }) => (
                <div key={title}>
                  <Icon className="h-6 w-6 text-gold" strokeWidth={1.2} />
                  <h4 className="mt-3 text-[0.65rem] tracking-[0.25em] uppercase text-cream">{title}</h4>
                  <p className="mt-2 text-[0.7rem] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="aspect-[4/3] overflow-hidden">
            <img src={legacyImg} alt="Rolled pashmina with gift box" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="text-gold/40 text-5xl font-display leading-none">"</div>
          <p className="font-display italic text-2xl md:text-3xl text-cream leading-relaxed mt-2">
            Pashmina is not just worn, it is felt.<br />A part of you, wherever you go.
          </p>
          <DiamondDivider className="mt-10" />
        </div>
      </section>
    </>
  );
}
