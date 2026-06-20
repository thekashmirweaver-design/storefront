import type { CommerceCart, CommerceProduct } from "./types";

/** Remaining purchasable quantity when inventory is known; null means no cap. */
export function getRemainingQuantity(
  quantityAvailable: number | null | undefined,
  cartQty: number,
): number | null {
  if (quantityAvailable == null || quantityAvailable < 0) return null;
  return Math.max(0, quantityAvailable - cartQty);
}

/** Max selectable quantity when inventory is known; null means no cap in UI. */
export function getProductMaxQuantity(product: CommerceProduct, cartQty?: number): number | null {
  const qty = product.quantityAvailable;
  if (qty == null || qty < 0) return null;
  if (cartQty == null || cartQty <= 0) return qty;
  return getRemainingQuantity(qty, cartQty);
}

export function clampToMaxQuantity(quantity: number, max: number | null): number {
  if (max == null) return quantity;
  return Math.min(quantity, max);
}

export function getShopifyCartVariantQuantity(
  cart: CommerceCart | null | undefined,
  variantId: string,
): number {
  if (!cart?.lines.length) return 0;
  const line = cart.lines.find((l) => l.product?.variantId === variantId);
  return line?.quantity ?? 0;
}

export function getCartProductQuantity(
  cartMode: "mock" | "shopify",
  mockCart: { slug: string; qty: number }[],
  shopifyCart: CommerceCart | null | undefined,
  product: CommerceProduct,
): number {
  if (cartMode === "shopify") {
    if (product.variantId) {
      return getShopifyCartVariantQuantity(shopifyCart, product.variantId);
    }
    return shopifyCart?.lines.find((l) => l.productSlug === product.slug)?.quantity ?? 0;
  }
  return mockCart.find((i) => i.slug === product.slug)?.qty ?? 0;
}

/** True when the product should show sold-out UI (labels, overlays, Notify Me). */
export function isProductSoldOut(product: CommerceProduct): boolean {
  return (
    !product.availableForSale ||
    (product.quantityAvailable != null && product.quantityAvailable <= 0)
  );
}

export function isLowStock(quantityAvailable: number | null | undefined): boolean {
  return quantityAvailable != null && quantityAvailable > 0 && quantityAvailable <= 5;
}

export function lowStockHint(quantityAvailable: number): string {
  return `Only ${quantityAvailable} available`;
}
