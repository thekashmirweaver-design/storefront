/** Headless legal page routes — not sourced from Shopify policy URLs. */
export const brandLegalRoutes = {
  privacyPolicyUrl: "/privacy",
  termsUrl: "/terms",
} as const;

/** Default logo dimensions when Shopify metafields omit width/height. */
export const defaultLogoDimensions = {
  width: 48,
  height: 48,
} as const;
