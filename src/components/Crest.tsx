"use client";

import { useState } from "react";

type CrestProps = {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
};

export function Crest({ src, alt, size = 24, className = "" }: CrestProps) {
  const [failed, setFailed] = useState(false);
  const dim = { width: size, height: size };

  if (!src || failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--panel)] border border-[var(--line)] text-[10px] font-bold text-[var(--muted)] ${className}`}
        style={dim}
        aria-hidden
      >
        {alt.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 object-contain ${className}`}
      style={dim}
    />
  );
}
