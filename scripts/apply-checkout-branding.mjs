#!/usr/bin/env node
/**
 * Apply checkout branding via Partner app CLI (checkoutBrandingUpsert).
 * See https://shopify.dev/docs/api/admin-graphql/latest/mutations/checkoutBrandingUpsert
 *
 * Usage: pnpm checkout:branding
 * Requires: shopify CLI, SHOPIFY_PARTNER_APP_DIR, partner app scopes
 *   read_checkout_branding_settings + write_checkout_branding_settings
 */

import { readFileSync, existsSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { checkoutBranding } from "./seed-shopify-catalog-data.mjs";

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

const storeDomain =
  process.env.SHOPIFY_STORE_DOMAIN ?? "the-kashmir-weaver-nncjdd3t.myshopify.com";
const partnerAppDir =
  process.env.SHOPIFY_PARTNER_APP_DIR ?? "/tmp/shopify-probe/kashmir-weaver-probe";

function appExecute(query, variables) {
  const args = [
    "app",
    "execute",
    "--path",
    partnerAppDir,
    "-s",
    storeDomain,
    "-q",
    query.trim(),
  ];
  let tempDir;
  if (variables && Object.keys(variables).length) {
    tempDir = mkdtempSync(join(tmpdir(), "checkout-branding-"));
    writeFileSync(join(tempDir, "variables.json"), JSON.stringify(variables));
    args.push("--variable-file", join(tempDir, "variables.json"));
  }
  const result = spawnSync("shopify", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 20 * 1024 * 1024,
  });
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  const combined = [result.stderr, result.stdout].filter(Boolean).join("\n");
  if (/Access denied for checkoutBrandingUpsert/i.test(combined)) {
    throw new Error(
      combined.match(/Access denied for checkoutBrandingUpsert[^"]*/)?.[0] ??
        "Access denied for checkoutBrandingUpsert",
    );
  }
  if (result.status !== 0) {
    throw new Error(combined.trim() || "shopify app execute failed");
  }
  const jsonMatch = result.stdout.match(/\{[\s\S]*\}\s*$/);
  if (!jsonMatch) throw new Error("Could not parse shopify app execute output");
  const parsed = JSON.parse(jsonMatch[0]);
  if (parsed.errors?.length) {
    throw new Error(parsed.errors.map((e) => e.message).join("; "));
  }
  return parsed.data ?? parsed;
}

const MUTATION = `
mutation CheckoutBrandingUpsert($checkoutBrandingInput: CheckoutBrandingInput!, $checkoutProfileId: ID!) {
  checkoutBrandingUpsert(checkoutBrandingInput: $checkoutBrandingInput, checkoutProfileId: $checkoutProfileId) {
    checkoutBranding {
      designSystem { colors { global { brand accent } } }
      customizations { header { logo { image { url } maxWidth visibility } } }
    }
    userErrors { field message }
  }
}`;

async function main() {
  console.log("Checkout branding (checkoutBrandingUpsert via Shopify CLI)\n");
  console.log(`Store: ${storeDomain}`);
  console.log(`App:   ${partnerAppDir}\n`);

  const profileData = await appExecute(
    `{ checkoutProfiles(first: 1, query: "is_published:true") {
      edges { node { id name } }
    } }`,
  );
  const profileId = profileData.checkoutProfiles?.edges?.[0]?.node?.id;
  if (!profileId) {
    console.error("No published checkout profile found.");
    process.exit(1);
  }
  console.log(`Profile: ${profileData.checkoutProfiles.edges[0].node.name} (${profileId})`);

  const filesData = await appExecute(
    `{ files(first: 1, query: "kashmir-weaver-logo") {
      nodes { id ... on MediaImage { image { url } } }
    } }`,
  );
  const mediaImageId = filesData.files?.nodes?.[0]?.id;
  if (!mediaImageId) {
    console.error("Logo MediaImage not found. Run: pnpm seed:shopify -- --checkout-branding-only");
    process.exit(1);
  }
  console.log(`Logo:    ${filesData.files.nodes[0].image?.url}\n`);

  const checkoutBrandingInput = {
    designSystem: { colors: checkoutBranding.colors },
    customizations: {
      header: {
        logo: {
          image: { mediaImageId },
          maxWidth: checkoutBranding.logoMaxWidth,
          visibility: "VISIBLE",
        },
      },
    },
  };

  const data = await appExecute(MUTATION, {
    checkoutProfileId: profileId,
    checkoutBrandingInput,
  });

  const userErrors = data.checkoutBrandingUpsert?.userErrors ?? [];
  if (userErrors.length) {
    console.error("userErrors:", JSON.stringify(userErrors, null, 2));
    process.exit(1);
  }

  const branding = data.checkoutBrandingUpsert?.checkoutBranding;
  console.log("✓ Checkout branding applied");
  console.log(`  brand: ${branding?.designSystem?.colors?.global?.brand}`);
  console.log(`  logo:  ${branding?.customizations?.header?.logo?.image?.url ?? "set"}`);
  console.log("\nVerify: add to cart → checkout on dev store");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n✗ ${message}`);
  if (/Access denied for checkoutBrandingUpsert/i.test(message)) {
    console.error(
      "\nThis store cannot use checkoutBrandingUpsert via API (needs Plus or a dev store with\n" +
        "checkout branding / Developer Preview). Customize manually:\n" +
        "  Admin → Settings → Checkout → Customize (logo + colors)\n" +
        "  Admin → Settings → Customer accounts → Customize (login branding)",
    );
  }
  process.exit(1);
});
