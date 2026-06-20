import { collectionBodyHtml, collectionBodyText } from "@/lib/commerce/collection-copy";
import type { CommerceCollection } from "@/lib/commerce";
import { cn } from "@/lib/utils";

const storyProseClassName =
  "prose prose-invert prose-sm max-w-none [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-4";

export function CollectionStory({
  collection,
  className,
}: {
  collection: CommerceCollection;
  className?: string;
}) {
  const html = collectionBodyHtml(collection);
  const text = collectionBodyText(collection);

  if (html) {
    return (
      <div
        className={cn(storyProseClassName, className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (text) {
    return <p className={className}>{text}</p>;
  }

  return null;
}
