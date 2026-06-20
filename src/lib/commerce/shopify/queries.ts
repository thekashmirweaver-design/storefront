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
  query Products($first: Int!) {
    products(first: $first) {
      nodes {
        ...ProductFields
      }
    }
  }
`;

export const PRODUCTS_QUERY_NO_INVENTORY = `
  ${PRODUCT_FRAGMENT_NO_INVENTORY}
  query ProductsNoInventory($first: Int!) {
    products(first: $first) {
      nodes {
        ...ProductFieldsNoInventory
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
  query Collections($first: Int!) {
    collections(first: $first) {
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

export const COLLECTION_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  ${COLLECTION_METAFIELD_FRAGMENT}
  query CollectionByHandle($handle: String!, $first: Int!) {
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
      products(first: $first) {
        nodes {
          ...ProductFields
        }
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY_NO_INVENTORY = `
  ${PRODUCT_FRAGMENT_NO_INVENTORY}
  ${COLLECTION_METAFIELD_FRAGMENT}
  query CollectionByHandleNoInventory($handle: String!, $first: Int!) {
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
      products(first: $first) {
        nodes {
          ...ProductFieldsNoInventory
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

export const SHOP_CONTEXT_QUERY = `
  query ShopContext {
    shop {
      shippingPolicy {
        body
      }
      refundPolicy {
        body
      }
      privacyPolicy {
        body
      }
      termsOfService {
        body
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
    }
  }
`;
