import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { PollPanel } from "@/components/PollPanel";
import { getTodaysMatches, listLeagues } from "@/lib/football-api";
import { getFootballNews } from "@/lib/news";
import { getServerPollState } from "@/lib/poll-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const leagues = listLeagues();
  const [news, poll, today] = await Promise.all([
    getFootballNews(8),
    getServerPollState(),
    getTodaysMatches(),
  ]);
  const hasMatchesToday = today.matches.length > 0;
  const featured = news[0];
  const sideNews = news.slice(1, 4);
  const moreNews = news.slice(4);

  return (
    <div className="space-y-10">
      <section className="hero-pitch rise-in rounded-sm px-5 py-8 sm:px-8 sm:py-10">
        <h1 className="display-font max-w-3xl text-3xl font-bold uppercase leading-tight tracking-tight text-[var(--ink)] sm:text-5xl">
          12 campionati. News e dati, aggiornati da soli.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--muted)] sm:text-base">
          Partite di oggi, sondaggio community, classifiche e calendari in un
          solo hub.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/notizie"
            className="inline-flex bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-ink)] hover:brightness-110"
          >
            Ultime news
          </Link>
          <Link
            href="/oggi"
            className="inline-flex border border-[var(--line)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] hover:border-[var(--accent)]"
          >
            Partite di oggi
          </Link>
        </div>
      </section>

      <AdSlot slot="top" />

      <section className="space-y-4">
        <div className="section-rule">
          <h2>Sondaggio</h2>
          <Link
            href="/sondaggio"
            className="section-meta hover:text-[var(--accent)]"
          >
            Pagina completa
          </Link>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Chi merita di più? Vota e guarda i vincitori live.
        </p>
        <PollPanel initial={poll} compact />
      </section>

      <section className="space-y-4 rise-in-delay">
        <div className="section-rule">
          <h2>Ultimissime</h2>
          <Link href="/notizie" className="section-meta hover:text-[var(--accent)]">
            Vedi tutte
          </Link>
        </div>

        {featured ? (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <a
              href={featured.link}
              target="_blank"
              rel="noopener noreferrer"
              className="panel group block p-5 transition hover:border-[var(--accent)] sm:p-6"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                {featured.source}
              </p>
              <h3 className="display-font mt-3 text-2xl font-bold uppercase leading-tight tracking-tight group-hover:text-[var(--accent)] sm:text-3xl">
                {featured.title}
              </h3>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Apri fonte originale →
              </p>
            </a>
            <ul className="panel divide-y divide-[var(--line)]">
              {sideNews.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3.5 transition hover:bg-white/[0.03]"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {item.source}
                    </div>
                    <div className="mt-1 text-sm font-semibold leading-snug">
                      {item.title}
                    </div>
                  </a>
                </li>
              ))}
              {!sideNews.length ? (
                <li className="px-4 py-4 text-sm text-[var(--muted)]">
                  Altre notizie in arrivo.
                </li>
              ) : null}
            </ul>
          </div>
        ) : (
          <p className="panel p-4 text-sm text-[var(--muted)]">
            Nessuna notizia disponibile. Riprova tra poco.
          </p>
        )}

        {moreNews.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {moreNews.map((item) => (
              <li key={item.id}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="panel block h-full px-4 py-3 transition hover:border-[var(--accent)]"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {item.source}
                  </div>
                  <div className="mt-1 text-sm font-semibold">{item.title}</div>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="section-rule">
          <h2>Partite di oggi</h2>
          <Link href="/oggi" className="section-meta hover:text-[var(--accent)]">
            Agenda
          </Link>
        </div>
        <div className="panel p-5">
          {hasMatchesToday ? (
            <p className="text-sm text-[var(--muted)]">
              {today.dateLabel}:{" "}
              <span className="font-semibold text-[var(--ink)]">
                {today.matches.length} partite
              </span>{" "}
              tra i campionati monitorati.
            </p>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Nessuna partita disponibile. Riprova tra poco.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/oggi"
              className="inline-flex bg-[var(--accent)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-ink)] hover:brightness-110"
            >
              Apri agenda
            </Link>
            <Link
              href="/gol"
              className="inline-flex border border-[var(--line)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] hover:border-[var(--accent)]"
            >
              Gol e marcatori
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="section-rule">
          <h2>Campionati</h2>
          <span className="section-meta">12 leghe</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <article key={league.slug} className="panel p-4 transition hover:border-[var(--accent)]">
              <div className="data-font text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                {league.country} · {league.code}
              </div>
              <h3 className="display-font mt-2 text-xl font-bold uppercase tracking-wide">
                {league.name}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
                <Link
                  href={`/${league.slug}`}
                  className="bg-[var(--accent)] px-2 py-1 text-[var(--accent-ink)] hover:brightness-110"
                >
                  Hub
                </Link>
                <Link
                  href={`/${league.slug}/classifica`}
                  className="border border-[var(--line)] px-2 py-1 hover:border-[var(--accent)]"
                >
                  Classifica
                </Link>
                <Link
                  href={`/${league.slug}/calendario`}
                  className="border border-[var(--line)] px-2 py-1 hover:border-[var(--accent)]"
                >
                  Calendario
                </Link>
                <Link
                  href={`/${league.slug}/risultati`}
                  className="border border-[var(--line)] px-2 py-1 hover:border-[var(--accent)]"
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
