/**
 * Affiliazioni Side Pitch Hub (no betting).
 * Guadagno reale quando imposti NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG
 * (es. sidepitchhub-21) da Amazon Associates Italia.
 */

export type AffiliateOffer = {
  id: string;
  slot: "top" | "side" | "in-content";
  title: string;
  subtitle: string;
  cta: string;
  /** Query Amazon.it */
  amazonQuery: string;
  /** Fallback se Amazon non attivo */
  fallbackHref: string;
};

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: "kit",
    slot: "top",
    title: "Kit e maglie ufficiale",
    subtitle: "Selezione Amazon · calcio 2026",
    cta: "Vedi offerte",
    amazonQuery: "maglia calcio ufficiale",
    fallbackHref: "https://www.amazon.it/s?k=maglia+calcio+ufficiale",
  },
  {
    id: "ball",
    slot: "side",
    title: "Palloni da match",
    subtitle: "Training e gara · prezzi aggiornati",
    cta: "Scopri",
    amazonQuery: "pallone calcio professionale",
    fallbackHref: "https://www.amazon.it/s?k=pallone+calcio+professionale",
  },
  {
    id: "gear",
    slot: "in-content",
    title: "Scarpe e gear",
    subtitle: "Tacchetti e accessori per il campo",
    cta: "Apri shop",
    amazonQuery: "scarpe calcio tacchetti",
    fallbackHref: "https://www.amazon.it/s?k=scarpe+calcio+tacchetti",
  },
];

export function amazonAssociateTag(): string | undefined {
  const tag = process.env["NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG"]?.trim();
  return tag || undefined;
}

/** Link Amazon.it con tag affiliate se presente. */
export function amazonSearchUrl(query: string, tag?: string): string {
  const params = new URLSearchParams({
    k: query,
    tag: tag || "",
  });
  if (!tag) params.delete("tag");
  return `https://www.amazon.it/s?${params.toString()}`;
}

export function offerHref(offer: AffiliateOffer): string {
  const tag = amazonAssociateTag();
  if (tag) return amazonSearchUrl(offer.amazonQuery, tag);
  return offer.fallbackHref;
}

export function offerBySlot(slot: AffiliateOffer["slot"]): AffiliateOffer {
  return (
    AFFILIATE_OFFERS.find((o) => o.slot === slot) ?? AFFILIATE_OFFERS[0]
  );
}

export const AMAZON_ASSOCIATES_JOIN =
  "https://programma-affiliazione.amazon.it/";

export const SPONSOR_MAIL = "mailto:info@sidepitchhub.com?subject=Sponsor%20Side%20Pitch%20Hub";
