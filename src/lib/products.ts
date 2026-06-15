import type { StaticImageData } from "next/image";

import ivory from "@/assets/product-ivory.jpg";
import sand from "@/assets/product-sand.jpg";
import mink from "@/assets/product-mink.jpg";
import opal from "@/assets/product-opal.jpg";
import rose from "@/assets/product-rose.jpg";
import midnight from "@/assets/product-midnight.jpg";
import sage from "@/assets/product-sage.jpg";
import plum from "@/assets/product-plum.jpg";

export type Product = {
  slug: string;
  name: string;
  category: "signature" | "lightweight" | "bridal" | "limited";
  categoryLabel: string;
  price: number;
  image: StaticImageData;
  colorHex: string;
  description: string;
};

export const products: Product[] = [
  {
    slug: "ivory-whisper",
    name: "Ivory Whisper",
    category: "signature",
    categoryLabel: "100% Pashmina",
    price: 495,
    image: ivory,
    colorHex: "#efe6d4",
    description:
      "A delicate ivory pashmina crafted from the finest Himalayan fibers. Featherlight, timeless, and endlessly versatile.",
  },
  {
    slug: "sand-dune",
    name: "Sand Dune",
    category: "signature",
    categoryLabel: "100% Pashmina",
    price: 495,
    image: sand,
    colorHex: "#d8bf99",
    description: "Warm sand tones woven into a perfectly draping shawl. The everyday luxury.",
  },
  {
    slug: "mink-beige",
    name: "Mink Beige",
    category: "signature",
    categoryLabel: "100% Pashmina",
    price: 495,
    image: mink,
    colorHex: "#7a4a32",
    description: "A rich mink beige with the subtle paisley weaving of Kashmir's masters.",
  },
  {
    slug: "opal-grey",
    name: "Opal Grey",
    category: "lightweight",
    categoryLabel: "100% Pashmina",
    price: 495,
    image: opal,
    colorHex: "#bcb6ad",
    description: "Cool opal grey, featherlight and effortless for all seasons.",
  },
  {
    slug: "rose-smoke",
    name: "Rose Smoke",
    category: "lightweight",
    categoryLabel: "100% Pashmina",
    price: 395,
    image: rose,
    colorHex: "#d77c8f",
    description: "A dusky rose that glows under warm light.",
  },
  {
    slug: "midnight-blue",
    name: "Midnight Blue",
    category: "signature",
    categoryLabel: "100% Pashmina",
    price: 395,
    image: midnight,
    colorHex: "#1e2a48",
    description: "Deep midnight blue with a subtle paisley undertone.",
  },
  {
    slug: "sage-green",
    name: "Sage Green",
    category: "lightweight",
    categoryLabel: "100% Pashmina",
    price: 395,
    image: sage,
    colorHex: "#9ba87a",
    description: "A muted sage, restful and grounding.",
  },
  {
    slug: "plum-shadow",
    name: "Plum Shadow",
    category: "limited",
    categoryLabel: "Limited Edition",
    price: 595,
    image: plum,
    colorHex: "#6c2b54",
    description: "A rare plum tone from our limited edition releases.",
  },
];

export const colors = [
  { name: "Ivory", hex: "#efe6d4" },
  { name: "Sand", hex: "#d8bf99" },
  { name: "Mink", hex: "#7a4a32" },
  { name: "Opal", hex: "#bcb6ad" },
  { name: "Rose", hex: "#d77c8f" },
  { name: "Midnight", hex: "#1e2a48" },
  { name: "Sage", hex: "#9ba87a" },
  { name: "Plum", hex: "#6c2b54" },
];

export const articles = [
  {
    slug: "timeless-legacy-of-pashmina",
    title: "The Timeless Legacy of Pashmina",
    category: "Heritage",
    date: "May 10, 2026",
    excerpt:
      "Pashmina is more than just a fabric — it is a legacy woven through centuries of rich heritage, artistry, and nature's finest gifts.",
  },
  {
    slug: "art-of-handloom-perfection",
    title: "The Art of Handloom Perfection",
    category: "Craftsmanship",
    date: "Apr 23, 2026",
    excerpt:
      "Step inside a Kashmiri weaver's workshop and witness the slow, patient craft that turns thread into heirloom.",
  },
  {
    slug: "how-to-style-your-pashmina",
    title: "How to Style Your Pashmina Effortlessly",
    category: "Style",
    date: "Apr 08, 2026",
    excerpt: "Five ways to wear a single pashmina from morning meetings to evening gatherings.",
  },
  {
    slug: "sustainability-woven-at-every-step",
    title: "Sustainability Woven at Every Step",
    category: "Sustainability",
    date: "Mar 18, 2026",
    excerpt:
      "How GULRIZA partners with mountain herders and weavers to keep an ancient craft alive.",
  },
  {
    slug: "kashmir-the-birthplace-of-pashmina",
    title: "Kashmir: The Birthplace of Pashmina",
    category: "Travel",
    date: "Mar 02, 2026",
    excerpt: "A journey into the valleys where the world's softest fiber begins its story.",
  },
  {
    slug: "the-perfect-gift",
    title: "The Perfect Gift: Thoughtful & Timeless",
    category: "Inspiration",
    date: "Feb 15, 2026",
    excerpt:
      "Why a pashmina is the most meaningful gift you can give — and how to choose the right one.",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getArticleBySlug(slug: string) {
  return articles.find((a) => a.slug === slug);
}
