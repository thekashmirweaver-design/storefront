import type { CommerceProduct } from "@/lib/commerce";

export function ProductJsonLd({ product }: { product: CommerceProduct }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gulriza.com";
  const image = product.images[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: image?.src.startsWith("http") ? image.src : `${siteUrl}${image?.src}`,
    brand: { "@type": "Brand", name: "GULRIZA" },
    offers: {
      "@type": "Offer",
      price: product.price.amount,
      priceCurrency: product.price.currencyCode,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
