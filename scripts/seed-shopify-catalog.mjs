#!/usr/bin/env node
/**
 * Seeds / enriches Shopify catalog with full Admin fields + mock images.
 *
 * Usage:
 *   pnpm seed:shopify          # create missing + enrich all fields/images
 *   pnpm seed:shopify -- --enrich-only   # skip creates, only update existing
 *   pnpm seed:shopify -- --policies-only # shop legal policies only (fast)
 *
 * Requires SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_PARTNER_APP_DIR (see docs).
 */

import { readFileSync, existsSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import {
  collectionMetafieldDefinitions,
  productMetafieldDefinitions,
  shopMetafieldDefinitions,
  shopMetafields,
  shopPolicies,
  collections,
  products,
  articles,
  BLOG_HANDLE,
  BLOG_TITLE,
  VENDOR,
  navigationMenus,
} from "./seed-shopify-catalog-data.mjs";
import {
  replaceProductMedia,
  uploadCollectionImage,
  uploadArticleImage,
  productHasMedia,
} from "./lib/shopify-media.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const enrichOnly = process.argv.includes("--enrich-only");
const policiesOnly = process.argv.includes("--policies-only");

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
const blogHandle = process.env.SHOPIFY_BLOG_HANDLE ?? BLOG_HANDLE;
const partnerAppDir =
  process.env.SHOPIFY_PARTNER_APP_DIR ?? "/tmp/shopify-probe/kashmir-weaver-probe";

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

function escapeGqlString(value) {
  return JSON.stringify(value);
}

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

  let tempDir;
  if (variables && Object.keys(variables).length) {
    tempDir = mkdtempSync(join(tmpdir(), "shopify-seed-"));
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
    throw new Error(
      result.stderr?.trim() ||
        result.stdout?.trim() ||
        "shopify app execute failed — set SHOPIFY_PARTNER_APP_DIR or SHOPIFY_ADMIN_ACCESS_TOKEN",
    );
  }

  const jsonMatch = result.stdout.match(/\{[\s\S]*\}\s*$/);
  if (!jsonMatch) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(detail || "Could not parse shopify app execute output");
  }
  const parsed = JSON.parse(jsonMatch[0]);
  if (parsed.errors?.length) {
    throw new Error(parsed.errors.map((e) => e.message).join("; "));
  }
  return parsed.data ?? parsed;
}

async function ensureMetafieldDefinitions(definitions, ownerType) {
  for (const def of definitions) {
    const data = await adminRequest(
      `mutation MetafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          userErrors { field message }
        }
      }`,
      {
        definition: {
          name: def.name,
          namespace: "custom",
          key: def.key,
          type: def.type ?? "single_line_text_field",
          ownerType,
          access: { storefront: "PUBLIC_READ" },
        },
      },
    );
    const errors = data.metafieldDefinitionCreate?.userErrors ?? [];
    const duplicate = errors.some((e) =>
      /taken|already exists|duplicate|in use/i.test(e.message ?? ""),
    );
    if (errors.length && !duplicate) {
      throw new Error(`metafieldDefinitionCreate(${def.key}): ${JSON.stringify(errors)}`);
    }
    console.log(`  • custom.${def.key}${duplicate ? " (exists)" : ""}`);
  }
}

async function ensurePrivacyPolicyManual() {
  const settings = await adminRequest(`{ privacySettings { privacyPolicy { autoManaged } } }`);
  if (!settings.privacySettings?.privacyPolicy?.autoManaged) {
    console.log("  privacy policy auto-management already off");
    return;
  }

  const data = await adminRequest(
    `mutation PrivacyFeaturesDisable {
      privacyFeaturesDisable(featuresToDisable: [PRIVACY_POLICY]) {
        featuresDisabled
        userErrors { field message }
      }
    }`,
  );
  const errors = data.privacyFeaturesDisable?.userErrors ?? [];
  if (errors.length) {
    throw new Error(`privacyFeaturesDisable: ${JSON.stringify(errors)}`);
  }
  console.log("  privacy policy auto-management disabled");
}

async function ensureShopPolicies() {
  for (const [type, body] of [
    ["SHIPPING_POLICY", shopPolicies.shipping],
    ["REFUND_POLICY", shopPolicies.refund],
    ["TERMS_OF_SERVICE", shopPolicies.terms],
  ]) {
    const data = await adminRequest(
      `mutation ShopPolicyUpdate($shopPolicy: ShopPolicyInput!) {
        shopPolicyUpdate(shopPolicy: $shopPolicy) {
          userErrors { field message }
        }
      }`,
      { shopPolicy: { type, body } },
    );
    const errors = data.shopPolicyUpdate?.userErrors ?? [];
    if (errors.length) throw new Error(`shopPolicyUpdate(${type}): ${JSON.stringify(errors)}`);
    console.log(`  shop policy ${type.toLowerCase()}`);
  }

  try {
    await ensurePrivacyPolicyManual();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const needsScope = /read_privacy_settings|write_privacy_settings/i.test(message);
    const manualHint = needsScope
      ? "Add read_privacy_settings + write_privacy_settings to partner app, re-install, then re-run."
      : "Admin → Settings → Customer privacy → Privacy policy → turn off automated policy, Save.";
    throw new Error(`privacy policy prep failed (${message}). ${manualHint}`);
  }

  const data = await adminRequest(
    `mutation ShopPolicyUpdate($shopPolicy: ShopPolicyInput!) {
      shopPolicyUpdate(shopPolicy: $shopPolicy) {
        userErrors { field message }
      }
    }`,
    { shopPolicy: { type: "PRIVACY_POLICY", body: shopPolicies.privacy } },
  );
  const errors = data.shopPolicyUpdate?.userErrors ?? [];
  if (errors.length) throw new Error(`shopPolicyUpdate(PRIVACY_POLICY): ${JSON.stringify(errors)}`);
  console.log("  shop policy privacy_policy");
}

async function ensureShopMetafields() {
  const shopData = await adminRequest(`{ shop { id } }`);
  const shopId = shopData.shop?.id;
  if (!shopId) throw new Error("Could not resolve shop id");

  const types = Object.fromEntries(
    shopMetafieldDefinitions.map((def) => [def.key, def.type ?? "single_line_text_field"]),
  );

  const data = await adminRequest(
    `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        userErrors { field message }
      }
    }`,
    {
      metafields: Object.entries(shopMetafields).map(([key, value]) => ({
        ownerId: shopId,
        namespace: "custom",
        key,
        type: types[key],
        value,
      })),
    },
  );
  const errors = data.metafieldsSet?.userErrors ?? [];
  if (errors.length) throw new Error(`shop metafieldsSet: ${JSON.stringify(errors)}`);
  console.log("  shop metafields (PDP badges + brand chrome)");
}

function mapMenuItemsForAdmin(items) {
  return items.map((item) => ({
    title: item.title,
    type: "HTTP",
    url: item.url,
    items: mapMenuItemsForAdmin(item.items ?? []),
  }));
}

async function getMenuIdByHandle(handle) {
  const data = await adminRequest(
    `query MenusByHandle($query: String!) {
      menus(first: 10, query: $query) {
        nodes { id handle }
      }
    }`,
    { query: `handle:${handle}` },
  );
  return data.menus?.nodes?.find((menu) => menu.handle === handle)?.id;
}

async function ensureNavigationMenus() {
  for (const menuDef of navigationMenus) {
    const items = mapMenuItemsForAdmin(menuDef.items);
    const existingId = await getMenuIdByHandle(menuDef.handle);

    if (existingId) {
      const data = await adminRequest(
        `mutation MenuUpdate($id: ID!, $title: String!, $handle: String!, $items: [MenuItemUpdateInput!]!) {
          menuUpdate(id: $id, title: $title, handle: $handle, items: $items) {
            menu { handle }
            userErrors { field message }
          }
        }`,
        {
          id: existingId,
          title: menuDef.title,
          handle: menuDef.handle,
          items,
        },
      );
      const errors = data.menuUpdate?.userErrors ?? [];
      if (errors.length) {
        throw new Error(`menuUpdate(${menuDef.handle}): ${JSON.stringify(errors)}`);
      }
      console.log(`  menu ${menuDef.handle} (updated)`);
      continue;
    }

    const data = await adminRequest(
      `mutation MenuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
        menuCreate(title: $title, handle: $handle, items: $items) {
          menu { handle }
          userErrors { field message }
        }
      }`,
      {
        title: menuDef.title,
        handle: menuDef.handle,
        items,
      },
    );
    const errors = data.menuCreate?.userErrors ?? [];
    if (errors.length) {
      throw new Error(`menuCreate(${menuDef.handle}): ${JSON.stringify(errors)}`);
    }
    console.log(`  menu ${menuDef.handle} (created)`);
  }
}

async function getPublications() {
  const data = await adminRequest(`{ publications(first: 10) { nodes { id name } } }`);
  const nodes = data.publications?.nodes ?? [];
  const online = nodes.find((n) => n.name === "Online Store");
  const headless = nodes.find((n) => /headless/i.test(n.name ?? ""));
  if (!online || !headless) {
    throw new Error(
      `Missing publications (found: ${nodes.map((n) => n.name).join(", ")}). ` +
        "Grant read_publications + write_publications on your Admin app.",
    );
  }
  return { onlineId: online.id, headlessId: headless.id };
}

async function publishToStorefront(id, publicationIds) {
  const data = await adminRequest(
    `mutation PublishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }`,
    { id, input: publicationIds.map((publicationId) => ({ publicationId })) },
  );
  const errors = data.publishablePublish?.userErrors ?? [];
  if (errors.length) throw new Error(`publishablePublish: ${JSON.stringify(errors)}`);
}

function metafieldsInput(metafields, types = {}) {
  return Object.entries(metafields).map(([key, value]) => ({
    namespace: "custom",
    key,
    value: Array.isArray(value) ? JSON.stringify(value) : value,
    type: types[key] ?? "single_line_text_field",
  }));
}

const PRODUCT_METAFIELD_TYPES = Object.fromEntries(
  productMetafieldDefinitions.map((def) => [def.key, def.type ?? "single_line_text_field"]),
);

async function findCollectionByHandle(handle) {
  const data = await adminRequest(
    `{ collectionByHandle(handle: ${escapeGqlString(handle)}) { id handle } }`,
  );
  return data.collectionByHandle;
}

async function findProductByHandle(handle) {
  const data = await adminRequest(
    `{ productByHandle(handle: ${escapeGqlString(handle)}) {
      id handle
      variants(first: 1) { nodes { id } }
    } }`,
  );
  return data.productByHandle;
}

async function ensureColorOption(productId, colorName) {
  const data = await adminRequest(
    `query ProductOptions($id: ID!) {
      product(id: $id) { options { name } }
    }`,
    { id: productId },
  );
  const hasColor = (data.product?.options ?? []).some((o) => o.name === "Color");
  if (hasColor) return;

  const created = await adminRequest(
    `mutation ProductOptionsCreate($productId: ID!, $options: [OptionCreateInput!]!) {
      productOptionsCreate(productId: $productId, options: $options) {
        userErrors { field message }
      }
    }`,
    {
      productId,
      options: [{ name: "Color", values: [{ name: colorName }] }],
    },
  );
  const errors = created.productOptionsCreate?.userErrors ?? [];
  if (errors.length) throw new Error(`productOptionsCreate: ${JSON.stringify(errors)}`);
}

async function setVariantPricing(productId, variantId, record) {
  const variantInput = {
    id: variantId,
    price: record.price,
    compareAtPrice: record.compareAtPrice,
    inventoryPolicy: "DENY",
    optionValues: [{ optionName: "Color", name: record.color }],
    inventoryItem: record.sku ? { sku: record.sku } : undefined,
  };

  const data = await adminRequest(
    `mutation ProductVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          price
          compareAtPrice
        }
        userErrors { field message }
      }
    }`,
    { productId, variants: [variantInput] },
  );
  const errors = data.productVariantsBulkUpdate?.userErrors ?? [];
  if (errors.length) throw new Error(`productVariantsBulkUpdate: ${JSON.stringify(errors)}`);

  const variant = data.productVariantsBulkUpdate?.productVariants?.[0];
  console.log(
    `    ↳ price $${record.price} / compare-at $${record.compareAtPrice}` +
      (variant?.compareAtPrice ? " ✓" : ""),
  );
}

let cachedPrimaryLocationId;

async function getPrimaryLocationId() {
  if (cachedPrimaryLocationId) return cachedPrimaryLocationId;
  const data = await adminRequest(
    `query ShopLocations { locations(first: 1) { nodes { id } } }`,
  );
  const locationId = data.locations?.nodes?.[0]?.id;
  if (!locationId) throw new Error("No Shopify location found for inventory seeding");
  cachedPrimaryLocationId = locationId;
  return locationId;
}

async function setVariantInventory(variantId, quantity) {
  if (quantity == null || quantity < 0) return;

  const variantData = await adminRequest(
    `query VariantInventory($id: ID!) {
      productVariant(id: $id) {
        inventoryItem { id }
      }
    }`,
    { id: variantId },
  );
  const inventoryItemId = variantData.productVariant?.inventoryItem?.id;
  if (!inventoryItemId) {
    console.log("    ↳ inventory skipped (no inventory item on variant)");
    return;
  }

  const locationId = await getPrimaryLocationId();
  const idemSuffix = `${inventoryItemId}-${locationId}`.replace(/[^a-zA-Z0-9_-]/g, "-");

  const levelData = await adminRequest(
    `query ItemInventoryLevel($itemId: ID!, $locationId: ID!) {
      inventoryItem(id: $itemId) {
        inventoryLevel(locationId: $locationId) {
          quantities(names: ["available"]) { quantity }
        }
      }
    }`,
    { itemId: inventoryItemId, locationId },
  );
  const changeFromQuantity =
    levelData.inventoryItem?.inventoryLevel?.quantities?.[0]?.quantity ?? 0;

  const activate = await adminRequest(
    `mutation InventoryActivate($inventoryItemId: ID!, $locationId: ID!) {
      inventoryActivate(inventoryItemId: $inventoryItemId, locationId: $locationId) @idempotent(key: "seed-activate-v2-${idemSuffix}") {
        userErrors { field message }
      }
    }`,
    { inventoryItemId, locationId },
  );
  const activateErrors = activate.inventoryActivate?.userErrors ?? [];
  const blockingActivateErrors = activateErrors.filter(
    (err) => !String(err.message ?? "").includes("already active"),
  );
  if (blockingActivateErrors.length) {
    throw new Error(`inventoryActivate: ${JSON.stringify(blockingActivateErrors)}`);
  }

  const setQty = await adminRequest(
    `mutation InventorySetQuantities($input: InventorySetQuantitiesInput!) {
      inventorySetQuantities(input: $input) @idempotent(key: "seed-set-v3-${idemSuffix}") {
        userErrors { field message }
      }
    }`,
    {
      input: {
        name: "available",
        reason: "correction",
        quantities: [{ inventoryItemId, locationId, quantity, changeFromQuantity }],
      },
    },
  );
  const setErrors = setQty.inventorySetQuantities?.userErrors ?? [];
  if (setErrors.length) throw new Error(`inventorySetQuantities: ${JSON.stringify(setErrors)}`);

  console.log(`    ↳ inventory ${quantity} at primary location (DENY policy)`);
}

async function upsertCollection(record, publicationIds) {
  let collectionId;
  const existing = await findCollectionByHandle(record.handle);

  const imageSrc = record.image
    ? await uploadCollectionImage(adminRequest, record.image)
    : undefined;

  const input = {
    title: record.title,
    handle: record.handle,
    descriptionHtml: record.descriptionHtml,
    metafields: metafieldsInput(record.metafields),
    seo: {
      title: record.seoTitle,
      description: record.seoDescription,
    },
    ...(imageSrc ? { image: { src: imageSrc, altText: record.image.alt } } : {}),
  };

  async function runCollectionUpdate(payload) {
    return adminRequest(
      `mutation CollectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection { id handle image { url altText } }
          userErrors { field message }
        }
      }`,
      { input: payload },
    );
  }

  if (existing) {
    const data = await runCollectionUpdate({ id: existing.id, ...input });
    const errors = data.collectionUpdate?.userErrors ?? [];
    if (errors.length)
      throw new Error(`collectionUpdate(${record.handle}): ${JSON.stringify(errors)}`);
    collectionId = existing.id;
    const imageUrl = data.collectionUpdate?.collection?.image?.url;
    console.log(`  collection ${record.handle} (updated${imageUrl ? ", hero image set" : ""})`);
  } else if (!enrichOnly) {
    const data = await adminRequest(
      `mutation CollectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection { id handle }
          userErrors { field message }
        }
      }`,
      { input },
    );
    const errors = data.collectionCreate?.userErrors ?? [];
    if (errors.length)
      throw new Error(`collectionCreate(${record.handle}): ${JSON.stringify(errors)}`);
    collectionId = data.collectionCreate.collection.id;
    console.log(`  collection ${record.handle} (created)`);
  } else {
    console.log(`  collection ${record.handle} (skipped — not found)`);
    return null;
  }

  await publishToStorefront(collectionId, publicationIds);
  return collectionId;
}

async function upsertProduct(record, collectionId, publicationIds) {
  let productId;
  let variantId;
  const existing = await findProductByHandle(record.handle);

  const productInput = {
    title: record.title,
    handle: record.handle,
    descriptionHtml: record.descriptionHtml,
    vendor: record.vendor,
    productType: record.productType,
    tags: record.tags,
    status: "ACTIVE",
    seo: {
      title: record.seoTitle,
      description: record.seoDescription,
    },
  };

  const createInput = {
    ...productInput,
    productOptions: [{ name: "Color", values: [{ name: record.color }] }],
  };

  if (existing) {
    const data = await adminRequest(
      `mutation ProductUpdate($product: ProductUpdateInput!) {
        productUpdate(product: $product) {
          product {
            id
            variants(first: 1) { nodes { id } }
          }
          userErrors { field message }
        }
      }`,
      { product: { id: existing.id, ...productInput } },
    );
    const errors = data.productUpdate?.userErrors ?? [];
    if (errors.length)
      throw new Error(`productUpdate(${record.handle}): ${JSON.stringify(errors)}`);
    productId = existing.id;
    variantId = data.productUpdate.product.variants.nodes[0]?.id ?? existing.variants.nodes[0].id;
    await ensureColorOption(productId, record.color);
    console.log(`  product ${record.handle} (updated)`);
  } else if (!enrichOnly) {
    const data = await adminRequest(
      `mutation ProductCreate($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            variants(first: 1) { nodes { id } }
          }
          userErrors { field message }
        }
      }`,
      { product: createInput },
    );
    const errors = data.productCreate?.userErrors ?? [];
    if (errors.length)
      throw new Error(`productCreate(${record.handle}): ${JSON.stringify(errors)}`);
    productId = data.productCreate.product.id;
    variantId = data.productCreate.product.variants.nodes[0].id;
    console.log(`  product ${record.handle} (created)`);
  } else {
    console.log(`  product ${record.handle} (skipped — not found)`);
    return;
  }

  await adminRequest(
    `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        ...Object.entries(record.metafields).map(([key, value]) => ({
          ownerId: productId,
          namespace: "custom",
          key,
          type: PRODUCT_METAFIELD_TYPES[key] ?? "single_line_text_field",
          value: Array.isArray(value) ? JSON.stringify(value) : value,
        })),
        {
          ownerId: productId,
          namespace: "custom",
          key: "inventory_quantity",
          type: "number_integer",
          value: String(record.inventoryQuantity ?? 50),
        },
      ],
    },
  );

  await setVariantPricing(productId, variantId, record);
  await setVariantInventory(variantId, record.inventoryQuantity ?? 50);

  const hasMedia = await productHasMedia(adminRequest, productId);
  if (hasMedia) {
    console.log(`    ↳ media already present (${record.images.length} images expected)`);
  } else {
    console.log(`    ↳ uploading ${record.images.length} images…`);
    await replaceProductMedia(adminRequest, productId, record.images);
  }

  if (collectionId) {
    await adminRequest(
      `mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          userErrors { field message }
        }
      }`,
      { id: collectionId, productIds: [productId] },
    );
  }

  await publishToStorefront(productId, publicationIds);
}

async function findBlogByHandle(handle) {
  const data = await adminRequest(
    `{ blogs(first: 10, query: ${escapeGqlString(`handle:${handle}`)}) { nodes { id handle title } } }`,
  );
  return data.blogs?.nodes?.[0] ?? null;
}

async function ensureBlog(handle, title) {
  const existing = await findBlogByHandle(handle);
  if (existing) {
    console.log(`  blog ${handle} (exists)`);
    return existing.id;
  }

  const data = await adminRequest(
    `mutation BlogCreate($blog: BlogCreateInput!) {
      blogCreate(blog: $blog) {
        blog { id handle }
        userErrors { field message }
      }
    }`,
    { blog: { title, handle } },
  );
  const errors = data.blogCreate?.userErrors ?? [];
  if (errors.length) throw new Error(`blogCreate(${handle}): ${JSON.stringify(errors)}`);
  console.log(`  blog ${handle} (created)`);
  return data.blogCreate.blog.id;
}

async function findArticleByHandle(blogId, handle) {
  const data = await adminRequest(
    `query BlogArticles($id: ID!) {
      blog(id: $id) {
        articles(first: 50) {
          nodes { id handle }
        }
      }
    }`,
    { id: blogId },
  );
  return data.blog?.articles?.nodes?.find((node) => node.handle === handle) ?? null;
}

async function upsertArticle(blogId, record) {
  const existing = await findArticleByHandle(blogId, record.handle);
  const imageUrl = record.image ? await uploadArticleImage(adminRequest, record.image) : undefined;

  const articleInput = {
    blogId,
    title: record.title,
    handle: record.handle,
    author: { name: VENDOR },
    body: record.bodyHtml,
    summary: record.excerpt,
    tags: record.tags ?? [record.category],
    isPublished: true,
    publishDate: record.publishDate,
    ...(imageUrl ? { image: { url: imageUrl, altText: record.image.alt } } : {}),
  };

  if (existing) {
    const { blogId: _blogId, ...updateFields } = articleInput;
    const data = await adminRequest(
      `mutation ArticleUpdate($id: ID!, $article: ArticleUpdateInput!) {
        articleUpdate(id: $id, article: $article) {
          article { id handle }
          userErrors { field message }
        }
      }`,
      { id: existing.id, article: updateFields },
    );
    const errors = data.articleUpdate?.userErrors ?? [];
    if (errors.length)
      throw new Error(`articleUpdate(${record.handle}): ${JSON.stringify(errors)}`);
    console.log(`  article ${record.handle} (updated)`);
    return;
  }

  if (enrichOnly) {
    console.log(`  article ${record.handle} (skipped — not found)`);
    return;
  }

  const data = await adminRequest(
    `mutation ArticleCreate($article: ArticleCreateInput!) {
      articleCreate(article: $article) {
        article { id handle }
        userErrors { field message }
      }
    }`,
    { article: articleInput },
  );
  const errors = data.articleCreate?.userErrors ?? [];
  if (errors.length) throw new Error(`articleCreate(${record.handle}): ${JSON.stringify(errors)}`);
  console.log(`  article ${record.handle} (created)`);
}

async function seedPoliciesOnly() {
  console.log("Shopify legal policies seed\n");
  console.log(`Store:  ${storeDomain}`);
  console.log(
    `Admin:  ${adminToken ? "SHOPIFY_ADMIN_ACCESS_TOKEN" : `shopify app execute (${partnerAppDir})`}\n`,
  );

  if (!adminToken && !existsSync(partnerAppDir)) {
    fail(
      `No SHOPIFY_ADMIN_ACCESS_TOKEN and partner app dir not found at ${partnerAppDir}. ` +
        "See docs/shopify-store-setup.md",
    );
  }

  console.log("Shop policies:");
  await ensureShopPolicies();
  console.log("\n✓ Legal policies updated");
  console.log("  Verify: node scripts/verify-shopify-policies.mjs\n");
}

async function main() {
  if (policiesOnly) {
    await seedPoliciesOnly();
    return;
  }

  console.log("Shopify catalog seed (full-field enrich)\n");
  console.log(`Store:  ${storeDomain}`);
  console.log(`Mode:   ${enrichOnly ? "enrich-only" : "create + enrich"}`);
  console.log(
    `Admin:  ${adminToken ? "SHOPIFY_ADMIN_ACCESS_TOKEN" : `shopify app execute (${partnerAppDir})`}\n`,
  );

  if (!adminToken && !existsSync(partnerAppDir)) {
    fail(
      `No SHOPIFY_ADMIN_ACCESS_TOKEN and partner app dir not found at ${partnerAppDir}. ` +
        "See docs/shopify-store-setup.md",
    );
  }

  console.log("Metafield definitions:");
  await ensureMetafieldDefinitions(collectionMetafieldDefinitions, "COLLECTION");
  await ensureMetafieldDefinitions(productMetafieldDefinitions, "PRODUCT");
  await ensureMetafieldDefinitions(shopMetafieldDefinitions, "SHOP");

  console.log("\nShop settings + policies:");
  await ensureShopMetafields();
  try {
    await ensureNavigationMenus();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const short =
      message.match(/Access denied for menu(Update|Create)[^"]*/)?.[0] ??
      message.split("\n").find((line) => line.includes("Access denied")) ??
      message.slice(0, 120);
    console.warn(
      `  ⚠ navigation menus skipped (${short}). Re-install partner app for write_online_store_navigation, ` +
        "then re-run `pnpm seed:shopify`, or edit menus in Admin → Online Store → Navigation.",
    );
  }
  try {
    await ensureShopPolicies();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const short =
      message.match(/Access denied for shopPolicyUpdate[^"]*/)?.[0] ??
      message.split("\n").find((line) => line.includes("Access denied")) ??
      message.slice(0, 120);
    console.warn(
      `  ⚠ shop policies skipped (${short}). Re-install partner app for write_legal_policies, then ` +
        "`pnpm seed:shopify -- --policies-only`, or set policies in Admin → Settings → Policies.",
    );
  }

  const { onlineId, headlessId } = await getPublications();
  const publicationIds = [onlineId, headlessId];
  console.log("\nPublications: Online Store + Headless\n");

  const collectionIds = {};
  console.log("Collections:");
  for (const record of collections) {
    const id = await upsertCollection(record, publicationIds);
    if (id) collectionIds[record.handle] = id;
  }

  console.log("\nJournal blog + articles:");
  const blogId = await ensureBlog(blogHandle, BLOG_TITLE);
  for (const record of articles) {
    await upsertArticle(blogId, record);
  }

  console.log("\nProducts:");
  for (const record of products) {
    await upsertProduct(record, collectionIds[record.collectionHandle], publicationIds);
  }

  console.log("\n✓ Catalog enriched");
  console.log("  Verify: pnpm verify:shopify");
  console.log("  Dev:    pnpm dev:shopify");
  console.log("  PDP:    /product/mustard-jamawar-embroidery-pashmina\n");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
