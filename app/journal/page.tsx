import type { Metadata } from "next";
import { Suspense } from "react";

import { JournalClient } from "@/components/site/JournalClient";
import { commerce, buildPageMetadata } from "@/lib/commerce";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildPageMetadata(brand, {
    title: "Journal",
    description: "Stories of heritage, craftsmanship, and the timeless beauty of pashmina.",
  });
}

export default async function JournalPage() {
  const articles = await commerce.getArticles();

  return (
    <Suspense
      fallback={<div className="py-24 text-center text-muted-foreground">Loading journal…</div>}
    >
      <JournalClient articles={articles} />
    </Suspense>
  );
}
