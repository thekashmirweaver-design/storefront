import "server-only";

import { cache } from "react";

import type { CommerceCountryOption, CommerceMarketContext } from "../types";
import { getShopifyClient } from "./client";
import type { ShopifyMarketContext } from "./market-context";
import { resolveShopifyMarketContext } from "./market-context.server";

const LOCALIZATION_QUERY = `
  query Localization {
    localization {
      country {
        isoCode
        name
        currency {
          isoCode
          name
        }
      }
      language {
        isoCode
        endonymName
      }
      availableCountries {
        isoCode
        name
        currency {
          isoCode
          name
        }
      }
      availableLanguages {
        isoCode
        endonymName
      }
    }
  }
`;

type ShopifyLocalizationNode = {
  country?: {
    isoCode: string;
    name: string;
    currency?: { isoCode: string; name?: string | null } | null;
  } | null;
  language?: { isoCode: string; endonymName?: string | null } | null;
  availableCountries?: {
    isoCode: string;
    name: string;
    currency?: { isoCode: string; name?: string | null } | null;
  }[];
  availableLanguages?: { isoCode: string; endonymName?: string | null }[];
};

export type ShopifyLocalization = {
  market: CommerceMarketContext;
  countries: CommerceCountryOption[];
  languages: { isoCode: string; endonymName: string }[];
};

function mapCountry(node: {
  isoCode: string;
  name: string;
  currency?: { isoCode: string; name?: string | null } | null;
}): CommerceCountryOption {
  return {
    isoCode: node.isoCode,
    name: node.name,
    currencyCode: node.currency?.isoCode ?? "USD",
    currencyName: node.currency?.name ?? undefined,
  };
}

function mapLocalization(
  node: ShopifyLocalizationNode | null | undefined,
  fallbackMarket: ShopifyMarketContext,
): ShopifyLocalization {
  const countries = (node?.availableCountries ?? [])
    .map(mapCountry)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Cookie/env context drives the active market; availableCountries supplies currency.
  const selectedCountry = countries.find((c) => c.isoCode === fallbackMarket.country);

  const market: CommerceMarketContext = {
    country: fallbackMarket.country,
    language: fallbackMarket.language,
    currencyCode: selectedCountry?.currencyCode ?? node?.country?.currency?.isoCode ?? "USD",
    locale: `${fallbackMarket.language.toLowerCase()}-${fallbackMarket.country.toLowerCase()}`,
  };

  const languages = (node?.availableLanguages ?? []).map((l) => ({
    isoCode: l.isoCode,
    endonymName: l.endonymName ?? l.isoCode,
  }));

  return { market, countries, languages };
}

export const fetchShopifyLocalization = cache(async (): Promise<ShopifyLocalization> => {
  const fallbackMarket = await resolveShopifyMarketContext();
  const client = await getShopifyClient();
  const { data, errors } = await client.request<{ localization?: ShopifyLocalizationNode }>(
    LOCALIZATION_QUERY,
  );

  if (errors) {
    throw new Error(`Shopify localization: ${JSON.stringify(errors)}`);
  }

  return mapLocalization(data?.localization, fallbackMarket);
});
