export const CUSTOMER_PROFILE_QUERY = `
  query CustomerProfile {
    customer {
      id
      firstName
      lastName
      displayName
      emailAddress {
        emailAddress
      }
    }
  }
`;

export const CUSTOMER_ORDERS_QUERY = `
  query CustomerOrders($first: Int!) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 8) {
            nodes {
              title
              quantity
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export const CUSTOMER_WISHLIST_QUERY = `
  query CustomerWishlist {
    customer {
      id
      metafield(namespace: "custom", key: "wishlist") {
        value
      }
    }
  }
`;

export const CUSTOMER_WISHLIST_SET_MUTATION = `
  mutation CustomerWishlistSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        namespace
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;
