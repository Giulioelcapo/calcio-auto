export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function adsenseClient(): string | undefined {
  const id = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
  return id || undefined;
}

export function adsenseSlot(kind: "top" | "side" | "in-content"): string | undefined {
  const map = {
    top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP,
    side: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDE,
    "in-content": process.env.NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT,
  } as const;
  const value = map[kind]?.trim();
  return value || undefined;
}

export const SITE_NAME = "CalcioAuto";
export const SITE_TAGLINE = "Classifiche e calendari calcio automatici";

export function contactEmail(): string {
  return (
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "info@calcioauto.local"
  );
}
