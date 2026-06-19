import { CollectionHero } from "@/components/site/CollectionHero";
import { CollectionPreview } from "@/components/site/CollectionPreview";
import type { HomepageCollectionSection } from "@/lib/commerce/types";

export function HomeCollectionSections({ sections }: { sections: HomepageCollectionSection[] }) {
  if (sections.length === 0) {
    return (
      <section id="collections" className="mx-auto max-w-[1400px] px-6 md:px-10 py-24">
        <p className="text-center text-sm text-muted-foreground">
          Collections will appear here once published in Shopify Admin.
        </p>
      </section>
    );
  }

  return (
    <div id="collections">
      {sections.map(({ collection, previewProducts }) => (
        <article key={collection.slug} id={collection.slug} className="scroll-mt-24">
          <CollectionHero collection={collection} />
          <CollectionPreview collection={collection} products={previewProducts} />
        </article>
      ))}
    </div>
  );
}
