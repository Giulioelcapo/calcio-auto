export function siteUrl(): string {
  const explicit = process.env["NEXT_PUBLIC_SITE_URL"]?.replace(/\/$/, "").trim();
  if (explicit) return explicit;

  // Su Vercel, anche senza env esplicita, usa l’URL del deploy
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
  // Publisher pubblico (visibile nello snippet AdSense)
  return "ca-pub-6747403673692656";
}

export function adsenseSlot(kind: "top" | "side" | "in-content"): string | undefined {
  const map = {
    top: process.env["NEXT_PUBLIC_ADSENSE_SLOT_TOP"],
    side: process.env["NEXT_PUBLIC_ADSENSE_SLOT_SIDE"],
    "in-content": process.env["NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT"],
  } as const;
  const value = map[kind]?.trim();
  return value || undefined;
}

export function googleSiteVerification(): string | undefined {
  const code = process.env["NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"]?.trim();
  return code || undefined;
}

export const SITE_NAME = "CalcioAuto";
export const SITE_TAGLINE = "Classifiche e calendari calcio automatici";

export function contactEmail(): string {
  return (
    process.env["NEXT_PUBLIC_CONTACT_EMAIL"]?.trim() ||
    "info@calcioauto.local"
  );
}
