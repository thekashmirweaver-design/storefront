"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Eyebrow } from "@/components/site/Eyebrow";
import { brandText } from "@/lib/commerce";
import { useCommerce } from "@/lib/commerce/client";

export function AccountClient() {
  const { brand } = useCommerce();
  const [mode, setMode] = useState<"signin" | "register">("signin");

  return (
    <section className="mx-auto max-w-md px-6 md:px-10 py-24">
      <div className="text-center mb-10">
        <Eyebrow>Account</Eyebrow>
        <h1 className="mt-4 font-display text-4xl text-cream">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to manage orders and saved pieces."
            : brandText(brand.copy.pages.account.registerSubtitle, brand)}
        </p>
      </div>

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
