import Link from "next/link";
import type { ReactNode } from "react";
import { LEAGUE_SECTIONS } from "@/lib/leagues";

export function LeagueNav({ slug }: { slug: string }) {
  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href={`/${slug}`}
        className="rounded border border-[var(--line)] px-3 py-1.5 text-xs uppercase tracking-wide hover:border-[var(--accent)]"
      >
        Hub
      </Link>
      {LEAGUE_SECTIONS.map((section) => (
        <Link
          key={section.segment}
          href={`/${slug}/${section.segment}`}
          className="rounded border border-[var(--line)] px-3 py-1.5 text-xs uppercase tracking-wide hover:border-[var(--accent)]"
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}

export function MockBanner({ usingMock }: { usingMock: boolean }) {
  if (!usingMock) return null;
  return (
    <p className="rounded border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-3 py-2 text-sm text-[var(--warn)]">
      Modalità demo: token mancante oppure API football-data.org non disponibile
      (account disabilitato, 403, rate limit). Controlla{" "}
      <code>FOOTBALL_DATA_API_TOKEN</code> in <code>.env.local</code> e su
      Vercel, poi riavvia / Redeploy.
    </p>
  );
}

export function ContentBlock({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      {title ? (
        <h2 className="text-lg font-semibold text-[var(--accent)]">{title}</h2>
      ) : null}
      <p className="text-sm leading-relaxed text-[var(--muted)]">{children}</p>
    </section>
  );
}
