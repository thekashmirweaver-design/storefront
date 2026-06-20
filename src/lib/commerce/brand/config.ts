import { getSiteUrl } from "@/lib/site-url";

import type { BrandConfig } from "../types";

const siteUrl = getSiteUrl();

/** Mock mode + Shopify API fallback defaults — not production brand data. */
export const brandDefaults = {
  id: "default",
  name: "Store",
  tagline: "",
  siteUrl,
  logo: {
    src: "/images/gulriza-icon.png",
    alt: "Store",
    width: 48,
    height: 48,
  },
  contact: {
    email: "",
    phone: "",
    address: "",
    hours: "",
  },
  social: {
    facebook: undefined,
    youtube: undefined,
    instagram: undefined,
    pinterest: undefined,
  },
  seo: {
    defaultTitle: "Store",
    titleTemplate: "%s",
    defaultDescription: "",
    ogTitle: "",
    ogDescription: "",
  },
  headerNav: [{ label: "Shop", href: "/shop" }],
  footerMenus: [],
  footerDescription: "",
  newsletter: {
    title: "",
    description: "",
    placeholder: "Enter your email",
  },
  legal: {
    privacyPolicyUrl: "/privacy",
    termsUrl: "/terms",
  },
  copy: {
    productNoun: "product",
    origin: "",
    searchPlaceholder: "Search…",
    pages: {
      home: {
        legacyBody:
          "Every {name} {productNoun} is crafted with care and made to be cherished for a lifetime.",
      },
      shop: {
        subtitle: "Explore our complete range of {name} {productNoun}.",
      },
      account: {
        registerSubtitle: "Join {name} to follow new arrivals and exclusive editions.",
        newToBrand: "New to {name}?",
        hasAccount: "Already have an account?",
      },
      product: {
        authenticityPromise:
          "Every {name} {productNoun} is made to the highest standards of quality.",
      },
      ourStory: {
        nameMeaningQuote: "{name} — artisans who carry forward tradition, thread by thread.",
        heritageBody:
          "{name} partners directly with skilled makers who have practiced their craft across generations.",
      },
      craftsmanship: {
        intro:
          "A single {name} {productNoun} passes through many hands before it reaches you. Here is how it is made.",
      },
    },
    messages: {
      newsletterWelcome: "Welcome to {name}.",
    },
  },
} satisfies BrandConfig;

/** @deprecated Use brandDefaults — kept for backward compatibility. */
export const brandConfig = brandDefaults;
