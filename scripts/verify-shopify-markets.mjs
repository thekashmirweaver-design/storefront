#!/usr/bin/env node
/**
 * Verifies Shopify Markets / localization via Storefront API.
 * Usage: node scripts/verify-shopify-markets.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const provider = process.env.COMMERCE_PROVIDER ?? "mock";
const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

async function storefrontRequest(query, variables) {
  const url = `https://${storeDomain}/api/${apiVersion}/graphql.json`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  return body.data;
}

console.log("Shopify Markets / localization check\n");

if (provider !== "shopify") {
  console.log(`COMMERCE_PROVIDER=${provider} (not shopify — skipping)`);
  process.exit(0);
}

if (!storeDomain) fail("Missing SHOPIFY_STORE_DOMAIN");
if (!token) fail("Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN");

const LOCALIZATION_QUERY = `
  query Localization {
    localization {
      country { isoCode name currency { isoCode } }
      language { isoCode endonymName }
      availableCountries { isoCode name currency { isoCode } }
      availableLanguages { isoCode endonymName }
    }
  }
`;

const data = await storefrontRequest(LOCALIZATION_QUERY);
const loc = data?.localization;
if (!loc) fail("No localization payload returned");

const countries = loc.availableCountries ?? [];
const currencies = [...new Set(countries.map((c) => c.currency?.isoCode).filter(Boolean))];

console.log(`✓ Store default market: ${loc.country?.isoCode} (${loc.country?.currency?.isoCode})`);
console.log(`✓ Default language: ${loc.language?.isoCode} (${loc.language?.endonymName ?? "—"})`);
console.log(`✓ Available countries: ${countries.length}`);
console.log(`✓ Distinct currencies in country list: ${currencies.length} (${currencies.slice(0, 8).join(", ")}${currencies.length > 8 ? "…" : ""})`);

if (currencies.length <= 1) {
  console.log(
    "\nNote: All countries share one currency — configure additional Markets in Shopify Admin",
  );
  console.log("  (Settings → Markets) to enable localized pricing and currencies.");
}

console.log("\n✓ Markets Storefront localization is reachable");
