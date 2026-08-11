import Link from "next/link";
import { CalcioAutoLogo } from "@/components/CalcioAutoLogo";
import { NewsTicker } from "@/components/NewsTicker";
import { LEAGUES } from "@/lib/leagues";
import { getFootballNews } from "@/lib/news";
import { SITE_NAME } from "@/lib/site";

export async function Header() {
  const news = await getFootballNews(8);

  return (
    <header className="border-b border-[var(--line)] bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <CalcioAutoLogo className="h-10 w-10 shrink-0" />
          <span className="display-font text-lg font-bold uppercase tracking-[0.04em] text-[var(--accent)] sm:text-2xl">
            {SITE_NAME}
          </span>
        </Link>
        <nav className="flex max-w-[58%] items-center gap-1 overflow-x-auto text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] sm:max-w-none sm:gap-2 sm:text-xs">
          <Link
            href="/notizie"
            className="whitespace-nowrap px-2 py-1 font-semibold text-[var(--accent)] hover:bg-white/5"
          >
            News
          </Link>
          <Link
            href="/oggi"
            className="whitespace-nowrap px-2 py-1 hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Oggi
          </Link>
          <Link
            href="/gol"
            className="whitespace-nowrap px-2 py-1 hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Gol
          </Link>
          <Link
            href="/analisi"
            className="whitespace-nowrap px-2 py-1 hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Analisi
          </Link>
          <Link
            href="/osservatori"
            className="whitespace-nowrap px-2 py-1 hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Osservatori
          </Link>
          <Link
            href="/sondaggio"
            className="whitespace-nowrap px-2 py-1 hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Sondaggio
          </Link>
          {LEAGUES.slice(0, 3).map((league) => (
            <Link
              key={league.slug}
              href={`/${league.slug}`}
              className="hidden whitespace-nowrap px-2 py-1 hover:bg-white/5 hover:text-[var(--ink)] md:inline"
            >
              {league.shortName}
            </Link>
          ))}
        </nav>
      </div>
      <div className="masthead-bar">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <Link
            href="/notizie"
            className="display-font shrink-0 text-sm font-bold uppercase italic tracking-wide"
          >
            Leggi
          </Link>
          <div className="hidden h-4 w-px bg-black/25 sm:block" />
          <div className="min-w-0 flex-1">
            <NewsTicker items={news} />
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-black py-10 text-sm text-[var(--muted)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <CalcioAutoLogo className="h-11 w-11 shrink-0" />
          <div className="space-y-1">
            <p className="display-font text-lg font-bold uppercase tracking-wide text-[var(--accent)]">
              {SITE_NAME}
            </p>
            <p className="max-w-sm text-xs leading-relaxed">
              Classifiche, calendari, risultati e notizie aggiornati in
              automatico · Dati football-data.org
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.12em]">
          <Link href="/oggi" className="hover:text-[var(--accent)]">
            Partite di oggi
          </Link>
          <Link href="/gol" className="hover:text-[var(--accent)]">
            Gol
          </Link>
          <Link href="/analisi" className="hover:text-[var(--accent)]">
            Analisi
          </Link>
          <Link href="/osservatori" className="hover:text-[var(--accent)]">
            Osservatori
          </Link>
          <Link href="/sondaggio" className="hover:text-[var(--accent)]">
            Sondaggio
          </Link>
          <Link href="/notizie" className="hover:text-[var(--accent)]">
            Notizie
          </Link>
          <Link href="/chi-siamo" className="hover:text-[var(--accent)]">
            Chi siamo
          </Link>
          <Link href="/contatti" className="hover:text-[var(--accent)]">
            Contatti
          </Link>
          <Link href="/privacy" className="hover:text-[var(--accent)]">
            Privacy
          </Link>
          <Link href="/cookie" className="hover:text-[var(--accent)]">
            Cookie
          </Link>
        </nav>
      </div>
    </footer>
  );
}
