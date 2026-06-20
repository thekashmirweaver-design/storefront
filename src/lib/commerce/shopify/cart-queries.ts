export const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            quantityAvailable
            image {
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            product {
              id
              handle
              title
              description
              availableForSale
              productType
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
              options {
                name
                optionValues {
                  name
                  swatch {
                    color
                  }
                }
              }
              tags
              collections(first: 1) {
                nodes {
                  handle
                }
              }
              inventoryQuantityMetafield: metafield(namespace: "custom", key: "inventory_quantity") {
                value
              }
            }
          }
        }
      }
    }
  }
`;

export const CART_FRAGMENT_NO_INVENTORY = `
  fragment CartFieldsNoInventory on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            image {
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            product {
              id
              handle
              title
              description
              availableForSale
              productType
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
              options {
                name
                optionValues {
                  name
                  swatch {
                    color
                  }
                }
              }
              tags
              collections(first: 1) {
                nodes {
                  handle
                }
              }
              inventoryQuantityMetafield: metafield(namespace: "custom", key: "inventory_quantity") {
                value
              }
            }
          }
        }
      }
    }
  }
`;

export const CART_QUERY = `
  ${CART_FRAGMENT}
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

export const CART_QUERY_NO_INVENTORY = `
  ${CART_FRAGMENT_NO_INVENTORY}
  query CartNoInventory($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFieldsNoInventory
    }
  }
`;

export const CART_CREATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
`;

export const CART_CREATE_MUTATION_NO_INVENTORY = `
  ${CART_FRAGMENT_NO_INVENTORY}
  mutation CartCreateNoInventory($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFieldsNoInventory
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION_NO_INVENTORY = `
  ${CART_FRAGMENT_NO_INVENTORY}
  mutation CartLinesAddNoInventory($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFieldsNoInventory
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION_NO_INVENTORY = `
  ${CART_FRAGMENT_NO_INVENTORY}
  mutation CartLinesUpdateNoInventory($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFieldsNoInventory
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION_NO_INVENTORY = `
  ${CART_FRAGMENT_NO_INVENTORY}
  mutation CartLinesRemoveNoInventory($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFieldsNoInventory
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_BUYER_IDENTITY_UPDATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
`;

export const CART_BUYER_IDENTITY_UPDATE_MUTATION_NO_INVENTORY = `
  ${CART_FRAGMENT_NO_INVENTORY}
  mutation CartBuyerIdentityUpdateNoInventory($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ...CartFieldsNoInventory
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
        target
      }
    }
  }
`;
