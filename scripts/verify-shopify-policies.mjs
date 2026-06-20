#!/usr/bin/env node
/**
 * Verifies Shopify Storefront shop legal policies return HTML body.
 * Usage: node scripts/verify-shopify-policies.mjs
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

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

const POLICIES_QUERY = `
  query ShopPolicies {
    shop {
      shippingPolicy { body }
      refundPolicy { body }
      privacyPolicy { body }
      termsOfService { body }
    }
  }
`;

async function storefrontRequest(query) {
  const url = `https://${storeDomain}/api/${apiVersion}/graphql.json`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query }),
  });
  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  return body.data;
}

console.log("Shopify legal policies check\n");

if (!storeDomain) fail("Missing SHOPIFY_STORE_DOMAIN");
if (!token) fail("Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN");

let data;
try {
  data = await storefrontRequest(POLICIES_QUERY);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

const shop = data?.shop;
if (!shop) fail("Unexpected API response — no shop data returned");

const checks = [
  ["shippingPolicy", shop.shippingPolicy?.body],
  ["refundPolicy", shop.refundPolicy?.body],
  ["privacyPolicy", shop.privacyPolicy?.body],
  ["termsOfService", shop.termsOfService?.body],
];

let missing = 0;
for (const [name, body] of checks) {
  const len = body?.trim().length ?? 0;
  const ok = len > 0;
  console.log(`  ${ok ? "✓" : "✗"} shop.${name} — ${len} chars`);
  if (!ok) missing += 1;
}

if (missing) {
  fail(
    `${missing} policy/policies empty. Run \`pnpm seed:shopify -- --policies-only\` ` +
      "after partner app has write_legal_policies scope.",
  );
}

console.log("\n✓ All shop legal policies present in Storefront API\n");
