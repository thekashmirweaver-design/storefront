import type { Metadata } from "next";

import { AccountClient } from "@/components/site/AccountClient";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in to manage your orders and saved pieces.",
  openGraph: {
    title: "Account — GULRIZA",
    description: "Sign in to manage your orders and saved pieces.",
  },
};

export default function AccountPage() {
  return <AccountClient />;
}
