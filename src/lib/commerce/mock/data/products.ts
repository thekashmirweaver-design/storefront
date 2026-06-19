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

const collectionSeeds: CollectionSeed[] = [
  {
    slug: "jamawar-embroidery",
    category: "signature",
    categoryLabel: "Jamawar Embroidery",
    priceBase: 1450,
  },
  {
    slug: "kani-pashmina",
    category: "signature",
    categoryLabel: "Kani Pashmina",
    priceBase: 1550,
  },
  {
    slug: "reversible-cashmere",
    category: "lightweight",
    categoryLabel: "Reversible Cashmere",
    priceBase: 320,
  },
];

const collectionBySlug = Object.fromEntries(collectionSeeds.map((c) => [c.slug, c]));

function slugify(...parts: string[]) {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
}

function describe(name: string, collectionSlug: string) {
  return `A ${name.toLowerCase()} from our ${collectionSlug.replace(/-/g, " ")} collection — handwoven in Kashmir for timeless elegance.`;
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

  // Flagship pieces — inspired by purekashmir.com collection previews
  add(
    "jamawar-embroidery",
    "mustard-jamawar-embroidery-pashmina",
    "Mustard Jamawar Embroidery Pashmina Shawl",
    "#c9a227",
    sand,
    1499,
  );
  add(
    "jamawar-embroidery",
    "black-jamawar-embroidery-pashmina",
    "Black Jamawar Embroidery Pashmina Shawl",
    "#1a1a1a",
    midnight,
    1650,
  );
  add(
    "jamawar-embroidery",
    "salmon-pink-jamawar-embroidery-pashmina",
    "Salmon Pink Jamawar Embroidery Pashmina Shawl",
    "#e8a598",
    rose,
    1450,
  );

  add("kani-pashmina", "striped-kani-pashmina-shawl", "Striped Kani Pashmina Shawl", "#bcb6ad", opal, 1950);
  add(
    "kani-pashmina",
    "natural-kani-white-buteh-pashmina",
    "Natural Kani White Buteh Pashmina Shawl",
    "#efe6d4",
    ivory,
    1550,
  );
  add(
    "kani-pashmina",
    "ivory-base-kani-jamawar-pashmina",
    "Ivory Base Kani Jamawar Pashmina Shawl",
    "#efe6d4",
    ivory,
    2950,
  );

  add(
    "reversible-cashmere",
    "dusty-blue-taupe-reversible-cashmere",
    "Dusty Blue And Taupe Reversible Cashmere Shawl",
    "#6b8fa3",
    opal,
    320,
  );
  add(
    "reversible-cashmere",
    "forest-green-stone-grey-reversible",
    "Forest Green And Stone Grey Reversible Cashmere Shawl",
    "#4a6741",
    sage,
    320,
  );
  add(
    "reversible-cashmere",
    "reversible-rust-green-cashmere",
    "Reversible Rust and Green Cashmere Shawl",
    "#a0522d",
    mink,
    320,
  );

  let variant = 0;
  for (const collection of collectionSeeds) {
    while (counts[collection.slug] < 6) {
      const color = colorSeeds[variant % colorSeeds.length];
      const epithet = ["Whisper", "Veil", "Loom", "Aura", "Echo", "Mist"][variant % 6];
      const slug = slugify(collection.slug, color.color, epithet);
      const name = `${color.color} ${epithet}`;
      const price = collection.priceBase + (variant % 3) * 25 - (variant % 2) * 10;

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
