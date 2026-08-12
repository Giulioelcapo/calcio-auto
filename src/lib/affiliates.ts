/**
 * Affiliazioni Amazon.it — obiettivo: click outbound (traffico affiliate).
 * Tag: NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG (es. sidepitchhub2-21)
 */

export type AffiliateOffer = {
  id: string;
  slot: "top" | "side" | "in-content";
  title: string;
  subtitle: string;
  cta: string;
  imageSrc: string;
  imageAlt: string;
  amazonQuery: string;
  fallbackHref: string;
};

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: "kit",
    slot: "top",
    title: "Maglie ufficiali",
    subtitle: "Kit 2026 · prezzi Amazon.it",
    cta: "Apri su Amazon",
    imageSrc: "/partner/kit.jpg",
    imageAlt: "Gear da calcio",
    amazonQuery: "maglia calcio ufficiale",
    fallbackHref: "https://www.amazon.it/s?k=maglia+calcio+ufficiale",
  },
  {
    id: "ball",
    slot: "side",
    title: "Palloni match",
    subtitle: "Training e gara",
    cta: "Apri su Amazon",
    imageSrc: "/partner/ball.jpg",
    imageAlt: "Pallone da calcio",
    amazonQuery: "pallone calcio professionale",
    fallbackHref: "https://www.amazon.it/s?k=pallone+calcio+professionale",
  },
  {
    id: "gear",
    slot: "in-content",
    title: "Scarpe e tacchetti",
    subtitle: "Nike · Adidas · Puma",
    cta: "Apri su Amazon",
    imageSrc: "/partner/boots.jpg",
    imageAlt: "Scarpe da calcio",
    amazonQuery: "scarpe calcio tacchetti",
    fallbackHref: "https://www.amazon.it/s?k=scarpe+calcio+tacchetti",
  },
];

/** Extra deal per rail / pagina shop (più punti di click). */
export const AMAZON_TRAFFIC_DEALS: AffiliateOffer[] = [
  ...AFFILIATE_OFFERS,
  {
    id: "fan",
    slot: "top",
    title: "Gadget e tifo",
    subtitle: "Sciarpe, cappelli, accessori",
    cta: "Apri su Amazon",
    imageSrc: "/partner/kit.jpg",
    imageAlt: "Accessori tifo calcio",
    amazonQuery: "gadget calcio tifoso",
    fallbackHref: "https://www.amazon.it/s?k=gadget+calcio+tifoso",
  },
  {
    id: "training",
    slot: "side",
    title: "Allenamento",
    subtitle: "Coni, scale, reti",
    cta: "Apri su Amazon",
    imageSrc: "/partner/ball.jpg",
    imageAlt: "Attrezzatura training calcio",
    amazonQuery: "attrezzatura allenamento calcio",
    fallbackHref: "https://www.amazon.it/s?k=attrezzatura+allenamento+calcio",
  },
  {
    id: "kids",
    slot: "in-content",
    title: "Calcio kids",
    subtitle: "Palloni e kit junior",
    cta: "Apri su Amazon",
    imageSrc: "/partner/boots.jpg",
    imageAlt: "Calcio bambini",
    amazonQuery: "pallone calcio bambini",
    fallbackHref: "https://www.amazon.it/s?k=pallone+calcio+bambini",
  },
];

export function amazonAssociateTag(): string | undefined {
  const tag = process.env["NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG"]?.trim();
  return tag || undefined;
}

export function amazonSearchUrl(query: string, tag?: string): string {
  const params = new URLSearchParams({ k: query });
  const t = tag ?? amazonAssociateTag();
  if (t) params.set("tag", t);
  return `https://www.amazon.it/s?${params.toString()}`;
}

/** Homepage Amazon.it con tag (max traffico generico). */
export function amazonHomeUrl(tag?: string): string {
  const t = tag ?? amazonAssociateTag();
  const params = new URLSearchParams();
  if (t) params.set("tag", t);
  const q = params.toString();
  return q ? `https://www.amazon.it/?${q}` : "https://www.amazon.it/";
}

export function offerHref(offer: AffiliateOffer): string {
  return amazonSearchUrl(offer.amazonQuery);
}

export function offerBySlot(slot: AffiliateOffer["slot"]): AffiliateOffer {
  return AFFILIATE_OFFERS.find((o) => o.slot === slot) ?? AFFILIATE_OFFERS[0];
}

/** Maglia contestuale: lega o squadra → più conversioni. */
export function amazonJerseyQuery(label: string): string {
  const clean = label.replace(/\s+/g, " ").trim();
  return `maglia ${clean} ufficiale`;
}

export function amazonJerseyHref(label: string): string {
  return amazonSearchUrl(amazonJerseyQuery(label));
}

export const AMAZON_ASSOCIATES_JOIN =
  "https://programma-affiliazione.amazon.it/";

export const AMAZON_DISCLOSURE =
  "Link Amazon: in qualità di Affiliato Amazon, Side Pitch Hub riceve un guadagno dagli acquisti idonei.";

export const SPONSOR_MAIL =
  "mailto:info@sidepitchhub.com?subject=Sponsor%20Side%20Pitch%20Hub";
