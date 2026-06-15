import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductClient } from "@/components/site/ProductClient";
import { ProductJsonLd } from "@/components/site/ProductJsonLd";
import { commerce, buildPageMetadata } from "@/lib/commerce";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await commerce.getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [product, brand] = await Promise.all([
    commerce.getProductBySlug(slug),
    commerce.getBrand(),
  ]);
  if (!product) return { title: "Product Not Found" };

  const image = product.images[0];

  return buildPageMetadata(brand, {
    title: product.name,
    description: product.description,
    openGraph: {
      description: product.description,
      images: image ? [{ url: image.src, width: image.width, height: image.height }] : undefined,
    },
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, allProducts, brand] = await Promise.all([
    commerce.getProductBySlug(slug),
    commerce.getProducts(),
    commerce.getBrand(),
  ]);
  if (!product) notFound();

  const related = allProducts.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <>
      <ProductJsonLd product={product} brandName={brand.name} siteUrl={brand.siteUrl} />
      <ProductClient product={product} related={related} colorSwatches={allProducts.slice(0, 6)} />
    </>
  );
}
