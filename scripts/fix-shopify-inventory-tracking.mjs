#!/usr/bin/env node
/**
 * Enable inventory tracking on all seeded catalog products.
 * Usage: node scripts/fix-shopify-inventory-tracking.mjs
 */
import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { products } from "./seed-shopify-catalog-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

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

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN ?? "the-kashmir-weaver-nncjdd3t.myshopify.com";
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2025-07";
const partnerAppDir =
  process.env.SHOPIFY_PARTNER_APP_DIR ?? "/tmp/shopify-probe/kashmir-weaver-probe";

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
    if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join("; "));
    return body.data;
  }

  const args = ["app", "execute", "--path", partnerAppDir, "-s", storeDomain, "-q", query.trim()];
  let tempDir;
  if (variables && Object.keys(variables).length) {
    tempDir = mkdtempSync(join(tmpdir(), "inv-track-fix-"));
    writeFileSync(join(tempDir, "variables.json"), JSON.stringify(variables));
    args.push("--variable-file", join(tempDir, "variables.json"));
  }
  const result = spawnSync("shopify", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 20 * 1024 * 1024,
  });
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || result.stdout?.trim() || "shopify app execute failed");
  }
  const jsonMatch = result.stdout.match(/\{[\s\S]*\}\s*$/);
  if (!jsonMatch) throw new Error("Could not parse shopify app execute output");
  const parsed = JSON.parse(jsonMatch[0]);
  if (parsed.errors?.length) throw new Error(parsed.errors.map((e) => e.message).join("; "));
  return parsed.data ?? parsed;
}

async function getVariantInventoryItemId(handle) {
  const data = await adminRequest(
    `query($h: String!) {
      productByHandle(handle: $h) {
        handle
        variants(first: 1) {
          nodes {
            id
            inventoryItem { id tracked }
          }
        }
      }
    }`,
    { h: handle },
  );
  const variant = data.productByHandle?.variants?.nodes?.[0];
  return {
    handle,
    variantId: variant?.id,
    inventoryItemId: variant?.inventoryItem?.id,
    tracked: variant?.inventoryItem?.tracked,
  };
}

async function enableTracking(inventoryItemId) {
  const data = await adminRequest(
    `mutation InventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem { id tracked }
        userErrors { field message }
      }
    }`,
    { id: inventoryItemId, input: { tracked: true } },
  );
  const errors = data.inventoryItemUpdate?.userErrors ?? [];
  if (errors.length) throw new Error(JSON.stringify(errors));
  return data.inventoryItemUpdate?.inventoryItem?.tracked === true;
}

async function main() {
  console.log(`Enabling inventory tracking on ${products.length} products\n`);
  const results = [];

  for (const product of products) {
    const info = await getVariantInventoryItemId(product.handle);
    if (!info.inventoryItemId) {
      results.push({ handle: product.handle, status: "skipped", reason: "no inventory item" });
      console.log(`  ${product.handle}: skipped (no inventory item)`);
      continue;
    }
    if (info.tracked) {
      results.push({ handle: product.handle, status: "already_tracked" });
      console.log(`  ${product.handle}: already tracked`);
      continue;
    }
    const tracked = await enableTracking(info.inventoryItemId);
    results.push({ handle: product.handle, status: tracked ? "enabled" : "failed" });
    console.log(`  ${product.handle}: tracking ${tracked ? "enabled" : "FAILED"}`);
  }

  const enabled = results.filter((r) => r.status === "enabled").length;
  const already = results.filter((r) => r.status === "already_tracked").length;
  console.log(`\n✓ Done: ${enabled} enabled, ${already} already tracked, ${results.length} total`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
