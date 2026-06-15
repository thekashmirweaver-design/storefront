import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Eyebrow } from "@/components/site/Eyebrow";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — GULRIZA" },
      { name: "description", content: "Reach our atelier in Kashmir or our concierge team." },
      { property: "og:title", content: "Contact — GULRIZA" },
      { property: "og:description", content: "Reach our atelier or concierge." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <section className="mx-auto max-w-[1100px] px-6 md:px-10 py-24 grid lg:grid-cols-2 gap-14">
      <div>
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-4 font-display text-5xl text-cream">We're here to help.</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
          Whether you have a question about a piece, an order, or simply wish to know more about our craft, our concierge team is at your service.
        </p>
        <div className="mt-10 space-y-6 text-sm">
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-gold mb-1">Atelier</p>
            <p className="text-foreground/85">Dal Lake Road, Srinagar<br />Kashmir, India 190001</p>
          </div>
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-gold mb-1">Concierge</p>
            <p className="text-foreground/85">care@gulriza.com<br />+91 194 000 0000</p>
          </div>
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-gold mb-1">Hours</p>
            <p className="text-foreground/85">Monday – Saturday · 10:00 – 19:00 IST</p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); toast.success("Message sent. We'll be in touch soon."); }}
        className="space-y-5">
        <div>
          <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream">Name</label>
          <input required className="mt-2 w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-gold outline-none" />
        </div>
        <div>
          <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream">Email</label>
          <input required type="email" className="mt-2 w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-gold outline-none" />
        </div>
        <div>
          <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream">Subject</label>
          <input className="mt-2 w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-gold outline-none" />
        </div>
        <div>
          <label className="text-[0.65rem] tracking-[0.25em] uppercase text-cream">Message</label>
          <textarea required rows={6} className="mt-2 w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-gold outline-none resize-none" />
        </div>
        <button type="submit" className="w-full bg-gold text-primary-foreground py-3.5 text-[0.7rem] tracking-[0.3em] uppercase hover:bg-gold-soft transition-colors">
          Send Message
        </button>
      </form>
    </section>
  );
}
