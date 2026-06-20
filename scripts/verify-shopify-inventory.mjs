/**
 * Compare Shopify inventory: Admin API vs Storefront (metafield + quantityAvailable).
 */
import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

function loadEnv() {
  const envPath = ".env.local";
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

loadEnv();

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const sfVer = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";
const adminVer = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2025-07";
const partnerAppDir =
  process.env.SHOPIFY_PARTNER_APP_DIR ?? "/tmp/shopify-probe/kashmir-weaver-probe";
const handle = process.argv[2] ?? "black-jamawar-embroidery-pashmina";

async function adminRequest(query, variables) {
  if (adminToken) {
    const res = await fetch(`https://${storeDomain}/admin/api/${adminVer}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    const body = await res.json();
    if (body.errors?.length) throw new Error(JSON.stringify(body.errors));
    return body.data;
  }
  const args = ["app", "execute", "--path", partnerAppDir, "-s", storeDomain, "-q", query.trim()];
  let tempDir;
  if (variables && Object.keys(variables).length) {
    tempDir = mkdtempSync(join(tmpdir(), "inv-verify-"));
    writeFileSync(join(tempDir, "variables.json"), JSON.stringify(variables));
    args.push("--variable-file", join(tempDir, "variables.json"));
  }
  const result = spawnSync("shopify", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  const jsonMatch = result.stdout.match(/\{[\s\S]*\}\s*$/);
  if (!jsonMatch) throw new Error("parse failed");
  const parsed = JSON.parse(jsonMatch[0]);
  if (parsed.errors?.length) throw new Error(JSON.stringify(parsed.errors));
  return parsed.data ?? parsed;
}

async function storefrontRequest(query, variables) {
  const res = await fetch(`https://${storeDomain}/api/${sfVer}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

const adminData = await adminRequest(
  `query($h: String!) {
    productByHandle(handle: $h) {
      handle
      title
      metafield(namespace: "custom", key: "inventory_quantity") { value }
      variants(first: 1) {
        nodes {
          id
          inventoryPolicy
          inventoryQuantity
          inventoryItem { id tracked }
        }
      }
    }
  }`,
  { h: handle },
);

const sfWithInventory = await storefrontRequest(
  `query($h: String!) {
    product(handle: $h) {
      handle
      variants(first: 1) { nodes { quantityAvailable } }
      inventoryQuantityMetafield: metafield(namespace: "custom", key: "inventory_quantity") { value }
    }
  }`,
  { h: handle },
);

const sfNoInventory = await storefrontRequest(
  `query($h: String!) {
    product(handle: $h) {
      handle
      inventoryQuantityMetafield: metafield(namespace: "custom", key: "inventory_quantity") { value }
    }
  }`,
  { h: handle },
);

const variant = adminData?.productByHandle?.variants?.nodes?.[0];
const adminAvailable = variant?.inventoryQuantity;

const report = {
  handle,
  admin: {
    inventoryQuantity: variant?.inventoryQuantity,
    inventoryPolicy: variant?.inventoryPolicy,
    tracked: variant?.inventoryItem?.tracked,
    locationAvailable: adminAvailable,
    metafield_inventory_quantity: adminData?.productByHandle?.metafield?.value,
  },
  storefront: {
    quantityAvailable: sfWithInventory.data?.product?.variants?.nodes?.[0]?.quantityAvailable,
    quantityAvailableError: sfWithInventory.errors?.[0]?.message,
    metafield_inventory_quantity:
      sfNoInventory.data?.product?.inventoryQuantityMetafield?.value ??
      sfWithInventory.data?.product?.inventoryQuantityMetafield?.value,
  },
  appUses: {
    source:
      sfWithInventory.data?.product?.variants?.nodes?.[0]?.quantityAvailable != null
        ? "variant.quantityAvailable (live inventory scope)"
        : sfNoInventory.data?.product?.inventoryQuantityMetafield?.value != null
          ? "custom.inventory_quantity metafield (fallback)"
          : "none — no cap in UI",
    resolvedQuantity:
      sfWithInventory.data?.product?.variants?.nodes?.[0]?.quantityAvailable ??
      Number(sfNoInventory.data?.product?.inventoryQuantityMetafield?.value) ??
      null,
  },
  aligned:
    adminAvailable != null &&
    (sfWithInventory.data?.product?.variants?.nodes?.[0]?.quantityAvailable === adminAvailable ||
      Number(adminData?.productByHandle?.metafield?.value) === adminAvailable),
};

console.log(JSON.stringify(report, null, 2));
