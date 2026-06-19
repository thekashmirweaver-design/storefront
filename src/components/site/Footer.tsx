"use client";

import Link from "next/link";
import { Instagram, Facebook, Youtube, ArrowRight } from "lucide-react";
import { useState, type ComponentType } from "react";
import { toast } from "sonner";

import { BrandLogo } from "@/components/site/BrandLogo";
import { BrandName } from "@/components/site/BrandName";
import { useCommerce } from "@/lib/commerce/client";
import { subscribeNewsletterAction } from "@/lib/commerce/actions";
import { formatBrandTagline } from "@/lib/commerce/mappers/metadata";
import { cn } from "@/lib/utils";

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.403.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

type SocialIcon = ComponentType<{ className?: string }>;

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

  const socialLinks: { href?: string; label: string; Icon: SocialIcon }[] = [
    { href: brand.social.facebook, label: "Facebook", Icon: Facebook },
    { href: brand.social.youtube, label: "YouTube", Icon: Youtube },
    { href: brand.social.instagram, label: "Instagram", Icon: Instagram },
    { href: brand.social.pinterest, label: "Pinterest", Icon: PinterestIcon },
  ];

  return (
    <footer className={cn("bg-ink border-t border-border/60 mt-24")}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
        <div className="lg:col-span-1">
          <Link href="/" className="flex flex-col items-start gap-3">
            <BrandLogo logo={brand.logo} size="lg" />
            <BrandName name={brand.name} size="lg" />
          </Link>
          <p className="text-[0.6rem] tracking-[0.25em] text-gold/70 mt-2">
            {formatBrandTagline(brand.tagline)}
          </p>
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed max-w-xs">
            {brand.footerDescription}
          </p>
          <div className="flex gap-3 mt-6 text-muted-foreground">
            {socialLinks
              .filter((s): s is typeof s & { href: string } => Boolean(s.href))
              .map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
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
            <a href={brand.legal.privacyPolicyUrl} className="hover:text-gold">
              Privacy Policy
            </a>
            <a href={brand.legal.termsUrl} className="hover:text-gold">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
