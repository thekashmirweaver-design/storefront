export const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    options {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        quantityAvailable
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    productType
    tags
    collections(first: 1) {
      nodes {
        handle
      }
    }
    careInstructionsMetafield: metafield(namespace: "custom", key: "care_instructions") {
      value
    }
    dimensionsMetafield: metafield(namespace: "custom", key: "dimensions") {
      value
    }
    productHighlightsMetafield: metafield(namespace: "custom", key: "product_highlights") {
      value
    }
    shippingReturnsMetafield: metafield(namespace: "custom", key: "shipping_returns_text") {
      value
    }
    authenticityPromiseMetafield: metafield(namespace: "custom", key: "authenticity_promise") {
      value
    }
    inventoryQuantityMetafield: metafield(namespace: "custom", key: "inventory_quantity") {
      value
    }
  }
`;

export const PRODUCT_FRAGMENT_NO_INVENTORY = `
  fragment ProductFieldsNoInventory on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    options {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    productType
    tags
    collections(first: 1) {
      nodes {
        handle
      }
    }
    careInstructionsMetafield: metafield(namespace: "custom", key: "care_instructions") {
      value
    }
    dimensionsMetafield: metafield(namespace: "custom", key: "dimensions") {
      value
    }
    productHighlightsMetafield: metafield(namespace: "custom", key: "product_highlights") {
      value
    }
    shippingReturnsMetafield: metafield(namespace: "custom", key: "shipping_returns_text") {
      value
    }
    authenticityPromiseMetafield: metafield(namespace: "custom", key: "authenticity_promise") {
      value
    }
    inventoryQuantityMetafield: metafield(namespace: "custom", key: "inventory_quantity") {
      value
    }
  }
`;

export const PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        ...ProductFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCTS_QUERY_NO_INVENTORY = `
  ${PRODUCT_FRAGMENT_NO_INVENTORY}
  query ProductsNoInventory($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        ...ProductFieldsNoInventory
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY_NO_INVENTORY = `
  ${PRODUCT_FRAGMENT_NO_INVENTORY}
  query ProductByHandleNoInventory($handle: String!) {
    product(handle: $handle) {
      ...ProductFieldsNoInventory
    }
  }
`;

export const PRODUCT_RECOMMENDATIONS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductFields
    }
  }
`;

export const PRODUCT_RECOMMENDATIONS_QUERY_NO_INVENTORY = `
  ${PRODUCT_FRAGMENT_NO_INVENTORY}
  query ProductRecommendationsNoInventory($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductFieldsNoInventory
    }
  }
`;

export const COLLECTION_METAFIELD_FRAGMENT = `
  fragment CollectionMetafields on Collection {
    heroHeadlineMetafield: metafield(namespace: "custom", key: "hero_headline") {
      value
    }
    heroTaglineMetafield: metafield(namespace: "custom", key: "hero_tagline") {
      value
    }
    ctaLabelMetafield: metafield(namespace: "custom", key: "cta_label") {
      value
    }
  }
`;

export const COLLECTIONS_QUERY = `
  ${COLLECTION_METAFIELD_FRAGMENT}
  query Collections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      nodes {
        id
        handle
        title
        description
        descriptionHtml
        image {
          url
          altText
          width
          height
        }
        ...CollectionMetafields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  ${COLLECTION_METAFIELD_FRAGMENT}
  query CollectionByHandle($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      image {
        url
        altText
        width
        height
      }
      ...CollectionMetafields
      products(first: $first, after: $after) {
        nodes {
          ...ProductFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY_NO_INVENTORY = `
  ${PRODUCT_FRAGMENT_NO_INVENTORY}
  ${COLLECTION_METAFIELD_FRAGMENT}
  query CollectionByHandleNoInventory($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      image {
        url
        altText
        width
        height
      }
      ...CollectionMetafields
      products(first: $first, after: $after) {
        nodes {
          ...ProductFieldsNoInventory
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const SEARCH_QUERY = `
  ${PRODUCT_FRAGMENT}
  ${COLLECTION_METAFIELD_FRAGMENT}
  query Search($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      nodes {
        ...ProductFields
      }
    }
    collections(first: $first, query: $query) {
      nodes {
        id
        handle
        title
        description
        descriptionHtml
        image {
          url
          altText
          width
          height
        }
        ...CollectionMetafields
      }
    }
  }
`;

export const SEARCH_QUERY_NO_INVENTORY = `
  ${PRODUCT_FRAGMENT_NO_INVENTORY}
  ${COLLECTION_METAFIELD_FRAGMENT}
  query SearchNoInventory($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      nodes {
        ...ProductFieldsNoInventory
      }
    }
    collections(first: $first, query: $query) {
      nodes {
        id
        handle
        title
        description
        descriptionHtml
        image {
          url
          altText
          width
          height
        }
        ...CollectionMetafields
      }
    }
  }
`;

/** Lighter product fields for type-ahead predictive search. */
export const PREDICTIVE_PRODUCT_FRAGMENT = `
  fragment PredictiveProductFields on Product {
    id
    handle
    title
    description
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    productType
    tags
    options {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        quantityAvailable
        selectedOptions {
          name
          value
        }
      }
    }
    collections(first: 1) {
      nodes {
        handle
      }
    }
  }
`;

export const PREDICTIVE_PRODUCT_FRAGMENT_NO_INVENTORY = `
  fragment PredictiveProductFieldsNoInventory on Product {
    id
    handle
    title
    description
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    productType
    tags
    options {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
      }
    }
    collections(first: 1) {
      nodes {
        handle
      }
    }
  }
`;

export const PREDICTIVE_SEARCH_QUERY = `
  ${PREDICTIVE_PRODUCT_FRAGMENT}
  query PredictiveSearch($query: String!, $limit: Int!) {
    predictiveSearch(query: $query, limit: $limit, types: [PRODUCT, COLLECTION, ARTICLE]) {
      products {
        ...PredictiveProductFields
      }
      collections {
        id
        handle
        title
        description
        image {
          url
          altText
          width
          height
        }
      }
      articles {
        handle
        title
        excerpt
        publishedAt
        tags
        image {
          url
          altText
          width
          height
        }
      }
      queries {
        text
      }
    }
  }
`;

export const PREDICTIVE_SEARCH_QUERY_NO_INVENTORY = `
  ${PREDICTIVE_PRODUCT_FRAGMENT_NO_INVENTORY}
  query PredictiveSearchNoInventory($query: String!, $limit: Int!) {
    predictiveSearch(query: $query, limit: $limit, types: [PRODUCT, COLLECTION, ARTICLE]) {
      products {
        ...PredictiveProductFieldsNoInventory
      }
      collections {
        id
        handle
        title
        description
        image {
          url
          altText
          width
          height
        }
      }
      articles {
        handle
        title
        excerpt
        publishedAt
        tags
        image {
          url
          altText
          width
          height
        }
      }
      queries {
        text
      }
    }
  }
`;

export const BLOG_ARTICLES_QUERY = `
  query BlogArticles($blogHandle: String!, $first: Int!) {
    blog(handle: $blogHandle) {
      articles(first: $first) {
        nodes {
          id
          handle
          title
          excerpt
          publishedAt
          tags
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

export const ARTICLE_BY_HANDLE_QUERY = `
  query ArticleByHandle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id
        handle
        title
        excerpt
        contentHtml
        publishedAt
        tags
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

const SHOP_BRAND_METAFIELD_FRAGMENT = `
  brandTaglineMetafield: metafield(namespace: "custom", key: "brand_tagline") { value }
  contactEmailMetafield: metafield(namespace: "custom", key: "contact_email") { value }
  contactPhoneMetafield: metafield(namespace: "custom", key: "contact_phone") { value }
  contactAddressMetafield: metafield(namespace: "custom", key: "contact_address") { value }
  contactHoursMetafield: metafield(namespace: "custom", key: "contact_hours") { value }
  socialFacebookMetafield: metafield(namespace: "custom", key: "social_facebook") { value }
  socialYoutubeMetafield: metafield(namespace: "custom", key: "social_youtube") { value }
  socialInstagramMetafield: metafield(namespace: "custom", key: "social_instagram") { value }
  socialPinterestMetafield: metafield(namespace: "custom", key: "social_pinterest") { value }
  seoDefaultTitleMetafield: metafield(namespace: "custom", key: "seo_default_title") { value }
  seoTitleTemplateMetafield: metafield(namespace: "custom", key: "seo_title_template") { value }
  seoDefaultDescriptionMetafield: metafield(namespace: "custom", key: "seo_default_description") { value }
  seoOgTitleMetafield: metafield(namespace: "custom", key: "seo_og_title") { value }
  seoOgDescriptionMetafield: metafield(namespace: "custom", key: "seo_og_description") { value }
  brandIdMetafield: metafield(namespace: "custom", key: "brand_id") { value }
  productNounMetafield: metafield(namespace: "custom", key: "product_noun") { value }
  brandOriginMetafield: metafield(namespace: "custom", key: "brand_origin") { value }
  searchPlaceholderMetafield: metafield(namespace: "custom", key: "search_placeholder") { value }
  copyJsonMetafield: metafield(namespace: "custom", key: "copy_json") { value }
  logoUrlMetafield: metafield(namespace: "custom", key: "logo_url") { value }
  logoWidthMetafield: metafield(namespace: "custom", key: "logo_width") { value }
  logoHeightMetafield: metafield(namespace: "custom", key: "logo_height") { value }
  footerDescriptionMetafield: metafield(namespace: "custom", key: "footer_description") { value }
  newsletterTitleMetafield: metafield(namespace: "custom", key: "newsletter_title") { value }
  newsletterDescriptionMetafield: metafield(namespace: "custom", key: "newsletter_description") { value }
  newsletterPlaceholderMetafield: metafield(namespace: "custom", key: "newsletter_placeholder") { value }
`;

const MENU_ITEM_FRAGMENT = `
  title
  url
  items {
    title
    url
    items {
      title
      url
    }
  }
`;

export const SHOP_CONTEXT_QUERY = `
  query ShopContext {
    shop {
      name
      shippingPolicy {
        body
        url
      }
      refundPolicy {
        body
        url
      }
      privacyPolicy {
        body
        url
      }
      termsOfService {
        body
        url
      }
      authenticityPromiseMetafield: metafield(namespace: "custom", key: "authenticity_promise") {
        value
      }
      shippingBadgeMetafield: metafield(namespace: "custom", key: "shipping_badge_text") {
        value
      }
      returnsBadgeMetafield: metafield(namespace: "custom", key: "returns_badge_text") {
        value
      }
      shippingReturnsMetafield: metafield(namespace: "custom", key: "shipping_returns_text") {
        value
      }
      ${SHOP_BRAND_METAFIELD_FRAGMENT}
    }
  }
`;

export const FAQS_QUERY = `
  query Faqs($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      nodes {
        handle
        question: field(key: "question") {
          value
        }
        answer: field(key: "answer") {
          value
        }
        showOnFaqPage: field(key: "show_on_faq_page") {
          value
        }
      }
    }
  }
`;

/** App-owned editorial metaobject types — must match partner app shopify.app.toml and seed script. */
export const SHOPIFY_HOMEPAGE_HERO_METAOBJECT_TYPE = "$app:homepage_hero";
export const SHOPIFY_HOMEPAGE_VALUE_PROP_METAOBJECT_TYPE = "$app:homepage_value_prop";
export const SHOPIFY_HOMEPAGE_MARQUEE_METAOBJECT_TYPE = "$app:homepage_marquee_item";
export const SHOPIFY_HOMEPAGE_LEGACY_METAOBJECT_TYPE = "$app:homepage_legacy";
export const SHOPIFY_HOMEPAGE_QUOTE_METAOBJECT_TYPE = "$app:homepage_quote";
export const SHOPIFY_OUR_STORY_METAOBJECT_TYPE = "$app:our_story";
export const SHOPIFY_CRAFTSMANSHIP_METAOBJECT_TYPE = "$app:craftsmanship";
export const SHOPIFY_CRAFTSMANSHIP_STEP_METAOBJECT_TYPE = "$app:craftsmanship_step";

const HOMEPAGE_HERO_FIELDS = `
  eyebrow: field(key: "eyebrow") { value }
  headlineLine1: field(key: "headline_line1") { value }
  headlineLine2: field(key: "headline_line2") { value }
  description: field(key: "description") { value }
  ctaLabel: field(key: "cta_label") { value }
  ctaHref: field(key: "cta_href") { value }
  imageUrl: field(key: "image_url") { value }
  imageAlt: field(key: "image_alt") { value }
  seoTitle: field(key: "seo_title") { value }
  seoDescription: field(key: "seo_description") { value }
`;

const HOMEPAGE_LEGACY_FIELDS = `
  eyebrow: field(key: "eyebrow") { value }
  titleLine1: field(key: "title_line1") { value }
  titleLine2: field(key: "title_line2") { value }
  body: field(key: "body") { value }
  imageUrl: field(key: "image_url") { value }
  imageAlt: field(key: "image_alt") { value }
  pillarsJson: field(key: "pillars_json") { value }
`;

const HOMEPAGE_QUOTE_FIELDS = `
  line1: field(key: "line1") { value }
  line2: field(key: "line2") { value }
`;

const OUR_STORY_FIELDS = `
  heroEyebrow: field(key: "hero_eyebrow") { value }
  heroTitle: field(key: "hero_title") { value }
  heroImageUrl: field(key: "hero_image_url") { value }
  heroImageAlt: field(key: "hero_image_alt") { value }
  quoteText: field(key: "quote_text") { value }
  heritageEyebrow: field(key: "heritage_eyebrow") { value }
  heritageTitle: field(key: "heritage_title") { value }
  heritageBody: field(key: "heritage_body") { value }
  heritageBodyExtra: field(key: "heritage_body_extra") { value }
  heritageImageUrl: field(key: "heritage_image_url") { value }
  heritageImageAlt: field(key: "heritage_image_alt") { value }
  sustainabilityEyebrow: field(key: "sustainability_eyebrow") { value }
  sustainabilityTitle: field(key: "sustainability_title") { value }
  sustainabilityBody: field(key: "sustainability_body") { value }
  sustainabilityImageUrl: field(key: "sustainability_image_url") { value }
  sustainabilityImageAlt: field(key: "sustainability_image_alt") { value }
`;

const CRAFTSMANSHIP_FIELDS = `
  heroEyebrow: field(key: "hero_eyebrow") { value }
  heroTitle: field(key: "hero_title") { value }
  heroImageUrl: field(key: "hero_image_url") { value }
  heroImageAlt: field(key: "hero_image_alt") { value }
  intro: field(key: "intro") { value }
  careEyebrow: field(key: "care_eyebrow") { value }
  careTitle: field(key: "care_title") { value }
  careTipsJson: field(key: "care_tips_json") { value }
  careImageUrl: field(key: "care_image_url") { value }
  careImageAlt: field(key: "care_image_alt") { value }
`;

export const EDITORIAL_CONTENT_QUERY = `
  query EditorialContent(
    $homepageHeroType: String!
    $homepageValuePropType: String!
    $homepageMarqueeType: String!
    $homepageLegacyType: String!
    $homepageQuoteType: String!
    $ourStoryType: String!
    $craftsmanshipType: String!
    $craftsmanshipStepType: String!
  ) {
    shop {
      journalHeroImageMetafield: metafield(namespace: "custom", key: "journal_hero_image_url") {
        value
      }
      journalHeroTitleMetafield: metafield(namespace: "custom", key: "journal_hero_title") {
        value
      }
      journalHeroDescriptionMetafield: metafield(namespace: "custom", key: "journal_hero_description") {
        value
      }
    }
    homepageHero: metaobject(handle: { type: $homepageHeroType, handle: "main" }) {
      ${HOMEPAGE_HERO_FIELDS}
    }
    homepageLegacy: metaobject(handle: { type: $homepageLegacyType, handle: "main" }) {
      ${HOMEPAGE_LEGACY_FIELDS}
    }
    homepageQuote: metaobject(handle: { type: $homepageQuoteType, handle: "main" }) {
      ${HOMEPAGE_QUOTE_FIELDS}
    }
    ourStory: metaobject(handle: { type: $ourStoryType, handle: "main" }) {
      ${OUR_STORY_FIELDS}
    }
    craftsmanship: metaobject(handle: { type: $craftsmanshipType, handle: "main" }) {
      ${CRAFTSMANSHIP_FIELDS}
    }
    homepageValueProps: metaobjects(type: $homepageValuePropType, first: 20) {
      nodes {
        handle
        label: field(key: "label") { value }
        icon: field(key: "icon") { value }
      }
    }
    homepageMarquee: metaobjects(type: $homepageMarqueeType, first: 20) {
      nodes {
        handle
        text: field(key: "text") { value }
      }
    }
    craftsmanshipSteps: metaobjects(type: $craftsmanshipStepType, first: 20) {
      nodes {
        handle
        number: field(key: "number") { value }
        title: field(key: "title") { value }
        description: field(key: "description") { value }
      }
    }
  }
`;

export const SHOP_BRAND_QUERY = `
  query ShopBrand($mainMenuHandle: String!, $footerMenuHandle: String!) {
    shop {
      name
      privacyPolicy {
        url
      }
      termsOfService {
        url
      }
      ${SHOP_BRAND_METAFIELD_FRAGMENT}
    }
    mainMenu: menu(handle: $mainMenuHandle) {
      title
      items {
        ${MENU_ITEM_FRAGMENT}
      }
    }
    footerMenu: menu(handle: $footerMenuHandle) {
      title
      items {
        ${MENU_ITEM_FRAGMENT}
      }
    }
  }
`;
