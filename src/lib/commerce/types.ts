export type CommerceImage = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type CommerceMoney = {
  amount: number;
  currencyCode: string;
};

export type CommerceProductCategory = "signature" | "lightweight" | "bridal" | "limited";

export type CommerceProduct = {
  id: string;
  slug: string;
  name: string;
  category: CommerceProductCategory;
  categoryLabel: string;
  price: CommerceMoney;
  /** Variant compare-at / was price when set in Shopify Admin */
  compareAtPrice?: CommerceMoney;
  images: CommerceImage[];
  colorHex: string;
  /** Display name from variant Color option (Shopify) or mock catalog. */
  colorName?: string;
  description: string;
  descriptionHtml?: string;
  availableForSale: boolean;
  /** Storefront inventory when tracked; null/undefined when unknown. */
  quantityAvailable?: number | null;
  variantId?: string;
  collectionSlug?: string;
  /** From Shopify product metafield custom.care_instructions */
  careInstructions?: string;
  /** From Shopify product metafield custom.dimensions */
  dimensions?: string;
  /** Bullet highlights — metafield custom.product_highlights or parsed from descriptionHtml */
  highlights?: string[];
  /** Per-product override for Shipping & Returns accordion */
  shippingReturnsText?: string;
  /** Per-product override for Our Promise accordion */
  authenticityPromise?: string;
};

export type CommerceStorefrontSettings = {
  authenticityPromise?: string;
  shippingBadgeText?: string;
  returnsBadgeText?: string;
};

export type CommerceShopPolicies = {
  shippingPolicyHtml?: string;
  refundPolicyHtml?: string;
  privacyPolicyHtml?: string;
  termsOfServiceHtml?: string;
};

export type CommerceCollection = {
  slug: string;
  title: string;
  /** Optional poetic hero headline shown below the eyebrow. */
  heroHeadline?: string;
  /** Short hero subhead (often shown in italic gold). */
  tagline: string;
  /** Longer story copy for the collection hero. */
  description?: string;
  /** Rich story copy from Shopify collection descriptionHtml. */
  descriptionHtml?: string;
  category: CommerceProductCategory;
  image?: CommerceImage;
  /** Hero CTA label; defaults to "Explore {title}" when omitted. */
  ctaLabel?: string;
};

export type HomepageCollectionSection = {
  collection: CommerceCollection;
  previewProducts: CommerceProduct[];
};

export type CommerceArticle = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  cover: CommerceImage;
  bodyHtml?: string;
};

export type CommerceFaq = {
  question: string;
  answer: string;
};

export type CommerceColor = {
  name: string;
  hex: string;
};

export type CommerceCartLine = {
  id: string;
  productSlug: string;
  quantity: number;
  product?: CommerceProduct;
  /** Line total from Shopify cart cost (shopify provider). */
  lineTotal?: CommerceMoney;
};

export type CommerceCart = {
  id: string;
  lines: CommerceCartLine[];
  subtotal: CommerceMoney;
  checkoutUrl: string | null;
};

export type CommerceCartWarningCode =
  | "MERCHANDISE_NOT_ENOUGH_STOCK"
  | "MERCHANDISE_OUT_OF_STOCK"
  | (string & {});

export type CommerceCartWarning = {
  code: CommerceCartWarningCode;
  message: string;
  target?: string;
};

export type CommerceCartActionResult = {
  cart: CommerceCart | null;
  warnings: CommerceCartWarning[];
};

export type CommerceCustomerSession = {
  authenticated: boolean;
  displayName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type CommerceOrderLineItem = {
  title: string;
  quantity: number;
  imageUrl?: string;
  imageAlt?: string;
};

export type CommerceOrder = {
  id: string;
  name: string;
  processedAt?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  totalPrice: CommerceMoney;
  lineItems: CommerceOrderLineItem[];
};

export type ProductFilters = {
  categories?: CommerceProductCategory[];
  colors?: string[];
  collectionSlugs?: string[];
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "name";
  page?: number;
  pageSize?: number;
};

export type PaginatedProducts = {
  products: CommerceProduct[];
  total: number;
  page: number;
  pageSize: number;
};

export type CommerceSearchResult = {
  products: CommerceProduct[];
  collections: CommerceCollection[];
  articles: CommerceArticle[];
};

export type CommerceSitemapEntry = {
  path: string;
  lastModified?: Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

export type ContactFormInput = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export type BrandCopy = {
  productNoun: string;
  origin: string;
  searchPlaceholder: string;
  pages: {
    home: { legacyBody: string };
    shop: { subtitle: string };
    account: {
      registerSubtitle: string;
      newToBrand: string;
      hasAccount: string;
    };
    product: { authenticityPromise: string };
    ourStory: {
      nameMeaningQuote: string;
      heritageBody: string;
    };
    craftsmanship: { intro: string };
  };
  messages: {
    newsletterWelcome: string;
  };
};

export type BrandConfig = {
  id: string;
  name: string;
  tagline: string;
  siteUrl: string;
  logo: CommerceImage;
  contact: {
    email: string;
    phone: string;
    address: string;
    hours: string;
  };
  social: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    pinterest?: string;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    ogTitle: string;
    ogDescription: string;
  };
  footerMenus: { title: string; links: { label: string; href: string }[] }[];
  headerNav: { label: string; href: string }[];
  footerDescription: string;
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
  };
  legal: {
    privacyPolicyUrl: string;
    termsUrl: string;
  };
  copy: BrandCopy;
};
