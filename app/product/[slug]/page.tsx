import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductClient } from "@/components/site/ProductClient";
import { ProductJsonLd } from "@/components/site/ProductJsonLd";
import { getProductBySlug, products } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} — GULRIZA`,
      description: product.description,
      images: [
        { url: product.image.src, width: product.image.width, height: product.image.height },
      ],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductClient product={product} />
    </>
  );
}
