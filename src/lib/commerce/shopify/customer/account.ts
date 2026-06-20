import "server-only";

import type { CommerceCustomerSession, CommerceMoney, CommerceOrder } from "../../types";
import { customerAccountRequest } from "./client";
import {
  CUSTOMER_ORDERS_QUERY,
  CUSTOMER_PROFILE_QUERY,
  CUSTOMER_WISHLIST_QUERY,
  CUSTOMER_WISHLIST_SET_MUTATION,
} from "./queries";
import { WISHLIST_METAFIELD_KEY, WISHLIST_METAFIELD_NAMESPACE } from "./config";

type ProfileData = {
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    emailAddress?: { emailAddress?: string | null } | null;
  } | null;
};

type OrdersData = {
  customer?: {
    orders?: {
      nodes?: Array<{
        id: string;
        name: string;
        processedAt?: string | null;
        financialStatus?: string | null;
        fulfillmentStatus?: string | null;
        totalPrice?: { amount: string; currencyCode: string } | null;
        lineItems?: {
          nodes?: Array<{
            title: string;
            quantity: number;
            image?: { url?: string | null; altText?: string | null } | null;
          }>;
        } | null;
      }>;
    } | null;
  } | null;
};

type WishlistData = {
  customer?: {
    id: string;
    metafield?: { value?: string | null } | null;
  } | null;
};

function mapMoney(money?: { amount: string; currencyCode: string } | null): CommerceMoney {
  return {
    amount: parseFloat(money?.amount ?? "0"),
    currencyCode: money?.currencyCode ?? "USD",
  };
}

function parseWishlistValue(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

function uniqueSlugs(slugs: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const slug of slugs) {
    if (!seen.has(slug)) {
      seen.add(slug);
      result.push(slug);
    }
  }
  return result;
}

export async function getCustomerProfile(): Promise<CommerceCustomerSession> {
  const data = await customerAccountRequest<ProfileData>(CUSTOMER_PROFILE_QUERY);
  const customer = data.customer;
  if (!customer) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    displayName: customer.displayName ?? undefined,
    email: customer.emailAddress?.emailAddress ?? undefined,
    firstName: customer.firstName ?? undefined,
    lastName: customer.lastName ?? undefined,
  };
}

export async function getCustomerOrders(limit = 12): Promise<CommerceOrder[]> {
  const data = await customerAccountRequest<OrdersData>(CUSTOMER_ORDERS_QUERY, { first: limit });
  const nodes = data.customer?.orders?.nodes ?? [];

  return nodes.map((order) => ({
    id: order.id,
    name: order.name,
    processedAt: order.processedAt ?? undefined,
    financialStatus: order.financialStatus ?? undefined,
    fulfillmentStatus: order.fulfillmentStatus ?? undefined,
    totalPrice: mapMoney(order.totalPrice),
    lineItems: (order.lineItems?.nodes ?? []).map((line) => ({
      title: line.title,
      quantity: line.quantity,
      imageUrl: line.image?.url ?? undefined,
      imageAlt: line.image?.altText ?? undefined,
    })),
  }));
}

export async function getCustomerWishlistSlugs(): Promise<string[]> {
  const data = await customerAccountRequest<WishlistData>(CUSTOMER_WISHLIST_QUERY);
  return parseWishlistValue(data.customer?.metafield?.value);
}

export async function setCustomerWishlistSlugs(slugs: string[]): Promise<string[]> {
  const data = await customerAccountRequest<WishlistData>(CUSTOMER_WISHLIST_QUERY);
  const customerId = data.customer?.id;
  if (!customerId) {
    throw new Error("Customer wishlist update requires a logged-in customer");
  }

  const normalized = uniqueSlugs(slugs);
  const result = await customerAccountRequest<{
    metafieldsSet?: {
      userErrors?: { message: string }[];
    };
  }>(CUSTOMER_WISHLIST_SET_MUTATION, {
    metafields: [
      {
        ownerId: customerId,
        namespace: WISHLIST_METAFIELD_NAMESPACE,
        key: WISHLIST_METAFIELD_KEY,
        type: "json",
        value: JSON.stringify(normalized),
      },
    ],
  });

  const errors = result.metafieldsSet?.userErrors ?? [];
  if (errors.length) {
    throw new Error(errors.map((error) => error.message).join("; "));
  }

  return normalized;
}

export async function mergeCustomerWishlistSlugs(localSlugs: string[]): Promise<string[]> {
  const remote = await getCustomerWishlistSlugs();
  return setCustomerWishlistSlugs(uniqueSlugs([...remote, ...localSlugs]));
}

export async function toggleCustomerWishlistSlug(slug: string): Promise<string[]> {
  const current = await getCustomerWishlistSlugs();
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];
  return setCustomerWishlistSlugs(next);
}
