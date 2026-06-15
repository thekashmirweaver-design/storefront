"use client";

import { toast } from "sonner";

import { Eyebrow } from "@/components/site/Eyebrow";
import type { BrandConfig } from "@/lib/commerce";
import { submitContactAction } from "@/lib/commerce/actions";

type ContactInfo = BrandConfig["contact"];

export function ContactClient({ contact }: { contact: ContactInfo }) {
  return (
    <section className="mx-auto max-w-[1100px] px-6 md:px-10 py-24 grid lg:grid-cols-2 gap-14">
      <div>
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-4 font-display text-5xl text-cream">We&apos;re here to help.</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
          Whether you have a question about a piece, an order, or simply wish to know more about our
          craft, our concierge team is at your service.
        </p>
        <div className="mt-10 space-y-6 text-sm">
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-gold mb-1">Atelier</p>
            <p className="text-foreground/85 whitespace-pre-line">{contact.address}</p>
          </div>
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-gold mb-1">Concierge</p>
            <p className="text-foreground/85">
              {contact.email}
              <br />
              {contact.phone}
            </p>
          </div>
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-gold mb-1">Hours</p>
            <p className="text-foreground/85">{contact.hours}</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = new FormData(form);
          const result = await submitContactAction({
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            subject: String(data.get("subject") ?? ""),
            message: String(data.get("message") ?? ""),
          });
          if (result.ok) {
            toast.success(result.message);
            form.reset();
          } else {
            toast.error(result.message);
          }
        }}
        className="space-y-5"
      >
        <div>
          <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream">Name</label>
          <input
            name="name"
            required
            className="mt-2 w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream">Email</label>
          <input
            name="email"
            required
            type="email"
            className="mt-2 w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream">Subject</label>
          <input
            name="subject"
            className="mt-2 w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream">Message</label>
          <textarea
            name="message"
            required
            rows={6}
            className="mt-2 w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-gold outline-none resize-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gold text-primary-foreground py-3.5 text-[0.7rem] tracking-[0.3em] uppercase hover:bg-gold-soft transition-colors"
        >
          Send Message
        </button>
      </form>
    </section>
  );
}
