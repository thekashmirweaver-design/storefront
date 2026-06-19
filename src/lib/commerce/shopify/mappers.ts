import type {
  CommerceArticle,
  CommerceCollection,
  CommerceImage,
  CommerceProduct,
  CommerceProductCategory,
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
  variants?: { nodes: { id: string; availableForSale: boolean }[] };
  productType?: string | null;
  tags?: string[];
};

type ShopifyCollectionNode = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  image?: ShopifyImage;
  products?: { nodes: ShopifyProductNode[] };
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

export function mapShopifyProduct(node: ShopifyProductNode): CommerceProduct {
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

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    category,
    categoryLabel: node.productType || "100% Pashmina",
    price: {
      amount: parseFloat(node.priceRange.minVariantPrice.amount),
      currencyCode: node.priceRange.minVariantPrice.currencyCode,
    },
    images,
    colorHex: "#bcb6ad",
    description: node.description,
    descriptionHtml: node.descriptionHtml ?? undefined,
    availableForSale: node.availableForSale && (variant?.availableForSale ?? true),
    variantId: variant?.id,
  };
}

export function mapShopifyCollection(node: ShopifyCollectionNode): CommerceCollection {
  return {
    slug: node.handle,
    title: node.title,
    tagline: "",
    description: node.description ?? undefined,
    category: inferCategoryFromHandle(node.handle),
    image: mapImage(node.image ?? null, node.title),
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
    image?: ShopifyImage;
  },
  category = "Journal",
): CommerceArticle {
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
    category,
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

export type { ShopifyProductNode, ShopifyCollectionNode };
