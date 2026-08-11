import Link from "next/link";
import { CalcioAutoLogo } from "@/components/CalcioAutoLogo";
import { NewsTicker } from "@/components/NewsTicker";
import { LEAGUES } from "@/lib/leagues";
import { getFootballNews } from "@/lib/news";
import { SITE_NAME } from "@/lib/site";

export async function Header() {
  const news = await getFootballNews(8);

  return (
    <header className="border-b border-[var(--line)] bg-black/30 backdrop-blur">
      <NewsTicker items={news} />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <CalcioAutoLogo className="h-9 w-9 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-[var(--accent)]">
              {SITE_NAME}
            </span>
            <span className="mt-1 hidden text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] sm:inline">
              FM Data Hub
            </span>
          </span>
        </Link>
        <nav className="flex max-w-[70%] items-center gap-2 overflow-x-auto text-xs text-[var(--muted)] sm:max-w-none sm:text-sm">
          <Link
            href="/gol"
            className="whitespace-nowrap rounded px-2 py-1 font-medium text-[var(--accent)] hover:bg-white/5"
          >
            Gol
          </Link>
          <Link
            href="/sondaggio"
            className="whitespace-nowrap rounded px-2 py-1 font-medium text-[var(--accent)] hover:bg-white/5"
          >
            Sondaggio
          </Link>
          <Link
            href="/notizie"
            className="whitespace-nowrap rounded px-2 py-1 font-medium text-[var(--accent)] hover:bg-white/5"
          >
            News
          </Link>
          {LEAGUES.slice(0, 4).map((league) => (
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
        <div className="flex items-start gap-3">
          <CalcioAutoLogo className="h-10 w-10 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-[var(--accent)]">{SITE_NAME}</p>
            <p className="text-xs">
              Classifiche e calendari aggiornati in automatico · Dati
              football-data.org
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <Link href="/oggi" className="hover:text-[var(--ink)]">
            Partite di oggi
          </Link>
          <Link href="/gol" className="hover:text-[var(--ink)]">
            Gol
          </Link>
          <Link href="/sondaggio" className="hover:text-[var(--ink)]">
            Sondaggio
          </Link>
          <Link href="/notizie" className="hover:text-[var(--ink)]">
            Notizie
          </Link>
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
