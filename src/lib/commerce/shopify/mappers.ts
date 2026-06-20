import type {
  CommerceArticle,
  CommerceCollection,
  CommerceImage,
  CommerceProduct,
  CommerceProductCategory,
  CommerceShopPolicies,
  CommerceStorefrontSettings,
  ProductFilters,
} from "../types";

type ShopifyImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
} | null;

type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

type ShopifyMetafield = { value?: string | null } | null;

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string | null;
  availableForSale: boolean;
  featuredImage?: ShopifyImage;
  images?: { nodes: ShopifyImage[] };
  priceRange: { minVariantPrice: ShopifyMoney };
  options?: {
    name: string;
    optionValues?: { name: string; swatch?: { color?: string | null } | null }[];
  }[];
  variants?: {
    nodes: {
      id: string;
      availableForSale: boolean;
      compareAtPrice?: ShopifyMoney | null;
      selectedOptions?: { name: string; value: string }[];
    }[];
  };
  productType?: string | null;
  tags?: string[];
  collections?: { nodes: { handle: string }[] };
  careInstructionsMetafield?: ShopifyMetafield;
  dimensionsMetafield?: ShopifyMetafield;
  productHighlightsMetafield?: ShopifyMetafield;
  shippingReturnsMetafield?: ShopifyMetafield;
  authenticityPromiseMetafield?: ShopifyMetafield;
};

const COLLECTION_CATEGORY_LABELS: Record<string, string> = {
  "jamawar-embroidery": "Jamawar Embroidery",
  "kani-pashmina": "Kani Pashmina",
  "reversible-cashmere": "Reversible Cashmere",
};

const CATEGORY_DISPLAY_LABELS: Record<CommerceProductCategory, string> = {
  signature: "Signature",
  lightweight: "Lightweight",
  bridal: "Bridal",
  limited: "Limited Editions",
};

const DEFAULT_COLOR_HEX = "#bcb6ad";

const COLOR_HEX_BY_NAME: Record<string, string> = {
  mustard: "#c9a227",
  black: "#1a1a1a",
  "salmon pink": "#e8a598",
  salmon: "#e8a598",
  opal: "#bcb6ad",
  ivory: "#efe6d4",
  "dusty blue": "#6b8fa3",
  "forest green": "#4a6741",
  rust: "#a0522d",
  sand: "#d8bf99",
  mink: "#7a4a32",
  rose: "#d77c8f",
  midnight: "#1e2a48",
  sage: "#9ba87a",
  plum: "#6c2b54",
};

function hasColorOption(options?: ShopifyProductNode["options"]): boolean {
  return options?.some((o) => o.name.toLowerCase() === "color") ?? false;
}

function resolveColorSwatchFromOptions(
  options: ShopifyProductNode["options"] | undefined,
  colorName: string,
): string | undefined {
  const colorOption = options?.find((o) => o.name.toLowerCase() === "color");
  const match = colorOption?.optionValues?.find(
    (v) => v.name.toLowerCase() === colorName.toLowerCase(),
  );
  return match?.swatch?.color?.trim() || undefined;
}

/** Deterministic hex for unknown Color option values (avoids hardcoded opal fallback). */
function hashColorName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 28%, 52%)`;
}

function resolveProductColor(
  node: ShopifyProductNode,
  selectedOptions?: { name: string; value: string }[],
): { hex: string; name?: string } {
  const colorName = selectedOptions?.find((o) => o.name.toLowerCase() === "color")?.value?.trim();
  const colorOptionExists = hasColorOption(node.options);

  if (colorName) {
    const normalized = colorName.toLowerCase();
    const hex =
      COLOR_HEX_BY_NAME[normalized] ??
      resolveColorSwatchFromOptions(node.options, colorName) ??
      (colorOptionExists ? hashColorName(colorName) : undefined);
    if (hex) return { hex, name: colorName };
  }

  if (colorOptionExists) {
    return { hex: DEFAULT_COLOR_HEX, name: colorName };
  }

  return { hex: DEFAULT_COLOR_HEX };
}

function resolveCategoryLabel(node: ShopifyProductNode, category: CommerceProductCategory): string {
  if (node.productType?.trim()) return node.productType.trim();

  const collectionHandle = node.collections?.nodes?.[0]?.handle;
  if (collectionHandle && COLLECTION_CATEGORY_LABELS[collectionHandle]) {
    return COLLECTION_CATEGORY_LABELS[collectionHandle];
  }

  return CATEGORY_DISPLAY_LABELS[category];
}

type ShopifyCollectionNode = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  descriptionHtml?: string | null;
  image?: ShopifyImage;
  products?: { nodes: ShopifyProductNode[] };
  heroHeadlineMetafield?: ShopifyMetafield;
  heroTaglineMetafield?: ShopifyMetafield;
  ctaLabelMetafield?: ShopifyMetafield;
};

function mapImage(
  image: ShopifyImage | undefined,
  fallbackAlt?: string,
): CommerceImage | undefined {
  if (!image?.url) return undefined;
  return {
    src: image.url,
    alt: image.altText ?? fallbackAlt,
    width: image.width ?? undefined,
    height: image.height ?? undefined,
  };
}

function parseListMetafield(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  } catch {
    return [];
  }
}

function extractBulletsFromHtml(html: string | null | undefined): string[] {
  if (!html?.trim()) return [];
  const bullets: string[] = [];
  const pattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text) bullets.push(text);
  }
  return bullets;
}

function resolveProductHighlights(node: ShopifyProductNode): string[] | undefined {
  const fromMetafield = parseListMetafield(node.productHighlightsMetafield?.value);
  if (fromMetafield.length) return fromMetafield;

  const fromHtml = extractBulletsFromHtml(node.descriptionHtml);
  return fromHtml.length ? fromHtml : undefined;
}

function inferCategory(product: ShopifyProductNode): CommerceProductCategory {
  const tags = (product.tags ?? []).map((t) => t.toLowerCase());
  if (tags.includes("limited")) return "limited";
  if (tags.includes("bridal")) return "bridal";
  if (tags.includes("lightweight")) return "lightweight";
  const type = (product.productType ?? "").toLowerCase();
  if (type.includes("limited")) return "limited";
  if (type.includes("bridal")) return "bridal";
  if (type.includes("lightweight")) return "lightweight";
  return "signature";
}

export function mapShopifyProduct(
  node: ShopifyProductNode,
  options?: { collectionSlug?: string },
): CommerceProduct {
  const images =
    node.images?.nodes
      ?.map((img) => mapImage(img, node.title))
      .filter((img): img is CommerceImage => img != null) ?? [];

  const featured = mapImage(node.featuredImage ?? null, node.title);
  if (featured && !images.some((i) => i.src === featured.src)) {
    images.unshift(featured);
  }

  const variant = node.variants?.nodes?.[0];
  const category = inferCategory(node);
  const collectionSlug =
    options?.collectionSlug ?? node.collections?.nodes?.[0]?.handle ?? undefined;
  const { hex: colorHex, name: colorName } = resolveProductColor(node, variant?.selectedOptions);

  const compareAtRaw = variant?.compareAtPrice;
  const compareAtPrice =
    compareAtRaw?.amount && parseFloat(compareAtRaw.amount) > 0
      ? {
          amount: parseFloat(compareAtRaw.amount),
          currencyCode: compareAtRaw.currencyCode,
        }
      : undefined;

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    category,
    categoryLabel: resolveCategoryLabel(node, category),
    price: {
      amount: parseFloat(node.priceRange.minVariantPrice.amount),
      currencyCode: node.priceRange.minVariantPrice.currencyCode,
    },
    compareAtPrice,
    images,
    colorHex,
    colorName,
    description: node.description,
    descriptionHtml: node.descriptionHtml ?? undefined,
    availableForSale: node.availableForSale && (variant?.availableForSale ?? true),
    variantId: variant?.id,
    collectionSlug,
    careInstructions: node.careInstructionsMetafield?.value?.trim() || undefined,
    dimensions: node.dimensionsMetafield?.value?.trim() || undefined,
    highlights: resolveProductHighlights(node),
    shippingReturnsText: node.shippingReturnsMetafield?.value?.trim() || undefined,
    authenticityPromise: node.authenticityPromiseMetafield?.value?.trim() || undefined,
  };
}

export function mapShopifyCollection(node: ShopifyCollectionNode): CommerceCollection {
  const heroHeadline = node.heroHeadlineMetafield?.value?.trim() || undefined;
  const tagline = node.heroTaglineMetafield?.value?.trim() ?? "";
  const ctaLabel = node.ctaLabelMetafield?.value?.trim() || undefined;

  return {
    slug: node.handle,
    title: node.title,
    heroHeadline,
    tagline,
    description: node.description?.trim() || undefined,
    descriptionHtml: node.descriptionHtml?.trim() || undefined,
    category: inferCategoryFromHandle(node.handle),
    image: mapImage(node.image ?? null, node.title),
    ctaLabel,
  };
}

function inferCategoryFromHandle(handle: string): CommerceProductCategory {
  const h = handle.toLowerCase();
  if (h.includes("limited")) return "limited";
  if (h.includes("bridal")) return "bridal";
  if (h.includes("reversible") || h.includes("lightweight")) return "lightweight";
  if (h.includes("kani") || h.includes("jamawar")) return "signature";
  return "signature";
}

export function mapShopifyArticle(
  node: {
    handle: string;
    title: string;
    excerpt?: string | null;
    publishedAt?: string | null;
    contentHtml?: string | null;
    tags?: string[];
    image?: ShopifyImage;
  },
  category = "Journal",
): CommerceArticle {
  const resolvedCategory = node.tags?.[0] ?? category;
  const cover = mapImage(node.image ?? null, node.title) ?? {
    src: "/images/kashmir-weaver-logo.png",
    alt: node.title,
  };
  const date = node.publishedAt
    ? new Date(node.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return {
    slug: node.handle,
    title: node.title,
    category: resolvedCategory,
    date,
    excerpt: node.excerpt ?? "",
    cover,
    bodyHtml: node.contentHtml ?? undefined,
  };
}

export function applyClientFilters(
  products: CommerceProduct[],
  filters?: ProductFilters,
): CommerceProduct[] {
  let list = [...products];
  if (filters?.categories?.length) {
    const cats = new Set(filters.categories);
    list = list.filter((p) => cats.has(p.category));
  }
  if (filters?.colors?.length) {
    const colors = new Set(filters.colors);
    list = list.filter((p) => colors.has(p.colorHex));
  }
  if (filters?.maxPrice != null) {
    list = list.filter((p) => p.price.amount <= filters.maxPrice!);
  }
  switch (filters?.sort) {
    case "price-asc":
      list.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "price-desc":
      list.sort((a, b) => b.price.amount - a.price.amount);
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }
  return list;
}

export function mapShopifyStorefrontSettings(
  shop:
    | {
        authenticityPromiseMetafield?: ShopifyMetafield;
        shippingBadgeMetafield?: ShopifyMetafield;
        returnsBadgeMetafield?: ShopifyMetafield;
      }
    | null
    | undefined,
): CommerceStorefrontSettings {
  return {
    authenticityPromise: shop?.authenticityPromiseMetafield?.value?.trim() || undefined,
    shippingBadgeText: shop?.shippingBadgeMetafield?.value?.trim() || undefined,
    returnsBadgeText: shop?.returnsBadgeMetafield?.value?.trim() || undefined,
  };
}

export function mapShopifyShopPolicies(
  shop:
    | {
        shippingPolicy?: { body?: string | null } | null;
        refundPolicy?: { body?: string | null } | null;
        privacyPolicy?: { body?: string | null } | null;
        termsOfService?: { body?: string | null } | null;
        shippingReturnsMetafield?: ShopifyMetafield;
      }
    | null
    | undefined,
): CommerceShopPolicies {
  const shippingPolicyHtml = shop?.shippingPolicy?.body?.trim() || undefined;
  const refundPolicyHtml = shop?.refundPolicy?.body?.trim() || undefined;
  const privacyPolicyHtml = shop?.privacyPolicy?.body?.trim() || undefined;
  const termsOfServiceHtml = shop?.termsOfService?.body?.trim() || undefined;
  const fallbackHtml = shop?.shippingReturnsMetafield?.value?.trim() || undefined;

  if (shippingPolicyHtml || refundPolicyHtml || privacyPolicyHtml || termsOfServiceHtml) {
    return { shippingPolicyHtml, refundPolicyHtml, privacyPolicyHtml, termsOfServiceHtml };
  }

  return fallbackHtml ? { shippingPolicyHtml: fallbackHtml } : {};
}

export type { ShopifyProductNode, ShopifyCollectionNode };
