import { unstable_cache } from "next/cache";

import { getSiteUrl } from "@/lib/site-url";
import {
  mockCraftsmanshipContent,
  mockHomepageEditorial,
  mockJournalIndexContent,
  mockOurStoryContent,
} from "../mock/data/editorial";
import type {
  CommerceCraftsmanshipContent,
  CommerceHomepageEditorial,
  CommerceImage,
  CommerceJournalIndexContent,
  CommerceOurStoryContent,
  EditorialIconName,
  EditorialPillar,
} from "../types";
import { SHOPIFY_CACHE_TAGS } from "./cache-tags";
import { getShopifyClient } from "./client";
import {
  EDITORIAL_CONTENT_QUERY,
  SHOPIFY_CRAFTSMANSHIP_STEP_METAOBJECT_TYPE,
  SHOPIFY_CRAFTSMANSHIP_METAOBJECT_TYPE,
  SHOPIFY_HOMEPAGE_HERO_METAOBJECT_TYPE,
  SHOPIFY_HOMEPAGE_LEGACY_METAOBJECT_TYPE,
  SHOPIFY_HOMEPAGE_MARQUEE_METAOBJECT_TYPE,
  SHOPIFY_HOMEPAGE_QUOTE_METAOBJECT_TYPE,
  SHOPIFY_HOMEPAGE_VALUE_PROP_METAOBJECT_TYPE,
  SHOPIFY_OUR_STORY_METAOBJECT_TYPE,
} from "./queries";

const EDITORIAL_REVALIDATE_SECONDS = 300;

type ShopifyField = { value?: string | null } | null;

type ShopifyListNode = {
  handle: string;
  label?: ShopifyField;
  icon?: ShopifyField;
  text?: ShopifyField;
  number?: ShopifyField;
  title?: ShopifyField;
  description?: ShopifyField;
};

type ShopifyEditorialResponse = {
  shop?: {
    journalHeroImageMetafield?: ShopifyField;
    journalHeroTitleMetafield?: ShopifyField;
    journalHeroDescriptionMetafield?: ShopifyField;
  } | null;
  homepageHero?: {
    eyebrow?: ShopifyField;
    headlineLine1?: ShopifyField;
    headlineLine2?: ShopifyField;
    description?: ShopifyField;
    ctaLabel?: ShopifyField;
    ctaHref?: ShopifyField;
    imageUrl?: ShopifyField;
    imageAlt?: ShopifyField;
    seoTitle?: ShopifyField;
    seoDescription?: ShopifyField;
  } | null;
  homepageValueProps?: { nodes?: ShopifyListNode[] } | null;
  homepageMarquee?: { nodes?: ShopifyListNode[] } | null;
  homepageLegacy?: {
    eyebrow?: ShopifyField;
    titleLine1?: ShopifyField;
    titleLine2?: ShopifyField;
    body?: ShopifyField;
    imageUrl?: ShopifyField;
    imageAlt?: ShopifyField;
    pillarsJson?: ShopifyField;
  } | null;
  homepageQuote?: {
    line1?: ShopifyField;
    line2?: ShopifyField;
  } | null;
  ourStory?: {
    heroEyebrow?: ShopifyField;
    heroTitle?: ShopifyField;
    heroImageUrl?: ShopifyField;
    heroImageAlt?: ShopifyField;
    quoteText?: ShopifyField;
    heritageEyebrow?: ShopifyField;
    heritageTitle?: ShopifyField;
    heritageBody?: ShopifyField;
    heritageBodyExtra?: ShopifyField;
    heritageImageUrl?: ShopifyField;
    heritageImageAlt?: ShopifyField;
    sustainabilityEyebrow?: ShopifyField;
    sustainabilityTitle?: ShopifyField;
    sustainabilityBody?: ShopifyField;
    sustainabilityImageUrl?: ShopifyField;
    sustainabilityImageAlt?: ShopifyField;
  } | null;
  craftsmanship?: {
    heroEyebrow?: ShopifyField;
    heroTitle?: ShopifyField;
    heroImageUrl?: ShopifyField;
    heroImageAlt?: ShopifyField;
    intro?: ShopifyField;
    careEyebrow?: ShopifyField;
    careTitle?: ShopifyField;
    careTipsJson?: ShopifyField;
    careImageUrl?: ShopifyField;
    careImageAlt?: ShopifyField;
  } | null;
  craftsmanshipSteps?: { nodes?: ShopifyListNode[] } | null;
};

function metafieldValue(field?: ShopifyField): string | undefined {
  const value = field?.value?.trim();
  return value || undefined;
}

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw?.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeImageUrl(src: string | undefined): string | undefined {
  if (!src?.trim()) return undefined;

  const trimmed = src.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const siteHost = new URL(getSiteUrl()).hostname;
    if (
      parsed.hostname === siteHost ||
      parsed.hostname === "thekashmirweaver.com" ||
      parsed.hostname.endsWith(".myshopify.com") ||
      siteHost.endsWith(".myshopify.com")
    ) {
      return `${parsed.pathname}${parsed.search}` || trimmed;
    }
  } catch {
    // keep original
  }

  return trimmed;
}

function resolveCommerceImage(
  src: string | undefined,
  alt: string,
  fallback: CommerceImage,
): CommerceImage {
  const normalized = normalizeImageUrl(src);
  if (!normalized) return fallback;

  return {
    src: normalized,
    alt: alt || fallback.alt,
    width: fallback.width,
    height: fallback.height,
  };
}

function mapIcon(value: string | undefined, fallback: EditorialIconName): EditorialIconName {
  const icons: EditorialIconName[] = [
    "leaf",
    "hexagon",
    "feather",
    "mountain",
    "hand",
    "home",
    "heart",
    "infinity",
  ];
  const normalized = value?.trim().toLowerCase() as EditorialIconName | undefined;
  return normalized && icons.includes(normalized) ? normalized : fallback;
}

function mapHomepageEditorial(data: ShopifyEditorialResponse): CommerceHomepageEditorial | null {
  const heroNode = data.homepageHero;
  const legacyNode = data.homepageLegacy;
  const quoteNode = data.homepageQuote;
  if (!heroNode || !legacyNode || !quoteNode) return null;

  const valueProps = (data.homepageValueProps?.nodes ?? [])
    .sort((a, b) => a.handle.localeCompare(b.handle))
    .map((node, index) => ({
      icon: mapIcon(
        metafieldValue(node.icon),
        mockHomepageEditorial.valueProps[index]?.icon ?? "leaf",
      ),
      label: metafieldValue(node.label) ?? "",
    }))
    .filter((item) => item.label);

  const marqueeItems = (data.homepageMarquee?.nodes ?? [])
    .sort((a, b) => a.handle.localeCompare(b.handle))
    .map((node) => metafieldValue(node.text) ?? "")
    .filter(Boolean);

  const pillars = parseJson<EditorialPillar[]>(
    metafieldValue(legacyNode.pillarsJson),
    mockHomepageEditorial.legacy.pillars,
  ).map((pillar, index) => ({
    icon: mapIcon(pillar.icon, mockHomepageEditorial.legacy.pillars[index]?.icon ?? "hand"),
    title: pillar.title?.trim() ?? "",
    description: pillar.description?.trim() ?? "",
  }));

  return {
    hero: {
      eyebrow: metafieldValue(heroNode.eyebrow) ?? mockHomepageEditorial.hero.eyebrow,
      headlineLine1:
        metafieldValue(heroNode.headlineLine1) ?? mockHomepageEditorial.hero.headlineLine1,
      headlineLine2:
        metafieldValue(heroNode.headlineLine2) ?? mockHomepageEditorial.hero.headlineLine2,
      description: metafieldValue(heroNode.description) ?? mockHomepageEditorial.hero.description,
      ctaLabel: metafieldValue(heroNode.ctaLabel) ?? mockHomepageEditorial.hero.ctaLabel,
      ctaHref: metafieldValue(heroNode.ctaHref) ?? mockHomepageEditorial.hero.ctaHref,
      image: resolveCommerceImage(
        metafieldValue(heroNode.imageUrl),
        metafieldValue(heroNode.imageAlt) ?? mockHomepageEditorial.hero.image.alt ?? "",
        mockHomepageEditorial.hero.image,
      ),
    },
    valueProps: valueProps.length ? valueProps : mockHomepageEditorial.valueProps,
    marqueeItems: marqueeItems.length ? marqueeItems : mockHomepageEditorial.marqueeItems,
    legacy: {
      eyebrow: metafieldValue(legacyNode.eyebrow) ?? mockHomepageEditorial.legacy.eyebrow,
      titleLine1:
        metafieldValue(legacyNode.titleLine1) ?? mockHomepageEditorial.legacy.titleLine1,
      titleLine2:
        metafieldValue(legacyNode.titleLine2) ?? mockHomepageEditorial.legacy.titleLine2,
      body: metafieldValue(legacyNode.body) ?? mockHomepageEditorial.legacy.body,
      image: resolveCommerceImage(
        metafieldValue(legacyNode.imageUrl),
        metafieldValue(legacyNode.imageAlt) ?? mockHomepageEditorial.legacy.image.alt ?? "",
        mockHomepageEditorial.legacy.image,
      ),
      pillars: pillars.filter((pillar) => pillar.title && pillar.description).length
        ? pillars.filter((pillar) => pillar.title && pillar.description)
        : mockHomepageEditorial.legacy.pillars,
    },
    quote: {
      line1: metafieldValue(quoteNode.line1) ?? mockHomepageEditorial.quote.line1,
      line2: metafieldValue(quoteNode.line2) ?? mockHomepageEditorial.quote.line2,
    },
    seo: {
      title: metafieldValue(heroNode.seoTitle) ?? mockHomepageEditorial.seo.title,
      description:
        metafieldValue(heroNode.seoDescription) ?? mockHomepageEditorial.seo.description,
    },
  };
}

function mapOurStoryContent(data: ShopifyEditorialResponse): CommerceOurStoryContent | null {
  const node = data.ourStory;
  if (!node) return null;

  return {
    hero: {
      eyebrow: metafieldValue(node.heroEyebrow) ?? mockOurStoryContent.hero.eyebrow,
      title: metafieldValue(node.heroTitle) ?? mockOurStoryContent.hero.title,
      image: resolveCommerceImage(
        metafieldValue(node.heroImageUrl),
        metafieldValue(node.heroImageAlt) ?? mockOurStoryContent.hero.image.alt ?? "",
        mockOurStoryContent.hero.image,
      ),
    },
    quote: metafieldValue(node.quoteText) ?? mockOurStoryContent.quote,
    heritage: {
      eyebrow: metafieldValue(node.heritageEyebrow) ?? mockOurStoryContent.heritage.eyebrow,
      title: metafieldValue(node.heritageTitle) ?? mockOurStoryContent.heritage.title,
      body: metafieldValue(node.heritageBody) ?? mockOurStoryContent.heritage.body,
      bodyExtra:
        metafieldValue(node.heritageBodyExtra) ?? mockOurStoryContent.heritage.bodyExtra,
      image: resolveCommerceImage(
        metafieldValue(node.heritageImageUrl),
        metafieldValue(node.heritageImageAlt) ?? mockOurStoryContent.heritage.image.alt ?? "",
        mockOurStoryContent.heritage.image,
      ),
    },
    sustainability: {
      eyebrow:
        metafieldValue(node.sustainabilityEyebrow) ?? mockOurStoryContent.sustainability.eyebrow,
      title: metafieldValue(node.sustainabilityTitle) ?? mockOurStoryContent.sustainability.title,
      body: metafieldValue(node.sustainabilityBody) ?? mockOurStoryContent.sustainability.body,
      image: resolveCommerceImage(
        metafieldValue(node.sustainabilityImageUrl),
        metafieldValue(node.sustainabilityImageAlt) ??
          mockOurStoryContent.sustainability.image.alt ??
          "",
        mockOurStoryContent.sustainability.image,
      ),
    },
  };
}

function mapCraftsmanshipContent(
  data: ShopifyEditorialResponse,
): CommerceCraftsmanshipContent | null {
  const node = data.craftsmanship;
  if (!node) return null;

  const steps = (data.craftsmanshipSteps?.nodes ?? [])
    .sort((a, b) => a.handle.localeCompare(b.handle))
    .map((stepNode, index) => ({
      number:
        metafieldValue(stepNode.number) ?? mockCraftsmanshipContent.steps[index]?.number ?? "",
      title: metafieldValue(stepNode.title) ?? "",
      description: metafieldValue(stepNode.description) ?? "",
    }))
    .filter((step) => step.title && step.description);

  const tips = parseJson<string[]>(
    metafieldValue(node.careTipsJson),
    mockCraftsmanshipContent.careGuide.tips,
  ).filter(Boolean);

  return {
    hero: {
      eyebrow: metafieldValue(node.heroEyebrow) ?? mockCraftsmanshipContent.hero.eyebrow,
      title: metafieldValue(node.heroTitle) ?? mockCraftsmanshipContent.hero.title,
      image: resolveCommerceImage(
        metafieldValue(node.heroImageUrl),
        metafieldValue(node.heroImageAlt) ?? mockCraftsmanshipContent.hero.image.alt ?? "",
        mockCraftsmanshipContent.hero.image,
      ),
    },
    intro: metafieldValue(node.intro) ?? mockCraftsmanshipContent.intro,
    steps: steps.length ? steps : mockCraftsmanshipContent.steps,
    careGuide: {
      eyebrow: metafieldValue(node.careEyebrow) ?? mockCraftsmanshipContent.careGuide.eyebrow,
      title: metafieldValue(node.careTitle) ?? mockCraftsmanshipContent.careGuide.title,
      tips: tips.length ? tips : mockCraftsmanshipContent.careGuide.tips,
      image: resolveCommerceImage(
        metafieldValue(node.careImageUrl),
        metafieldValue(node.careImageAlt) ?? mockCraftsmanshipContent.careGuide.image.alt ?? "",
        mockCraftsmanshipContent.careGuide.image,
      ),
    },
  };
}

function mapJournalIndexContent(data: ShopifyEditorialResponse): CommerceJournalIndexContent {
  const shop = data.shop;

  return {
    eyebrow: "Journal",
    title: metafieldValue(shop?.journalHeroTitleMetafield) ?? mockJournalIndexContent.title,
    description:
      metafieldValue(shop?.journalHeroDescriptionMetafield) ??
      mockJournalIndexContent.description,
    image: resolveCommerceImage(
      metafieldValue(shop?.journalHeroImageMetafield),
      mockJournalIndexContent.image.alt ?? "",
      mockJournalIndexContent.image,
    ),
  };
}

async function fetchShopifyEditorial(): Promise<ShopifyEditorialResponse> {
  const client = await getShopifyClient();
  const { data, errors } = await client.request(EDITORIAL_CONTENT_QUERY, {
    variables: {
      homepageHeroType: SHOPIFY_HOMEPAGE_HERO_METAOBJECT_TYPE,
      homepageValuePropType: SHOPIFY_HOMEPAGE_VALUE_PROP_METAOBJECT_TYPE,
      homepageMarqueeType: SHOPIFY_HOMEPAGE_MARQUEE_METAOBJECT_TYPE,
      homepageLegacyType: SHOPIFY_HOMEPAGE_LEGACY_METAOBJECT_TYPE,
      homepageQuoteType: SHOPIFY_HOMEPAGE_QUOTE_METAOBJECT_TYPE,
      ourStoryType: SHOPIFY_OUR_STORY_METAOBJECT_TYPE,
      craftsmanshipType: SHOPIFY_CRAFTSMANSHIP_METAOBJECT_TYPE,
      craftsmanshipStepType: SHOPIFY_CRAFTSMANSHIP_STEP_METAOBJECT_TYPE,
    },
  });

  if (errors) {
    throw new Error(`Shopify editorial: ${JSON.stringify(errors)}`);
  }

  return (data ?? {}) as ShopifyEditorialResponse;
}

async function getCachedEditorialResponse(): Promise<ShopifyEditorialResponse> {
  return unstable_cache(fetchShopifyEditorial, ["shopify-editorial", "v1"], {
    revalidate: EDITORIAL_REVALIDATE_SECONDS,
    tags: [SHOPIFY_CACHE_TAGS.editorial],
  })();
}

export async function getShopifyHomepageEditorial(): Promise<CommerceHomepageEditorial> {
  try {
    const data = await getCachedEditorialResponse();
    return mapHomepageEditorial(data) ?? mockHomepageEditorial;
  } catch {
    return mockHomepageEditorial;
  }
}

export async function getShopifyOurStoryContent(): Promise<CommerceOurStoryContent> {
  try {
    const data = await getCachedEditorialResponse();
    return mapOurStoryContent(data) ?? mockOurStoryContent;
  } catch {
    return mockOurStoryContent;
  }
}

export async function getShopifyCraftsmanshipContent(): Promise<CommerceCraftsmanshipContent> {
  try {
    const data = await getCachedEditorialResponse();
    return mapCraftsmanshipContent(data) ?? mockCraftsmanshipContent;
  } catch {
    return mockCraftsmanshipContent;
  }
}

export async function getShopifyJournalIndexContent(): Promise<CommerceJournalIndexContent> {
  try {
    const data = await getCachedEditorialResponse();
    return mapJournalIndexContent(data);
  } catch {
    return mockJournalIndexContent;
  }
}
