import Link from "next/link";
import { LEAGUES } from "@/lib/leagues";
import { SITE_NAME } from "@/lib/site";

export function Header() {
  return (
    <header className="border-b border-[var(--line)] bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-[var(--accent)]">
            {SITE_NAME}
          </span>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-[var(--muted)] sm:inline">
            FM Data Hub
          </span>
        </Link>
        <nav className="flex max-w-[60%] gap-2 overflow-x-auto text-xs text-[var(--muted)] sm:max-w-none sm:text-sm">
          {LEAGUES.slice(0, 6).map((league) => (
            <Link
              key={league.slug}
              href={`/${league.slug}`}
              className="whitespace-nowrap rounded px-2 py-1 hover:bg-white/5 hover:text-[var(--ink)]"
            >
              {league.shortName}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] py-8 text-sm text-[var(--muted)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-[var(--accent)]">{SITE_NAME}</p>
          <p className="text-xs">
            Classifiche e calendari aggiornati in automatico · Dati
            football-data.org
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <Link href="/chi-siamo" className="hover:text-[var(--ink)]">
            Chi siamo
          </Link>
          <Link href="/contatti" className="hover:text-[var(--ink)]">
            Contatti
          </Link>
          <Link href="/privacy" className="hover:text-[var(--ink)]">
            Privacy
          </Link>
          <Link href="/cookie" className="hover:text-[var(--ink)]">
            Cookie
          </Link>
        </nav>
      </div>
    </footer>
  );
}
