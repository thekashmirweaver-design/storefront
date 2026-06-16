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
  images: CommerceImage[];
  colorHex: string;
  description: string;
  descriptionHtml?: string;
  availableForSale: boolean;
  variantId?: string;
  collectionSlug?: string;
};

export type CommerceCollection = {
  slug: string;
  title: string;
  tagline: string;
  category: CommerceProductCategory;
  image?: CommerceImage;
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
};

export type CommerceCart = {
  id: string;
  lines: CommerceCartLine[];
  subtotal: CommerceMoney;
  checkoutUrl: string | null;
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

export type BrandConfig = {
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
};
