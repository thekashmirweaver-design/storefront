import type { CommerceProduct, CommerceShopPolicies, CommerceStorefrontSettings } from "./types";

export type ProductDetailContent = {
  highlights: string[];
  shippingBadgeText?: string;
  returnsBadgeText?: string;
  /** HTML or plain text for Shipping & Returns accordion */
  shippingReturnsBody?: string;
  shippingReturnsIsHtml?: boolean;
  authenticityPromise?: string;
  /** When true, omit sections with no Shopify-sourced copy (no mock fallbacks). */
  shopifyMode: boolean;
};

const MOCK_HIGHLIGHTS = [
  "100% Pure Pashmina",
  "Handwoven in Kashmir",
  "Ethically Made",
  "Limited Production",
];

function combinePolicyHtml(policies: CommerceShopPolicies): string | undefined {
  const parts: string[] = [];
  if (policies.shippingPolicyHtml?.trim()) parts.push(policies.shippingPolicyHtml.trim());
  if (policies.refundPolicyHtml?.trim()) parts.push(policies.refundPolicyHtml.trim());
  return parts.length ? parts.join("\n") : undefined;
}

export function resolveProductDetailContent(
  product: CommerceProduct,
  settings: CommerceStorefrontSettings,
  policies: CommerceShopPolicies,
  shopifyMode: boolean,
  mockAuthenticityPromise?: string,
): ProductDetailContent {
  const highlights = product.highlights?.length
    ? product.highlights
    : shopifyMode
      ? []
      : MOCK_HIGHLIGHTS;

  const shippingBadgeText = settings.shippingBadgeText;
  const returnsBadgeText = settings.returnsBadgeText;

  let shippingReturnsBody = product.shippingReturnsText?.trim();
  let shippingReturnsIsHtml = false;

  if (!shippingReturnsBody) {
    const policyHtml = combinePolicyHtml(policies);
    if (policyHtml) {
      shippingReturnsBody = policyHtml;
      shippingReturnsIsHtml = true;
    } else if (!shopifyMode) {
      shippingReturnsBody =
        "Complimentary worldwide express shipping. Free returns within 30 days.";
    }
  }

  const authenticityPromise =
    product.authenticityPromise?.trim() ||
    settings.authenticityPromise?.trim() ||
    (shopifyMode ? undefined : mockAuthenticityPromise);

  return {
    highlights,
    shippingBadgeText,
    returnsBadgeText,
    shippingReturnsBody,
    shippingReturnsIsHtml,
    authenticityPromise,
    shopifyMode,
  };
}
