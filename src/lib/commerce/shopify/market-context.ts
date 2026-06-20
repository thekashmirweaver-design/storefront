/** Optional Storefront `@inContext` country/language for Markets pricing. */
export type ShopifyMarketContext = {
  country?: string;
  language?: string;
};

export function getShopifyMarketContext(): ShopifyMarketContext {
  const country = process.env.NEXT_PUBLIC_SHOPIFY_COUNTRY?.trim();
  const language = process.env.NEXT_PUBLIC_SHOPIFY_LANGUAGE?.trim();
  return {
    ...(country ? { country: country.toUpperCase() } : {}),
    ...(language ? { language: language.toUpperCase() } : {}),
  };
}

/** Inject `@inContext` when market env vars are set; no-op otherwise. */
export function applyMarketContextToQuery(query: string): string {
  const { country, language } = getShopifyMarketContext();
  if (!country && !language) return query;

  const args: string[] = [];
  if (country) args.push(`country: ${country}`);
  if (language) args.push(`language: ${language}`);
  const directive = `@inContext(${args.join(", ")})`;

  return query.replace(
    /^(query|mutation)(\s+[A-Za-z_]\w*)?/m,
    (_, op: string, name = "") => `${op}${name} ${directive}`,
  );
}
