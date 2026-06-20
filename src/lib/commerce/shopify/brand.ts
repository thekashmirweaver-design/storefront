import { unstable_cache } from "next/cache";

import { getSiteUrl } from "@/lib/site-url";

import { brandLegalRoutes, defaultLogoDimensions } from "../brand/config";
import { CommerceConfigError } from "../errors";
import type { BrandConfig, BrandCopy, CommerceImage } from "../types";
import { SHOPIFY_CACHE_TAGS } from "./cache-tags";
import { getShopifyClient } from "./client";
import { SHOP_BRAND_QUERY } from "./queries";

export const SHOPIFY_MAIN_MENU_HANDLE = "main-menu";
export const SHOPIFY_FOOTER_MENU_HANDLE = "footer";

const BRAND_REVALIDATE_SECONDS = 300;
const SEED_HINT = "Run `pnpm seed:shopify -- --brand-only` after partner app install.";

type ShopifyMetafield = { value?: string | null } | null;

type ShopifyMenuItem = {
  title: string;
  url?: string | null;
  items?: ShopifyMenuItem[];
};

type ShopifyBrandShop = {
  name?: string | null;
  privacyPolicy?: { url?: string | null } | null;
  termsOfService?: { url?: string | null } | null;
  brandIdMetafield?: ShopifyMetafield;
  brandTaglineMetafield?: ShopifyMetafield;
  contactEmailMetafield?: ShopifyMetafield;
  contactPhoneMetafield?: ShopifyMetafield;
  contactAddressMetafield?: ShopifyMetafield;
  contactHoursMetafield?: ShopifyMetafield;
  socialFacebookMetafield?: ShopifyMetafield;
  socialYoutubeMetafield?: ShopifyMetafield;
  socialInstagramMetafield?: ShopifyMetafield;
  socialPinterestMetafield?: ShopifyMetafield;
  seoDefaultTitleMetafield?: ShopifyMetafield;
  seoTitleTemplateMetafield?: ShopifyMetafield;
  seoDefaultDescriptionMetafield?: ShopifyMetafield;
  seoOgTitleMetafield?: ShopifyMetafield;
  seoOgDescriptionMetafield?: ShopifyMetafield;
  productNounMetafield?: ShopifyMetafield;
  brandOriginMetafield?: ShopifyMetafield;
  searchPlaceholderMetafield?: ShopifyMetafield;
  copyJsonMetafield?: ShopifyMetafield;
  logoUrlMetafield?: ShopifyMetafield;
  logoWidthMetafield?: ShopifyMetafield;
  logoHeightMetafield?: ShopifyMetafield;
  footerDescriptionMetafield?: ShopifyMetafield;
  newsletterTitleMetafield?: ShopifyMetafield;
  newsletterDescriptionMetafield?: ShopifyMetafield;
  newsletterPlaceholderMetafield?: ShopifyMetafield;
};

type ShopifyBrandResponse = {
  shop?: ShopifyBrandShop | null;
  mainMenu?: { title?: string | null; items?: ShopifyMenuItem[] } | null;
  footerMenu?: { title?: string | null; items?: ShopifyMenuItem[] } | null;
};

type BrandCopyJson = Pick<BrandCopy, "pages" | "messages">;

function metafieldValue(metafield?: ShopifyMetafield): string | undefined {
  const value = metafield?.value?.trim();
  return value || undefined;
}

function metafieldInteger(metafield?: ShopifyMetafield): number | undefined {
  const raw = metafieldValue(metafield);
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function requireMetafield(label: string, value: string | undefined): string {
  if (!value) {
    throw new CommerceConfigError(`Shopify brand metafield "${label}" is missing. ${SEED_HINT}`);
  }
  return value;
}

function parseBrandCopyJson(raw: string): BrandCopyJson {
  try {
    const parsed = JSON.parse(raw) as Partial<BrandCopyJson>;
    if (!parsed || typeof parsed !== "object" || !parsed.pages || !parsed.messages) {
      throw new Error("copy_json must include pages and messages");
    }
    return { pages: parsed.pages, messages: parsed.messages };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new CommerceConfigError(
      `Invalid Shopify brand metafield "copy_json": ${detail}. ${SEED_HINT}`,
    );
  }
}

function mapBrandCopy(shop: ShopifyBrandShop): BrandCopy {
  const copyJson = parseBrandCopyJson(
    requireMetafield("copy_json", metafieldValue(shop.copyJsonMetafield)),
  );

  return {
    productNoun: requireMetafield("product_noun", metafieldValue(shop.productNounMetafield)),
    origin: requireMetafield("brand_origin", metafieldValue(shop.brandOriginMetafield)),
    searchPlaceholder: requireMetafield(
      "search_placeholder",
      metafieldValue(shop.searchPlaceholderMetafield),
    ),
    pages: copyJson.pages,
    messages: copyJson.messages,
  };
}

function normalizeMenuUrl(url: string | null | undefined, siteUrl: string): string {
  if (!url?.trim()) return "#";

  const trimmed = url.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const siteHost = new URL(siteUrl).hostname;
    if (
      parsed.hostname === siteHost ||
      parsed.hostname.endsWith(".myshopify.com") ||
      siteHost.endsWith(".myshopify.com")
    ) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

function mapHeaderNav(
  items: ShopifyMenuItem[] | undefined,
  siteUrl: string,
): BrandConfig["headerNav"] {
  if (!items?.length) {
    throw new CommerceConfigError(
      `Shopify menu "${SHOPIFY_MAIN_MENU_HANDLE}" is missing or empty. ${SEED_HINT}`,
    );
  }

  return items.map((item) => ({
    label: item.title,
    href: normalizeMenuUrl(item.url, siteUrl),
  }));
}

function mapFooterMenus(
  items: ShopifyMenuItem[] | undefined,
  siteUrl: string,
): BrandConfig["footerMenus"] {
  if (!items?.length) {
    throw new CommerceConfigError(
      `Shopify menu "${SHOPIFY_FOOTER_MENU_HANDLE}" is missing or empty. ${SEED_HINT}`,
    );
  }

  const columns = items
    .map((column) => {
      const links = (column.items?.length ? column.items : [column]).map((link) => ({
        label: link.title,
        href: normalizeMenuUrl(link.url, siteUrl),
      }));

      if (!links.length) return null;

      return {
        title: column.title,
        links,
      };
    })
    .filter((column): column is BrandConfig["footerMenus"][number] => column !== null);

  if (!columns.length) {
    throw new CommerceConfigError(
      `Shopify menu "${SHOPIFY_FOOTER_MENU_HANDLE}" has no usable links. ${SEED_HINT}`,
    );
  }

  return columns;
}

function resolveLogo(src: string, name: string, width?: number, height?: number): CommerceImage {
  const logoWidth = width ?? defaultLogoDimensions.width;
  const logoHeight = height ?? defaultLogoDimensions.height;
  const siteUrl = getSiteUrl();
  let logoSrc = src.trim();

  if (!logoSrc.startsWith("/") && !logoSrc.startsWith("#")) {
    try {
      const parsed = new URL(logoSrc);
      const siteHost = new URL(siteUrl).hostname;
      const isShopifyCdn = parsed.hostname === "cdn.shopify.com";
      const isLocalPublicAsset =
        parsed.pathname.startsWith("/images/") || parsed.pathname.startsWith("/icons/");
      if (
        isShopifyCdn ||
        isLocalPublicAsset ||
        parsed.hostname === siteHost ||
        parsed.hostname.endsWith(".myshopify.com") ||
        siteHost.endsWith(".myshopify.com")
      ) {
        logoSrc = isShopifyCdn
          ? logoSrc
          : `${parsed.pathname}${parsed.search}` || "/images/kashmir-weaver-logo.png";
      }
    } catch {
      // keep original src
    }
  }

  return {
    src: logoSrc,
    alt: name,
    width: logoWidth,
    height: logoHeight,
  };
}

function mapShopifyBrand(data: ShopifyBrandResponse): BrandConfig {
  const shop = data.shop;
  if (!shop) {
    throw new CommerceConfigError(`Shopify shop payload missing. ${SEED_HINT}`);
  }

  const siteUrl = getSiteUrl();
  const name = shop.name?.trim();
  if (!name) {
    throw new CommerceConfigError(`Shopify shop.name is missing. ${SEED_HINT}`);
  }

  const logoUrl = requireMetafield("logo_url", metafieldValue(shop.logoUrlMetafield));

  return {
    id: requireMetafield("brand_id", metafieldValue(shop.brandIdMetafield)),
    name,
    tagline: requireMetafield("brand_tagline", metafieldValue(shop.brandTaglineMetafield)),
    siteUrl,
    logo: resolveLogo(
      logoUrl,
      name,
      metafieldInteger(shop.logoWidthMetafield),
      metafieldInteger(shop.logoHeightMetafield),
    ),
    contact: {
      email: requireMetafield("contact_email", metafieldValue(shop.contactEmailMetafield)),
      phone: requireMetafield("contact_phone", metafieldValue(shop.contactPhoneMetafield)),
      address: requireMetafield("contact_address", metafieldValue(shop.contactAddressMetafield)),
      hours: requireMetafield("contact_hours", metafieldValue(shop.contactHoursMetafield)),
    },
    social: {
      facebook: metafieldValue(shop.socialFacebookMetafield),
      youtube: metafieldValue(shop.socialYoutubeMetafield),
      instagram: metafieldValue(shop.socialInstagramMetafield),
      pinterest: metafieldValue(shop.socialPinterestMetafield),
    },
    seo: {
      defaultTitle: requireMetafield(
        "seo_default_title",
        metafieldValue(shop.seoDefaultTitleMetafield),
      ),
      titleTemplate: requireMetafield(
        "seo_title_template",
        metafieldValue(shop.seoTitleTemplateMetafield),
      ),
      defaultDescription: requireMetafield(
        "seo_default_description",
        metafieldValue(shop.seoDefaultDescriptionMetafield),
      ),
      ogTitle: requireMetafield("seo_og_title", metafieldValue(shop.seoOgTitleMetafield)),
      ogDescription: requireMetafield(
        "seo_og_description",
        metafieldValue(shop.seoOgDescriptionMetafield),
      ),
    },
    headerNav: mapHeaderNav(data.mainMenu?.items, siteUrl),
    footerMenus: mapFooterMenus(data.footerMenu?.items, siteUrl),
    footerDescription: requireMetafield(
      "footer_description",
      metafieldValue(shop.footerDescriptionMetafield),
    ),
    newsletter: {
      title: requireMetafield("newsletter_title", metafieldValue(shop.newsletterTitleMetafield)),
      description: requireMetafield(
        "newsletter_description",
        metafieldValue(shop.newsletterDescriptionMetafield),
      ),
      placeholder: requireMetafield(
        "newsletter_placeholder",
        metafieldValue(shop.newsletterPlaceholderMetafield),
      ),
    },
    legal: brandLegalRoutes,
    copy: mapBrandCopy(shop),
  };
}

async function fetchShopifyBrand(): Promise<BrandConfig> {
  const client = await getShopifyClient();
  const { data, errors } = await client.request(SHOP_BRAND_QUERY, {
    variables: {
      mainMenuHandle: SHOPIFY_MAIN_MENU_HANDLE,
      footerMenuHandle: SHOPIFY_FOOTER_MENU_HANDLE,
    },
  });

  if (errors) {
    throw new Error(`Shopify getBrand: ${JSON.stringify(errors)}`);
  }

  return mapShopifyBrand((data ?? {}) as ShopifyBrandResponse);
}

export async function getShopifyBrand(): Promise<BrandConfig> {
  return unstable_cache(fetchShopifyBrand, ["shopify-brand", "v6"], {
    revalidate: BRAND_REVALIDATE_SECONDS,
    tags: [SHOPIFY_CACHE_TAGS.brand],
  })();
}
