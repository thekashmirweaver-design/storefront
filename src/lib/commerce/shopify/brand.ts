import { unstable_cache } from "next/cache";

import { getSiteUrl } from "@/lib/site-url";

import { brandDefaults } from "../brand/config";
import type { BrandConfig, BrandCopy, CommerceImage } from "../types";
import { SHOPIFY_CACHE_TAGS } from "./cache-tags";
import { getShopifyClient } from "./client";
import { SHOP_BRAND_QUERY } from "./queries";

export const SHOPIFY_MAIN_MENU_HANDLE = "main-menu";
export const SHOPIFY_FOOTER_MENU_HANDLE = "footer";

const BRAND_REVALIDATE_SECONDS = 300;

type ShopifyMetafield = { value?: string | null } | null;

type ShopifyMenuItem = {
  title: string;
  url?: string | null;
  items?: ShopifyMenuItem[];
};

type ShopifyBrandResponse = {
  shop?: {
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
  } | null;
  mainMenu?: { title?: string | null; items?: ShopifyMenuItem[] } | null;
  footerMenu?: { title?: string | null; items?: ShopifyMenuItem[] } | null;
};

type BrandCopyJson = Pick<BrandCopy, "pages" | "messages">;

function metafieldValue(metafield?: ShopifyMetafield): string | undefined {
  const value = metafield?.value?.trim();
  return value || undefined;
}

function metafieldInteger(metafield?: ShopifyMetafield, fallback?: number): number | undefined {
  const raw = metafieldValue(metafield);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBrandCopyJson(raw: string | undefined): BrandCopyJson | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as Partial<BrandCopyJson>;
    if (!parsed || typeof parsed !== "object") return undefined;
    return {
      pages: { ...brandDefaults.copy.pages, ...parsed.pages },
      messages: { ...brandDefaults.copy.messages, ...parsed.messages },
    };
  } catch {
    return undefined;
  }
}

function mapBrandCopy(shop: NonNullable<ShopifyBrandResponse["shop"]>): BrandCopy {
  const copyJson = parseBrandCopyJson(metafieldValue(shop.copyJsonMetafield));

  return {
    productNoun: metafieldValue(shop.productNounMetafield) ?? brandDefaults.copy.productNoun,
    origin: metafieldValue(shop.brandOriginMetafield) ?? brandDefaults.copy.origin,
    searchPlaceholder:
      metafieldValue(shop.searchPlaceholderMetafield) ?? brandDefaults.copy.searchPlaceholder,
    pages: copyJson?.pages ?? brandDefaults.copy.pages,
    messages: copyJson?.messages ?? brandDefaults.copy.messages,
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
  if (!items?.length) return brandDefaults.headerNav;

  return items.map((item) => ({
    label: item.title,
    href: normalizeMenuUrl(item.url, siteUrl),
  }));
}

function mapFooterMenus(
  items: ShopifyMenuItem[] | undefined,
  siteUrl: string,
): BrandConfig["footerMenus"] {
  if (!items?.length) return brandDefaults.footerMenus;

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

  return columns.length ? columns : brandDefaults.footerMenus;
}

function resolveLogo(
  src: string | undefined,
  name: string,
  width?: number,
  height?: number,
): CommerceImage {
  const logoWidth = width ?? brandDefaults.logo.width;
  const logoHeight = height ?? brandDefaults.logo.height;

  if (!src) {
    return { ...brandDefaults.logo, alt: name, width: logoWidth, height: logoHeight };
  }

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
          : `${parsed.pathname}${parsed.search}` || brandDefaults.logo.src;
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
  const siteUrl = getSiteUrl();
  const name = shop?.name?.trim() || brandDefaults.name;

  return {
    id: metafieldValue(shop?.brandIdMetafield) ?? brandDefaults.id,
    name,
    tagline: metafieldValue(shop?.brandTaglineMetafield) ?? brandDefaults.tagline,
    siteUrl,
    logo: resolveLogo(
      metafieldValue(shop?.logoUrlMetafield),
      name,
      metafieldInteger(shop?.logoWidthMetafield),
      metafieldInteger(shop?.logoHeightMetafield),
    ),
    contact: {
      email: metafieldValue(shop?.contactEmailMetafield) ?? brandDefaults.contact.email,
      phone: metafieldValue(shop?.contactPhoneMetafield) ?? brandDefaults.contact.phone,
      address: metafieldValue(shop?.contactAddressMetafield) ?? brandDefaults.contact.address,
      hours: metafieldValue(shop?.contactHoursMetafield) ?? brandDefaults.contact.hours,
    },
    social: {
      facebook: metafieldValue(shop?.socialFacebookMetafield) ?? brandDefaults.social.facebook,
      youtube: metafieldValue(shop?.socialYoutubeMetafield) ?? brandDefaults.social.youtube,
      instagram: metafieldValue(shop?.socialInstagramMetafield) ?? brandDefaults.social.instagram,
      pinterest: metafieldValue(shop?.socialPinterestMetafield) ?? brandDefaults.social.pinterest,
    },
    seo: {
      defaultTitle:
        metafieldValue(shop?.seoDefaultTitleMetafield) ?? brandDefaults.seo.defaultTitle,
      titleTemplate:
        metafieldValue(shop?.seoTitleTemplateMetafield) ?? brandDefaults.seo.titleTemplate,
      defaultDescription:
        metafieldValue(shop?.seoDefaultDescriptionMetafield) ??
        brandDefaults.seo.defaultDescription,
      ogTitle: metafieldValue(shop?.seoOgTitleMetafield) ?? brandDefaults.seo.ogTitle,
      ogDescription:
        metafieldValue(shop?.seoOgDescriptionMetafield) ?? brandDefaults.seo.ogDescription,
    },
    headerNav: mapHeaderNav(data.mainMenu?.items, siteUrl),
    footerMenus: mapFooterMenus(data.footerMenu?.items, siteUrl),
    footerDescription:
      metafieldValue(shop?.footerDescriptionMetafield) ?? brandDefaults.footerDescription,
    newsletter: {
      title: metafieldValue(shop?.newsletterTitleMetafield) ?? brandDefaults.newsletter.title,
      description:
        metafieldValue(shop?.newsletterDescriptionMetafield) ??
        brandDefaults.newsletter.description,
      placeholder:
        metafieldValue(shop?.newsletterPlaceholderMetafield) ??
        brandDefaults.newsletter.placeholder,
    },
    legal: {
      privacyPolicyUrl: brandDefaults.legal.privacyPolicyUrl,
      termsUrl: brandDefaults.legal.termsUrl,
    },
    copy: shop ? mapBrandCopy(shop) : brandDefaults.copy,
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
  return unstable_cache(fetchShopifyBrand, ["shopify-brand", "v5"], {
    revalidate: BRAND_REVALIDATE_SECONDS,
    tags: [SHOPIFY_CACHE_TAGS.brand],
  })();
}
