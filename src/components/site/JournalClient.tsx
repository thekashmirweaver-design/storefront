"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";

import mountainImg from "@/assets/journal-mountain.jpg";
import handloomImg from "@/assets/journal-handloom.jpg";
import styleImg from "@/assets/journal-style.jpg";
import legacyImg from "@/assets/legacy-stilllife.jpg";
import classicImg from "@/assets/collection-classic.jpg";
import wovenImg from "@/assets/collection-woven.jpg";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Eyebrow } from "@/components/site/Eyebrow";
import { articles } from "@/lib/products";

const covers = [mountainImg, handloomImg, styleImg, legacyImg, classicImg, wovenImg];
const cats = ["All", "Heritage", "Craftsmanship", "Style", "Sustainability", "Travel"];

export function JournalClient() {
  const [activeCat, setActiveCat] = useState("All");

  const filtered =
    activeCat === "All" ? articles : articles.filter((a) => a.category === activeCat);

  return (
    <>
      <section className="relative h-[360px] overflow-hidden border-b border-border/40">
        <OptimizedImage
          src={mountainImg}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 h-full flex flex-col justify-end pb-12">
          <Eyebrow>Journal</Eyebrow>
          <h1 className="mt-4 font-display text-5xl text-cream">Journal</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">
            Stories of heritage, craftsmanship, and the timeless beauty of pashmina.
          </p>
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`text-[0.7rem] tracking-[0.25em] uppercase ${
                  activeCat === c
                    ? "text-gold border-b border-gold pb-1"
                    : "text-muted-foreground hover:text-gold"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border border-border px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search articles..."
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-44"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
        {filtered.map((a, i) => (
          <Link key={a.slug} href={`/journal/${a.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden">
              <OptimizedImage
                src={covers[i % covers.length]}
                alt={a.title}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="pt-5">
              <p className="text-[0.6rem] tracking-[0.3em] uppercase text-gold/80">
                {a.date} · {a.category}
              </p>
              <h3 className="mt-2 font-display text-2xl text-cream group-hover:text-gold transition-colors">
                {a.title}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {a.excerpt}
              </p>
              <span className="mt-4 inline-block text-[0.65rem] tracking-[0.3em] uppercase text-gold">
                Read more →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
