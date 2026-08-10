import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Crest } from "@/components/Crest";
import {
  getCompetitionBundle,
  getTodaysMatches,
} from "@/lib/football-api";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Gol e risultati ufficiali di oggi",
  description: `Gol e risultati precisi di oggi su ${SITE_NAME}: solo dati ufficiali API, nessun marcature inventato.`,
  alternates: { canonical: "/gol" },
};

export default async function GolPage() {
  const today = await getTodaysMatches();
  const finished = today.matches.filter(
    (m) =>
      (m.status === "FINISHED" || m.status === "AWARDED") &&
      m.homeScore != null &&
      m.awayScore != null,
  );
  const live = today.matches.filter(
    (m) =>
      m.status === "IN_PLAY" || m.status === "PAUSED" || m.status === "LIVE",
  );

  // Marcatori solo da endpoint ufficiale (Serie A). Se non disponibile, non inventiamo.
  const serieA = await getCompetitionBundle("serie-a");
  const scorers =
    serieA && serieA.scorersAvailable ? serieA.scorers.slice(0, 10) : [];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          Dati ufficiali
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Gol e risultati
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          {today.dateLabel}. Mostriamo solo risultati e marcatori provenienti
          dall’API football-data.org. Niente gol “a caso” o goleador inventati.
        </p>
      </section>

      <AdSlot slot="top" />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--accent)]">
          Risultati di oggi ({finished.length})
        </h2>
        {finished.length ? (
          <ul className="fm-panel divide-y divide-[var(--line)]">
            {finished.map((match) => (
              <li key={match.id} className="px-4 py-3">
                <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  {match.leagueName}
                  {match.matchday != null ? ` · G${match.matchday}` : ""}
                </div>
                <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div className="flex items-center justify-end gap-2 text-sm font-medium">
                    <span className="text-right">{match.homeTeam}</span>
                    <Crest src={match.homeCrest} alt={match.homeTeam} size={24} />
                  </div>
                  <div className="data-font min-w-[4rem] text-center text-base font-bold text-[var(--accent)]">
                    {match.homeScore}-{match.awayScore}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Crest src={match.awayCrest} alt={match.awayTeam} size={24} />
                    <span>{match.awayTeam}</span>
                  </div>
                </div>
                <div className="mt-1 text-center text-[11px] text-[var(--muted)]">
                  Gol totali in partita:{" "}
                  {(match.homeScore ?? 0) + (match.awayScore ?? 0)} (risultato
                  ufficiale)
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="panel rounded-md p-4 text-sm text-[var(--muted)]">
            Nessun risultato ufficiale concluso oggi. In pre-stagione o a inizio
            giornata è normale.{" "}
            <Link href="/oggi" className="text-[var(--accent)] hover:underline">
              Vedi il calendario di oggi
            </Link>
            .
          </p>
        )}
      </section>

      {live.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--accent)]">
            In corso ({live.length})
          </h2>
          <ul className="fm-panel divide-y divide-[var(--line)]">
            {live.map((match) => (
              <li key={match.id} className="px-4 py-3 text-sm">
                <span className="text-[var(--muted)]">{match.leagueName} · </span>
                {match.homeTeam} {match.homeScore ?? 0}-{match.awayScore ?? 0}{" "}
                {match.awayTeam}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--accent)]">
          Marcatori Serie A (ufficiali)
        </h2>
        {scorers.length ? (
          <ol className="fm-panel divide-y divide-[var(--line)]">
            {scorers.map((row) => (
              <li
                key={`${row.rank}-${row.playerName}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="data-font w-6 text-[var(--accent)]">
                    {row.rank}
                  </span>
                  <div>
                    <div className="font-medium">{row.playerName}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {row.teamName}
                    </div>
                  </div>
                </div>
                <span className="data-font font-semibold text-[var(--accent)]">
                  {row.goals} gol
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="panel rounded-md p-4 text-sm text-[var(--muted)]">
            Elenco marcatori non disponibile dall’API free in questo momento
            (stagione non iniziata o endpoint non incluso). Non mostriamo nomi
            inventati.
          </p>
        )}
      </section>

      <p className="text-sm text-[var(--muted)]">
        Partecipa al{" "}
        <Link href="/sondaggio" className="text-[var(--accent)] hover:underline">
          sondaggio miglior squadra di oggi
        </Link>
        .
      </p>
    </div>
  );
}
