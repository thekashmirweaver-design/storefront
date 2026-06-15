"use client";

import Link from "next/link";
import { Instagram, Facebook, Youtube, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { OptimizedImage } from "@/components/site/OptimizedImage";

const cols = [
  {
    title: "Shop",
    links: [
      { label: "All Pashminas", href: "/shop" },
      { label: "Signature Pashminas", href: "/collections/signature" },
      { label: "Lightweight Pashminas", href: "/collections/lightweight" },
      { label: "Bridal Collection", href: "/collections" },
      { label: "Limited Editions", href: "/collections" },
    ],
  },
  {
    title: "Collections",
    links: [
      { label: "New Arrivals", href: "/shop" },
      { label: "Best Sellers", href: "/shop" },
      { label: "Bridal Edit", href: "/collections" },
      { label: "Men's Pashminas", href: "/shop" },
      { label: "Accessories", href: "/shop" },
    ],
  },
  {
    title: "Our Story",
    links: [
      { label: "Our Heritage", href: "/our-story" },
      { label: "Sustainability", href: "/our-story" },
      { label: "Craftsmanship", href: "/craftsmanship" },
      { label: "The Kashmir Valley", href: "/our-story" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping & Delivery", href: "/faqs" },
      { label: "Returns & Exchanges", href: "/faqs" },
      { label: "Care Guide", href: "/craftsmanship" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("You're on the list", { description: "Welcome to the GULRIZA atelier." });
    setEmail("");
  };

  return (
    <footer className="border-t border-border/60 bg-ink mt-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
        <div className="lg:col-span-1">
          <Link href="/" className="flex flex-col items-start gap-2">
            <OptimizedImage
              src="/images/gulriza-logo.jpg"
              alt="GULRIZA"
              width={48}
              height={48}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <span className="font-display text-lg tracking-[0.3em] text-cream">GULRIZA</span>
          </Link>
          <p className="text-[0.6rem] tracking-[0.3em] text-gold/70 mt-2">
            TIMELESS · NATURAL · LUXURIOUS
          </p>
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed max-w-xs">
            Ethically crafted in Kashmir using the finest natural fibers. Made to be treasured for
            generations.
          </p>
          <div className="flex gap-3 mt-6 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="hover:text-gold">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-gold">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-gold">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        {cols.map((col) => (
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
            Stay Connected
          </h4>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Be the first to know about new arrivals and exclusive offers.
          </p>
          <form className="flex border border-border" onSubmit={submit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
          <p>© {new Date().getFullYear()} GULRIZA. All rights reserved.</p>
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
