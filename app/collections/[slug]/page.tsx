import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { ProductCard } from "@/components/site/ProductCard";
import { Eyebrow } from "@/components/site/Eyebrow";
import { commerce, commerceColors, buildPageMetadata } from "@/lib/commerce";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await commerce.getCollectionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [data, brand] = await Promise.all([
    commerce.getCollectionBySlug(slug),
    commerce.getBrand(),
  ]);
  if (!data) return { title: "Collection Not Found" };

  return buildPageMetadata(brand, {
    title: data.collection.title,
    description: data.collection.tagline,
    openGraph: {
      description: data.collection.tagline,
    },
  });
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await commerce.getCollectionBySlug(slug);
  if (!data) notFound();

  const { collection, products } = data;

  return (
    <>
      <section className="border-b border-border/40 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16">
          <nav className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-6">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/collections" className="hover:text-gold">
              Collections
            </Link>{" "}
            / <span className="text-gold">{collection.title}</span>
          </nav>
          <Eyebrow>Collection</Eyebrow>
          <h1 className="mt-4 font-display text-5xl text-cream">{collection.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{collection.tagline}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <h2 className="text-[0.7rem] tracking-[0.25em] uppercase text-gold">Filter</h2>
            <button className="text-[0.65rem] uppercase text-muted-foreground hover:text-gold">
              Clear
            </button>
          </div>
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-3">Color</p>
            <div className="grid grid-cols-6 gap-2">
              {commerceColors.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  className="h-6 w-6 rounded-full border border-border hover:ring-2 hover:ring-gold"
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-border/40">
            <p className="text-xs text-muted-foreground">{products.length} products</p>
            <button className="flex items-center gap-2 text-xs text-cream border border-border px-3 py-1.5">
              Featured <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
