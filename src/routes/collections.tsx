import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Hexagon, Mountain } from "lucide-react";
import classicImg from "@/assets/collection-classic.jpg";
import lightweightImg from "@/assets/collection-lightweight.jpg";
import wovenImg from "@/assets/collection-woven.jpg";
import seasonalImg from "@/assets/collection-seasonal.jpg";
import legacyImg from "@/assets/legacy-stilllife.jpg";
import { Eyebrow } from "@/components/site/Eyebrow";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — GULRIZA" },
      { name: "description", content: "Discover our timeless pashmina collections, crafted with heritage, woven with care." },
      { property: "og:title", content: "Collections — GULRIZA" },
      { property: "og:description", content: "Discover our timeless pashmina collections." },
    ],
  }),
  component: CollectionsPage,
});

const tiles = [
  { title: "Signature Pashminas", desc: "Timeless classics for every season.", img: classicImg, to: "/collections/signature" },
  { title: "Lightweight Pashminas", desc: "Featherlight and effortlessly elegant.", img: lightweightImg, to: "/collections/lightweight" },
  { title: "Bridal Collection", desc: "Exquisite weaves for life's special moments.", img: wovenImg, to: "/collections" },
  { title: "Limited Editions", desc: "Rare pieces, meticulously crafted.", img: seasonalImg, to: "/collections" },
];

function CollectionsPage() {
  return (
    <>
      <section className="relative h-[420px] overflow-hidden border-b border-border/40">
        <img src={legacyImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 h-full flex flex-col justify-end pb-14">
          <Eyebrow>Discover</Eyebrow>
          <h1 className="mt-4 font-display text-6xl text-cream">Collections</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">Discover our timeless pashmina collections, crafted with heritage, woven with care.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-16">
        <div className="grid sm:grid-cols-2 gap-6">
          {tiles.map((t) => (
            <Link key={t.title} to={t.to} className="group relative aspect-[5/4] overflow-hidden block">
              <img src={t.img} alt={t.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="font-display text-3xl text-cream">{t.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-xs">{t.desc}</p>
                <span className="mt-4 text-[0.65rem] tracking-[0.3em] uppercase text-gold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border/40 bg-ink py-10">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-8 divide-x divide-border/40">
          {[
            { Icon: Leaf, t: "100% Natural Pashmina", d: "Pure. Soft. Authentic." },
            { Icon: Hexagon, t: "Handwoven in Kashmir", d: "Crafted by skilled artisans." },
            { Icon: Mountain, t: "Ethical & Sustainable", d: "For people and planet." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex items-center gap-4 px-6">
              <Icon className="h-8 w-8 text-gold shrink-0" strokeWidth={1.2} />
              <div>
                <p className="text-[0.7rem] tracking-[0.25em] uppercase text-cream">{t}</p>
                <p className="text-xs text-muted-foreground mt-1">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
