import { createFileRoute } from "@tanstack/react-router";
import handloomImg from "@/assets/journal-handloom.jpg";
import wovenImg from "@/assets/collection-woven.jpg";
import { Eyebrow, DiamondDivider } from "@/components/site/Eyebrow";

export const Route = createFileRoute("/craftsmanship")({
  head: () => ({
    meta: [
      { title: "Craftsmanship — GULRIZA" },
      { name: "description", content: "The slow, patient art of weaving pashmina by hand in Kashmir." },
      { property: "og:title", content: "Craftsmanship — GULRIZA" },
      { property: "og:description", content: "The slow, patient art of weaving pashmina by hand." },
      { property: "og:image", content: handloomImg },
    ],
  }),
  component: Craftsmanship,
});

const steps = [
  { n: "01", t: "Gathering the Fleece", d: "Each spring, mountain herders comb the soft under-fleece from the Changthangi goat, never shearing." },
  { n: "02", t: "Hand-Spinning", d: "Women in the valley spin the fiber on the traditional charkha, a craft passed from mother to daughter." },
  { n: "03", t: "Natural Dyeing", d: "Plant- and mineral-based dyes are mixed by hand, producing colors that age gracefully." },
  { n: "04", t: "Handloom Weaving", d: "A single shawl can take a weaver up to four weeks on the wooden handloom." },
  { n: "05", t: "Finishing & Inspection", d: "Each piece is hand-washed in spring water, brushed, and signed by its weaver." },
];

function Craftsmanship() {
  return (
    <>
      <section className="relative h-[460px] overflow-hidden">
        <img src={handloomImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/40" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 h-full flex flex-col items-center justify-center text-center pt-20">
          <Eyebrow className="justify-center">Craftsmanship</Eyebrow>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-cream max-w-3xl">The Slow Art of the Handloom</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          A single GULRIZA pashmina passes through the hands of more than a dozen artisans before it reaches you. Here is how it is made.
        </p>
        <DiamondDivider className="mt-10" />
      </section>

      <section className="mx-auto max-w-[1100px] px-6 md:px-10 pb-24 space-y-16">
        {steps.map((s, i) => (
          <div key={s.n} className="grid lg:grid-cols-[120px_1fr] gap-6 items-start border-b border-border/40 pb-12 last:border-0">
            <div className="font-display text-5xl text-gold/70">{s.n}</div>
            <div>
              <h3 className="font-display text-3xl text-cream">{s.t}</h3>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">{s.d}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="border-t border-border/40 bg-ink">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-24 grid lg:grid-cols-2 gap-14 items-center">
          <div className="aspect-[4/5] overflow-hidden">
            <img src={wovenImg} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div>
            <Eyebrow>Care Guide</Eyebrow>
            <h2 className="mt-4 font-display text-4xl text-cream">Caring for Your Pashmina</h2>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <li>— Dry clean only, ideally by a specialist familiar with cashmere.</li>
              <li>— Store folded, never on a hanger. A breathable cotton bag is ideal.</li>
              <li>— Keep cedar or lavender nearby to ward off moths.</li>
              <li>— Air your shawl outdoors twice a season to keep it fresh.</li>
              <li>— Pulls happen. Gently push the thread back through; never cut.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
