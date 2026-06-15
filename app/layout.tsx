import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import dynamic from "next/dynamic";

import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { commerce, buildMetadataFromBrand } from "@/lib/commerce";

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

const brand = await commerce.getBrand();

export const metadata: Metadata = buildMetadataFromBrand(brand);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Providers brand={brand}>
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
