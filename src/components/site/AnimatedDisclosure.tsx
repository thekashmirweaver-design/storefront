"use client";

import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type AnimatedDisclosureProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
};

export function AnimatedDisclosure({
  title,
  children,
  defaultOpen = false,
  className,
  triggerClassName,
  contentClassName,
  iconClassName,
}: AnimatedDisclosureProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className={cn("group/disclosure", className)}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between cursor-pointer text-left transition-colors",
          triggerClassName,
        )}
      >
        {title}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]/disclosure:rotate-180",
            iconClassName,
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={contentClassName}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
