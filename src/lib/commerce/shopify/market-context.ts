/** Storefront `@inContext` country/language for Markets pricing. */
export type ShopifyMarketContext = {
  country: string;
  language: string;
};

function normalizeCountry(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : undefined;
}

function normalizeLanguage(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : undefined;
}

/** Env-only fallback (sync) for scripts and legacy callers. */
export function getShopifyMarketContextFromEnv(): Partial<ShopifyMarketContext> {
  return {
    ...(normalizeCountry(process.env.NEXT_PUBLIC_SHOPIFY_COUNTRY)
      ? { country: normalizeCountry(process.env.NEXT_PUBLIC_SHOPIFY_COUNTRY)! }
      : {}),
    ...(normalizeLanguage(process.env.NEXT_PUBLIC_SHOPIFY_LANGUAGE)
      ? { language: normalizeLanguage(process.env.NEXT_PUBLIC_SHOPIFY_LANGUAGE)! }
      : {}),
  };
}

/** Inject `@inContext(country, language)` on Storefront queries and mutations. */
export function applyMarketContextToQuery(query: string, context: ShopifyMarketContext): string {
  const directive = `@inContext(country: ${context.country}, language: ${context.language})`;

  // Catalog/cart documents often lead with fragment definitions — target the first operation.
  const withContext = query.replace(
    /(^|\n)(\s*(?:query|mutation))(\s+[A-Za-z_]\w*)?(\([^)]*\))?(?=\s*\{)/,
    (_, before: string, op: string, name = "", variables = "") =>
      `${before}${op}${name}${variables} ${directive}`,
  );

  if (withContext !== query) return withContext;

  // Fallback for operation-only documents (e.g. localization bootstrap).
  return query.replace(
    /^\s*(query|mutation)(\s+[A-Za-z_]\w*)?(\([^)]*\))?/,
    (_, op: string, name = "", variables = "") => `${op}${name}${variables} ${directive}`,
  );
}

/** HTML `lang` attribute from market language + country. */
export function htmlLangFromMarket(context: ShopifyMarketContext): string {
  return `${context.language.toLowerCase()}-${context.country.toLowerCase()}`;
}

export const DEFAULT_SHOPIFY_MARKET: ShopifyMarketContext = {
  country: "US",
  language: "EN",
};
