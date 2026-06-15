"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { products } from "@/lib/products";
import { useStore } from "@/lib/store";

export function SearchDialog() {
  const { searchOpen, setSearchOpen } = useStore();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products.slice(0, 6);
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.categoryLabel.toLowerCase().includes(s) ||
        p.category.includes(s),
    );
  }, [q]);

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
            placeholder="Search pashminas, collections…"
            className="flex-1 bg-transparent text-sm text-cream placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              No matches for &quot;{q}&quot;.
            </p>
          ) : (
            <ul>
              {results.map((p) => (
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
                      <OptimizedImage
                        src={p.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-base text-cream">{p.name}</p>
                      <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
                        {p.categoryLabel}
                      </p>
                    </div>
                    <p className="text-sm text-gold">${p.price}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
