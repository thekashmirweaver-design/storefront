"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ProductCard } from "@/components/site/ProductCard";
import { ProductFilters, SortSelect } from "@/components/site/ProductFilters";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { CommerceCollection, CommerceColor, CommerceProduct } from "@/lib/commerce";

import {
  activeFilterCount,
  buildActiveChips,
  defaultListingState,
  deriveListingFacets,
  filterAndSortProducts,
  parseListingState,
  PER_PAGE,
  serializeListingState,
  type ListingState,
} from "./listing-state";

type ProductListingProps = {
  products: CommerceProduct[];
  /** Optional name lookup when deriving color swatch labels from product hex values. */
  colorCatalog?: CommerceColor[];
  collections?: CommerceCollection[];
  lockedCollection?: string;
  totalCount?: number;
};

export function ProductListing({
  products,
  colorCatalog = [],
  collections = [],
  lockedCollection,
  totalCount,
}: ProductListingProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(3);

  const facets = useMemo(
    () => deriveListingFacets(products, colorCatalog),
    [products, colorCatalog],
  );

  const listingOptions = useMemo(
    () => ({ lockedCollection, facets }),
    [lockedCollection, facets],
  );

  const [state, setState] = useState<ListingState>(() =>
    parseListingState(searchParams, listingOptions),
  );
  const skipUrlSync = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("shop-grid-cols");
    if (stored === "2" || stored === "3") setGridCols(Number(stored) as 2 | 3);
  }, []);

  useEffect(() => {
    skipUrlSync.current = true;
    setState(parseListingState(searchParams, listingOptions));
  }, [searchParams, listingOptions]);

  const updateState = useCallback((patch: Partial<ListingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearAll = useCallback(() => {
    setState(defaultListingState(facets));
  }, [facets]);

  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    const qs = serializeListingState(state, {
      lockedCollection,
      catalogMaxPrice: facets.priceMax,
    });
    const current = searchParams.toString();
    if (qs === current) return;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [state, pathname, router, lockedCollection, facets.priceMax, searchParams]);

  const filtered = useMemo(() => filterAndSortProducts(products, state), [products, state]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  useEffect(() => {
    if (state.page > totalPages) {
      updateState({ page: totalPages });
    }
  }, [state.page, totalPages, updateState]);

  const safePage = Math.min(state.page, totalPages);
  const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const filterCount = activeFilterCount(state, {
    lockedCollection,
    catalogMaxPrice: facets.priceMax,
  });
  const chips = buildActiveChips(state, facets, collections, lockedCollection);
  const catalogTotal = totalCount ?? products.length;
  const showCategoryFilter = !lockedCollection;

  const setGridPreference = (cols: 2 | 3) => {
    setGridCols(cols);
    localStorage.setItem("shop-grid-cols", String(cols));
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
      <div className="lg:hidden sticky top-[var(--header-height,64px)] z-30 -mx-6 px-6 py-3 mb-6 bg-background/95 backdrop-blur border-b border-border/40 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 border border-border py-2.5 text-[0.65rem] tracking-[0.2em] uppercase text-cream"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter{filterCount > 0 ? ` (${filterCount})` : ""}
        </button>
        <SortSelect
          value={state.sort}
          onChange={(sort) => updateState({ sort, page: 1 })}
          className="flex-1 bg-transparent text-cream border border-border px-3 py-2 text-[0.65rem] tracking-wider uppercase focus:outline-none focus:border-gold"
        />
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden lg:block sticky top-[var(--header-height,72px)] self-start z-20 max-h-[calc(100vh-var(--header-height,72px)-2rem)] overflow-y-auto overscroll-contain">
          <ProductFilters
            facets={facets}
            collections={collections}
            state={state}
            onChange={updateState}
            onClear={clearAll}
            showCollectionFilter={!lockedCollection}
            showCategoryFilter={showCategoryFilter}
          />
        </aside>

        <div>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-3 border-b border-border/40">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {catalogTotal}
            </p>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1 text-[0.65rem] tracking-wider uppercase text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setGridPreference(2)}
                  aria-pressed={gridCols === 2}
                  className={`px-2 py-1 ${gridCols === 2 ? "text-gold" : "hover:text-cream"}`}
                >
                  2 col
                </button>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => setGridPreference(3)}
                  aria-pressed={gridCols === 3}
                  className={`px-2 py-1 ${gridCols === 3 ? "text-gold" : "hover:text-cream"}`}
                >
                  3 col
                </button>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-xs">
                <span className="text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground">
                  Sort by
                </span>
                <SortSelect
                  value={state.sort}
                  onChange={(sort) => updateState({ sort, page: 1 })}
                />
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => updateState(chip.remove())}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[0.65rem] tracking-wider uppercase border border-border text-cream hover:border-gold hover:text-gold transition-colors"
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          {visible.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              No pieces match your filters.{" "}
              <button type="button" onClick={clearAll} className="text-gold hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-10 ${gridCols === 3 ? "lg:grid-cols-3" : ""}`}
            >
              {visible.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-16" aria-label="Pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateState({ page: n })}
                  aria-current={n === safePage ? "page" : undefined}
                  className={`h-8 w-8 text-xs ${n === safePage ? "border border-gold text-gold" : "text-muted-foreground hover:text-gold"}`}
                >
                  {n}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-sm bg-background border-l border-border p-0 flex flex-col"
        >
          <SheetHeader className="px-6 py-5 border-b border-border/40">
            <SheetTitle className="font-display text-xl text-cream text-left">Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ProductFilters
              facets={facets}
              collections={collections}
              state={state}
              onChange={(patch) => {
                updateState(patch);
              }}
              onClear={() => {
                clearAll();
                setFilterOpen(false);
              }}
              showCollectionFilter={!lockedCollection}
              showCategoryFilter={showCategoryFilter}
              idPrefix="mobile"
            />
          </div>
          <div className="px-6 py-4 border-t border-border/40">
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="w-full bg-gold text-primary-foreground py-3 text-[0.7rem] tracking-[0.3em] uppercase"
            >
              Apply ({filtered.length} results)
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
