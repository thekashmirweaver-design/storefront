import type { Metadata } from "next";

import { ContactClient } from "@/components/site/ContactClient";
import { commerce, buildPageMetadata } from "@/lib/commerce";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildPageMetadata(brand, {
    title: "Contact",
    description: "Reach our atelier in Kashmir or our concierge team.",
    openGraph: {
      description: "Reach our atelier or concierge.",
    },
  });
}

export default async function ContactPage() {
  const brand = await commerce.getBrand();
  return <ContactClient contact={brand.contact} />;
}
