import type { StaticImageData } from "next/image";

import mountainImg from "@/assets/journal-mountain.jpg";
import handloomImg from "@/assets/journal-handloom.jpg";
import styleImg from "@/assets/journal-style.jpg";

export type Collection = {
  slug: string;
  title: string;
  tagline: string;
  cat: string;
};

export const collections: Collection[] = [
  {
    slug: "signature",
    title: "Signature Pashminas",
    tagline: "Timeless designs, exquisitely handcrafted for every occasion.",
    cat: "signature",
  },
  {
    slug: "lightweight",
    title: "Lightweight Pashminas",
    tagline: "Featherlight elegance for every day.",
    cat: "lightweight",
  },
  {
    slug: "bridal",
    title: "Bridal Collection",
    tagline: "For life's most precious occasions.",
    cat: "bridal",
  },
  {
    slug: "limited",
    title: "Limited Editions",
    tagline: "Rare and meticulously crafted.",
    cat: "limited",
  },
];

export const articleCovers: Record<string, StaticImageData> = {
  "timeless-legacy-of-pashmina": mountainImg,
  "art-of-handloom-perfection": handloomImg,
  "how-to-style-your-pashmina": styleImg,
};

export function getCollectionBySlug(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function getArticleCover(slug: string): StaticImageData {
  return articleCovers[slug] ?? mountainImg;
}
