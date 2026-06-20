"use client";

import { AnimatedDisclosure } from "@/components/site/AnimatedDisclosure";
import type { CommerceCollection } from "@/lib/commerce";

import {
  formatProductPrice,
  CATEGORY_OPTIONS,
  type ListingFacets,
  type ListingSort,
  type ListingState,
} from "./listing-state";
import { useCommerce } from "@/lib/commerce/client";

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <AnimatedDisclosure
      defaultOpen={defaultOpen}
      className="border-b border-border/40 py-4"
      triggerClassName="py-0"
      contentClassName="pt-4 space-y-2 text-xs text-muted-foreground"
      title={<span className="text-[0.7rem] tracking-[0.25em] uppercase text-cream">{title}</span>}
    >
      {children}
    </AnimatedDisclosure>
  );
}

type ProductFiltersProps = {
  facets: ListingFacets;
  collections?: CommerceCollection[];
  state: ListingState;
  onChange: (patch: Partial<ListingState>) => void;
  onClear: () => void;
  showCollectionFilter?: boolean;
  showCategoryFilter?: boolean;
  idPrefix?: string;
};

export function ProductFilters({
  facets,
  collections = [],
  state,
  onChange,
  onClear,
  showCollectionFilter = true,
  showCategoryFilter = true,
  idPrefix = "filter",
}: ProductFiltersProps) {
  const { market } = useCommerce();
  const priceLocale = market?.locale;
  const categoryOptions = facets.categories.length > 0 ? facets.categories : CATEGORY_OPTIONS;

  const toggleCategory = (value: string) => {
    const next = state.categories.includes(value)
      ? state.categories.filter((c) => c !== value)
      : [...state.categories, value];
    onChange({ categories: next, page: 1 });
  };

  const toggleColor = (hex: string) => {
    const next = state.colors.includes(hex)
      ? state.colors.filter((c) => c !== hex)
      : [...state.colors, hex];
    onChange({ colors: next, page: 1 });
  };

  const toggleCollection = (slug: string) => {
    const next = state.collectionSlugs.includes(slug)
      ? state.collectionSlugs.filter((s) => s !== slug)
      : [...state.collectionSlugs, slug];
    onChange({ collectionSlugs: next, page: 1 });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h2 className="text-[0.7rem] tracking-[0.25em] uppercase text-gold">Filter</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-[0.65rem] tracking-wider uppercase text-muted-foreground hover:text-gold"
        >
          Clear all
        </button>
      </div>

      {showCategoryFilter && categoryOptions.length > 1 && (
        <FilterGroup title="Category">
          {categoryOptions.map((c) => (
            <label
              key={c.value}
              htmlFor={`${idPrefix}-cat-${c.value}`}
              className="flex items-center gap-2 cursor-pointer hover:text-cream"
            >
              <input
                id={`${idPrefix}-cat-${c.value}`}
                type="checkbox"
                checked={state.categories.includes(c.value)}
                onChange={() => toggleCategory(c.value)}
                className="accent-[--gold]"
              />
              {c.label}
            </label>
          ))}
        </FilterGroup>
      )}

      {showCollectionFilter && collections.length > 0 && (
        <FilterGroup title="Collection" defaultOpen={false}>
          {collections.map((c) => (
            <label
              key={c.slug}
              htmlFor={`${idPrefix}-coll-${c.slug}`}
              className="flex items-center gap-2 cursor-pointer hover:text-cream"
            >
              <input
                id={`${idPrefix}-coll-${c.slug}`}
                type="checkbox"
                checked={state.collectionSlugs.includes(c.slug)}
                onChange={() => toggleCollection(c.slug)}
                className="accent-[--gold]"
              />
              {c.title}
            </label>
          ))}
        </FilterGroup>
      )}

      {facets.colors.length > 0 && (
        <FilterGroup title="Color">
          <div className="grid grid-cols-6 gap-2">
            {facets.colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={state.colors.includes(c.hex)}
                onClick={() => toggleColor(c.hex)}
                className={`h-6 w-6 rounded-full border ${state.colors.includes(c.hex) ? "ring-2 ring-gold" : "border-border"} hover:ring-2 hover:ring-gold transition-all`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      {facets.priceMax > facets.priceMin && (
        <FilterGroup title="Price">
          <div className="px-1">
            <input
              type="range"
              min={facets.priceMin}
              max={facets.priceMax}
              step={facets.priceMax - facets.priceMin > 100 ? 10 : 1}
              value={state.maxPrice}
              onChange={(e) => onChange({ maxPrice: Number(e.target.value), page: 1 })}
              className="w-full accent-[--gold]"
              aria-label="Maximum price"
            />
            <div className="flex justify-between mt-2 text-[0.65rem] text-muted-foreground">
              <span>{formatProductPrice(facets.priceMin, facets.currencyCode, priceLocale)}</span>
              <span>
                {formatProductPrice(state.maxPrice, facets.currencyCode, priceLocale)}
                {state.maxPrice >= facets.priceMax ? "+" : ""}
              </span>
            </div>
          </div>
        </FilterGroup>
      )}
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
  className,
  id,
}: {
  value: ListingSort;
  onChange: (sort: ListingSort) => void;
  className?: string;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as ListingSort)}
      className={
        className ??
        "bg-transparent text-cream border border-border px-3 py-1.5 focus:outline-none focus:border-gold"
      }
    >
      <option value="featured">Featured</option>
      <option value="price-asc">Price: Low → High</option>
      <option value="price-desc">Price: High → Low</option>
      <option value="name">Name (A–Z)</option>
    </select>
  );
}
