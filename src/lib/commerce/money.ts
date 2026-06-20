/** BCP 47 locale from Shopify market country + language (e.g. EN + US → en-US). */
export function marketLocale(language: string, country: string): string {
  return `${language.toLowerCase()}-${country.toUpperCase()}`;
}

/** Format a monetary amount with Intl using market currency and locale. */
export function formatCommerceMoney(amount: number, currencyCode: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}
