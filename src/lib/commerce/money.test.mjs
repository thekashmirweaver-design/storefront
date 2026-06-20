import assert from "node:assert/strict";
import test from "node:test";

function marketLocale(language, country) {
  return `${language.toLowerCase()}-${country.toUpperCase()}`;
}

function formatCommerceMoney(amount, currencyCode, locale) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

test("marketLocale builds BCP 47 tag", () => {
  assert.equal(marketLocale("EN", "US"), "en-US");
  assert.equal(marketLocale("FR", "CA"), "fr-CA");
});

test("formatCommerceMoney formats USD", () => {
  const formatted = formatCommerceMoney(1200, "USD", "en-US");
  assert.match(formatted, /\$1,200/);
});

test("formatCommerceMoney formats INR", () => {
  const formatted = formatCommerceMoney(9999, "INR", "en-IN");
  assert.match(formatted, /9,999/);
});
