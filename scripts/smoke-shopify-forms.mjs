#!/usr/bin/env node
/**
 * Smoke-test newsletter + contact forms against Shopify Admin API.
 * Usage: node scripts/smoke-shopify-forms.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");

function loadEnvLocal() {
  const envPath = resolve(root, ".env.local");
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
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2025-07";
const partnerAppDir =
  process.env.SHOPIFY_PARTNER_APP_DIR ?? "/tmp/shopify-probe/kashmir-weaver-probe";

if (!storeDomain) {
  console.error("✗ SHOPIFY_STORE_DOMAIN not set");
  process.exit(1);
}

if (!adminToken && !existsSync(partnerAppDir)) {
  console.error(
    "✗ Set SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_PARTNER_APP_DIR for Admin API access",
  );
  process.exit(1);
}

const stamp = Date.now();
const newsletterEmail = `smoke-newsletter-${stamp}@example.com`;
const contactEmail = `smoke-contact-${stamp}@example.com`;

async function adminRequest(query, variables) {
  if (adminToken) {
    const url = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    const body = await response.json();
    if (body.errors?.length) {
      throw new Error(body.errors.map((e) => e.message).join("; "));
    }
    return body.data;
  }

  const args = ["app", "execute", "--path", partnerAppDir, "-s", storeDomain, "-q", query.trim()];
  if (variables && Object.keys(variables).length) {
    const { mkdtempSync, rmSync, writeFileSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const tempDir = mkdtempSync(join(tmpdir(), "smoke-forms-"));
    writeFileSync(join(tempDir, "variables.json"), JSON.stringify(variables));
    args.push("--variable-file", join(tempDir, "variables.json"));
    const result = spawnSync("shopify", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });
    rmSync(tempDir, { recursive: true, force: true });
    if (result.status !== 0) {
      throw new Error(result.stderr?.trim() || result.stdout?.trim() || "shopify app execute failed");
    }
    const jsonMatch = result.stdout.match(/\{[\s\S]*\}\s*$/);
    if (!jsonMatch) throw new Error("Could not parse shopify app execute output");
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.errors?.length) throw new Error(parsed.errors.map((e) => e.message).join("; "));
    return parsed.data ?? parsed;
  }

  const result = spawnSync("shopify", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || result.stdout?.trim() || "shopify app execute failed");
  }
  const jsonMatch = result.stdout.match(/\{[\s\S]*\}\s*$/);
  if (!jsonMatch) throw new Error("Could not parse shopify app execute output");
  const parsed = JSON.parse(jsonMatch[0]);
  if (parsed.errors?.length) throw new Error(parsed.errors.map((e) => e.message).join("; "));
  return parsed.data ?? parsed;
}


async function testNewsletter() {
  const data = await adminRequest(
    `mutation CustomerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        userErrors { message }
        customer { id email tags }
      }
    }`,
    {
      input: {
        email: newsletterEmail,
        tags: ["newsletter"],
        emailMarketingConsent: {
          marketingState: "SUBSCRIBED",
          marketingOptInLevel: "SINGLE_OPT_IN",
          consentUpdatedAt: new Date().toISOString(),
        },
      },
    },
  );
  const errors = data.customerCreate?.userErrors ?? [];
  if (errors.length) throw new Error(errors.map((e) => e.message).join("; "));
  const customer = data.customerCreate?.customer;
  if (!customer?.id) throw new Error("Newsletter customerCreate returned no customer");
  console.log(`✓ Newsletter: created ${customer.email} (${customer.id})`);
}

async function testContact() {
  const note = `[Smoke test contact — ${new Date().toISOString()}]\nName: Smoke Tester\nSubject: Automated smoke test`;
  const data = await adminRequest(
    `mutation CustomerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        userErrors { message }
        customer { id email tags note }
      }
    }`,
    {
      input: {
        email: contactEmail,
        firstName: "Smoke",
        lastName: "Tester",
        note,
        tags: ["contact-form"],
      },
    },
  );
  const errors = data.customerCreate?.userErrors ?? [];
  if (errors.length) throw new Error(errors.map((e) => e.message).join("; "));
  const customer = data.customerCreate?.customer;
  if (!customer?.id) throw new Error("Contact customerCreate returned no customer");
  console.log(`✓ Contact: created ${customer.email} (${customer.id})`);
}

console.log(
  `Admin: ${adminToken ? "SHOPIFY_ADMIN_ACCESS_TOKEN" : `shopify app execute (${partnerAppDir})`}\n`,
);

try {
  await testNewsletter();
  await testContact();
  console.log("\n✓ Form smoke tests passed");
} catch (error) {
  console.error(`\n✗ Form smoke test failed: ${error.message}`);
  process.exit(1);
}
