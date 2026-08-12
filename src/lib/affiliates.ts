/**
 * Affiliazioni Amazon.it — prodotti reali (ASIN) + foto CDN Amazon.
 * Tag: NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG (es. sidepitchhub2-21)
 */

export type AffiliateOffer = {
  id: string;
  slot: "top" | "side" | "in-content";
  title: string;
  subtitle: string;
  cta: string;
  /** ASIN Amazon.it → link prodotto reale + commissione */
  asin: string;
  /** Foto prodotto ufficiale m.media-amazon.com */
  imageSrc: string;
  imageAlt: string;
  amazonQuery: string;
};

/** Foto prodotto Amazon (CDN ufficiale). */
export function amazonCdnImage(imageId: string, size = 500): string {
  return `https://m.media-amazon.com/images/I/${imageId}._AC_SL${size}_.jpg`;
}

export function amazonProductUrl(asin: string, tag?: string): string {
  const t = tag ?? amazonAssociateTag();
  const params = new URLSearchParams();
  if (t) params.set("tag", t);
  const q = params.toString();
  return q
    ? `https://www.amazon.it/dp/${asin}?${q}`
    : `https://www.amazon.it/dp/${asin}`;
}

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: "kit",
    slot: "top",
    title: "Maglia Italia adidas",
    subtitle: "Disponibile su Amazon.it",
    cta: "Apri su Amazon",
    asin: "B0DM6CQVMC",
    imageSrc: amazonCdnImage("81xfnM-HCjL"),
    imageAlt: "Maglia ufficiale Italia adidas su Amazon.it",
    amazonQuery: "maglia calcio ufficiale",
  },
  {
    id: "ball",
    slot: "side",
    title: "Pallone adidas Starlancer",
    subtitle: "Disponibile su Amazon.it",
    cta: "Apri su Amazon",
    asin: "B0CPYBMVDL",
    imageSrc: amazonCdnImage("71I90TKsdGL"),
    imageAlt: "Pallone adidas Starlancer Club su Amazon.it",
    amazonQuery: "pallone calcio professionale",
  },
  {
    id: "gear",
    slot: "in-content",
    title: "Scarpe Puma Ultra 6",
    subtitle: "Disponibile su Amazon.it",
    cta: "Apri su Amazon",
    asin: "B0DJ9H9MNJ",
    imageSrc: amazonCdnImage("71rhBo-UneL"),
    imageAlt: "Scarpe da calcio Puma Ultra 6 Match su Amazon.it",
    amazonQuery: "scarpe calcio tacchetti",
  },
];

export const AMAZON_TRAFFIC_DEALS: AffiliateOffer[] = [
  ...AFFILIATE_OFFERS,
  {
    id: "fan",
    slot: "top",
    title: "Maglia Juventus adidas",
    subtitle: "Disponibile su Amazon.it",
    cta: "Apri su Amazon",
    asin: "B0DM36B4M5",
    imageSrc: amazonCdnImage("71MVjnMxd5L"),
    imageAlt: "Maglia Juventus adidas su Amazon.it",
    amazonQuery: "maglia juventus",
  },
  {
    id: "training",
    slot: "side",
    title: "Coni allenamento",
    subtitle: "Disponibile su Amazon.it",
    cta: "Apri su Amazon",
    asin: "B0CGGSK9PN",
    imageSrc: amazonCdnImage("71ymvLejTGL"),
    imageAlt: "Coni allenamento calcio su Amazon.it",
    amazonQuery: "attrezzatura allenamento calcio",
  },
  {
    id: "kids",
    slot: "in-content",
    title: "Pallone mini adidas",
    subtitle: "Disponibile su Amazon.it",
    cta: "Apri su Amazon",
    asin: "B0F4K5MJXF",
    imageSrc: amazonCdnImage("61QpbuHTpDL"),
    imageAlt: "Pallone adidas Starlancer Mini su Amazon.it",
    amazonQuery: "pallone calcio bambini",
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

export function amazonHomeUrl(tag?: string): string {
  const t = tag ?? amazonAssociateTag();
  const params = new URLSearchParams();
  if (t) params.set("tag", t);
  const q = params.toString();
  return q ? `https://www.amazon.it/?${q}` : "https://www.amazon.it/";
}

export function offerHref(offer: AffiliateOffer): string {
  if (offer.asin) return amazonProductUrl(offer.asin);
  return amazonSearchUrl(offer.amazonQuery);
}

export function offerBySlot(slot: AffiliateOffer["slot"]): AffiliateOffer {
  return AFFILIATE_OFFERS.find((o) => o.slot === slot) ?? AFFILIATE_OFFERS[0];
}

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
  "Link Amazon: in qualità di Affiliato Amazon, Side Pitch Hub riceve un guadagno dagli acquisti idonei. Foto prodotto © Amazon.";

export const SPONSOR_MAIL =
  "mailto:info@sidepitchhub.com?subject=Sponsor%20Side%20Pitch%20Hub";
