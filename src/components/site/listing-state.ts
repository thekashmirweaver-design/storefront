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

export const DEFAULT_MAX_PRICE = 1000;
export const PER_PAGE = 9;

export const CATEGORY_OPTIONS: { value: CommerceProductCategory; label: string }[] = [
  { value: "signature", label: "Signature" },
  { value: "lightweight", label: "Lightweight" },
  { value: "bridal", label: "Bridal" },
  { value: "limited", label: "Limited Editions" },
];

export function defaultListingState(): ListingState {
  return {
    categories: [],
    colors: [],
    collectionSlugs: [],
    maxPrice: DEFAULT_MAX_PRICE,
    sort: "featured",
    page: 1,
  };
}

export function parseListingState(
  params: URLSearchParams,
  lockedCollection?: string,
): ListingState {
  const cats = params.get("cat");
  const colors = params.get("color");
  const colls = params.get("coll");
  const max = params.get("max");
  const sort = params.get("sort");
  const page = params.get("page");

  const validCats = new Set(CATEGORY_OPTIONS.map((c) => c.value));
  const validSorts = new Set<ListingSort>(["featured", "price-asc", "price-desc", "name"]);

  return {
    categories: cats
      ? cats
          .split(",")
          .filter((c): c is CommerceProductCategory => validCats.has(c as CommerceProductCategory))
      : [],
    colors: colors ? colors.split(",").map((h) => (h.startsWith("#") ? h : `#${h}`)) : [],
    collectionSlugs: lockedCollection ? [] : colls ? colls.split(",").filter(Boolean) : [],
    maxPrice: max
      ? Math.min(DEFAULT_MAX_PRICE, Math.max(0, Number(max) || DEFAULT_MAX_PRICE))
      : DEFAULT_MAX_PRICE,
    sort: sort && validSorts.has(sort as ListingSort) ? (sort as ListingSort) : "featured",
    page: page ? Math.max(1, Number(page) || 1) : 1,
  };
}

export function serializeListingState(state: ListingState, lockedCollection?: string): string {
  const params = new URLSearchParams();
  if (state.categories.length) params.set("cat", state.categories.join(","));
  if (state.colors.length) {
    params.set("color", state.colors.map((h) => h.replace("#", "")).join(","));
  }
  if (!lockedCollection && state.collectionSlugs.length) {
    params.set("coll", state.collectionSlugs.join(","));
  }
  if (state.maxPrice < DEFAULT_MAX_PRICE) params.set("max", String(state.maxPrice));
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

export function activeFilterCount(state: ListingState, lockedCollection?: string): number {
  let n = state.categories.length + state.colors.length;
  if (!lockedCollection) n += state.collectionSlugs.length;
  if (state.maxPrice < DEFAULT_MAX_PRICE) n += 1;
  return n;
}

export type ActiveChip = { key: string; label: string; remove: () => Partial<ListingState> };

export function buildActiveChips(
  state: ListingState,
  colors: CommerceColor[],
  collections: CommerceCollection[],
  lockedCollection?: string,
): ActiveChip[] {
  const chips: ActiveChip[] = [];
  const colorByHex = new Map(colors.map((c) => [c.hex, c.name]));
  const collBySlug = new Map(collections.map((c) => [c.slug, c.title]));

  for (const cat of state.categories) {
    const label = CATEGORY_OPTIONS.find((c) => c.value === cat)?.label ?? cat;
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

  if (state.maxPrice < DEFAULT_MAX_PRICE) {
    chips.push({
      key: "max-price",
      label: `Under $${state.maxPrice}`,
      remove: () => ({ maxPrice: DEFAULT_MAX_PRICE, page: 1 }),
    });
  }

  return chips;
}

export function formatProductPrice(amount: number, currencyCode: string): string {
  if (currencyCode === "USD") return `$${amount}`;
  return `${amount} ${currencyCode}`;
}
