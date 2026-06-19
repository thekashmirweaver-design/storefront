#!/usr/bin/env node
/**
 * Verifies Shopify Storefront API credentials in .env.local (or process env).
 * Usage: node scripts/verify-shopify-connection.mjs
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
    const value = trimmed.slice(eq + 1).trim();
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

console.log("Shopify connection check\n");

if (provider !== "shopify") {
  console.log(`COMMERCE_PROVIDER=${provider} (not shopify — skipping API test)`);
  process.exit(0);
}

if (!storeDomain) fail("Missing SHOPIFY_STORE_DOMAIN");
if (!token) fail("Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN");

const url = `https://${storeDomain}/api/${apiVersion}/graphql.json`;
const query = `{ shop { name primaryDomain { url } } products(first: 1) { nodes { title } } }`;

let response;
try {
  response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query }),
  });
} catch (error) {
  fail(`Network error: ${error instanceof Error ? error.message : String(error)}`);
}

const body = await response.json();

if (body.errors?.length) {
  const code = body.errors[0]?.extensions?.code ?? "UNKNOWN";
  fail(`Storefront API rejected the token (${code}). Regenerate via docs/shopify-store-setup.md`);
}

if (!body.data?.shop) {
  fail("Unexpected API response — no shop data returned");
}

const { name, primaryDomain } = body.data.shop;
const productCount = body.data.products?.nodes?.length ?? 0;

console.log("✓ Storefront API connected");
console.log(`  Shop:     ${name}`);
console.log(`  Domain:   ${primaryDomain?.url ?? storeDomain}`);
console.log(`  Provider: shopify (${apiVersion})`);
console.log(`  Products: ${productCount} returned in sample query (store may be empty)`);
console.log("\nRun `pnpm dev:shopify` to start the app with live catalog data.\n");
