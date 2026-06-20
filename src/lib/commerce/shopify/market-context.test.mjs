import assert from "node:assert/strict";
import test from "node:test";

function applyMarketContextToQuery(query, context) {
  const directive = `@inContext(country: ${context.country}, language: ${context.language})`;
  const withContext = query.replace(
    /(^|\n)(\s*(?:query|mutation))(\s+[A-Za-z_]\w*)?(\([^)]*\))?(?=\s*\{)/,
    (_, before, op, name = "", variables = "") => `${before}${op}${name}${variables} ${directive}`,
  );
  if (withContext !== query) return withContext;
  return query.replace(
    /^\s*(query|mutation)(\s+[A-Za-z_]\w*)?(\([^)]*\))?/,
    (_, op, name = "", variables = "") => `${op}${name}${variables} ${directive}`,
  );
}

const context = { country: "GB", language: "EN" };

test("applyMarketContextToQuery injects @inContext on indented template-literal queries", () => {
  const query = `
  query Localization {
    localization {
      country { isoCode }
    }
  }
`;

  const result = applyMarketContextToQuery(query, context);
  assert.match(
    result,
    /query Localization @inContext\(country: GB, language: EN\) \{/,
  );
});

test("applyMarketContextToQuery injects @inContext after leading fragment definitions", () => {
  const query = `
  fragment ProductFields on Product {
    id
    priceRange { minVariantPrice { amount currencyCode } }
  }
  query Products($first: Int!) {
    products(first: $first) {
      nodes { ...ProductFields }
    }
  }
`;

  const result = applyMarketContextToQuery(query, context);
  assert.match(
    result,
    /query Products\(\$first: Int!\) @inContext\(country: GB, language: EN\) \{/,
  );
  assert.doesNotMatch(result, /fragment ProductFields @inContext/);
});

test("applyMarketContextToQuery injects @inContext on mutations", () => {
  const query = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) { cart { id } }
  }
`;

  const result = applyMarketContextToQuery(query, context);
  assert.match(
    result,
    /mutation CartCreate\(\$input: CartInput!\) @inContext\(country: GB, language: EN\) \{/,
  );
});
