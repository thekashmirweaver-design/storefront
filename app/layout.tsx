import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import dynamic from "next/dynamic";

import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AnalyticsScripts } from "@/components/site/AnalyticsScripts";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { buildMetadataFromBrand } from "@/lib/commerce";
import { commerce } from "@/lib/commerce/server";
import { getCommerceProviderName, isShopifyProvider } from "@/lib/commerce/config";
import { fetchShopifyLocalization } from "@/lib/commerce/shopify/localization";
import { htmlLangFromMarket } from "@/lib/commerce/shopify/market-context";

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
  const cartMode = getCommerceProviderName();
  const localization = isShopifyProvider() ? await fetchShopifyLocalization() : null;
  const market = localization?.market ?? null;
  const lang = market
    ? htmlLangFromMarket({ country: market.country, language: market.language })
    : "en";

  return (
    <html lang={lang} className={`${display.variable} ${sans.variable}`}>
      <body>
        <AnalyticsScripts />
        <Providers brand={brand} cartMode={cartMode} market={market} localization={localization}>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <SearchDialog />
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
