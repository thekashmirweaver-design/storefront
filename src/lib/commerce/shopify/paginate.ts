import { requestWithInventoryFallback } from "./inventory-scope";

/** Shopify Storefront API max per connection page (products/collections). */
export const STOREFRONT_MAX_PAGE_SIZE = 250;

export type ShopifyConnectionPageInfo = {
  hasNextPage: boolean;
  endCursor?: string | null;
};

export type ShopifyConnection<TNode> = {
  nodes?: TNode[];
  pageInfo?: ShopifyConnectionPageInfo;
};

type StorefrontRequestClient = {
  request: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<{ data?: unknown; errors?: unknown }>;
};

export function getStorefrontConnectionPageSize(): number {
  const raw = process.env.SHOPIFY_STOREFRONT_PAGE_SIZE?.trim();
  if (!raw) return STOREFRONT_MAX_PAGE_SIZE;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return STOREFRONT_MAX_PAGE_SIZE;
  return Math.min(parsed, STOREFRONT_MAX_PAGE_SIZE);
}

/** Walk Storefront connection cursors until all nodes are loaded. */
export async function fetchAllShopifyConnectionNodes<TNode>(
  client: StorefrontRequestClient,
  queryWithInventory: string,
  queryWithoutInventory: string,
  buildVariables: (pageSize: number, after: string | null) => Record<string, unknown>,
  selectConnection: (data: unknown) => ShopifyConnection<TNode> | null | undefined,
  errorLabel: string,
): Promise<TNode[]> {
  const pageSize = getStorefrontConnectionPageSize();
  const nodes: TNode[] = [];
  let after: string | null = null;

  for (;;) {
    const { data, errors } = await requestWithInventoryFallback<unknown>(
      client,
      queryWithInventory,
      queryWithoutInventory,
      { variables: buildVariables(pageSize, after) },
    );
    if (errors) {
      throw new Error(`${errorLabel}: ${JSON.stringify(errors)}`);
    }

    const connection = selectConnection(data);
    nodes.push(...(connection?.nodes ?? []));

    const pageInfo = connection?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
    after = pageInfo.endCursor;
  }

  return nodes;
}

/** Paginate a plain Storefront connection (no inventory fallback). */
export async function fetchAllShopifyConnectionNodesPlain<TNode>(
  client: StorefrontRequestClient,
  query: string,
  buildVariables: (pageSize: number, after: string | null) => Record<string, unknown>,
  selectConnection: (data: unknown) => ShopifyConnection<TNode> | null | undefined,
  errorLabel: string,
): Promise<TNode[]> {
  const pageSize = getStorefrontConnectionPageSize();
  const nodes: TNode[] = [];
  let after: string | null = null;

  for (;;) {
    const { data, errors } = await client.request(query, {
      variables: buildVariables(pageSize, after),
    });
    if (errors) {
      throw new Error(`${errorLabel}: ${JSON.stringify(errors)}`);
    }

    const connection = selectConnection(data);
    nodes.push(...(connection?.nodes ?? []));

    const pageInfo = connection?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
    after = pageInfo.endCursor;
  }

  return nodes;
}
