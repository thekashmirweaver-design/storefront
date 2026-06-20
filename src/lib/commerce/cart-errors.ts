import type { CommerceCartWarning } from "./types";

/** Strip server action prefix (e.g. "cartLinesUpdate: ") from Shopify cart errors. */
export function getCartActionErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    const colon = error.message.indexOf(": ");
    return colon >= 0 ? error.message.slice(colon + 2) : error.message;
  }
  return fallback;
}

const CART_WARNING_MESSAGES: Record<string, string> = {
  MERCHANDISE_NOT_ENOUGH_STOCK:
    "We adjusted the quantity to match available stock.",
  MERCHANDISE_OUT_OF_STOCK: "This piece is no longer available in the quantity requested.",
};

export function formatCartWarningMessage(warning: CommerceCartWarning): string {
  if (warning.message?.trim()) return warning.message.trim();
  return CART_WARNING_MESSAGES[warning.code] ?? "Your bag was updated to reflect available stock.";
}
