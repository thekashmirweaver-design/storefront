import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Eyebrow } from "@/components/site/Eyebrow";
import { getArticleCover } from "@/lib/collections";
import { articles, getArticleBySlug } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  const cover = getArticleCover(slug);

  return {
    title: `${article.title} — Journal`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: cover.src, width: cover.width, height: cover.height }],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const cover = getArticleCover(article.slug);
  const idx = articles.findIndex((a) => a.slug === article.slug);
  const prev = articles[idx - 1];
  const next = articles[idx + 1];

  return (
    <article className="mx-auto max-w-[1200px] px-6 md:px-10 py-12 grid lg:grid-cols-[1fr_240px] gap-14">
      <div>
        <nav className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-6">
          <Link href="/" className="hover:text-gold">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/journal" className="hover:text-gold">
            Journal
          </Link>{" "}
          / <span className="text-gold">{article.title}</span>
        </nav>

        <Eyebrow>
          {article.date} · {article.category}
        </Eyebrow>
        <h1 className="mt-4 font-display text-5xl text-cream leading-tight">{article.title}</h1>

        <div className="relative mt-10 aspect-[16/9] overflow-hidden">
          <OptimizedImage
            src={cover}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
          />
        </div>

        <div className="mt-10 space-y-6 text-base text-foreground/85 leading-relaxed">
          <p>
            Pashmina is more than just a fabric — it is a legacy woven through centuries of rich
            heritage, artistry, and nature&apos;s finest gifts.
          </p>
          <p>
            Originating from the pristine highlands of Kashmir, pashmina is derived from the soft
            under-fleece of the Changthangi goat. The extreme climate, the pure air, and the
            traditional way of life in this region contribute to the unmatched quality of this
            fiber.
          </p>
          <p>
            For generations, skilled artisans have transformed this exquisite fiber into timeless
            pieces — each one a labor of love that embodies elegance, warmth, and sophistication.
          </p>
          <p>
            Today, as the world embraces slow fashion and conscious luxury, pashmina stands as a
            symbol of timeless beauty and mindful creation — to be treasured, and passed down
            through generations.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex items-center gap-4">
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold">Share</span>
          {[Facebook, Twitter, Instagram, Mail].map((Icon, i) => (
            <a key={i} href="#" className="text-muted-foreground hover:text-gold">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-6 text-sm">
          {prev ? (
            <Link href={`/journal/${prev.slug}`} className="group">
              <p className="text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground">
                ← Previous
              </p>
              <p className="mt-2 font-display text-lg text-cream group-hover:text-gold">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link href={`/journal/${next.slug}`} className="group text-right">
              <p className="text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground">
                Next →
              </p>
              <p className="mt-2 font-display text-lg text-cream group-hover:text-gold">
                {next.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      <aside className="space-y-10">
        <div>
          <h3 className="text-[0.7rem] tracking-[0.25em] uppercase text-gold mb-4">Categories</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {["Heritage", "Craftsmanship", "Style", "Sustainability", "Travel"].map((c) => (
              <li key={c}>
                <a href="#" className="hover:text-gold">
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[0.7rem] tracking-[0.25em] uppercase text-gold mb-4">Recent Posts</h3>
          <ul className="space-y-4">
            {articles.slice(0, 4).map((a) => (
              <li key={a.slug}>
                <Link href={`/journal/${a.slug}`} className="flex gap-3 group">
                  <div className="relative h-12 w-12 shrink-0">
                    <OptimizedImage
                      src={getArticleCover(a.slug)}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-cream group-hover:text-gold leading-tight">
                      {a.title}
                    </p>
                    <p className="text-[0.6rem] tracking-wider uppercase text-muted-foreground mt-1">
                      {a.date}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </article>
  );
}
