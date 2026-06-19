import legacyImg from "@/assets/legacy-stilllife.jpg";
import collectionClassic from "@/assets/collection-classic.jpg";
import collectionLightweight from "@/assets/collection-lightweight.jpg";
import collectionWoven from "@/assets/collection-woven.jpg";
import journalHandloom from "@/assets/journal-handloom.jpg";

import type { CommerceProductCategory } from "../../types";

export type MockCollectionRecord = {
  slug: string;
  title: string;
  heroHeadline?: string;
  tagline: string;
  description?: string;
  ctaLabel?: string;
  category: CommerceProductCategory;
  image: typeof legacyImg;
};

/** Homepage collections — aligned with purekashmir.com editorial structure. */
export const mockCollections: MockCollectionRecord[] = [
  {
    slug: "jamawar-embroidery",
    title: "Jamawar Embroidery",
    heroHeadline: "Authentic pashmina, richly embroidered —",
    tagline: "Woven for Generations",
    description:
      "Jamawar is among the most elaborate embroidery traditions of Kashmir — dense floral and paisley motifs worked by hand over pure pashmina. Each shawl carries weeks of needlework from artisans trained under master embroiderers.",
    ctaLabel: "Explore Jamawar",
    category: "signature",
    image: collectionWoven,
  },
  {
    slug: "kani-pashmina",
    title: "Kani Pashmina",
    heroHeadline: "Kani woven thread by thread —",
    tagline: "Worn for a Lifetime",
    description:
      "Kani weaving uses no shuttle — instead, hundreds of small wooden bobbins called kanis carry each colour thread individually. The pattern is read from a talim, a coded manuscript, line by line. A single shawl takes a master weaver 12 to 18 months to complete.",
    ctaLabel: "Explore Kani",
    category: "signature",
    image: journalHandloom,
  },
  {
    slug: "reversible-cashmere",
    title: "Reversible Cashmere",
    heroHeadline: "Two faces, one masterpiece —",
    tagline: "Infinite Possibilities",
    description:
      "Artistically woven with two distinct hues — each side a different expression. One shawl, two wardrobes. The ultimate travel companion, finished in the world's finest handwoven cashmere pashmina.",
    ctaLabel: "Shop Reversible",
    category: "lightweight",
    image: collectionLightweight,
  },
];
