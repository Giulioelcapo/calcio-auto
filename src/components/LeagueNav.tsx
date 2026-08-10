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

export function MockBanner(_props: { usingMock: boolean }) {
  // Nascosto in produzione: non attrattivo per i visitatori
  return null;
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
