import type { CommerceProduct } from "@/lib/commerce";

export function ProductJsonLd({
  product,
  brandName,
  siteUrl,
}: {
  product: CommerceProduct;
  brandName: string;
  siteUrl: string;
}) {
  const image = product.images[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: image?.src.startsWith("http") ? image.src : `${siteUrl}${image?.src}`,
    brand: { "@type": "Brand", name: brandName },
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
