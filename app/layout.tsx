import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import dynamic from "next/dynamic";

import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
});

const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

const CartDrawer = dynamic(() => import("@/components/site/CartDrawer").then((m) => m.CartDrawer));
const SearchDialog = dynamic(() =>
  import("@/components/site/SearchDialog").then((m) => m.SearchDialog),
);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gulriza.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GULRIZA — Timeless. Natural. Luxurious.",
    template: "%s — GULRIZA",
  },
  description:
    "GULRIZA crafts the world's finest pashmina shawls, handwoven in Kashmir from 100% natural fibers.",
  authors: [{ name: "GULRIZA" }],
  openGraph: {
    title: "GULRIZA — Handwoven Pashmina from Kashmir",
    description: "Exquisite Kashmiri pashmina shawls, woven by heritage.",
    type: "website",
    siteName: "GULRIZA",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <SearchDialog />
          </div>
        </Providers>
      </body>
    </html>
  );
}
