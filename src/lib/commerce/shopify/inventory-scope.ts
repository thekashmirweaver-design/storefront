/** Storefront `quantityAvailable` requires `unauthenticated_read_product_inventory`. */
type GraphQlErrorLike = {
  message?: string;
  extensions?: { code?: string; requiredAccess?: string };
};

export function inventoryFieldsEnabled(): boolean {
  return true;
}

export function errorsDenyInventoryRead(errors: unknown): boolean {
  if (!errors) return false;

  const list: GraphQlErrorLike[] =
    typeof errors === "object" && errors !== null && "graphQLErrors" in errors
      ? ((errors as { graphQLErrors?: GraphQlErrorLike[] }).graphQLErrors ?? [])
      : Array.isArray(errors)
        ? (errors as GraphQlErrorLike[])
        : [];

  return list.some(
    (e) =>
      e.extensions?.code === "ACCESS_DENIED" &&
      (e.message?.includes("quantityAvailable") ||
        e.extensions?.requiredAccess?.includes("unauthenticated_read_product_inventory")),
  );
}

type ShopifyClient = {
  request: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<{ data?: unknown; errors?: unknown }>;
};

export async function requestWithInventoryFallback<TData>(
  client: ShopifyClient,
  queryWithInventory: string,
  queryWithoutInventory: string,
  options?: { variables?: Record<string, unknown> },
): Promise<{ data?: TData; errors?: unknown }> {
  const result = await client.request(queryWithInventory, options);
  if (errorsDenyInventoryRead(result.errors)) {
    return client.request(queryWithoutInventory, options) as Promise<{ data?: TData; errors?: unknown }>;
  }
  return result as { data?: TData; errors?: unknown };
}
