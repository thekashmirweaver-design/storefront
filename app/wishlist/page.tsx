import type { Metadata } from "next";

import { WishlistClient } from "@/components/site/WishlistClient";

export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "Pieces you've saved to revisit.",
  openGraph: {
    title: "Your Wishlist — GULRIZA",
    description: "Pieces you've saved to revisit.",
  },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
