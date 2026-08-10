"use client";

import { useEffect, useMemo, useState } from "react";
import { Crest } from "@/components/Crest";
import type { PollCandidate, PollSide, PollState } from "@/lib/poll-types";

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleTimeString("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pct(part: number, total: number) {
  if (total <= 0) return 50;
  return Math.round((part / total) * 100);
}

function matchLeader(c: PollCandidate): {
  side: PollSide | "tie" | null;
  name: string;
  crest: string | null;
  percent: number;
  votes: number;
} | null {
  const total = c.votes.home + c.votes.away;
  if (total <= 0) return null;
  if (c.votes.home === c.votes.away) {
    return {
      side: "tie",
      name: "Pareggio",
      crest: null,
      percent: 50,
      votes: c.votes.home,
    };
  }
  const homeWins = c.votes.home > c.votes.away;
  return {
    side: homeWins ? "home" : "away",
    name: homeWins ? c.homeTeam : c.awayTeam,
    crest: homeWins ? c.homeCrest : c.awayCrest,
    percent: pct(homeWins ? c.votes.home : c.votes.away, total),
    votes: homeWins ? c.votes.home : c.votes.away,
  };
}

export function PollPanel({
  initial,
  compact = false,
}: {
  initial: PollState;
  compact?: boolean;
}) {
  const [state, setState] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    setState(initial);
  }, [initial]);

  const winners = useMemo(
    () =>
      state.candidates
        .map((c) => {
          const leader = matchLeader(c);
          if (!leader) return null;
          return { match: c, leader };
        })
        .filter(Boolean) as Array<{
        match: PollCandidate;
        leader: NonNullable<ReturnType<typeof matchLeader>>;
      }>,
    [state.candidates],
  );

  const votedCount = state.candidates.filter((c) => c.votedSide).length;
  const showWinners = winners.length > 0;

  async function vote(matchId: string, side: PollSide) {
    setError(null);
    setPendingId(matchId);
    try {
      const res = await fetch("/api/sondaggio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, side }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Voto non riuscito");
        return;
      }
      setState(data as PollState);
    } catch {
      setError("Errore di rete");
    } finally {
      setPendingId(null);
    }
  }

  if (!state.candidates.length) {
    return (
      <p className="panel rounded-md p-4 text-sm text-[var(--muted)]">
        Nessuna partita disponibile per votare in questo momento.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Scegli una squadra per partita. Le percentuali e i vincitori si
        aggiornano subito.
        {votedCount
          ? ` Hai votato ${votedCount}/${state.candidates.length}.`
          : ""}
      </p>
      {error ? <p className="text-sm text-[var(--warn)]">{error}</p> : null}

      {showWinners ? (
        <section className="panel space-y-3 rounded-md p-4">
          <div className="flex items-end justify-between gap-2">
            <h3 className="text-sm font-semibold text-[var(--accent)]">
              Vincitori del sondaggio
            </h3>
            <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
              In tempo reale
            </span>
          </div>
          <ul className="space-y-2">
            {winners.map(({ match, leader }) => (
              <li
                key={match.id}
                className="flex items-center justify-between gap-3 rounded border border-[var(--line)] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    {match.leagueName} · {match.homeTeam} vs {match.awayTeam}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {leader.crest ? (
                      <Crest
                        src={leader.crest}
                        alt={leader.name}
                        size={22}
                      />
                    ) : null}
                    <span className="text-sm font-semibold">
                      {leader.side === "tie"
                        ? "Pareggio di voti"
                        : leader.name}
                    </span>
                  </div>
                </div>
                <div className="data-font shrink-0 text-right text-sm text-[var(--accent)]">
                  {leader.percent}%
                  <div className="text-[10px] text-[var(--muted)]">
                    {leader.votes} voti
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-xs text-[var(--muted)]">
          Vota almeno una partita: qui compariranno i vincitori con le %.
        </p>
      )}

      <div
        className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}
      >
        {state.candidates.map((c) => {
          const total = c.votes.home + c.votes.away;
          const homePct = pct(c.votes.home, total);
          const awayPct = 100 - homePct;
          const busy = pendingId === c.id;
          const locked = Boolean(c.votedSide);
          const leader = matchLeader(c);

          return (
            <article key={c.id} className="panel space-y-3 rounded-md p-3">
              <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                <span>{c.leagueName}</span>
                <span>
                  {formatKickoff(c.kickoff)}
                  {c.status === "IN_PLAY" || c.status === "LIVE"
                    ? " · LIVE"
                    : ""}
                </span>
              </div>

              {leader && leader.side !== "tie" ? (
                <div className="rounded bg-[var(--accent)]/10 px-2 py-1 text-center text-[11px] text-[var(--accent)]">
                  In testa: {leader.name} ({leader.percent}%)
                </div>
              ) : null}
              {leader?.side === "tie" ? (
                <div className="rounded bg-white/5 px-2 py-1 text-center text-[11px] text-[var(--muted)]">
                  Pareggio {leader.percent}% – {leader.percent}%
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={busy || locked}
                  onClick={() => void vote(c.id, "home")}
                  className={`rounded-md border px-2 py-3 text-left transition ${
                    c.votedSide === "home"
                      ? "border-[var(--accent)] bg-[var(--accent)]/15"
                      : leader?.side === "home"
                        ? "border-[var(--accent)]/50"
                        : "border-[var(--line)] hover:border-[var(--accent)] disabled:opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Crest src={c.homeCrest} alt={c.homeTeam} size={26} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold sm:text-sm">
                        {c.homeTeam}
                      </div>
                      <div className="data-font text-[11px] text-[var(--accent)]">
                        {homePct}% · {c.votes.home} voti
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={busy || locked}
                  onClick={() => void vote(c.id, "away")}
                  className={`rounded-md border px-2 py-3 text-left transition ${
                    c.votedSide === "away"
                      ? "border-[var(--accent)] bg-[var(--accent)]/15"
                      : leader?.side === "away"
                        ? "border-[var(--accent)]/50"
                        : "border-[var(--line)] hover:border-[var(--accent)] disabled:opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Crest src={c.awayCrest} alt={c.awayTeam} size={26} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold sm:text-sm">
                        {c.awayTeam}
                      </div>
                      <div className="data-font text-[11px] text-[var(--accent)]">
                        {awayPct}% · {c.votes.away} voti
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex h-2 overflow-hidden rounded bg-black/40">
                <div
                  className="h-full bg-[var(--accent)] transition-all"
                  style={{ width: `${homePct}%` }}
                />
                <div
                  className="h-full bg-[var(--pitch)] transition-all"
                  style={{ width: `${awayPct}%` }}
                />
              </div>

              <div className="text-center text-[11px] text-[var(--muted)]">
                {c.homeScore != null && c.awayScore != null
                  ? `Risultato: ${c.homeScore}-${c.awayScore}`
                  : "vs"}
                {locked
                  ? ` · Hai votato ${c.votedSide === "home" ? c.homeTeam : c.awayTeam}`
                  : " · Tocca una squadra"}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
