import type {
  CommerceCart,
  CommerceCartActionResult,
  CommerceCartLine,
  CommerceCartWarning,
  CommerceMoney,
  CommerceProduct,
} from "../types";
import { createShopifyClient } from "./client";
import { mapShopifyProduct, type ShopifyProductNode } from "./mappers";
import {
  CART_CREATE_MUTATION,
  CART_CREATE_MUTATION_NO_INVENTORY,
  CART_LINES_ADD_MUTATION,
  CART_LINES_ADD_MUTATION_NO_INVENTORY,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_REMOVE_MUTATION_NO_INVENTORY,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_UPDATE_MUTATION_NO_INVENTORY,
  CART_QUERY,
  CART_QUERY_NO_INVENTORY,
} from "./cart-queries";
import { requestWithInventoryFallback } from "./inventory-scope";
import {
  clearShopifyCartIdCookie,
  getShopifyCartIdFromCookie,
  setShopifyCartIdCookie,
} from "./cart-cookie";

type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

type ShopifyCartLineNode = {
  id: string;
  quantity: number;
  cost?: {
    totalAmount?: ShopifyMoney | null;
  } | null;
  merchandise: {
    id: string;
    title?: string | null;
    availableForSale?: boolean;
    quantityAvailable?: number | null;
    image?: {
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
    price?: ShopifyMoney | null;
    product: {
      id: string;
      handle: string;
      title: string;
      description?: string | null;
      availableForSale?: boolean;
      productType?: string | null;
      featuredImage?: {
        url: string;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      } | null;
      priceRange?: {
        minVariantPrice: ShopifyMoney;
      };
      options?: ShopifyProductNode["options"];
      variants?: ShopifyProductNode["variants"];
      tags?: string[];
      collections?: { nodes: { handle: string }[] };
      inventoryQuantityMetafield?: { value?: string | null } | null;
    };
  };
};

type ShopifyCartNode = {
  id: string;
  checkoutUrl?: string | null;
  cost?: {
    subtotalAmount?: ShopifyMoney | null;
  } | null;
  lines?: {
    nodes: ShopifyCartLineNode[];
  } | null;
};

type ShopifyCartWarningNode = {
  code?: string | null;
  message?: string | null;
  target?: string | null;
};

type ShopifyCartMutationPayload = {
  cart?: ShopifyCartNode | null;
  userErrors?: { field?: string[] | null; message: string }[];
  warnings?: ShopifyCartWarningNode[];
};

type ShopifyCartCreateData = { cartCreate?: ShopifyCartMutationPayload };
type ShopifyCartLinesAddData = { cartLinesAdd?: ShopifyCartMutationPayload };
type ShopifyCartLinesUpdateData = { cartLinesUpdate?: ShopifyCartMutationPayload };
type ShopifyCartLinesRemoveData = { cartLinesRemove?: ShopifyCartMutationPayload };

function mapMoney(money: ShopifyMoney | null | undefined): CommerceMoney {
  return {
    amount: parseFloat(money?.amount ?? "0"),
    currencyCode: money?.currencyCode ?? "USD",
  };
}

function mapCartWarnings(
  warnings: ShopifyCartWarningNode[] | null | undefined,
): CommerceCartWarning[] {
  if (!warnings?.length) return [];
  return warnings
    .filter((w) => w.code || w.message)
    .map((w) => ({
      code: w.code ?? "UNKNOWN",
      message: w.message?.trim() ?? "",
      target: w.target ?? undefined,
    }));
}

function mapCartLine(node: ShopifyCartLineNode): CommerceCartLine {
  const variant = node.merchandise;
  const productNode = variant.product;
  const image = variant.image ?? productNode.featuredImage;

  const product: CommerceProduct = mapShopifyProduct({
    id: productNode.id,
    handle: productNode.handle,
    title: productNode.title,
    description: productNode.description ?? "",
    availableForSale: productNode.availableForSale ?? true,
    featuredImage: image,
    images: image ? { nodes: [image] } : undefined,
    priceRange: productNode.priceRange ?? {
      minVariantPrice: variant.price ?? { amount: "0", currencyCode: "USD" },
    },
    options: productNode.options,
    variants: {
      nodes: [
        {
          id: variant.id,
          availableForSale: variant.availableForSale ?? true,
          quantityAvailable: variant.quantityAvailable,
          selectedOptions: [],
        },
      ],
    },
    productType: productNode.productType,
    tags: productNode.tags,
    collections: productNode.collections,
    inventoryQuantityMetafield: productNode.inventoryQuantityMetafield,
  });

  return {
    id: node.id,
    productSlug: productNode.handle,
    quantity: node.quantity,
    product,
    lineTotal: node.cost?.totalAmount ? mapMoney(node.cost.totalAmount) : undefined,
  };
}

export function mapShopifyCart(node: ShopifyCartNode | null | undefined): CommerceCart | null {
  if (!node?.id) return null;

  const subtotalMoney = node.cost?.subtotalAmount;
  const firstLineCurrency = node.lines?.nodes?.[0]?.cost?.totalAmount?.currencyCode;

  return {
    id: node.id,
    lines: (node.lines?.nodes ?? []).map(mapCartLine),
    subtotal: subtotalMoney
      ? mapMoney(subtotalMoney)
      : { amount: 0, currencyCode: firstLineCurrency ?? "USD" },
    checkoutUrl: node.checkoutUrl ?? null,
  };
}

export function emptyCommerceCart(currencyCode = "USD"): CommerceCart {
  return {
    id: "",
    lines: [],
    subtotal: { amount: 0, currencyCode },
    checkoutUrl: null,
  };
}

function assertNoUserErrors(
  userErrors: { field?: string[] | null; message: string }[] | undefined,
  operation: string,
): void {
  if (!userErrors?.length) return;
  throw new Error(`${operation}: ${userErrors.map((e) => e.message).join(", ")}`);
}

async function fetchCartById(cartId: string): Promise<CommerceCart | null> {
  const client = createShopifyClient();
  const { data, errors } = await requestWithInventoryFallback<{ cart?: ShopifyCartNode | null }>(
    client,
    CART_QUERY,
    CART_QUERY_NO_INVENTORY,
    { variables: { cartId } },
  );
  if (errors) throw new Error(`Shopify fetchCart: ${JSON.stringify(errors)}`);
  return mapShopifyCart(data?.cart);
}

async function persistCart(cart: CommerceCart | null): Promise<CommerceCart> {
  if (!cart) return emptyCommerceCart();
  await setShopifyCartIdCookie(cart.id);
  return cart;
}

function mutationResult(
  cart: CommerceCart | null,
  warnings: CommerceCartWarning[],
): CommerceCartActionResult {
  return { cart, warnings };
}

export async function getShopifyCart(): Promise<CommerceCart> {
  const cartId = await getShopifyCartIdFromCookie();
  if (!cartId) return emptyCommerceCart();

  const cart = await fetchCartById(cartId);
  if (!cart) {
    await clearShopifyCartIdCookie();
    return emptyCommerceCart();
  }

  return cart;
}

export async function cartCreate(
  variantId: string,
  quantity: number,
): Promise<CommerceCartActionResult> {
  const client = createShopifyClient();
  const { data, errors } = await requestWithInventoryFallback<ShopifyCartCreateData>(
    client,
    CART_CREATE_MUTATION,
    CART_CREATE_MUTATION_NO_INVENTORY,
    {
      variables: {
        input: {
          lines: [{ merchandiseId: variantId, quantity }],
        },
      },
    },
  );
  if (errors) throw new Error(`Shopify cartCreate: ${JSON.stringify(errors)}`);

  const payload = data?.cartCreate;
  assertNoUserErrors(payload?.userErrors, "cartCreate");

  const cart = mapShopifyCart(payload?.cart);
  if (!cart) throw new Error("cartCreate: missing cart in response");
  const persisted = await persistCart(cart);
  return mutationResult(persisted, mapCartWarnings(payload?.warnings));
}

export async function cartLinesAdd(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<CommerceCartActionResult> {
  const client = createShopifyClient();
  const { data, errors } = await requestWithInventoryFallback<ShopifyCartLinesAddData>(
    client,
    CART_LINES_ADD_MUTATION,
    CART_LINES_ADD_MUTATION_NO_INVENTORY,
    {
      variables: {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      },
    },
  );
  if (errors) throw new Error(`Shopify cartLinesAdd: ${JSON.stringify(errors)}`);

  const payload = data?.cartLinesAdd;
  assertNoUserErrors(payload?.userErrors, "cartLinesAdd");

  const cart = mapShopifyCart(payload?.cart);
  if (!cart) throw new Error("cartLinesAdd: missing cart in response");
  const persisted = await persistCart(cart);
  const result = mutationResult(persisted, mapCartWarnings(payload?.warnings));
  return result;
}

export async function cartLinesUpdate(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<CommerceCartActionResult> {
  const client = createShopifyClient();
  const { data, errors } = await requestWithInventoryFallback<ShopifyCartLinesUpdateData>(
    client,
    CART_LINES_UPDATE_MUTATION,
    CART_LINES_UPDATE_MUTATION_NO_INVENTORY,
    {
      variables: {
        cartId,
        lines: [{ id: lineId, quantity }],
      },
    },
  );
  if (errors) throw new Error(`Shopify cartLinesUpdate: ${JSON.stringify(errors)}`);

  const payload = data?.cartLinesUpdate;
  assertNoUserErrors(payload?.userErrors, "cartLinesUpdate");

  const cart = mapShopifyCart(payload?.cart);
  if (!cart) throw new Error("cartLinesUpdate: missing cart in response");
  const persisted = await persistCart(cart);
  return mutationResult(persisted, mapCartWarnings(payload?.warnings));
}

export async function cartLinesRemove(
  cartId: string,
  lineIds: string[],
): Promise<CommerceCartActionResult> {
  const client = createShopifyClient();
  const { data, errors } = await requestWithInventoryFallback<ShopifyCartLinesRemoveData>(
    client,
    CART_LINES_REMOVE_MUTATION,
    CART_LINES_REMOVE_MUTATION_NO_INVENTORY,
    { variables: { cartId, lineIds } },
  );
  if (errors) throw new Error(`Shopify cartLinesRemove: ${JSON.stringify(errors)}`);

  const payload = data?.cartLinesRemove;
  assertNoUserErrors(payload?.userErrors, "cartLinesRemove");

  const cart = mapShopifyCart(payload?.cart);
  if (!cart) throw new Error("cartLinesRemove: missing cart in response");
  const persisted = await persistCart(cart);
  return mutationResult(persisted, mapCartWarnings(payload?.warnings));
}

export async function addVariantToShopifyCart(
  variantId: string,
  quantity: number,
): Promise<CommerceCartActionResult> {
  const existingCartId = await getShopifyCartIdFromCookie();
  if (!existingCartId) {
    return cartCreate(variantId, quantity);
  }

  const existing = await fetchCartById(existingCartId);
  if (!existing) {
    await clearShopifyCartIdCookie();
    return cartCreate(variantId, quantity);
  }

  return cartLinesAdd(existing.id, variantId, quantity);
}

export async function updateShopifyCartLine(
  lineId: string,
  quantity: number,
): Promise<CommerceCartActionResult> {
  const cartId = await getShopifyCartIdFromCookie();
  if (!cartId) return mutationResult(emptyCommerceCart(), []);

  if (quantity <= 0) {
    return cartLinesRemove(cartId, [lineId]);
  }

  return cartLinesUpdate(cartId, lineId, quantity);
}

export async function removeShopifyCartLine(lineId: string): Promise<CommerceCartActionResult> {
  const cartId = await getShopifyCartIdFromCookie();
  if (!cartId) return mutationResult(emptyCommerceCart(), []);
  return cartLinesRemove(cartId, [lineId]);
}

export async function clearShopifyCart(): Promise<CommerceCartActionResult> {
  await clearShopifyCartIdCookie();
  return mutationResult(emptyCommerceCart(), []);
}
