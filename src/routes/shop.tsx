import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { products, colors, type Product } from "@/lib/products";
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

type Sort = "featured" | "price-asc" | "price-desc" | "name";
type Category = Product["category"];

function ShopPage() {
  const [selectedCats, setCats] = useState<Set<Category>>(new Set());
  const [selectedColors, setColors] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sort, setSort] = useState<Sort>("featured");
  const [page, setPage] = useState(1);
  const perPage = 9;

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (selectedCats.size && !selectedCats.has(p.category)) return false;
      if (selectedColors.size && !selectedColors.has(p.colorHex)) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [selectedCats, selectedColors, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const toggleCat = (c: Category) => {
    const next = new Set(selectedCats);
    next.has(c) ? next.delete(c) : next.add(c);
    setCats(next); setPage(1);
  };
  const toggleColor = (hex: string) => {
    const next = new Set(selectedColors);
    next.has(hex) ? next.delete(hex) : next.add(hex);
    setColors(next); setPage(1);
  };
  const clearAll = () => { setCats(new Set()); setColors(new Set()); setMaxPrice(1000); setPage(1); };

  const cats: { value: Category; label: string }[] = [
    { value: "signature", label: "Signature" },
    { value: "lightweight", label: "Lightweight" },
    { value: "bridal", label: "Bridal" },
    { value: "limited", label: "Limited Editions" },
  ];

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
            <button onClick={clearAll} className="text-[0.65rem] tracking-wider uppercase text-muted-foreground hover:text-gold">Clear all</button>
          </div>
          <FilterGroup title="Category">
            {cats.map((c) => (
              <label key={c.value} className="flex items-center gap-2 cursor-pointer hover:text-cream">
                <input type="checkbox" checked={selectedCats.has(c.value)} onChange={() => toggleCat(c.value)} className="accent-[--gold]" /> {c.label}
              </label>
            ))}
          </FilterGroup>
          <FilterGroup title="Color">
            <div className="grid grid-cols-6 gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => toggleColor(c.hex)}
                  className={`h-6 w-6 rounded-full border ${selectedColors.has(c.hex) ? "ring-2 ring-gold" : "border-border"} hover:ring-2 hover:ring-gold transition-all`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Price">
            <div className="px-1">
              <input type="range" min={0} max={1000} value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }} className="w-full accent-[--gold]" />
              <div className="flex justify-between mt-2 text-[0.65rem] text-muted-foreground">
                <span>$0</span><span>${maxPrice}{maxPrice === 1000 ? "+" : ""}</span>
              </div>
            </div>
          </FilterGroup>
        </aside>

        <div>
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-border/40">
            <p className="text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? "product" : "products"}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="bg-transparent text-cream border border-border px-3 py-1.5 focus:outline-none focus:border-gold"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              No pieces match your filters.{" "}
              <button onClick={clearAll} className="text-gold hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
              {visible.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 text-xs ${n === safePage ? "border border-gold text-gold" : "text-muted-foreground hover:text-gold"}`}
                >{n}</button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
