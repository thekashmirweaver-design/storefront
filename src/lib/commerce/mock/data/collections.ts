import legacyImg from "@/assets/legacy-stilllife.jpg";
import collectionClassic from "@/assets/collection-classic.jpg";
import collectionLightweight from "@/assets/collection-lightweight.jpg";
import collectionWoven from "@/assets/collection-woven.jpg";

import type { CommerceProductCategory } from "../../types";

export type MockCollectionRecord = {
  slug: string;
  title: string;
  tagline: string;
  category: CommerceProductCategory;
  image: typeof legacyImg;
};

export const mockCollections: MockCollectionRecord[] = [
  {
    slug: "signature",
    title: "Signature Pashminas",
    tagline: "Timeless designs, exquisitely handcrafted for every occasion.",
    category: "signature",
    image: collectionClassic,
  },
  {
    slug: "lightweight",
    title: "Lightweight Pashminas",
    tagline: "Featherlight elegance for every day.",
    category: "lightweight",
    image: collectionLightweight,
  },
  {
    slug: "bridal",
    title: "Bridal Collection",
    tagline: "For life's most precious occasions.",
    category: "bridal",
    image: collectionWoven,
  },
  {
    slug: "limited",
    title: "Limited Editions",
    tagline: "Rare and meticulously crafted.",
    category: "limited",
    image: legacyImg,
  },
];
