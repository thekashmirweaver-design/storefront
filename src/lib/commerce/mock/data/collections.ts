import legacyImg from "@/assets/legacy-stilllife.jpg";
import collectionClassic from "@/assets/collection-classic.jpg";
import collectionLightweight from "@/assets/collection-lightweight.jpg";
import collectionWoven from "@/assets/collection-woven.jpg";
import collectionSeasonal from "@/assets/collection-seasonal.jpg";
import heroPortrait from "@/assets/hero-portrait.jpg";
import journalMountain from "@/assets/journal-mountain.jpg";
import journalHandloom from "@/assets/journal-handloom.jpg";
import journalStyle from "@/assets/journal-style.jpg";

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
  {
    slug: "new-arrivals",
    title: "New Arrivals",
    tagline: "The latest handwoven pieces from our Kashmir atelier.",
    category: "signature",
    image: heroPortrait,
  },
  {
    slug: "best-sellers",
    title: "Best Sellers",
    tagline: "Our most-loved pashminas, chosen by collectors worldwide.",
    category: "signature",
    image: collectionSeasonal,
  },
  {
    slug: "heritage-weaves",
    title: "Heritage Weaves",
    tagline: "Patterns and techniques passed down through generations.",
    category: "signature",
    image: journalHandloom,
  },
  {
    slug: "evening-edit",
    title: "Evening Edit",
    tagline: "Rich tones and refined drape for after dusk.",
    category: "limited",
    image: journalStyle,
  },
  {
    slug: "travel-wraps",
    title: "Travel Wraps",
    tagline: "Compact, versatile shawls for journeys near and far.",
    category: "lightweight",
    image: journalMountain,
  },
  {
    slug: "gift-edition",
    title: "Gift Edition",
    tagline: "Thoughtfully packaged heirlooms for meaningful giving.",
    category: "bridal",
    image: collectionWoven,
  },
];
