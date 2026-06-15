import ivory from "@/assets/product-ivory.jpg";
import sand from "@/assets/product-sand.jpg";
import mink from "@/assets/product-mink.jpg";
import opal from "@/assets/product-opal.jpg";
import rose from "@/assets/product-rose.jpg";
import midnight from "@/assets/product-midnight.jpg";
import sage from "@/assets/product-sage.jpg";
import plum from "@/assets/product-plum.jpg";

import type { CommerceProductCategory } from "../../types";

export type MockProductRecord = {
  slug: string;
  name: string;
  category: CommerceProductCategory;
  categoryLabel: string;
  price: number;
  image: typeof ivory;
  colorHex: string;
  description: string;
};

export const mockProducts: MockProductRecord[] = [
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

export const mockColors = [
  { name: "Ivory", hex: "#efe6d4" },
  { name: "Sand", hex: "#d8bf99" },
  { name: "Mink", hex: "#7a4a32" },
  { name: "Opal", hex: "#bcb6ad" },
  { name: "Rose", hex: "#d77c8f" },
  { name: "Midnight", hex: "#1e2a48" },
  { name: "Sage", hex: "#9ba87a" },
  { name: "Plum", hex: "#6c2b54" },
];
