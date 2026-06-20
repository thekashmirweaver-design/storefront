import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import dynamic from "next/dynamic";

import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { commerce, buildMetadataFromBrand } from "@/lib/commerce";
import { getCommerceProviderName } from "@/lib/commerce/config";

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

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildMetadataFromBrand(brand);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await commerce.getBrand();
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Providers brand={brand} cartMode={getCommerceProviderName()}>
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
