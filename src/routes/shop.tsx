import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { products, colors } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { Eyebrow } from "@/components/site/Eyebrow";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Pashminas — GULRIZA" },
      { name: "description", content: "Explore our complete range of handcrafted Kashmiri pashmina shawls." },
      { property: "og:title", content: "Shop All Pashminas — GULRIZA" },
      { property: "og:description", content: "Explore our complete range of handcrafted pashmina." },
    ],
  }),
  component: ShopPage,
});

function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="border-b border-border/40 py-4 group">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-[0.7rem] tracking-[0.25em] uppercase text-cream">{title}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-open:rotate-180 transition-transform" />
      </summary>
      <div className="pt-4 space-y-2 text-xs text-muted-foreground">{children}</div>
    </details>
  );
}

function ShopPage() {
  return (
    <>
      <section className="border-b border-border/40 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16">
          <Eyebrow>Shop</Eyebrow>
          <h1 className="mt-4 font-display text-5xl text-cream">All Products</h1>
          <p className="mt-3 text-sm text-muted-foreground">Explore our complete range of handcrafted GULRIZA pashmina.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="space-y-1">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-[0.7rem] tracking-[0.25em] uppercase text-gold">Filter</h2>
            <button className="text-[0.65rem] tracking-wider uppercase text-muted-foreground hover:text-gold">Clear all</button>
          </div>
          <FilterGroup title="Category">
            {["Shawls", "Wraps", "Stoles"].map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer hover:text-cream">
                <input type="checkbox" className="accent-[--gold]" /> {c}
              </label>
            ))}
          </FilterGroup>
          <FilterGroup title="Color">
            <div className="grid grid-cols-6 gap-2">
              {colors.map((c) => (
                <button key={c.name} title={c.name} className="h-6 w-6 rounded-full border border-border hover:ring-2 hover:ring-gold transition-all" style={{ background: c.hex }} />
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Material">
            {["100% Pashmina", "Pashmina Silk Blend"].map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer hover:text-cream">
                <input type="checkbox" className="accent-[--gold]" /> {c}
              </label>
            ))}
          </FilterGroup>
          <FilterGroup title="Price">
            <div className="px-1">
              <input type="range" min="0" max="1000" defaultValue="600" className="w-full accent-[--gold]" />
              <div className="flex justify-between mt-2 text-[0.65rem] text-muted-foreground">
                <span>$0</span><span>$1000+</span>
              </div>
            </div>
          </FilterGroup>
          <FilterGroup title="Size">
            {["All Sizes", "70 x 200", "100 x 200"].map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer hover:text-cream">
                <input type="radio" name="size" className="accent-[--gold]" /> {c}
              </label>
            ))}
          </FilterGroup>
        </aside>

        <div>
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-border/40">
            <p className="text-xs text-muted-foreground">{products.length} products</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground">Sort by</span>
              <button className="flex items-center gap-2 text-cream border border-border px-3 py-1.5">
                Featured <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
            {products.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>

          <div className="flex items-center justify-center gap-2 mt-16">
            {[1,2,3,"…",8].map((n,i) => (
              <button key={i} className={`h-8 w-8 text-xs ${n === 1 ? "border border-gold text-gold" : "text-muted-foreground hover:text-gold"}`}>{n}</button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
