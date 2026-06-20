import { unstable_cache } from "next/cache";

import { brandConfig } from "../brand/config";
import type { BrandConfig, CommerceImage } from "../types";
import { SHOPIFY_CACHE_TAGS } from "./cache-tags";
import { createShopifyClient } from "./client";
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
    logoUrlMetafield?: ShopifyMetafield;
    footerDescriptionMetafield?: ShopifyMetafield;
    newsletterTitleMetafield?: ShopifyMetafield;
    newsletterDescriptionMetafield?: ShopifyMetafield;
    newsletterPlaceholderMetafield?: ShopifyMetafield;
  } | null;
  mainMenu?: { title?: string | null; items?: ShopifyMenuItem[] } | null;
  footerMenu?: { title?: string | null; items?: ShopifyMenuItem[] } | null;
};

function metafieldValue(metafield?: ShopifyMetafield): string | undefined {
  const value = metafield?.value?.trim();
  return value || undefined;
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
  if (!items?.length) return brandConfig.headerNav;

  return items.map((item) => ({
    label: item.title,
    href: normalizeMenuUrl(item.url, siteUrl),
  }));
}

function mapFooterMenus(
  items: ShopifyMenuItem[] | undefined,
  siteUrl: string,
): BrandConfig["footerMenus"] {
  if (!items?.length) return brandConfig.footerMenus;

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

  return columns.length ? columns : brandConfig.footerMenus;
}

function resolveLogo(src: string | undefined, name: string): CommerceImage {
  if (!src) return brandConfig.logo;

  const siteUrl = brandConfig.siteUrl;
  let logoSrc = src.trim();

  if (!logoSrc.startsWith("/") && !logoSrc.startsWith("#")) {
    try {
      const parsed = new URL(logoSrc);
      const siteHost = new URL(siteUrl).hostname;
      const isLocalPublicAsset =
        parsed.pathname.startsWith("/images/") || parsed.pathname.startsWith("/icons/");
      if (
        isLocalPublicAsset ||
        parsed.hostname === siteHost ||
        parsed.hostname === "thekashmirweaver.com" ||
        parsed.hostname.endsWith(".myshopify.com") ||
        siteHost.endsWith(".myshopify.com")
      ) {
        logoSrc = `${parsed.pathname}${parsed.search}` || brandConfig.logo.src;
      }
    } catch {
      // keep original src
    }
  }

  return {
    src: logoSrc,
    alt: name,
    width: brandConfig.logo.width,
    height: brandConfig.logo.height,
  };
}

function mapShopifyBrand(data: ShopifyBrandResponse): BrandConfig {
  const shop = data.shop;
  const siteUrl = brandConfig.siteUrl;
  const name = shop?.name?.trim() || brandConfig.name;

  const privacyPolicyUrl = shop?.privacyPolicy?.url
    ? normalizeMenuUrl(shop.privacyPolicy.url, siteUrl)
    : brandConfig.legal.privacyPolicyUrl;
  const termsUrl = shop?.termsOfService?.url
    ? normalizeMenuUrl(shop.termsOfService.url, siteUrl)
    : brandConfig.legal.termsUrl;

  return {
    ...brandConfig,
    name,
    tagline: metafieldValue(shop?.brandTaglineMetafield) ?? brandConfig.tagline,
    logo: resolveLogo(metafieldValue(shop?.logoUrlMetafield), name),
    contact: {
      email: metafieldValue(shop?.contactEmailMetafield) ?? brandConfig.contact.email,
      phone: metafieldValue(shop?.contactPhoneMetafield) ?? brandConfig.contact.phone,
      address: metafieldValue(shop?.contactAddressMetafield) ?? brandConfig.contact.address,
      hours: metafieldValue(shop?.contactHoursMetafield) ?? brandConfig.contact.hours,
    },
    social: {
      facebook: metafieldValue(shop?.socialFacebookMetafield) ?? brandConfig.social.facebook,
      youtube: metafieldValue(shop?.socialYoutubeMetafield) ?? brandConfig.social.youtube,
      instagram: metafieldValue(shop?.socialInstagramMetafield) ?? brandConfig.social.instagram,
      pinterest: metafieldValue(shop?.socialPinterestMetafield) ?? brandConfig.social.pinterest,
    },
    seo: {
      defaultTitle: metafieldValue(shop?.seoDefaultTitleMetafield) ?? brandConfig.seo.defaultTitle,
      titleTemplate:
        metafieldValue(shop?.seoTitleTemplateMetafield) ?? brandConfig.seo.titleTemplate,
      defaultDescription:
        metafieldValue(shop?.seoDefaultDescriptionMetafield) ?? brandConfig.seo.defaultDescription,
      ogTitle: metafieldValue(shop?.seoOgTitleMetafield) ?? brandConfig.seo.ogTitle,
      ogDescription:
        metafieldValue(shop?.seoOgDescriptionMetafield) ?? brandConfig.seo.ogDescription,
    },
    headerNav: mapHeaderNav(data.mainMenu?.items, siteUrl),
    footerMenus: mapFooterMenus(data.footerMenu?.items, siteUrl),
    footerDescription:
      metafieldValue(shop?.footerDescriptionMetafield) ?? brandConfig.footerDescription,
    newsletter: {
      title: metafieldValue(shop?.newsletterTitleMetafield) ?? brandConfig.newsletter.title,
      description:
        metafieldValue(shop?.newsletterDescriptionMetafield) ?? brandConfig.newsletter.description,
      placeholder:
        metafieldValue(shop?.newsletterPlaceholderMetafield) ?? brandConfig.newsletter.placeholder,
    },
    legal: {
      privacyPolicyUrl,
      termsUrl,
    },
    copy: brandConfig.copy,
  };
}

async function fetchShopifyBrand(): Promise<BrandConfig> {
  const client = createShopifyClient();
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
  return unstable_cache(fetchShopifyBrand, ["shopify-brand", "v3"], {
    revalidate: BRAND_REVALIDATE_SECONDS,
    tags: [SHOPIFY_CACHE_TAGS.brand],
  })();
}
