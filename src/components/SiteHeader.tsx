import Link from "next/link";
import { Crest } from "@/components/Crest";
import { LEAGUES } from "@/lib/leagues";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_85%,black)]/80 backdrop-blur sticky top-0 z-40">
      <div className="fm-shell flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-[1.35rem] font-bold tracking-tight text-[var(--accent)]">
            PitchPulse
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            2026/27
          </span>
        </Link>
        <nav className="flex flex-wrap gap-1.5 text-sm text-[var(--muted)]">
          {LEAGUES.slice(0, 6).map((league) => (
            <Link
              key={league.slug}
              href={`/${league.slug}/classifica`}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-[var(--panel)] hover:text-[var(--text)]"
              title={league.name}
            >
              <Crest src={league.emblem} alt={league.shortName} size={16} />
              <span>{league.shortName}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
