import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CollectionListing } from "@/components/site/CollectionListing";
import { CollectionStory } from "@/components/site/CollectionStory";
import { Eyebrow } from "@/components/site/Eyebrow";
import { commerce, commerceColors, buildPageMetadata } from "@/lib/commerce";
import { isShopifyProvider } from "@/lib/commerce/config";
import {
  collectionEyebrow,
  collectionHeadline,
  collectionMetaDescription,
  collectionShowItalicTagline,
} from "@/lib/commerce/collection-copy";

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

  const description = collectionMetaDescription(data.collection);

  return buildPageMetadata(brand, {
    title: data.collection.title,
    description,
    openGraph: {
      description,
    },
  });
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await commerce.getCollectionBySlug(slug);
  if (!data) notFound();

  const { collection, products } = data;
  const showItalicTagline = collectionShowItalicTagline(collection);

  return (
    <>
      <section className="border-b border-border/40 bg-ink">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16">
          <nav className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-6">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/#collections" className="hover:text-gold">
              Collections
            </Link>{" "}
            / <span className="text-gold">{collection.title}</span>
          </nav>
          <Eyebrow>{collectionEyebrow(collection)}</Eyebrow>
          <h1 className="mt-4 font-display text-5xl text-cream">
            {collectionHeadline(collection)}
          </h1>
          {showItalicTagline ? (
            <p className="mt-3 font-display text-2xl italic text-gold leading-snug">
              {collection.tagline}
            </p>
          ) : null}
          <CollectionStory
            collection={collection}
            className="mt-3 text-sm text-muted-foreground max-w-2xl"
          />
        </div>
      </section>

      <Suspense
        fallback={
          <div className="py-24 text-center text-muted-foreground">Loading collection…</div>
        }
      >
        <CollectionListing
          products={products}
          colorCatalog={isShopifyProvider() ? [] : commerceColors}
          collectionSlug={slug}
        />
      </Suspense>
    </>
  );
}
