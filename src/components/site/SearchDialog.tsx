"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { CommerceProduct } from "@/lib/commerce";
import { getProductsAction, searchCommerce } from "@/lib/commerce/actions";
import { useCommerce } from "@/lib/commerce/client";

export function SearchDialog() {
  const { brand, searchOpen, setSearchOpen } = useCommerce();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CommerceProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchOpen) return;

    let cancelled = false;
    setLoading(true);
    const query = q.trim();

    const run = async () => {
      const data = query
        ? (await searchCommerce(query)).products
        : (await getProductsAction()).slice(0, 6);
      if (!cancelled) {
        setResults(data);
        setLoading(false);
      }
    };

    const timer = setTimeout(run, query ? 200 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, searchOpen]);

  return (
    <Dialog
      open={searchOpen}
      onOpenChange={(v) => {
        setSearchOpen(v);
        if (!v) setQ("");
      }}
    >
      <DialogContent className="max-w-2xl bg-background border border-border p-0">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
          <Search className="h-4 w-4 text-gold" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={brand.copy.searchPlaceholder}
            className="flex-1 bg-transparent text-sm text-cream placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-12">Searching…</p>
          ) : results.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              No matches for &quot;{q}&quot;.
            </p>
          ) : (
            <ul>
              {results.map((p) => {
                const image = p.images[0];
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setQ("");
                      }}
                      className="flex items-center gap-4 px-3 py-3 hover:bg-card transition-colors"
                    >
                      <div className="relative w-12 h-14 bg-card shrink-0">
                        {image && (
                          <OptimizedImage
                            src={image.src}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                            width={image.width}
                            height={image.height}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-base text-cream">{p.name}</p>
                        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
                          {p.categoryLabel}
                        </p>
                      </div>
                      <p className="text-sm text-gold">${p.price.amount}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
