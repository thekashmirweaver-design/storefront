import type { BrandConfig } from "../types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gulriza.com";

export const mockBrand: BrandConfig = {
  name: "GULRIZA",
  tagline: "Timeless. Natural. Luxurious.",
  siteUrl,
  logo: {
    src: "/images/gulriza-logo.jpg",
    alt: "GULRIZA",
    width: 120,
    height: 40,
  },
  contact: {
    email: "care@gulriza.com",
    phone: "+91 194 000 0000",
    address: "Dal Lake Road, Srinagar\nKashmir, India 190001",
    hours: "Monday – Saturday · 10:00 – 19:00 IST",
  },
  social: {
    instagram: "https://instagram.com/gulriza",
    facebook: "https://facebook.com/gulriza",
    youtube: "https://youtube.com/gulriza",
  },
  seo: {
    defaultTitle: "GULRIZA — Timeless. Natural. Luxurious.",
    titleTemplate: "%s — GULRIZA",
    defaultDescription:
      "GULRIZA crafts the world's finest pashmina shawls, handwoven in Kashmir from 100% natural fibers.",
    ogTitle: "GULRIZA — Handwoven Pashmina from Kashmir",
    ogDescription: "Exquisite Kashmiri pashmina shawls, woven by heritage.",
  },
  headerNav: [
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/collections" },
    { label: "Our Story", href: "/our-story" },
    { label: "Craftsmanship", href: "/craftsmanship" },
    { label: "Journal", href: "/journal" },
    { label: "Contact", href: "/contact" },
  ],
  footerMenus: [
    {
      title: "Shop",
      links: [
        { label: "All Pashminas", href: "/shop" },
        { label: "Signature Pashminas", href: "/collections/signature" },
        { label: "Lightweight Pashminas", href: "/collections/lightweight" },
        { label: "Bridal Collection", href: "/collections" },
        { label: "Limited Editions", href: "/collections" },
      ],
    },
    {
      title: "Collections",
      links: [
        { label: "New Arrivals", href: "/shop" },
        { label: "Best Sellers", href: "/shop" },
        { label: "Bridal Edit", href: "/collections" },
        { label: "Men's Pashminas", href: "/shop" },
        { label: "Accessories", href: "/shop" },
      ],
    },
    {
      title: "Our Story",
      links: [
        { label: "Our Heritage", href: "/our-story" },
        { label: "Sustainability", href: "/our-story" },
        { label: "Craftsmanship", href: "/craftsmanship" },
        { label: "The Kashmir Valley", href: "/our-story" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "FAQs", href: "/faqs" },
        { label: "Shipping & Delivery", href: "/faqs" },
        { label: "Returns & Exchanges", href: "/faqs" },
        { label: "Care Guide", href: "/craftsmanship" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
  ],
  footerDescription:
    "Ethically crafted in Kashmir using the finest natural fibers. Made to be treasured for generations.",
  newsletter: {
    title: "Stay Connected",
    description: "Be the first to know about new arrivals and exclusive offers.",
    placeholder: "Enter your email",
  },
};
