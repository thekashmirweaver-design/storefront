import { getSiteUrl } from "@/lib/site-url";

import type { BrandConfig } from "../types";

const siteUrl = getSiteUrl();

/** Single source of truth for all brand identity across the storefront. */
export const brandConfig = {
  id: "the-kashmir-weaver",
  name: "The Kashmir Weaver",
  tagline: "Timeless. Natural. Luxurious.",
  siteUrl,
  logo: {
    src: "/images/kashmir-weaver-logo.png",
    alt: "The Kashmir Weaver",
    width: 48,
    height: 48,
  },
  contact: {
    email: "",
    phone: "+91 194 000 0000",
    address: "Dal Lake Road, Srinagar\nKashmir, India 190001",
    hours: "Monday – Saturday · 10:00 – 19:00 IST",
  },
  social: {
    facebook: "https://facebook.com/thekashmirweaver",
    youtube: "https://youtube.com/thekashmirweaver",
    instagram: "https://instagram.com/thekashmirweaver",
    pinterest: "https://pinterest.com/thekashmirweaver",
  },
  seo: {
    defaultTitle: "The Kashmir Weaver — Timeless. Natural. Luxurious.",
    titleTemplate: "%s — The Kashmir Weaver",
    defaultDescription:
      "The Kashmir Weaver crafts the world's finest pashmina shawls, handwoven in Kashmir from 100% natural fibers.",
    ogTitle: "The Kashmir Weaver — Handwoven Pashmina from Kashmir",
    ogDescription: "Exquisite Kashmiri pashmina shawls, woven by heritage.",
  },
  headerNav: [
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/#collections" },
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
        { label: "Jamawar Embroidery", href: "/collections/jamawar-embroidery" },
        { label: "Kani Pashmina", href: "/collections/kani-pashmina" },
        { label: "Reversible Cashmere", href: "/collections/reversible-cashmere" },
      ],
    },
    {
      title: "Collections",
      links: [
        { label: "Jamawar Embroidery", href: "/collections/jamawar-embroidery" },
        { label: "Kani Pashmina", href: "/collections/kani-pashmina" },
        { label: "Reversible Cashmere", href: "/collections/reversible-cashmere" },
        { label: "Shop All", href: "/shop" },
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
  legal: {
    privacyPolicyUrl: "/privacy",
    termsUrl: "/terms",
  },
  copy: {
    productNoun: "pashmina",
    origin: "Kashmir",
    searchPlaceholder: "Search pashminas, collections…",
    pages: {
      home: {
        legacyBody:
          "From the highlands of Kashmir to the hands of skilled artisans, every {name} {productNoun} is a story of tradition, patience and unmatched craftsmanship. Woven with care. Cherished for a lifetime.",
      },
      shop: {
        subtitle: "Explore our complete range of handcrafted {name} {productNoun}.",
      },
      account: {
        registerSubtitle: "Join {name} to follow new arrivals and exclusive editions.",
        newToBrand: "New to {name}?",
        hasAccount: "Already have an account?",
      },
      product: {
        authenticityPromise:
          "Every {name} {productNoun} is signed by the master weaver and accompanied by a certificate of authenticity.",
      },
      ourStory: {
        nameMeaningQuote:
          "{name} — artisans who carry forward a centuries-old tradition from the valleys of {origin}, thread by thread.",
        heritageBody:
          "For over six hundred years, the artisans of Kashmir have hand-woven pashmina from the soft under-fleece of the Changthangi goat. {name} carries forward this lineage — partnering directly with families of weavers, dyers and spinners who have practiced the craft across generations.",
      },
      craftsmanship: {
        intro:
          "A single {name} {productNoun} passes through the hands of more than a dozen artisans before it reaches you. Here is how it is made.",
      },
    },
    messages: {
      newsletterWelcome: "Welcome to the {name} atelier.",
    },
  },
} satisfies BrandConfig;
