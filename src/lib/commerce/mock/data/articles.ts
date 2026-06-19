import mountainImg from "@/assets/journal-mountain.jpg";
import handloomImg from "@/assets/journal-handloom.jpg";
import styleImg from "@/assets/journal-style.jpg";
import legacyImg from "@/assets/legacy-stilllife.jpg";
import lightweightImg from "@/assets/collection-lightweight.jpg";

export type MockArticleRecord = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  cover: typeof mountainImg;
};

export const mockArticles: MockArticleRecord[] = [
  {
    slug: "timeless-legacy-of-pashmina",
    title: "The Timeless Legacy of Pashmina",
    category: "Heritage",
    date: "May 10, 2026",
    excerpt:
      "Pashmina is more than just a fabric — it is a legacy woven through centuries of rich heritage, artistry, and nature's finest gifts.",
    cover: mountainImg,
  },
  {
    slug: "art-of-handloom-perfection",
    title: "The Art of Handloom Perfection",
    category: "Craftsmanship",
    date: "Apr 23, 2026",
    excerpt:
      "Step inside a Kashmiri weaver's workshop and witness the slow, patient craft that turns thread into heirloom.",
    cover: handloomImg,
  },
  {
    slug: "how-to-style-your-pashmina",
    title: "How to Style Your Pashmina Effortlessly",
    category: "Style",
    date: "Apr 08, 2026",
    excerpt: "Five ways to wear a single pashmina from morning meetings to evening gatherings.",
    cover: styleImg,
  },
  {
    slug: "sustainability-woven-at-every-step",
    title: "Sustainability Woven at Every Step",
    category: "Sustainability",
    date: "Mar 18, 2026",
    excerpt:
      "How {name} partners with mountain herders and weavers to keep an ancient craft alive.",
    cover: legacyImg,
  },
  {
    slug: "kashmir-the-birthplace-of-pashmina",
    title: "Kashmir: The Birthplace of Pashmina",
    category: "Travel",
    date: "Mar 02, 2026",
    excerpt: "A journey into the valleys where the world's softest fiber begins its story.",
    cover: mountainImg,
  },
  {
    slug: "the-perfect-gift",
    title: "The Perfect Gift: Thoughtful & Timeless",
    category: "Inspiration",
    date: "Feb 15, 2026",
    excerpt:
      "Why a pashmina is the most meaningful gift you can give — and how to choose the right one.",
    cover: lightweightImg,
  },
];

export function getArticleCover(slug: string) {
  return mockArticles.find((a) => a.slug === slug)?.cover ?? mountainImg;
}
