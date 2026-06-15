import type { StaticImageData } from "next/image";

import type { CommerceImage } from "../types";

export function staticImageToCommerceImage(image: StaticImageData, alt?: string): CommerceImage {
  return {
    src: image.src,
    alt,
    width: image.width,
    height: image.height,
  };
}
