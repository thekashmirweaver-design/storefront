"use client";

import Link from "next/link";
import { Instagram, Facebook, Youtube, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import { useCommerce } from "@/lib/commerce/client";
import { subscribeNewsletterAction } from "@/lib/commerce/actions";
import { formatBrandTagline } from "@/lib/commerce/mappers/metadata";

export function Footer() {
  const { brand } = useCommerce();
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await subscribeNewsletterAction(email);
    if (result.ok) {
      toast.success("You're on the list", { description: result.message });
      setEmail("");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <footer className="border-t border-border/60 bg-ink mt-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
        <div className="lg:col-span-1">
          <Link href="/" className="flex flex-col items-start gap-3">
            <OptimizedImage
              src={brand.logo.src}
              alt={brand.logo.alt ?? brand.name}
              width={brand.logo.width ?? 48}
              height={brand.logo.height ?? 48}
              className="h-14 w-14 object-contain"
            />
            <span className="font-display text-lg tracking-[0.3em] text-cream">{brand.name}</span>
          </Link>
          <p className="text-[0.6rem] tracking-[0.3em] text-gold/70 mt-2">
            {formatBrandTagline(brand.tagline)}
          </p>
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed max-w-xs">
            {brand.footerDescription}
          </p>
          <div className="flex gap-3 mt-6 text-muted-foreground">
            {brand.social.instagram && (
              <a href={brand.social.instagram} aria-label="Instagram" className="hover:text-gold">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {brand.social.facebook && (
              <a href={brand.social.facebook} aria-label="Facebook" className="hover:text-gold">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {brand.social.youtube && (
              <a href={brand.social.youtube} aria-label="YouTube" className="hover:text-gold">
                <Youtube className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {brand.footerMenus.map((col) => (
          <div key={col.title}>
            <h4 className="text-[0.7rem] tracking-[0.25em] uppercase text-gold font-sans font-medium mb-5">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-xs text-muted-foreground hover:text-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-[0.7rem] tracking-[0.25em] uppercase text-gold font-sans font-medium mb-5">
            {brand.newsletter.title}
          </h4>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {brand.newsletter.description}
          </p>
          <form className="flex border border-border" onSubmit={submit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={brand.newsletter.placeholder}
              className="bg-transparent flex-1 min-w-0 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="bg-gold text-primary-foreground px-3 hover:bg-gold-soft transition-colors"
              aria-label="Subscribe"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-6 flex flex-wrap justify-between gap-4 text-[0.65rem] tracking-wider text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gold">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
