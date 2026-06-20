import type {
  CommerceColor,
  CommerceCollection,
  CommerceProduct,
  CommerceProductCategory,
} from "@/lib/commerce";

export type ListingSort = "featured" | "price-asc" | "price-desc" | "name";

export type ListingState = {
  categories: CommerceProductCategory[];
  colors: string[];
  collectionSlugs: string[];
  maxPrice: number;
  sort: ListingSort;
  page: number;
};

export const DEFAULT_MAX_PRICE = 5000;
export const PER_PAGE = 9;

export type ListingFacets = {
  colors: CommerceColor[];
  categories: { value: CommerceProductCategory; label: string }[];
  priceMin: number;
  priceMax: number;
};

export const CATEGORY_OPTIONS: { value: CommerceProductCategory; label: string }[] = [
  { value: "signature", label: "Signature" },
  { value: "lightweight", label: "Lightweight" },
  { value: "bridal", label: "Bridal" },
  { value: "limited", label: "Limited Editions" },
];

/** Build filter options from the products visible on the current page (shop or collection). */
export function deriveListingFacets(
  products: CommerceProduct[],
  colorCatalog: CommerceColor[] = [],
): ListingFacets {
  const colorNameByHex = new Map(colorCatalog.map((c) => [c.hex.toLowerCase(), c.name]));

  const colors: CommerceColor[] = [];
  const seenHex = new Set<string>();
  for (const product of products) {
    const hex = product.colorHex;
    if (seenHex.has(hex)) continue;
    seenHex.add(hex);
    colors.push({
      hex,
      name:
        product.colorName ??
        colorNameByHex.get(hex.toLowerCase()) ??
        product.name.split(" ")[0] ??
        hex,
    });
  }

  const categoryMap = new Map<CommerceProductCategory, string>();
  for (const product of products) {
    if (!categoryMap.has(product.category)) {
      categoryMap.set(product.category, product.categoryLabel);
    }
  }
  const categories = [...categoryMap.entries()].map(([value, label]) => ({ value, label }));

  const amounts = products.map((p) => p.price.amount);
  const priceMin = amounts.length ? Math.min(...amounts) : 0;
  const priceMax = amounts.length ? Math.max(...amounts) : DEFAULT_MAX_PRICE;

  return { colors, categories, priceMin, priceMax };
}

export function defaultListingState(facets?: ListingFacets): ListingState {
  return {
    categories: [],
    colors: [],
    collectionSlugs: [],
    maxPrice: facets?.priceMax ?? DEFAULT_MAX_PRICE,
    sort: "featured",
    page: 1,
  };
}

type ParseListingOptions = {
  lockedCollection?: string;
  facets?: ListingFacets;
};

export function parseListingState(
  params: URLSearchParams,
  options?: ParseListingOptions | string,
): ListingState {
  const opts: ParseListingOptions =
    typeof options === "string" ? { lockedCollection: options } : (options ?? {});
  const { lockedCollection, facets } = opts;

  const cats = params.get("cat");
  const colors = params.get("color");
  const colls = params.get("coll");
  const max = params.get("max");
  const sort = params.get("sort");
  const page = params.get("page");

  const catalogMax = facets?.priceMax ?? DEFAULT_MAX_PRICE;
  const validCatOptions = facets?.categories ?? CATEGORY_OPTIONS;
  const validCats = new Set(validCatOptions.map((c) => c.value));
  const validSorts = new Set<ListingSort>(["featured", "price-asc", "price-desc", "name"]);

  const parsedMax = max
    ? Math.min(catalogMax, Math.max(facets?.priceMin ?? 0, Number(max) || catalogMax))
    : catalogMax;

  return {
    categories: cats
      ? cats
          .split(",")
          .filter((c): c is CommerceProductCategory => validCats.has(c as CommerceProductCategory))
      : [],
    colors: colors ? colors.split(",").map((h) => (h.startsWith("#") ? h : `#${h}`)) : [],
    collectionSlugs: lockedCollection ? [] : colls ? colls.split(",").filter(Boolean) : [],
    maxPrice: lockedCollection ? parsedMax : parsedMax,
    sort: sort && validSorts.has(sort as ListingSort) ? (sort as ListingSort) : "featured",
    page: page ? Math.max(1, Number(page) || 1) : 1,
  };
}

export function serializeListingState(
  state: ListingState,
  options?: { lockedCollection?: string; catalogMaxPrice?: number },
): string {
  const lockedCollection = options?.lockedCollection;
  const catalogMax = options?.catalogMaxPrice ?? DEFAULT_MAX_PRICE;

  const params = new URLSearchParams();
  if (state.categories.length) params.set("cat", state.categories.join(","));
  if (state.colors.length) {
    params.set("color", state.colors.map((h) => h.replace("#", "")).join(","));
  }
  if (!lockedCollection && state.collectionSlugs.length) {
    params.set("coll", state.collectionSlugs.join(","));
  }
  if (state.maxPrice < catalogMax) params.set("max", String(state.maxPrice));
  if (state.sort !== "featured") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}

export function filterAndSortProducts(
  products: CommerceProduct[],
  state: ListingState,
): CommerceProduct[] {
  let list = products.filter((p) => {
    if (state.categories.length && !state.categories.includes(p.category)) return false;
    if (state.colors.length && !state.colors.includes(p.colorHex)) return false;
    if (
      state.collectionSlugs.length &&
      (!p.collectionSlug || !state.collectionSlugs.includes(p.collectionSlug))
    ) {
      return false;
    }
    if (p.price.amount > state.maxPrice) return false;
    return true;
  });

  if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price.amount - b.price.amount);
  if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price.amount - a.price.amount);
  if (state.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

export function activeFilterCount(
  state: ListingState,
  options?: { lockedCollection?: string; catalogMaxPrice?: number },
): number {
  const lockedCollection = options?.lockedCollection;
  const catalogMax = options?.catalogMaxPrice ?? DEFAULT_MAX_PRICE;

  let n = state.categories.length + state.colors.length;
  if (!lockedCollection) n += state.collectionSlugs.length;
  if (state.maxPrice < catalogMax) n += 1;
  return n;
}

export type ActiveChip = { key: string; label: string; remove: () => Partial<ListingState> };

export function buildActiveChips(
  state: ListingState,
  facets: ListingFacets,
  collections: CommerceCollection[],
  lockedCollection?: string,
): ActiveChip[] {
  const chips: ActiveChip[] = [];
  const colorByHex = new Map(facets.colors.map((c) => [c.hex, c.name]));
  const collBySlug = new Map(collections.map((c) => [c.slug, c.title]));
  const categoryLabels = new Map(facets.categories.map((c) => [c.value, c.label]));

  for (const cat of state.categories) {
    const label = categoryLabels.get(cat) ?? cat;
    chips.push({
      key: `cat-${cat}`,
      label,
      remove: () => ({
        categories: state.categories.filter((c) => c !== cat),
        page: 1,
      }),
    });
  }

  for (const hex of state.colors) {
    chips.push({
      key: `color-${hex}`,
      label: colorByHex.get(hex) ?? hex,
      remove: () => ({
        colors: state.colors.filter((c) => c !== hex),
        page: 1,
      }),
    });
  }

  if (!lockedCollection) {
    for (const slug of state.collectionSlugs) {
      chips.push({
        key: `coll-${slug}`,
        label: collBySlug.get(slug) ?? slug,
        remove: () => ({
          collectionSlugs: state.collectionSlugs.filter((s) => s !== slug),
          page: 1,
        }),
      });
    }
  }

  if (state.maxPrice < facets.priceMax) {
    chips.push({
      key: "max-price",
      label: `Under $${state.maxPrice}`,
      remove: () => ({ maxPrice: facets.priceMax, page: 1 }),
    });
  }

  return chips;
}

export function formatProductPrice(amount: number, currencyCode: string): string {
  if (currencyCode === "USD") return `$${amount}`;
  return `${amount} ${currencyCode}`;
}

export function productHasCompareAt(product: CommerceProduct): boolean {
  return Boolean(product.compareAtPrice && product.compareAtPrice.amount > product.price.amount);
}
