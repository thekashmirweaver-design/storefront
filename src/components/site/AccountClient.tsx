"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { BrandedPageHeader } from "@/components/site/BrandedPageHeader";
import type { CommerceCustomerSession, CommerceOrder } from "@/lib/commerce";
import { brandText } from "@/lib/commerce";
import { useCommerce } from "@/lib/commerce/client";
import { getCustomerOrdersAction, getCustomerSessionAction } from "@/lib/commerce/actions";

type AccountClientProps = {
  accountEnabled: boolean;
};

function formatOrderDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

function formatStatus(value?: string) {
  if (!value) return "—";
  return value.replace(/_/g, " ").toLowerCase();
}

export function AccountClient({ accountEnabled }: AccountClientProps) {
  const { brand, cartMode } = useCommerce();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [session, setSession] = useState<CommerceCustomerSession | null>(null);
  const [orders, setOrders] = useState<CommerceOrder[]>([]);
  const [loading, setLoading] = useState(accountEnabled && cartMode === "shopify");

  const isShopifyAccount = cartMode === "shopify" && accountEnabled;

  useEffect(() => {
    if (!isShopifyAccount) return;

    const signedIn = searchParams.get("signed_in");
    const error = searchParams.get("error");

    if (signedIn) {
      toast.success("Signed in", { description: "Welcome back." });
    } else if (error) {
      const description =
        error === "invalid_client" || error === "access_denied"
          ? "Customer Account API scopes may need re-approval on the dev store. Redeploy the partner app, then open the app in Shopify Admin and approve updated permissions."
          : "Please try again or contact support if this continues.";
      toast.error("Sign in failed", { description });
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([getCustomerSessionAction(), getCustomerOrdersAction()])
      .then(([nextSession, nextOrders]) => {
        if (cancelled) return;
        setSession(nextSession);
        setOrders(nextOrders);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isShopifyAccount, searchParams]);

  if (isShopifyAccount && loading) {
    return (
      <section className="mx-auto max-w-3xl px-6 md:px-10 py-24 text-center">
        <p className="text-sm text-muted-foreground">Loading your account…</p>
      </section>
    );
  }

  if (isShopifyAccount && session?.authenticated) {
    return (
      <section className="mx-auto max-w-3xl px-6 md:px-10 py-24">
        <BrandedPageHeader
          brand={brand}
          eyebrow="Account"
          title={session.displayName ?? "Your account"}
          description={session.email ?? undefined}
          className="mb-12"
        />

        <div className="flex justify-end mb-8">
          <a
            href="/api/auth/customer/logout"
            className="border border-border px-5 py-2.5 text-[0.65rem] tracking-[0.25em] uppercase text-cream hover:border-gold hover:text-gold transition-colors"
          >
            Sign out
          </a>
        </div>

        <div className="space-y-8">
          <div className="border border-border/60 p-6">
            <h2 className="font-display text-2xl text-cream mb-4">Profile</h2>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="text-cream text-right">
                  {[session.firstName, session.lastName].filter(Boolean).join(" ") || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="text-cream text-right">{session.email ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-cream">Order history</h2>
              <Link href="/wishlist" className="text-xs text-gold hover:underline">
                View wishlist
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground border border-border/60 p-6">
                No orders yet. When you place an order, it will appear here.
              </p>
            ) : (
              <ul className="space-y-4">
                {orders.map((order) => (
                  <li key={order.id} className="border border-border/60 p-6">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-display text-lg text-cream">{order.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatOrderDate(order.processedAt)}
                        </p>
                      </div>
                      <p className="text-sm text-gold">
                        {formatMoney(order.totalPrice.amount, order.totalPrice.currencyCode)}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-[0.65rem] tracking-[0.15em] uppercase text-muted-foreground">
                      <span>Payment: {formatStatus(order.financialStatus)}</span>
                      <span>Fulfillment: {formatStatus(order.fulfillmentStatus)}</span>
                    </div>
                    {order.lineItems.length > 0 && (
                      <ul className="mt-4 space-y-2 text-sm text-cream/90">
                        {order.lineItems.map((line, index) => (
                          <li key={`${order.id}-${index}`}>
                            {line.quantity} × {line.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (isShopifyAccount) {
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const originMismatch =
      typeof window !== "undefined" &&
      configuredSiteUrl &&
      window.location.origin !== new URL(configuredSiteUrl).origin;

    return (
      <section className="mx-auto max-w-md px-6 md:px-10 py-24">
        <BrandedPageHeader
          brand={brand}
          eyebrow="Account"
          title="Sign in to your account"
          description="Sign in with your Shopify customer account to view orders and sync your saved pieces."
          className="mb-10"
        />

        {originMismatch && (
          <p className="mb-6 text-xs text-amber-200/90 border border-amber-500/40 bg-amber-500/10 px-4 py-3 leading-relaxed">
            Customer sign-in must use your configured site URL ({configuredSiteUrl}), not{" "}
            {window.location.origin}. Shopify redirects back over HTTPS — open the tunnel URL while
            `pnpm dev:shopify` runs locally.
          </p>
        )}

        <a
          href="/api/auth/customer/login"
          className="block w-full bg-gold text-primary-foreground py-3.5 text-center text-[0.7rem] tracking-[0.3em] uppercase hover:bg-gold-soft transition-colors"
        >
          Sign in with Shopify
        </a>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Your wishlist syncs to your account after sign-in.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 md:px-10 py-24">
      <BrandedPageHeader
        brand={brand}
        eyebrow="Account"
        title={mode === "signin" ? "Sign in to your account" : "Create account"}
        description={
          mode === "signin"
            ? "Sign in to manage orders and saved pieces."
            : brandText(brand.copy.pages.account.registerSubtitle, brand)
        }
        className="mb-10"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success(mode === "signin" ? "Signed in (demo)" : "Account created (demo)", {
            description: "This demo store doesn't store credentials.",
          });
        }}
        className="space-y-5"
      >
        {mode === "register" && (
          <div>
            <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-2 block">
              Full Name
            </label>
            <input
              required
              type="text"
              className="w-full bg-transparent border border-border px-3 py-3 text-sm text-cream focus:outline-none focus:border-gold"
            />
          </div>
        )}
        <div>
          <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-2 block">
            Email
          </label>
          <input
            required
            type="email"
            className="w-full bg-transparent border border-border px-3 py-3 text-sm text-cream focus:outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream mb-2 block">
            Password
          </label>
          <input
            required
            type="password"
            minLength={6}
            className="w-full bg-transparent border border-border px-3 py-3 text-sm text-cream focus:outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gold text-primary-foreground py-3.5 text-[0.7rem] tracking-[0.3em] uppercase hover:bg-gold-soft transition-colors"
        >
          {mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-8">
        {mode === "signin"
          ? brandText(brand.copy.pages.account.newToBrand, brand)
          : brand.copy.pages.account.hasAccount}{" "}
        <button
          onClick={() => setMode(mode === "signin" ? "register" : "signin")}
          className="text-gold hover:underline"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </section>
  );
}
