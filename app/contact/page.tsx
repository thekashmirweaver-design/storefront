import type { Metadata } from "next";

import { ContactClient } from "@/components/site/ContactClient";
import { commerce } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach our atelier in Kashmir or our concierge team.",
  openGraph: {
    title: "Contact — GULRIZA",
    description: "Reach our atelier or concierge.",
  },
};

export default async function ContactPage() {
  const brand = await commerce.getBrand();
  return <ContactClient contact={brand.contact} />;
}
