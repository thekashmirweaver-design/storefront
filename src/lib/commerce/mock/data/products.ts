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
  collectionSlug: string;
  price: number;
  image: typeof ivory;
  colorHex: string;
  description: string;
};

type ColorSeed = {
  color: string;
  hex: string;
  image: typeof ivory;
};

type CollectionSeed = {
  slug: string;
  category: CommerceProductCategory;
  categoryLabel: string;
  priceBase: number;
};

const colorSeeds: ColorSeed[] = [
  { color: "Ivory", hex: "#efe6d4", image: ivory },
  { color: "Sand", hex: "#d8bf99", image: sand },
  { color: "Mink", hex: "#7a4a32", image: mink },
  { color: "Opal", hex: "#bcb6ad", image: opal },
  { color: "Rose", hex: "#d77c8f", image: rose },
  { color: "Midnight", hex: "#1e2a48", image: midnight },
  { color: "Sage", hex: "#9ba87a", image: sage },
  { color: "Plum", hex: "#6c2b54", image: plum },
];

const epithets = [
  "Whisper",
  "Dune",
  "Beige",
  "Grey",
  "Smoke",
  "Blue",
  "Green",
  "Shadow",
  "Mist",
  "Glow",
  "Veil",
  "Bloom",
  "Echo",
  "Loom",
  "Aura",
  "Silk",
  "Haze",
  "Dusk",
  "Dawn",
  "Frost",
];

const collectionSeeds: CollectionSeed[] = [
  { slug: "signature", category: "signature", categoryLabel: "100% Pashmina", priceBase: 495 },
  { slug: "lightweight", category: "lightweight", categoryLabel: "100% Pashmina", priceBase: 425 },
  { slug: "bridal", category: "bridal", categoryLabel: "Bridal Pashmina", priceBase: 575 },
  { slug: "limited", category: "limited", categoryLabel: "Limited Edition", priceBase: 595 },
  { slug: "new-arrivals", category: "signature", categoryLabel: "New Arrival", priceBase: 485 },
  { slug: "best-sellers", category: "signature", categoryLabel: "100% Pashmina", priceBase: 465 },
  {
    slug: "heritage-weaves",
    category: "signature",
    categoryLabel: "Heritage Weave",
    priceBase: 525,
  },
  { slug: "evening-edit", category: "limited", categoryLabel: "Evening Edit", priceBase: 545 },
  { slug: "travel-wraps", category: "lightweight", categoryLabel: "Travel Wrap", priceBase: 415 },
  { slug: "gift-edition", category: "bridal", categoryLabel: "Gift Edition", priceBase: 505 },
];

const collectionBySlug = Object.fromEntries(collectionSeeds.map((c) => [c.slug, c]));

function slugify(...parts: string[]) {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
}

function describe(name: string, collectionSlug: string) {
  return `A ${name.toLowerCase()} pashmina from our ${collectionSlug.replace(/-/g, " ")} collection — handwoven in Kashmir for timeless elegance.`;
}

function buildMockProducts(): MockProductRecord[] {
  const products: MockProductRecord[] = [];
  const usedSlugs = new Set<string>();
  const counts: Record<string, number> = Object.fromEntries(
    collectionSeeds.map((c) => [c.slug, 0]),
  );

  const push = (record: MockProductRecord) => {
    if (usedSlugs.has(record.slug)) return false;
    products.push(record);
    usedSlugs.add(record.slug);
    counts[record.collectionSlug]++;
    return true;
  };

  const add = (
    collectionSlug: string,
    slug: string,
    name: string,
    colorHex: string,
    image: typeof ivory,
    price: number,
    categoryLabel?: string,
  ) => {
    const collection = collectionBySlug[collectionSlug];
    push({
      slug,
      name,
      category: collection.category,
      categoryLabel: categoryLabel ?? collection.categoryLabel,
      collectionSlug,
      price,
      image,
      colorHex,
      description: describe(name, collectionSlug),
    });
  };

  // Preserve original hero PDPs
  add("signature", "ivory-whisper", "Ivory Whisper", "#efe6d4", ivory, 495);
  add("signature", "sand-dune", "Sand Dune", "#d8bf99", sand, 495);
  add("signature", "mink-beige", "Mink Beige", "#7a4a32", mink, 495);
  add("signature", "midnight-blue", "Midnight Blue", "#1e2a48", midnight, 395);
  add("lightweight", "opal-grey", "Opal Grey", "#bcb6ad", opal, 495);
  add("lightweight", "rose-smoke", "Rose Smoke", "#d77c8f", rose, 395);
  add("lightweight", "sage-green", "Sage Green", "#9ba87a", sage, 395);
  add("limited", "plum-shadow", "Plum Shadow", "#6c2b54", plum, 595, "Limited Edition");

  let variant = 0;
  for (const collection of collectionSeeds) {
    while (counts[collection.slug] < 6) {
      const color = colorSeeds[variant % colorSeeds.length];
      const epithet = epithets[variant % epithets.length];
      const slug = slugify(collection.slug, color.color, epithet);
      const name = `${color.color} ${epithet}`;
      const price = collection.priceBase + (variant % 3) * 15 - (variant % 2) * 5;

      if (!usedSlugs.has(slug)) {
        push({
          slug,
          name,
          category: collection.category,
          categoryLabel: collection.categoryLabel,
          collectionSlug: collection.slug,
          price,
          image: color.image,
          colorHex: color.hex,
          description: describe(name, collection.slug),
        });
      }
      variant++;
    }
  }

  return products;
}

export const mockProducts: MockProductRecord[] = buildMockProducts();

export const mockColors = colorSeeds.map((c) => ({ name: c.color, hex: c.hex }));
