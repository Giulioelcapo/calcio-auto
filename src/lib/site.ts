import {
  offerBySlot,
  offerHref,
  type AffiliateOffer,
} from "@/lib/affiliates";

export function siteUrl(): string {
  const explicit = process.env["NEXT_PUBLIC_SITE_URL"]?.replace(/\/$/, "").trim();
  if (explicit) return explicit;

  const vercelHost = (
    process.env["VERCEL_PROJECT_PRODUCTION_URL"] ||
    process.env["VERCEL_URL"] ||
    ""
  )
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .trim();
  if (vercelHost) return `https://${vercelHost}`;

  return "http://localhost:3000";
}

export function adsenseClient(): string | undefined {
  const id = process.env["NEXT_PUBLIC_ADSENSE_CLIENT_ID"]?.trim();
  if (id) return id;
  // Publisher per verifica sito (account Gmail attivo)
  return "ca-pub-4342895251465402";
}

export function adsenseSlot(
  kind: "top" | "side" | "in-content",
): string | undefined {
  const map = {
    top: process.env["NEXT_PUBLIC_ADSENSE_SLOT_TOP"],
    side: process.env["NEXT_PUBLIC_ADSENSE_SLOT_SIDE"],
    "in-content": process.env["NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT"],
  } as const;
  const value = map[kind]?.trim();
  return value || undefined;
}

export type PartnerSlotKind = AffiliateOffer["slot"];

export type PartnerSlotConfig = {
  href: string;
  title: string;
  subtitle: string;
  cta: string;
  external: boolean;
  imageSrc?: string;
  imageAlt?: string;
};

/** Banner partner / affiliate (funziona senza AdSense). */
export function partnerSlot(kind: PartnerSlotKind): PartnerSlotConfig {
  const map = {
    top: {
      href: process.env["NEXT_PUBLIC_PARTNER_TOP_URL"],
      title: process.env["NEXT_PUBLIC_PARTNER_TOP_TITLE"],
    },
    side: {
      href: process.env["NEXT_PUBLIC_PARTNER_SIDE_URL"],
      title: process.env["NEXT_PUBLIC_PARTNER_SIDE_TITLE"],
    },
    "in-content": {
      href: process.env["NEXT_PUBLIC_PARTNER_INCONTENT_URL"],
      title: process.env["NEXT_PUBLIC_PARTNER_INCONTENT_TITLE"],
    },
  } as const;

  const href = map[kind].href?.trim();
  const title = map[kind].title?.trim();
  const offer = offerBySlot(kind);

  if (href) {
    return {
      href,
      title: title || "Partner Side Pitch Hub",
      subtitle: "Offerta consigliata · apre in una nuova scheda",
      cta: "Scopri",
      external: /^https?:\/\//i.test(href),
      imageSrc: offer.imageSrc,
      imageAlt: offer.imageAlt,
    };
  }

  // Default: offerte Amazon (commissioni se NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG è set)
  return {
    href: offerHref(offer),
    title: offer.title,
    subtitle: offer.subtitle,
    cta: offer.cta,
    external: true,
    imageSrc: offer.imageSrc,
    imageAlt: offer.imageAlt,
  };
}

export function googleSiteVerification(): string | undefined {
  const code = process.env["NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"]?.trim();
  return code || undefined;
}

/** Google Analytics 4 Measurement ID (es. G-XXXXXXXXXX). */
export function gaMeasurementId(): string | undefined {
  const id = process.env["NEXT_PUBLIC_GA_MEASUREMENT_ID"]?.trim();
  if (!id) return undefined;
  if (!/^G-[A-Z0-9]+$/i.test(id)) return undefined;
  return id.toUpperCase();
}

export const SITE_NAME = "Side Pitch Hub";
export const SITE_TAGLINE = "Classifiche, news e dati calcio automatici";

export function contactEmail(): string {
  return (
    process.env["NEXT_PUBLIC_CONTACT_EMAIL"]?.trim() ||
    "info@sidepitchhub.com"
  );
}

/** Handle X senza @ (es. sidepitchhub). */
export function xHandle(): string | undefined {
  const fromEnv = process.env["NEXT_PUBLIC_X_HANDLE"]?.trim().replace(/^@/, "");
  if (fromEnv) return fromEnv;
  // Default brand account
  return "sidepitchhub";
}

/** Profilo X pubblico, se configurato. */
export function xProfileUrl(): string | undefined {
  const explicit = process.env["NEXT_PUBLIC_X_URL"]?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const handle = xHandle();
  if (!handle) return undefined;
  return `https://x.com/${handle}`;
}
