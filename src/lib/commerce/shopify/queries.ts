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
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
    productType
    tags
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

export const PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export const COLLECTIONS_QUERY = `
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes {
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
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query CollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
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
      products(first: $first) {
        nodes {
          ...ProductFields
        }
      }
    }
  }
`;

export const SEARCH_QUERY = `
  ${PRODUCT_FRAGMENT}
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
