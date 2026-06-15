import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { products, colors } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { Eyebrow } from "@/components/site/Eyebrow";

const categories: Record<string, { title: string; tagline: string; cat: string }> = {
  signature: { title: "Signature Pashminas", tagline: "Timeless designs, exquisitely handcrafted for every occasion.", cat: "signature" },
  lightweight: { title: "Lightweight Pashminas", tagline: "Featherlight elegance for every day.", cat: "lightweight" },
  bridal: { title: "Bridal Collection", tagline: "For life's most precious occasions.", cat: "bridal" },
  limited: { title: "Limited Editions", tagline: "Rare and meticulously crafted.", cat: "limited" },
};

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const data = categories[params.slug];
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Collection"} — GULRIZA` },
      { name: "description", content: loaderData?.tagline ?? "" },
      { property: "og:title", content: `${loaderData?.title ?? "Collection"} — GULRIZA` },
      { property: "og:description", content: loaderData?.tagline ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="py-32 text-center text-muted-foreground">
      Collection not found. <Link to="/collections" className="text-gold underline">View all collections</Link>
    </div>
  ),
  component: CollectionDetail,
});

function CollectionDetail() {
  const data = Route.useLoaderData();
  const filtered = products.filter((p) => p.category === data.cat || data.cat === "bridal");

  return (
    <>
      <section className="border-b border-border/40 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16">
          <nav className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-6">
            <Link to="/" className="hover:text-gold">Home</Link> / <Link to="/collections" className="hover:text-gold">Collections</Link> / <span className="text-gold">{data.title}</span>
          </nav>
          <Eyebrow>Collection</Eyebrow>
          <h1 className="mt-4 font-display text-5xl text-cream">{data.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{data.tagline}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <h2 className="text-[0.7rem] tracking-[0.25em] uppercase text-gold">Filter</h2>
            <button className="text-[0.65rem] uppercase text-muted-foreground hover:text-gold">Clear</button>
          </div>
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-3">Color</p>
            <div className="grid grid-cols-6 gap-2">
              {colors.map((c) => (
                <button key={c.name} title={c.name} className="h-6 w-6 rounded-full border border-border hover:ring-2 hover:ring-gold" style={{ background: c.hex }} />
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-border/40">
            <p className="text-xs text-muted-foreground">{filtered.length} products</p>
            <button className="flex items-center gap-2 text-xs text-cream border border-border px-3 py-1.5">
              Featured <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
            {filtered.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}
