import { commerce } from "./server";
import type { HomepageCollectionSection } from "./types";

const HOMEPAGE_SECTION_LIMIT = 3;
const DEFAULT_PREVIEW_LIMIT = 3;

export async function getHomepageCollectionSections(
  previewLimit = DEFAULT_PREVIEW_LIMIT,
): Promise<HomepageCollectionSection[]> {
  const collections = (await commerce.getCollections()).slice(0, HOMEPAGE_SECTION_LIMIT);

  const sections = await Promise.all(
    collections.map(async (collection) => {
      const data = await commerce.getCollectionBySlug(collection.slug);
      if (!data) return null;

      return {
        collection: data.collection,
        previewProducts: data.products.slice(0, previewLimit),
      } satisfies HomepageCollectionSection;
    }),
  );

  return sections.filter((section): section is HomepageCollectionSection => section != null);
}
