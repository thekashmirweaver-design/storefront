import Image, { type ImageProps } from "next/image";

export function OptimizedImage({ fill, width, height, ...rest }: ImageProps) {
  if (fill) {
    return <Image {...rest} fill />;
  }
  return <Image {...rest} width={width} height={height} />;
}
