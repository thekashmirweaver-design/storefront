import { brandText } from "./brand/text";
import type { BrandConfig } from "./types";
import type {
  CommerceCraftsmanshipContent,
  CommerceHomepageEditorial,
  CommerceOurStoryContent,
} from "./types";

export function applyBrandToHomepageEditorial(
  content: CommerceHomepageEditorial,
  brand: BrandConfig,
): CommerceHomepageEditorial {
  return {
    ...content,
    legacy: {
      ...content.legacy,
      body: brandText(content.legacy.body, brand),
    },
  };
}

export function applyBrandToOurStoryContent(
  content: CommerceOurStoryContent,
  brand: BrandConfig,
): CommerceOurStoryContent {
  return {
    ...content,
    quote: brandText(content.quote, brand),
    heritage: {
      ...content.heritage,
      body: brandText(content.heritage.body, brand),
    },
  };
}

export function applyBrandToCraftsmanshipContent(
  content: CommerceCraftsmanshipContent,
  brand: BrandConfig,
): CommerceCraftsmanshipContent {
  return {
    ...content,
    intro: brandText(content.intro, brand),
  };
}
