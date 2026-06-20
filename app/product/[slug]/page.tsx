import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductClient } from "@/components/site/ProductClient";
import { ProductJsonLd } from "@/components/site/ProductJsonLd";
import { commerce, buildPageMetadata, brandText } from "@/lib/commerce";
import { resolveProductDetailContent } from "@/lib/commerce/product-detail";

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
  const product = await commerce.getProductBySlug(slug);
  if (!product) notFound();

  const shopifyMode = commerce.name === "shopify";

  const [related, brand, collectionData, settings, policies] = await Promise.all([
    commerce.getRelatedProducts(slug, 4),
    commerce.getBrand(),
    product.collectionSlug
      ? commerce.getCollectionBySlug(product.collectionSlug)
      : Promise.resolve(null),
    commerce.getStorefrontSettings(),
    commerce.getShopPolicies(),
  ]);

  const detailContent = resolveProductDetailContent(
    product,
    settings,
    policies,
    shopifyMode,
    brandText(brand.copy.pages.product.authenticityPromise, brand),
  );

  const colorVariants =
    collectionData?.products.filter((p) => p.collectionSlug === product.collectionSlug) ?? [];

  return (
    <>
      <ProductJsonLd product={product} brandName={brand.name} siteUrl={brand.siteUrl} />
      <ProductClient
        product={product}
        related={related}
        colorVariants={colorVariants.length > 0 ? colorVariants : [product]}
        collectionTitle={collectionData?.collection.title}
        detailContent={detailContent}
      />
    </>
  );
}
