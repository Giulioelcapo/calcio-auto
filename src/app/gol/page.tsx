import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Crest } from "@/components/Crest";
import {
  getMultiLeagueScorers,
  getTodaysMatches,
} from "@/lib/football-api";
import { golMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = golMetadata();

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
  const scorerBlocks = await getMultiLeagueScorers();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          Dati ufficiali
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Gol e marcatori calcio oggi
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          {today.dateLabel}. Risultati ufficiali di oggi + marcatori di più
          campionati (solo se l’API free li espone). Nessun goleador inventato.
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
              </li>
            ))}
          </ul>
        ) : (
          <div className="panel space-y-2 rounded-md p-4">
            <p className="text-sm font-medium">Campionati non ancora iniziati</p>
            <p className="text-sm text-[var(--muted)]">
              Nessun risultato ufficiale concluso oggi. Controlla il{" "}
              <Link
                href="/oggi"
                className="text-[var(--accent)] hover:underline"
              >
                calendario di oggi
              </Link>{" "}
              oppure torna all’inizio della stagione.
            </p>
          </div>
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

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--accent)]">
          Marcatori multi-lega (ufficiali)
        </h2>
        {scorerBlocks.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {scorerBlocks.map((block) => (
              <div key={block.leagueSlug} className="fm-panel">
                <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2">
                  <h3 className="text-sm font-semibold">{block.leagueName}</h3>
                  <Link
                    href={`/${block.leagueSlug}/marcatori`}
                    className="text-[10px] uppercase tracking-wide text-[var(--muted)] hover:text-[var(--accent)]"
                  >
                    Vedi tutti
                  </Link>
                </div>
                <ol className="divide-y divide-[var(--line)]">
                  {block.scorers.map((row) => (
                    <li
                      key={`${block.leagueSlug}-${row.rank}-${row.playerName}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="data-font w-5 text-[var(--accent)]">
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
                        {row.goals}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ) : (
          <p className="panel rounded-md p-4 text-sm text-[var(--muted)]">
            Nessun elenco marcatori disponibile ora dall’API free (tipico in
            pre-stagione). Non inventiamo gol o nomi.
          </p>
        )}
      </section>

      <p className="text-sm text-[var(--muted)]">
        Gioca al{" "}
        <Link
          href="/sondaggio"
          className="text-[var(--accent)] hover:underline"
        >
          sondaggio partita della giornata
        </Link>{" "}
        anche dalla home.
      </p>
    </div>
  );
}
