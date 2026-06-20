import { unstable_cache } from "next/cache";

import { CATALOG_REVALIDATE_SECONDS } from "./cache-tags";

export function withShopifyCache<T>(
  keyParts: string[],
  tags: string[],
  fn: () => Promise<T>,
): Promise<T> {
  return unstable_cache(fn, keyParts, {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags,
  })();
}
