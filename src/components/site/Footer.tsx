import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logoAsset from "@/assets/gulriza-logo.png.asset.json";

const cols = [
  {
    title: "Shop",
    links: [
      { label: "All Pashminas", to: "/shop" },
      { label: "Signature Pashminas", to: "/collections/signature" },
      { label: "Lightweight Pashminas", to: "/collections/lightweight" },
      { label: "Bridal Collection", to: "/collections" },
      { label: "Limited Editions", to: "/collections" },
    ],
  },
  {
    title: "Collections",
    links: [
      { label: "New Arrivals", to: "/shop" },
      { label: "Best Sellers", to: "/shop" },
      { label: "Bridal Edit", to: "/collections" },
      { label: "Men's Pashminas", to: "/shop" },
      { label: "Accessories", to: "/shop" },
    ],
  },
  {
    title: "Our Story",
    links: [
      { label: "Our Heritage", to: "/our-story" },
      { label: "Sustainability", to: "/our-story" },
      { label: "Craftsmanship", to: "/craftsmanship" },
      { label: "The Kashmir Valley", to: "/our-story" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQs", to: "/faqs" },
      { label: "Shipping & Delivery", to: "/faqs" },
      { label: "Returns & Exchanges", to: "/faqs" },
      { label: "Care Guide", to: "/craftsmanship" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-ink mt-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
        <div className="lg:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoAsset.url} alt="GULRIZA" className="h-8 w-8" />
            <span className="font-display text-lg tracking-[0.3em] text-cream">GULRIZA</span>
          </Link>
          <p className="text-[0.6rem] tracking-[0.3em] text-gold/70 mt-2">TIMELESS · NATURAL · LUXURIOUS</p>
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed max-w-xs">
            Ethically crafted in Kashmir using the finest natural fibers. Made to be treasured for generations.
          </p>
          <div className="flex gap-3 mt-6 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-gold"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-gold"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-[0.7rem] tracking-[0.25em] uppercase text-gold font-sans font-medium mb-5">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-xs text-muted-foreground hover:text-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-[0.7rem] tracking-[0.25em] uppercase text-gold font-sans font-medium mb-5">Stay Connected</h4>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Be the first to know about new arrivals and exclusive offers.
          </p>
          <form className="flex border border-border" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent flex-1 min-w-0 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button type="submit" className="bg-gold text-primary-foreground px-3 hover:bg-gold-soft transition-colors" aria-label="Subscribe">
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-6 flex flex-wrap justify-between gap-4 text-[0.65rem] tracking-wider text-muted-foreground">
          <p>© {new Date().getFullYear()} GULRIZA. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold">Privacy Policy</a>
            <a href="#" className="hover:text-gold">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
