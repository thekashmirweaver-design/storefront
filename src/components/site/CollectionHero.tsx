import Link from "next/link";
import { ArrowRight } from "lucide-react";

import fallbackImg from "@/assets/collection-classic.jpg";
import { CollectionStory } from "@/components/site/CollectionStory";
import { Eyebrow } from "@/components/site/Eyebrow";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import type { CommerceCollection } from "@/lib/commerce";
import {
  collectionCtaLabel,
  collectionEyebrow,
  collectionHeadline,
  collectionShowItalicTagline,
} from "@/lib/commerce/collection-copy";

export function CollectionHero({ collection }: { collection: CommerceCollection }) {
  const image = collection.image?.src ?? fallbackImg;
  const showItalicTagline = collectionShowItalicTagline(collection);

  return (
    <section className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] overflow-hidden border-b border-border/40">
      <OptimizedImage
        src={image}
        alt={collection.image?.alt ?? collection.title}
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 py-20 sm:py-24 lg:py-28 flex flex-col justify-end min-h-[520px] sm:min-h-[580px] lg:min-h-[640px]">
        <div className="max-w-xl">
          <Eyebrow>{collectionEyebrow(collection)}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl text-cream leading-[1.08]">
            {collectionHeadline(collection)}
          </h2>
          {showItalicTagline ? (
            <p className="mt-4 font-display text-2xl sm:text-3xl italic text-gold leading-snug">
              {collection.tagline}
            </p>
          ) : null}
          <CollectionStory
            collection={collection}
            className="mt-6 text-sm sm:text-base text-foreground/80 leading-relaxed max-w-lg"
          />
          <Link
            href={`/collections/${collection.slug}`}
            className="mt-8 sm:mt-10 inline-flex items-center gap-3 border border-cream/50 px-6 sm:px-8 py-3.5 sm:py-4 text-[0.7rem] tracking-[0.3em] uppercase text-cream hover:bg-cream hover:text-primary-foreground transition-colors"
          >
            {collectionCtaLabel(collection)} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
