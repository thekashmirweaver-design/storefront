import type { BrandConfig } from "../types";

const TOKEN_PATTERN = /\{(name|tagline|productNoun|origin)\}/g;

/** Interpolate brand tokens in copy templates. */
export function brandText(template: string, brand: BrandConfig): string {
  return template.replace(TOKEN_PATTERN, (_, token: string) => {
    switch (token) {
      case "name":
        return brand.name;
      case "tagline":
        return brand.tagline;
      case "productNoun":
        return brand.copy.productNoun;
      case "origin":
        return brand.copy.origin;
      default:
        return `{${token}}`;
    }
  });
}

/** Namespace localStorage keys per brand so rebrands don't collide. */
export function brandStorageKey(brand: BrandConfig, key: "cart" | "wishlist"): string {
  return `${brand.id}:${key}`;
}
