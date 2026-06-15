import type { Metadata } from "next";
import { Suspense } from "react";

import { JournalClient } from "@/components/site/JournalClient";
import { commerce } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories of heritage, craftsmanship, and the timeless beauty of pashmina.",
  openGraph: {
    title: "Journal — GULRIZA",
    description: "Stories of heritage, craftsmanship, and the timeless beauty of pashmina.",
  },
};

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
