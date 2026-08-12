"use client";

import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Foto prodotto Amazon CDN (m.media-amazon.com).
 * unoptimized: Amazon non espone sempre size hints stabili.
 */
export function AmazonProductImage({
  src,
  alt,
  className = "object-contain bg-white p-2",
  sizes = "200px",
  priority = false,
}: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      unoptimized
      priority={priority}
    />
  );
}
