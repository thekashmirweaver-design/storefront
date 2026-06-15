/** @deprecated Use @/lib/commerce/client instead. */
export {
  CommerceProvider as StoreProvider,
  useCommerce as useStore,
  useCommerceCart,
  useCommerceWishlist,
} from "./commerce/client";

import { getProductBySlugAction } from "./commerce/actions";

/** @deprecated Use commerce.getProductBySlug */
export async function getProduct(slug: string) {
  return getProductBySlugAction(slug);
}
