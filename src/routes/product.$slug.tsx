import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronDown, Minus, Plus, Check, Leaf, Hexagon, Feather, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Pashmina"} — GULRIZA` },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:title", content: `${loaderData?.name ?? "Pashmina"} — GULRIZA` },
      { property: "og:description", content: loaderData?.description ?? "" },
      { property: "og:image", content: loaderData?.image ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="py-32 text-center text-muted-foreground">
      Product not found. <Link to="/shop" className="text-gold underline">Shop all</Link>
    </div>
  ),
  component: ProductPage,
});

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="border-b border-border/40 py-4 group">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-[0.7rem] tracking-[0.25em] uppercase text-cream">{title}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-open:rotate-180 transition-transform" />
      </summary>
      <div className="pt-3 text-xs text-muted-foreground leading-relaxed">{children}</div>
    </details>
  );
}

function ProductPage() {
  const product = Route.useLoaderData();
  const [qty, setQty] = useState(1);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-10">
        <nav className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
          <Link to="/" className="hover:text-gold">Home</Link> / <Link to="/shop" className="hover:text-gold">Shop</Link> / <span className="text-gold">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 grid lg:grid-cols-[80px_1fr_400px] gap-8">
        <div className="hidden lg:flex flex-col gap-3 order-1">
          {[product.image, product.image, product.image, product.image].map((src, i) => (
            <div key={i} className={`aspect-square overflow-hidden border ${i === 0 ? "border-gold" : "border-border/30"} cursor-pointer`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <div className="aspect-[4/5] overflow-hidden bg-card order-2">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <aside className="order-3 space-y-5">
          <div>
            <h1 className="font-display text-4xl text-cream">{product.name}</h1>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground mt-2">{product.categoryLabel}</p>
            <p className="text-xl text-gold mt-4">${product.price}</p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          <ul className="space-y-2 text-xs text-foreground/80">
            {[
              { Icon: Leaf, t: "100% Pure Pashmina" },
              { Icon: Hexagon, t: "Handwoven in Kashmir" },
              { Icon: Feather, t: "Ethically Made" },
              { Icon: Check, t: "Limited Production" },
            ].map(({ Icon, t }) => (
              <li key={t} className="flex items-center gap-3"><Icon className="h-4 w-4 text-gold" strokeWidth={1.2} /> {t}</li>
            ))}
          </ul>

          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-2">Color: <span className="text-muted-foreground capitalize">{product.name.split(" ")[0]}</span></p>
            <div className="flex gap-2">
              {products.slice(0,6).map((p) => (
                <Link key={p.slug} to="/product/$slug" params={{ slug: p.slug }} title={p.name}
                  className={`h-7 w-7 rounded-full border ${p.slug === product.slug ? "ring-2 ring-gold ring-offset-2 ring-offset-background" : "border-border"}`}
                  style={{ background: p.colorHex }} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-2">Size</p>
            <p className="text-xs text-muted-foreground">70 x 200 cm</p>
          </div>

          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-2">Quantity</p>
            <div className="flex items-center border border-border w-fit">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 text-muted-foreground hover:text-gold"><Minus className="h-3 w-3" /></button>
              <span className="px-5 text-sm text-cream">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2 text-muted-foreground hover:text-gold"><Plus className="h-3 w-3" /></button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => toast.success(`${product.name} added to bag`, { description: `Quantity: ${qty}` })}
              className="w-full bg-gold text-primary-foreground py-3.5 text-[0.7rem] tracking-[0.3em] uppercase hover:bg-gold-soft transition-colors">
              Add to Bag
            </button>
            <button className="w-full border border-border py-3.5 text-[0.7rem] tracking-[0.3em] uppercase text-cream hover:border-gold hover:text-gold transition-colors">
              Add to Wishlist
            </button>
          </div>

          <div className="pt-4">
            <Accordion title="Description">{product.description} Made from the under-fleece of the Changthangi goat from the Himalayas, this piece is a true heirloom.</Accordion>
            <Accordion title="Details & Care">Dimensions: 70 x 200 cm. Dry clean only. Store folded with cedar to preserve the fiber.</Accordion>
            <Accordion title="Shipping & Returns">Complimentary worldwide express shipping. Free returns within 30 days.</Accordion>
            <Accordion title="Our Promise">Every GULRIZA pashmina is signed by the master weaver and accompanied by a certificate of authenticity.</Accordion>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-20">
        <h2 className="font-display text-3xl text-cream mb-10">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
          {related.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>
    </>
  );
}
