
# GULRIZA — Luxury Pashmina Site

Build a multi-page marketing + catalog site closely matching the attached mockups, rebranded from "PASHMINA" to "GULRIZA" with the gold serif "G" logo.

## Design system
- Palette: near-black background (#0b0907), deep brown surfaces, warm gold accent (#c9a24c / matching the G logo), cream/ivory text.
- Typography: serif display (Cormorant / Playfair-like) for headings, clean sans (Jost / Work Sans) for body, small-caps gold eyebrow labels with diamond divider motif.
- Tokens defined in `src/styles.css` (HSL/oklch) — no hardcoded colors in components.
- Decorative diamond/floret separators, hairline gold dividers, ornate arch motifs.

## Routes (TanStack Start, separate files w/ unique head() meta)
- `/` Home — hero (woman in shawl portrait), 4 value-prop strip (100% Natural / Handwoven / Ultra Soft / Sustainable), Our Collections (4 cards), "A Legacy Woven Through Time" split section w/ 4 sub-pillars, pull-quote, footer.
- `/shop` All Products — grid w/ filter sidebar (category, color swatches, material, price slider, size), sort, pagination.
- `/collections` — 4 collection tiles (Signature, Lightweight, Bridal, Limited Editions).
- `/collections/signature` and `/collections/lightweight` — filtered product grids.
- `/product/$slug` — gallery thumbs + main image, title, price, color swatches, size, qty, Add to Bag / Wishlist, accordions (Description, Details & Care, Shipping, Our Promise), "You may also like".
- `/our-story` — heritage narrative.
- `/craftsmanship` — process.
- `/journal` — article grid w/ category tabs and search.
- `/journal/$slug` — article detail w/ sidebar (categories, recent posts), share row, prev/next.
- `/contact`, `/faqs` — simple support pages.

## Shared
- Header: G logo + GULRIZA wordmark (tagline "TIMELESS. NATURAL. LUXURIOUS."), nav (SHOP, COLLECTIONS, OUR STORY, CRAFTSMANSHIP, JOURNAL), search/account/bag icons.
- Footer: brand block, 5 link columns, newsletter w/ gold arrow button, socials, legal row.
- Reusable components: `Eyebrow`, `DiamondDivider`, `ProductCard`, `CollectionCard`, `FilterSidebar`, `Accordion`, `Header`, `Footer`.

## Images
- Generate hero portrait (Kashmiri woman in pashmina, arched window, lake/mountain sunset — matches uploaded reference).
- Generate 4 collection tiles, ~12 product shots (varied colors: ivory, sand, mink, opal grey, rose, midnight blue, sage, plum, charcoal), legacy gift-box still life, journal article covers, mountain landscape.
- Use the uploaded `G.png` as the logo asset.

## Out of scope (frontend-only build)
- No cart persistence, no checkout, no auth, no CMS. Add-to-bag shows a toast. Newsletter form is a stub.

## Tech notes
- All pages SSR-friendly with per-route `head()` meta + og tags (og:image only at leaf routes with hero imagery).
- Framer Motion for restrained hero fade-in only.
- Mobile responsive following grid+min-w-0 patterns.
