import heroImg from "@/assets/hero-portrait.jpg";
import legacyImg from "@/assets/legacy-stilllife.jpg";
import mountainImg from "@/assets/journal-mountain.jpg";
import handloomImg from "@/assets/journal-handloom.jpg";
import wovenImg from "@/assets/collection-woven.jpg";

import { staticImageToCommerceImage } from "../../mappers/image";
import type {
  CommerceCraftsmanshipContent,
  CommerceHomepageEditorial,
  CommerceJournalIndexContent,
  CommerceOurStoryContent,
} from "../../types";

export const mockHomepageEditorial: CommerceHomepageEditorial = {
  hero: {
    eyebrow: "Exquisite by Nature",
    headlineLine1: "The Finest Pashmina",
    headlineLine2: "Woven by Heritage",
    description: "Luxuriously soft. Exceptionally rare.\nA timeless wrap of elegance and comfort.",
    ctaLabel: "Explore Collections",
    ctaHref: "/#collections",
    image: staticImageToCommerceImage(heroImg, "Woman elegantly styling a Kashmiri pashmina shawl"),
  },
  valueProps: [
    { icon: "leaf", label: "100% Natural Yarn" },
    { icon: "hexagon", label: "Handwoven in Kashmir" },
    { icon: "feather", label: "Ultra Soft & Lightweight" },
    { icon: "mountain", label: "Sustainable & Ethical" },
  ],
  marqueeItems: [
    "Timeless Elegance",
    "100% Pure Pashmina",
    "Handwoven in Kashmir",
    "Limited Production",
    "Ethically Sourced",
    "Certificate of Authenticity",
    "Complimentary Worldwide Shipping",
  ],
  legacy: {
    eyebrow: "Rooted in Heritage · Made to Last",
    titleLine1: "A Legacy Woven",
    titleLine2: "Through Time",
    body: "From the highlands of Kashmir to the hands of skilled artisans, every {name} {productNoun} is a story of tradition, patience and unmatched craftsmanship. Woven with care. Cherished for a lifetime.",
    image: staticImageToCommerceImage(legacyImg, "Rolled pashmina with gift box"),
    pillars: [
      {
        icon: "hand",
        title: "Heritage Craft",
        description: "Centuries-old Kashmiri artistry",
      },
      {
        icon: "home",
        title: "Pristine Origin",
        description: "Sourced from the Himalayan highlands",
      },
      {
        icon: "heart",
        title: "Made with Care",
        description: "Every piece is woven with love and precision",
      },
      {
        icon: "infinity",
        title: "Timeless Beauty",
        description: "Designed to be treasured forever",
      },
    ],
  },
  quote: {
    line1: "Pashmina is not just worn, it is felt.",
    line2: "A part of you, wherever you go.",
  },
  seo: {
    title: "The Finest Pashmina, Woven by Heritage",
    description:
      "Luxuriously soft. Exceptionally rare. Handwoven Kashmiri pashmina shawls crafted from 100% natural fibers.",
  },
};

export const mockOurStoryContent: CommerceOurStoryContent = {
  hero: {
    eyebrow: "Our Story",
    title: "From the Highlands of Kashmir, Woven with Love",
    image: staticImageToCommerceImage(mountainImg, "Kashmir highlands"),
  },
  quote:
    "{name} — artisans who carry forward a centuries-old tradition from the valleys of {origin}, thread by thread.",
  heritage: {
    eyebrow: "Heritage",
    title: "A Craft Centuries in the Making",
    body: "For over six hundred years, the artisans of Kashmir have hand-woven pashmina from the soft under-fleece of the Changthangi goat. {name} carries forward this lineage — partnering directly with families of weavers, dyers and spinners who have practiced the craft across generations.",
    bodyExtra:
      "Every shawl is signed and numbered by the weaver who made it. No two are ever identical.",
    image: staticImageToCommerceImage(legacyImg, "Heritage pashmina still life"),
  },
  sustainability: {
    eyebrow: "Sustainability",
    title: "Made Slowly. Made Honestly.",
    body: "Our fiber is gathered each spring, only when the goats naturally shed. Our dyes are derived from plants and minerals. Our weavers are paid living wages. We make a small number of pieces each season, and we make them to last for decades.",
    image: staticImageToCommerceImage(mountainImg, "Kashmir landscape"),
  },
};

export const mockCraftsmanshipContent: CommerceCraftsmanshipContent = {
  hero: {
    eyebrow: "Craftsmanship",
    title: "The Slow Art of the Handloom",
    image: staticImageToCommerceImage(handloomImg, "Handloom weaving in Kashmir"),
  },
  intro:
    "A single {name} {productNoun} passes through the hands of more than a dozen artisans before it reaches you. Here is how it is made.",
  steps: [
    {
      number: "01",
      title: "Gathering the Fleece",
      description:
        "Each spring, mountain herders comb the soft under-fleece from the Changthangi goat, never shearing.",
    },
    {
      number: "02",
      title: "Hand-Spinning",
      description:
        "Women in the valley spin the fiber on the traditional charkha, a craft passed from mother to daughter.",
    },
    {
      number: "03",
      title: "Natural Dyeing",
      description:
        "Plant- and mineral-based dyes are mixed by hand, producing colors that age gracefully.",
    },
    {
      number: "04",
      title: "Handloom Weaving",
      description: "A single shawl can take a weaver up to four weeks on the wooden handloom.",
    },
    {
      number: "05",
      title: "Finishing & Inspection",
      description: "Each piece is hand-washed in spring water, brushed, and signed by its weaver.",
    },
  ],
  careGuide: {
    eyebrow: "Care Guide",
    title: "Caring for Your Pashmina",
    tips: [
      "Dry clean only, ideally by a specialist familiar with cashmere.",
      "Store folded, never on a hanger. A breathable cotton bag is ideal.",
      "Keep cedar or lavender nearby to ward off moths.",
      "Air your shawl outdoors twice a season to keep it fresh.",
      "Pulls happen. Gently push the thread back through; never cut.",
    ],
    image: staticImageToCommerceImage(wovenImg, "Woven pashmina detail"),
  },
};

export const mockJournalIndexContent: CommerceJournalIndexContent = {
  eyebrow: "Journal",
  title: "Journal",
  description: "Stories of heritage, craftsmanship, and the timeless beauty of pashmina.",
  image: staticImageToCommerceImage(mountainImg, "Journal hero landscape"),
};
