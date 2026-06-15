import type { Metadata } from "next";

import { WishlistClient } from "@/components/site/WishlistClient";
import { commerce, buildPageMetadata } from "@/lib/commerce";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await commerce.getBrand();
  return buildPageMetadata(brand, {
    title: "Your Wishlist",
    description: "Pieces you've saved to revisit.",
  });
}

export default function WishlistPage() {
  return <WishlistClient />;
}
