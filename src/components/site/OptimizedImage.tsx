import Image, { type ImageProps } from "next/image";

export function OptimizedImage(props: ImageProps) {
  return <Image {...props} />;
}
