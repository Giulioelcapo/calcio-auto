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

export type PartnerSlotKind = "top" | "side" | "in-content";

export type PartnerSlotConfig = {
  href: string;
  title: string;
  subtitle: string;
  cta: string;
  external: boolean;
};

/** Banner partner/affiliate (funziona senza AdSense). */
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

  if (href) {
    return {
      href,
      title: title || "Partner CalcioAuto",
      subtitle: "Offerta consigliata · apre in una nuova scheda",
      cta: "Scopri",
      external: /^https?:\/\//i.test(href),
    };
  }

  // Fallback pronto: invito sponsor diretto
  return {
    href: "/contatti",
    title: "Spazio partner",
    subtitle: "Pubblicità e collaborazioni su CalcioAuto",
    cta: "Contattaci",
    external: false,
  };
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
