import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { PollPanel } from "@/components/PollPanel";
import { listLeagues } from "@/lib/football-api";
import { getFootballNews } from "@/lib/news";
import { buildPollState } from "@/lib/poll";

export default async function HomePage() {
  const leagues = listLeagues();
  const news = await getFootballNews(6);
  const poll = await buildPollState();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          Programmatic SEO · Zero gestione manuale
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          <span className="text-[var(--accent)]">CalcioAuto</span>
        </h1>
        <p className="max-w-2xl text-base text-[var(--muted)]">
          Classifiche, calendari, risultati, notizie e insight automatici sui 12
          campionati free. Stile Football Manager, mobile-first, pronto per
          AdSense.
        </p>
      </section>

      <AdSlot slot="top" />

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Mini-gioco di oggi
            </p>
            <h2 className="text-xl font-semibold text-[var(--accent)]">
              Partita della giornata
            </h2>
          </div>
          <Link
            href="/sondaggio"
            className="text-xs text-[var(--muted)] hover:text-[var(--accent)]"
          >
            Pagina completa
          </Link>
        </div>
        <PollPanel initial={poll} compact />
      </section>

      <section className="panel rounded-md p-4">
        <h2 className="text-lg font-semibold text-[var(--accent)]">
          Partite di oggi
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Orari e risultati di tutte le partite in programma oggi, aggiornati in
          automatico.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/oggi"
            className="inline-flex rounded bg-[var(--pitch)] px-3 py-1.5 text-sm hover:brightness-110"
          >
            Agenda di oggi
          </Link>
          <Link
            href="/gol"
            className="inline-flex rounded border border-[var(--line)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
          >
            Gol e marcatori
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-[var(--accent)]">
            Notizie e mercato
          </h2>
          <Link
            href="/notizie"
            className="text-xs text-[var(--muted)] hover:text-[var(--accent)]"
          >
            Vedi tutte
          </Link>
        </div>
        {news.length ? (
          <ul className="fm-panel divide-y divide-[var(--line)]">
            {news.map((item) => (
              <li key={item.id}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 hover:bg-white/5"
                >
                  <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    {item.source}
                  </div>
                  <div className="mt-1 text-sm font-medium">{item.title}</div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted)]">Notizie in aggiornamento…</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--accent)]">Campionati</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <article key={league.slug} className="panel rounded-md p-4">
              <div className="data-font text-xs text-[var(--muted)]">
                {league.country} · {league.code}
              </div>
              <h3 className="mt-1 text-lg font-semibold">{league.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Link
                  href={`/${league.slug}`}
                  className="rounded bg-[var(--pitch)] px-2 py-1 hover:brightness-110"
                >
                  Hub
                </Link>
                <Link
                  href={`/${league.slug}/classifica`}
                  className="rounded border border-[var(--line)] px-2 py-1 hover:border-[var(--accent)]"
                >
                  Classifica
                </Link>
                <Link
                  href={`/${league.slug}/calendario`}
                  className="rounded border border-[var(--line)] px-2 py-1 hover:border-[var(--accent)]"
                >
                  Calendario
                </Link>
                <Link
                  href={`/${league.slug}/risultati`}
                  className="rounded border border-[var(--line)] px-2 py-1 hover:border-[var(--accent)]"
                >
                  Risultati
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
