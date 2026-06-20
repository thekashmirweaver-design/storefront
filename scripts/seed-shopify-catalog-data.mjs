/**
 * Rich seed data aligned with src/lib/commerce/mock/data.
 * Every Shopify Admin field we consume in Next.js is populated here for QA.
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, "../src/assets");
const img = (filename) => resolve(assetsDir, filename);

export const VENDOR = "The Kashmir Weaver";

export const collectionMetafieldDefinitions = [
  { name: "Hero Headline", key: "hero_headline" },
  { name: "Hero Tagline", key: "hero_tagline" },
  { name: "CTA Label", key: "cta_label" },
];

export const productMetafieldDefinitions = [
  { name: "Care Instructions", key: "care_instructions", type: "multi_line_text_field" },
  { name: "Dimensions", key: "dimensions", type: "single_line_text_field" },
  { name: "Product Highlights", key: "product_highlights", type: "list.single_line_text_field" },
  {
    name: "Shipping Returns Text",
    key: "shipping_returns_text",
    type: "multi_line_text_field",
  },
  { name: "Authenticity Promise", key: "authenticity_promise", type: "multi_line_text_field" },
];

export const shopPolicies = {
  shipping: `<p><strong>Complimentary worldwide express shipping</strong> on all orders. Orders are dispatched from our Kashmir atelier within 1–2 business days of confirmation.</p><p>Delivery typically within <strong>5–10 business days</strong> for most international destinations. You will receive tracking details by email once your parcel ships.</p><p>Customs duties and import taxes, where applicable, are the responsibility of the recipient unless stated otherwise at checkout.</p>`,
  refund: `<p>We want you to love your pashmina. If you are not completely satisfied, you may return unworn items in their original packaging within <strong>30 days of delivery</strong> for a full refund or exchange.</p><p>Initiate a return by contacting <a href="mailto:hello@thekashmirweaver.com">hello@thekashmirweaver.com</a> with your order number. Return shipping is complimentary for eligible orders.</p><p>Final-sale or personalised pieces are non-returnable unless faulty.</p>`,
  terms: `<p>By accessing or purchasing from The Kashmir Weaver website, you agree to these Terms of Service.</p><p>All products are handwoven or hand-finished in Kashmir; natural variations in colour and texture are a hallmark of artisan craft, not defects.</p><p>Prices are listed in USD unless otherwise noted. We reserve the right to refuse or cancel orders placed in error or suspected of fraud.</p><p>These terms are governed by the laws applicable in our place of business. For questions, contact <a href="mailto:hello@thekashmirweaver.com">hello@thekashmirweaver.com</a>.</p>`,
  privacy: `<p>The Kashmir Weaver respects your privacy. We collect only the information needed to process orders, deliver products, and respond to enquiries—such as name, email, shipping address, and payment details processed securely by our payment partners.</p><p>We do not sell your personal data. We may use your email to send order updates and, with your consent, occasional news about new collections. You may unsubscribe at any time.</p><p>We use industry-standard measures to protect your data. For privacy requests, contact <a href="mailto:hello@thekashmirweaver.com">hello@thekashmirweaver.com</a>.</p>`,
};

export const shopMetafieldDefinitions = [
  { name: "Authenticity Promise", key: "authenticity_promise", type: "multi_line_text_field" },
  { name: "Shipping Badge Text", key: "shipping_badge_text", type: "single_line_text_field" },
  { name: "Returns Badge Text", key: "returns_badge_text", type: "single_line_text_field" },
  {
    name: "Shipping Returns Text",
    key: "shipping_returns_text",
    type: "multi_line_text_field",
  },
];

export const shopMetafields = {
  authenticity_promise:
    "Every The Kashmir Weaver pashmina is signed by the master weaver and accompanied by a certificate of authenticity.",
  shipping_badge_text: "Complimentary express shipping",
  returns_badge_text: "Free 30-day returns",
  shipping_returns_text: `${shopPolicies.shipping}\n${shopPolicies.refund}`,
};

export const BLOG_HANDLE = "news";
export const BLOG_TITLE = "Journal";

export const articles = [
  {
    handle: "timeless-legacy-of-pashmina",
    title: "The Timeless Legacy of Pashmina",
    category: "Heritage",
    tags: ["Heritage"],
    publishDate: "2026-05-10T12:00:00Z",
    excerpt:
      "Pashmina is more than just a fabric — it is a legacy woven through centuries of rich heritage, artistry, and nature's finest gifts.",
    bodyHtml: `<p>Pashmina is more than just a fabric — it is a legacy woven through centuries of rich heritage, artistry, and nature's finest gifts.</p><p>Originating from the pristine highlands of Kashmir, pashmina is derived from the soft under-fleece of the Changthangi goat. The extreme climate, the pure air, and the traditional way of life in this region contribute to the unmatched quality of this fiber.</p><p>For generations, skilled artisans have transformed this exquisite fiber into timeless pieces — each one a labor of love that embodies elegance, warmth, and sophistication.</p>`,
    image: { file: img("journal-mountain.jpg"), alt: "Changthangi goats in the Kashmir highlands" },
  },
  {
    handle: "art-of-handloom-perfection",
    title: "The Art of Handloom Perfection",
    category: "Craftsmanship",
    tags: ["Craftsmanship"],
    publishDate: "2026-04-23T12:00:00Z",
    excerpt:
      "Step inside a Kashmiri weaver's workshop and witness the slow, patient craft that turns thread into heirloom.",
    bodyHtml: `<p>Step inside a Kashmiri weaver's workshop and witness the slow, patient craft that turns thread into heirloom.</p><p>Kani weaving uses no shuttle — instead, hundreds of small wooden bobbins called <em>kanis</em> carry each colour thread individually. The pattern is read from a talim, a coded manuscript, line by line.</p><p>A single shawl takes a master weaver 12 to 18 months to complete. Every knot, every colour change, is a decision made by hand.</p>`,
    image: { file: img("journal-handloom.jpg"), alt: "Kashmiri weaver at the handloom" },
  },
  {
    handle: "how-to-style-your-pashmina",
    title: "How to Style Your Pashmina Effortlessly",
    category: "Style",
    tags: ["Style"],
    publishDate: "2026-04-08T12:00:00Z",
    excerpt: "Five ways to wear a single pashmina from morning meetings to evening gatherings.",
    bodyHtml: `<p>Five ways to wear a single pashmina from morning meetings to evening gatherings.</p><p><strong>The classic drape</strong> — fold lengthwise and let it fall over one shoulder for effortless polish.</p><p><strong>The evening wrap</strong> — drape across both shoulders and secure with a fine brooch for formal occasions.</p><p><strong>The travel layer</strong> — fold into a compact bundle for flights, then unfold as an elegant shawl on arrival.</p>`,
    image: { file: img("journal-style.jpg"), alt: "Pashmina styled for day and evening wear" },
  },
];

export const collections = [
  {
    handle: "jamawar-embroidery",
    title: "Jamawar Embroidery",
    descriptionHtml: `<p>Jamawar is among the most elaborate embroidery traditions of Kashmir — dense floral and paisley motifs worked by hand over pure pashmina.</p><p>Each shawl carries weeks of needlework from artisans trained under master embroiderers. The result is a textile that reads as painting in thread.</p>`,
    metafields: {
      hero_headline: "Authentic pashmina, richly embroidered —",
      hero_tagline: "Woven for Generations",
      cta_label: "Explore Jamawar",
    },
    seoTitle: "Jamawar Embroidery Pashmina | The Kashmir Weaver",
    seoDescription:
      "Shop hand-embroidered Jamawar pashmina shawls from Kashmir — dense floral motifs on pure pashmina, woven for generations.",
    image: { file: img("collection-woven.jpg"), alt: "Jamawar Embroidery collection hero" },
    category: "signature",
  },
  {
    handle: "kani-pashmina",
    title: "Kani Pashmina",
    descriptionHtml: `<p>Kani weaving uses no shuttle — instead, hundreds of small wooden bobbins called <em>kanis</em> carry each colour thread individually.</p><p>The pattern is read from a talim, a coded manuscript, line by line. A single shawl takes a master weaver 12 to 18 months to complete.</p>`,
    metafields: {
      hero_headline: "Kani woven thread by thread —",
      hero_tagline: "Worn for a Lifetime",
      cta_label: "Explore Kani",
    },
    seoTitle: "Kani Pashmina Shawls | The Kashmir Weaver",
    seoDescription:
      "Discover Kani pashmina shawls woven thread by thread in Kashmir — heirloom pieces worn for a lifetime.",
    image: { file: img("journal-handloom.jpg"), alt: "Kani Pashmina collection hero" },
    category: "signature",
  },
  {
    handle: "reversible-cashmere",
    title: "Reversible Cashmere",
    descriptionHtml: `<p>Artistically woven with two distinct hues — each side a different expression. One shawl, two wardrobes.</p><p>The ultimate travel companion, finished in the world's finest handwoven cashmere pashmina.</p>`,
    metafields: {
      hero_headline: "Two faces, one masterpiece —",
      hero_tagline: "Infinite Possibilities",
      cta_label: "Shop Reversible",
    },
    seoTitle: "Reversible Cashmere Shawls | The Kashmir Weaver",
    seoDescription:
      "Two-sided reversible cashmere pashmina shawls — two colours, one masterpiece, infinite styling possibilities.",
    image: { file: img("collection-lightweight.jpg"), alt: "Reversible Cashmere collection hero" },
    category: "lightweight",
  },
];

function productHtml(intro, bullets) {
  const list = bullets.map((b) => `<li>${b}</li>`).join("");
  return `<p>${intro}</p><ul>${list}</ul><p>Handwoven in Kashmir for timeless elegance.</p>`;
}

const care =
  "Dry clean only. Store folded with cedar blocks. Avoid direct sunlight and heavy perfume on the fibers.";
const dimensions = "70 x 200 cm";

function productMetafields(bullets) {
  return {
    care_instructions: care,
    dimensions,
    product_highlights: bullets,
  };
}

/** @type {import('./seed-shopify-catalog-data.mjs').SeedProduct[]} */
export const products = [
  {
    handle: "mustard-jamawar-embroidery-pashmina",
    title: "Mustard Jamawar Embroidery Pashmina Shawl",
    collectionHandle: "jamawar-embroidery",
    vendor: VENDOR,
    productType: "Jamawar Embroidery",
    tags: ["signature", "jamawar", "embroidery"],
    color: "Mustard",
    colorHex: "#c9a227",
    price: "1499.00",
    compareAtPrice: "1799.00",
    sku: "KWB-JAM-MUSTARD-001",
    descriptionPlain:
      "Mustard Jamawar embroidery on pure pashmina — dense hand-worked florals in a warm golden hue.",
    descriptionHtml: productHtml(
      "Mustard Jamawar embroidery on pure pashmina — dense hand-worked florals in a warm golden hue.",
      ["100% pure pashmina base", "Hand-embroidered Jamawar motifs", "Lightweight yet warm drape"],
    ),
    seoTitle: "Mustard Jamawar Embroidery Pashmina | The Kashmir Weaver",
    seoDescription:
      "Mustard Jamawar embroidery pashmina shawl — hand-embroidered florals on pure Kashmir pashmina.",
    metafields: productMetafields([
      "100% pure pashmina base",
      "Hand-embroidered Jamawar motifs",
      "Lightweight yet warm drape",
    ]),
    images: [
      { file: img("product-sand.jpg"), alt: "Mustard Jamawar shawl — full view" },
      { file: img("product-opal.jpg"), alt: "Mustard Jamawar shawl — embroidery detail" },
      { file: img("collection-woven.jpg"), alt: "Mustard Jamawar shawl — artisan context" },
    ],
  },
  {
    handle: "black-jamawar-embroidery-pashmina",
    title: "Black Jamawar Embroidery Pashmina Shawl",
    collectionHandle: "jamawar-embroidery",
    vendor: VENDOR,
    productType: "Jamawar Embroidery",
    tags: ["signature", "jamawar", "embroidery", "evening"],
    color: "Black",
    colorHex: "#1a1a1a",
    price: "1650.00",
    compareAtPrice: "1895.00",
    sku: "KWB-JAM-BLACK-001",
    descriptionPlain:
      "Black Jamawar embroidery pashmina with ivory threadwork — dramatic contrast for evening.",
    descriptionHtml: productHtml("Black Jamawar embroidery pashmina with ivory threadwork.", [
      "Ivory embroidery on deep black ground",
      "Evening-ready silhouette",
      "Master embroiderer finish",
    ]),
    seoTitle: "Black Jamawar Embroidery Pashmina | The Kashmir Weaver",
    seoDescription:
      "Black Jamawar embroidery pashmina shawl with ivory floral motifs — pure Kashmir craftsmanship.",
    metafields: productMetafields([
      "Ivory embroidery on deep black ground",
      "Evening-ready silhouette",
      "Master embroiderer finish",
    ]),
    images: [
      { file: img("product-midnight.jpg"), alt: "Black Jamawar shawl — full view" },
      { file: img("product-ivory.jpg"), alt: "Black Jamawar shawl — contrast detail" },
      { file: img("product-plum.jpg"), alt: "Black Jamawar shawl — drape study" },
    ],
  },
  {
    handle: "salmon-pink-jamawar-embroidery-pashmina",
    title: "Salmon Pink Jamawar Embroidery Pashmina Shawl",
    collectionHandle: "jamawar-embroidery",
    vendor: VENDOR,
    productType: "Jamawar Embroidery",
    tags: ["signature", "jamawar", "embroidery", "bridal"],
    color: "Salmon Pink",
    colorHex: "#e8a598",
    price: "1450.00",
    compareAtPrice: "1695.00",
    sku: "KWB-JAM-SALMON-001",
    descriptionPlain:
      "Salmon pink Jamawar pashmina with tonal embroidery — soft, romantic, and luminous.",
    descriptionHtml: productHtml("Salmon pink Jamawar pashmina with tonal embroidery.", [
      "Soft salmon ground colour",
      "Bridal and occasion ready",
      "Featherlight pashmina handle",
    ]),
    seoTitle: "Salmon Pink Jamawar Pashmina | The Kashmir Weaver",
    seoDescription:
      "Salmon pink Jamawar embroidery pashmina — romantic hand-embroidered Kashmir shawl.",
    metafields: productMetafields([
      "Soft salmon ground colour",
      "Bridal and occasion ready",
      "Featherlight pashmina handle",
    ]),
    images: [
      { file: img("product-rose.jpg"), alt: "Salmon pink Jamawar shawl — full view" },
      { file: img("product-sand.jpg"), alt: "Salmon pink Jamawar shawl — texture" },
      { file: img("collection-woven.jpg"), alt: "Salmon pink Jamawar shawl — collection styling" },
    ],
  },
  {
    handle: "striped-kani-pashmina-shawl",
    title: "Striped Kani Pashmina Shawl",
    collectionHandle: "kani-pashmina",
    vendor: VENDOR,
    productType: "Kani Pashmina",
    tags: ["signature", "kani", "limited"],
    color: "Opal",
    colorHex: "#bcb6ad",
    price: "1950.00",
    compareAtPrice: "2250.00",
    sku: "KWB-KANI-STRIPE-001",
    descriptionPlain:
      "Striped Kani pashmina woven thread by thread — graphic bands in natural opal tones.",
    descriptionHtml: productHtml("Striped Kani pashmina woven thread by thread.", [
      "Kani technique — no shuttle",
      "Graphic stripe pattern",
      "Limited production run",
    ]),
    seoTitle: "Striped Kani Pashmina Shawl | The Kashmir Weaver",
    seoDescription: "Striped Kani pashmina shawl — thread-by-thread Kashmir weaving in opal tones.",
    metafields: productMetafields([
      "Kani technique — no shuttle",
      "Graphic stripe pattern",
      "Limited production run",
    ]),
    images: [
      { file: img("product-opal.jpg"), alt: "Striped Kani shawl — full view" },
      { file: img("product-sage.jpg"), alt: "Striped Kani shawl — weave detail" },
      { file: img("journal-handloom.jpg"), alt: "Striped Kani shawl — loom context" },
    ],
  },
  {
    handle: "natural-kani-white-buteh-pashmina",
    title: "Natural Kani White Buteh Pashmina Shawl",
    collectionHandle: "kani-pashmina",
    vendor: VENDOR,
    productType: "Kani Pashmina",
    tags: ["signature", "kani"],
    color: "Ivory",
    colorHex: "#efe6d4",
    price: "1550.00",
    compareAtPrice: "1795.00",
    sku: "KWB-KANI-BUTEH-001",
    descriptionPlain: "Natural ivory Kani with classic buteh motif — understated heirloom weaving.",
    descriptionHtml: productHtml("Natural ivory Kani with classic buteh motif.", [
      "Natural undyed ivory tones",
      "Traditional buteh pattern",
      "12–18 month weave time",
    ]),
    seoTitle: "Natural Kani White Buteh Pashmina | The Kashmir Weaver",
    seoDescription:
      "Natural Kani white buteh pashmina shawl — classic Kashmir motif on ivory ground.",
    metafields: productMetafields([
      "Natural undyed ivory tones",
      "Traditional buteh pattern",
      "12–18 month weave time",
    ]),
    images: [
      { file: img("product-ivory.jpg"), alt: "Natural Kani buteh shawl — full view" },
      { file: img("product-opal.jpg"), alt: "Natural Kani buteh shawl — motif detail" },
      { file: img("collection-classic.jpg"), alt: "Natural Kani buteh shawl — styled flat lay" },
    ],
  },
  {
    handle: "ivory-base-kani-jamawar-pashmina",
    title: "Ivory Base Kani Jamawar Pashmina Shawl",
    collectionHandle: "kani-pashmina",
    vendor: VENDOR,
    productType: "Kani Pashmina",
    tags: ["signature", "kani", "jamawar", "limited"],
    color: "Ivory",
    colorHex: "#efe6d4",
    price: "2950.00",
    compareAtPrice: "3200.00",
    sku: "KWB-KANI-JAM-001",
    descriptionPlain:
      "Ivory Kani ground with Jamawar embroidery — two master crafts in one heirloom piece.",
    descriptionHtml: productHtml("Ivory Kani ground with Jamawar embroidery.", [
      "Kani weave + Jamawar embroidery",
      "Flagship artisan collaboration",
      "Certificate of authenticity included",
    ]),
    seoTitle: "Ivory Kani Jamawar Pashmina | The Kashmir Weaver",
    seoDescription:
      "Ivory base Kani Jamawar pashmina — rare fusion of Kani weaving and Jamawar embroidery.",
    metafields: productMetafields([
      "Kani weave + Jamawar embroidery",
      "Flagship artisan collaboration",
      "Certificate of authenticity included",
    ]),
    images: [
      { file: img("product-ivory.jpg"), alt: "Ivory Kani Jamawar shawl — full view" },
      { file: img("product-sand.jpg"), alt: "Ivory Kani Jamawar shawl — embroidery close-up" },
      { file: img("journal-handloom.jpg"), alt: "Ivory Kani Jamawar shawl — artisan loom" },
      { file: img("collection-classic.jpg"), alt: "Ivory Kani Jamawar shawl — heritage styling" },
    ],
  },
  {
    handle: "dusty-blue-taupe-reversible-cashmere",
    title: "Dusty Blue And Taupe Reversible Cashmere Shawl",
    collectionHandle: "reversible-cashmere",
    vendor: VENDOR,
    productType: "Reversible Cashmere",
    tags: ["lightweight", "reversible", "travel"],
    color: "Dusty Blue",
    colorHex: "#6b8fa3",
    price: "320.00",
    compareAtPrice: "395.00",
    sku: "KWB-REV-BLUE-001",
    descriptionPlain:
      "Reversible dusty blue and taupe cashmere — two palettes in one lightweight shawl.",
    descriptionHtml: productHtml("Reversible dusty blue and taupe cashmere.", [
      "Two distinct wearing faces",
      "Travel-friendly weight",
      "Handwoven cashmere pashmina",
    ]),
    seoTitle: "Dusty Blue Reversible Cashmere Shawl | The Kashmir Weaver",
    seoDescription:
      "Dusty blue and taupe reversible cashmere shawl — two colours, one lightweight piece.",
    metafields: productMetafields([
      "Two distinct wearing faces",
      "Travel-friendly weight",
      "Handwoven cashmere pashmina",
    ]),
    images: [
      { file: img("product-opal.jpg"), alt: "Dusty blue reversible shawl — blue side" },
      { file: img("product-sage.jpg"), alt: "Dusty blue reversible shawl — taupe side" },
      {
        file: img("collection-lightweight.jpg"),
        alt: "Dusty blue reversible shawl — collection context",
      },
    ],
  },
  {
    handle: "forest-green-stone-grey-reversible",
    title: "Forest Green And Stone Grey Reversible Cashmere Shawl",
    collectionHandle: "reversible-cashmere",
    vendor: VENDOR,
    productType: "Reversible Cashmere",
    tags: ["lightweight", "reversible"],
    color: "Forest Green",
    colorHex: "#4a6741",
    price: "320.00",
    compareAtPrice: "395.00",
    sku: "KWB-REV-GREEN-001",
    descriptionPlain:
      "Forest green and stone grey reversible cashmere — earthy tones, effortless layering.",
    descriptionHtml: productHtml("Forest green and stone grey reversible cashmere.", [
      "Earthy green and grey pairing",
      "Reversible construction",
      "All-season drape",
    ]),
    seoTitle: "Forest Green Reversible Cashmere | The Kashmir Weaver",
    seoDescription: "Forest green and stone grey reversible cashmere pashmina shawl from Kashmir.",
    metafields: productMetafields([
      "Earthy green and grey pairing",
      "Reversible construction",
      "All-season drape",
    ]),
    images: [
      { file: img("product-sage.jpg"), alt: "Forest green reversible shawl — green side" },
      { file: img("product-opal.jpg"), alt: "Forest green reversible shawl — grey side" },
      { file: img("product-mink.jpg"), alt: "Forest green reversible shawl — folded detail" },
    ],
  },
  {
    handle: "reversible-rust-green-cashmere",
    title: "Reversible Rust and Green Cashmere Shawl",
    collectionHandle: "reversible-cashmere",
    vendor: VENDOR,
    productType: "Reversible Cashmere",
    tags: ["lightweight", "reversible"],
    color: "Rust",
    colorHex: "#a0522d",
    price: "320.00",
    compareAtPrice: "395.00",
    sku: "KWB-REV-RUST-001",
    descriptionPlain: "Rust and green reversible cashmere — warm autumn tones on pure pashmina.",
    descriptionHtml: productHtml("Rust and green reversible cashmere.", [
      "Rust and forest green faces",
      "Compact for travel",
      "Soft brushed finish",
    ]),
    seoTitle: "Rust and Green Reversible Cashmere | The Kashmir Weaver",
    seoDescription:
      "Reversible rust and green cashmere shawl — warm seasonal colours, handwoven in Kashmir.",
    metafields: productMetafields([
      "Rust and forest green faces",
      "Compact for travel",
      "Soft brushed finish",
    ]),
    images: [
      { file: img("product-mink.jpg"), alt: "Rust green reversible shawl — rust side" },
      { file: img("product-sage.jpg"), alt: "Rust green reversible shawl — green side" },
      { file: img("collection-lightweight.jpg"), alt: "Rust green reversible shawl — styling" },
    ],
  },
];
