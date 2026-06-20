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
const blogHandle = process.env.SHOPIFY_BLOG_HANDLE ?? "news";

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
    const code = body.errors[0]?.extensions?.code ?? "UNKNOWN";
    throw new Error(`Storefront API error (${code}): ${body.errors[0]?.message ?? "unknown"}`);
  }
  return body.data;
}

console.log("Shopify connection check\n");

if (provider !== "shopify") {
  console.log(`COMMERCE_PROVIDER=${provider} (not shopify — skipping API test)`);
  process.exit(0);
}

if (!storeDomain) fail("Missing SHOPIFY_STORE_DOMAIN");
if (!token) fail("Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN");

const CATALOG_QUERY = `
  query VerifyCatalog($blogHandle: String!, $mainMenuHandle: String!, $footerMenuHandle: String!) {
    shop {
      name
      primaryDomain { url }
      brandTaglineMetafield: metafield(namespace: "custom", key: "brand_tagline") { value }
      contactEmailMetafield: metafield(namespace: "custom", key: "contact_email") { value }
    }
    mainMenu: menu(handle: $mainMenuHandle) {
      title
      items { title url }
    }
    footerMenu: menu(handle: $footerMenuHandle) {
      title
      items { title items { title url } }
    }
    collections(first: 10) {
      nodes {
        handle
        title
        image { url }
      }
    }
    products(first: 20) {
      nodes {
        handle
        title
        featuredImage { url }
        images(first: 1) { nodes { url } }
        options {
          name
          optionValues { name }
        }
        variants(first: 1) {
          nodes {
            selectedOptions { name value }
          }
        }
        collections(first: 1) {
          nodes { handle }
        }
        productType
        tags
      }
    }
    blog(handle: $blogHandle) {
      handle
      title
      articles(first: 10) {
        nodes {
          handle
          title
          excerpt
          tags
          image { url }
        }
      }
    }
  }
`;

let data;
try {
  data = await storefrontRequest(CATALOG_QUERY, {
    blogHandle,
    mainMenuHandle: "main-menu",
    footerMenuHandle: "footer",
  });
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

if (!data?.shop) {
  fail("Unexpected API response — no shop data returned");
}

const { name, primaryDomain } = data.shop;
const mainMenu = data.mainMenu;
const footerMenu = data.footerMenu;
const brandTagline = data.shop?.brandTaglineMetafield?.value?.trim();
const contactEmail = data.shop?.contactEmailMetafield?.value?.trim();
const collections = data.collections?.nodes ?? [];
const products = data.products?.nodes ?? [];
const blog = data.blog;
const articles = blog?.articles?.nodes ?? [];

const collectionsWithImages = collections.filter((c) => c.image?.url);
const productsWithImages = products.filter(
  (p) => p.featuredImage?.url || p.images?.nodes?.[0]?.url,
);
const articlesWithImages = articles.filter((a) => a.image?.url);
const productsWithColorOption = products.filter((p) =>
  (p.options ?? []).some((o) => o.name === "Color"),
);
const productsWithCollection = products.filter((p) => p.collections?.nodes?.[0]?.handle);
const productsWithProductType = products.filter((p) => p.productType?.trim());
const articlesWithTags = articles.filter((a) => (a.tags ?? []).length > 0);

console.log("✓ Storefront API connected");
console.log(`  Shop:     ${name}`);
console.log(`  Domain:   ${primaryDomain?.url ?? storeDomain}`);
console.log(`  Provider: shopify (${apiVersion})`);
console.log(
  `  Collections: ${collections.length} (${collectionsWithImages.length} with hero images)`,
);
console.log(`  Products:    ${products.length} (${productsWithImages.length} with images)`);
console.log(
  `  Blog:        ${blog ? `"${blog.handle}" — ${articles.length} articles (${articlesWithImages.length} with images, ${articlesWithTags.length} with tags)` : `missing (handle: ${blogHandle})`}`,
);
console.log(
  `  Catalog fidelity: ${productsWithColorOption.length}/${products.length} with Color option, ${productsWithCollection.length}/${products.length} with collection, ${productsWithProductType.length}/${products.length} with productType`,
);
console.log(
  `  Brand:      tagline ${brandTagline ? "✓" : "—"}, contact ${contactEmail ? "✓" : "—"}`,
);
console.log(
  `  Menus:      main-menu ${mainMenu?.items?.length ?? 0} links, footer ${footerMenu?.items?.length ?? 0} columns`,
);

const warnings = [];
if (collections.length < 3)
  warnings.push("Expected at least 3 collections — run `pnpm seed:shopify`");
if (collectionsWithImages.length < 3)
  warnings.push("Expected 3 collection hero images — run `pnpm seed:shopify`");
if (products.length < 9) warnings.push("Expected at least 9 products — run `pnpm seed:shopify`");
if (productsWithImages.length < 9)
  warnings.push("Expected product media on all flagship products — run `pnpm seed:shopify`");
if (!blog) warnings.push(`Blog "${blogHandle}" not found — run \`pnpm seed:shopify\``);
if (blog && articles.length < 2)
  warnings.push("Expected at least 2 journal articles — run `pnpm seed:shopify`");
if (products.length >= 9 && productsWithColorOption.length < products.length) {
  warnings.push(
    `${products.length - productsWithColorOption.length} product(s) missing Color option — run \`pnpm seed:shopify\``,
  );
}
if (products.length >= 9 && productsWithCollection.length < products.length) {
  warnings.push(
    `${products.length - productsWithCollection.length} product(s) missing collection membership`,
  );
}
if (blog && articles.length >= 2 && articlesWithTags.length < articles.length) {
  warnings.push("Some journal articles missing tags — category filters need first tag per article");
}
if (!brandTagline) {
  warnings.push("Shop brand_tagline metafield missing — run `pnpm seed:shopify` for Phase 3 brand fields");
}
if (!mainMenu?.items?.length) {
  warnings.push(
    'Main menu "main-menu" empty or missing — run `pnpm seed:shopify` (needs write_online_store_navigation scope)',
  );
}
if (!footerMenu?.items?.length) {
  warnings.push(
    'Footer menu "footer" empty or missing — run `pnpm seed:shopify` (needs write_online_store_navigation scope)',
  );
}

if (warnings.length) {
  console.log("\n⚠ Checks:");
  for (const w of warnings) console.log(`  • ${w}`);
} else {
  console.log("\n✓ Phase 0 catalog checks passed");
  if (products.length >= 9) console.log("✓ Phase 1 catalog fidelity checks passed");
}

console.log("\nRun `pnpm dev:shopify` to start the app with live catalog data.\n");
