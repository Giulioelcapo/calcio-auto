import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Crest } from "@/components/Crest";
import { MockBanner } from "@/components/LeagueNav";
import { getTodaysMatches } from "@/lib/football-api";
import { SITE_NAME } from "@/lib/site";
import type { TodayMatch } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Partite di oggi",
  description: `Calendario partite di calcio di oggi: orari e risultati live su ${SITE_NAME}, tutti i campionati free aggiornati in automatico.`,
  alternates: { canonical: "/oggi" },
};

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleTimeString("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TodayMatchRow({ match }: { match: TodayMatch }) {
  const done = match.status === "FINISHED" || match.status === "AWARDED";
  const live =
    match.status === "IN_PLAY" ||
    match.status === "PAUSED" ||
    match.status === "LIVE";

  return (
    <article className="space-y-2 border-b border-[var(--line)] px-4 py-3 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <Link
          href={`/${match.leagueSlug}`}
          className="uppercase tracking-wide hover:text-[var(--accent)]"
        >
          {match.leagueName}
        </Link>
        <span>
          {formatKickoff(match.utcDate)}
          {match.matchday != null ? ` · G${match.matchday}` : ""}
          {live ? " · LIVE" : ""}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center justify-end gap-2 text-sm font-medium">
          <span className="text-right">{match.homeTeam}</span>
          <Crest src={match.homeCrest} alt={match.homeTeam} size={26} />
        </div>
        <div className="min-w-[4.5rem] text-center font-mono text-sm">
          {done || live ? (
            <span className="font-bold text-[var(--accent)]">
              {match.homeScore ?? 0}-{match.awayScore ?? 0}
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
              vs
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Crest src={match.awayCrest} alt={match.awayTeam} size={26} />
          <span>{match.awayTeam}</span>
        </div>
      </div>
    </article>
  );
}

export default async function OggiPage() {
  const data = await getTodaysMatches();
  const finished = data.matches.filter(
    (m) => m.status === "FINISHED" || m.status === "AWARDED",
  );
  const upcoming = data.matches.filter(
    (m) => m.status !== "FINISHED" && m.status !== "AWARDED",
  );

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          Agenda giornaliera
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Partite di oggi
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          {data.dateLabel} · orari Europa/Roma · aggiornamento automatico su
          Premier League, Serie A, Liga, Bundesliga, Ligue 1 e gli altri
          campionati free.
        </p>
      </section>

      <AdSlot slot="top" />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--accent)]">
          In programma / live ({upcoming.length})
        </h2>
        {upcoming.length ? (
          <div className="fm-panel">
            {upcoming.map((match) => (
              <TodayMatchRow key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="panel space-y-2 rounded-md p-4">
            <p className="text-sm font-medium">Campionati non ancora iniziati</p>
            <p className="text-sm text-[var(--muted)]">
              Oggi non ci sono partite tra i campionati monitorati. Torna
              all'inizio della stagione, oppure apri i{" "}
              <Link href="/" className="text-[var(--accent)] hover:underline">
                calendari
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      {finished.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--accent)]">
            Risultati di oggi ({finished.length})
          </h2>
          <div className="fm-panel">
            {finished.map((match) => (
              <TodayMatchRow key={match.id} match={match} />
            ))}
          </div>
        </section>
      ) : null}

      <AdSlot slot="in-content" />
      <AmazonShopRail title="Gear per il matchday" limit={3} />
    </div>
  );
}
