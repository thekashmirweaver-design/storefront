import type { Metadata } from "next";

import { ContactClient } from "@/components/site/ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach our atelier in Kashmir or our concierge team.",
  openGraph: {
    title: "Contact — GULRIZA",
    description: "Reach our atelier or concierge.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
