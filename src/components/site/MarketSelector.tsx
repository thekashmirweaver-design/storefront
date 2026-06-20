"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { CommerceCountryOption, CommerceMarketContext } from "@/lib/commerce";
import { setMarketAction } from "@/lib/commerce/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FEATURED_COUNTRY_CODES = ["US", "IN", "GB", "CA", "AU", "AE", "DE", "FR"];

type MarketSelectorProps = {
  market: CommerceMarketContext;
  countries: CommerceCountryOption[];
};

export function MarketSelector({ market, countries }: MarketSelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const selected = useMemo(
    () => countries.find((c) => c.isoCode === market.country),
    [countries, market.country],
  );

  const { featured, rest } = useMemo(() => {
    const featuredSet = new Set(FEATURED_COUNTRY_CODES);
    const featuredList: CommerceCountryOption[] = [];
    const restList: CommerceCountryOption[] = [];
    for (const country of countries) {
      if (featuredSet.has(country.isoCode)) featuredList.push(country);
      else restList.push(country);
    }
    featuredList.sort(
      (a, b) =>
        FEATURED_COUNTRY_CODES.indexOf(a.isoCode) - FEATURED_COUNTRY_CODES.indexOf(b.isoCode),
    );
    return { featured: featuredList, rest: restList };
  }, [countries]);

  const label = selected
    ? `${selected.isoCode} · ${selected.currencyCode}`
    : `${market.country} · ${market.currencyCode}`;

  const selectCountry = (isoCode: string) => {
    if (isoCode === market.country) {
      setOpen(false);
      return;
    }

    setOpen(false);
    startTransition(async () => {
      try {
        await setMarketAction(isoCode);
        router.refresh();
      } catch (error) {
        toast.error("Could not update shipping country", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
      }
    });
  };

  const handleCommandSelect = (value: string) => {
    const normalized = value.trim().toUpperCase();
    const match =
      countries.find((c) => c.isoCode.toUpperCase() === normalized) ??
      countries.find((c) => `${c.name} ${c.isoCode}`.toLowerCase() === value.toLowerCase());
    if (match) selectCountry(match.isoCode);
  };

  if (!countries.length) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          className="h-8 px-2 text-[0.65rem] tracking-wider uppercase text-foreground/80 hover:text-gold hover:bg-transparent"
          aria-label={`Shipping country: ${label}`}
        >
          <Globe className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{market.country}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Search country…" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            {featured.length > 0 && (
              <CommandGroup heading="Popular">
                {featured.map((country) => (
                  <CommandItem
                    key={country.isoCode}
                    value={country.isoCode}
                    keywords={[country.name, country.currencyCode]}
                    onSelect={handleCommandSelect}
                    className={cn(market.country === country.isoCode && "text-gold")}
                  >
                    <span className="flex-1">{country.name}</span>
                    <span className="text-muted-foreground text-xs">{country.currencyCode}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="All countries">
              {rest.map((country) => (
                <CommandItem
                  key={country.isoCode}
                  value={country.isoCode}
                  keywords={[country.name, country.currencyCode]}
                  onSelect={handleCommandSelect}
                  className={cn(market.country === country.isoCode && "text-gold")}
                >
                  <span className="flex-1">{country.name}</span>
                  <span className="text-muted-foreground text-xs">{country.currencyCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
