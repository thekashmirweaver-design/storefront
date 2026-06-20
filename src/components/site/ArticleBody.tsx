import { cn } from "@/lib/utils";

/**
 * Tailwind selectors for Shopify/CMS HTML. Mirrors ProductClient/CollectionStory intent
 * (hierarchy, lists, blockquotes, gold links) without requiring @tailwindcss/typography.
 */
export const richTextProseClassName =
  "max-w-none text-base text-foreground/85 [&_p]:mb-6 [&_p:last-child]:mb-0 [&_p]:leading-relaxed [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:leading-tight [&_h2]:text-cream [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:leading-snug [&_h3]:text-cream [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:font-display [&_h4]:text-xl [&_h4]:text-cream [&_ul]:my-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_li]:leading-relaxed [&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-gold/40 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:text-gold [&_a]:no-underline hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-cream [&_em]:italic";

export function ArticleBody({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(richTextProseClassName, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
