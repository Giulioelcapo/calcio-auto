"use client";

import { useEffect, useState } from "react";
import { Crest } from "@/components/Crest";
import type { PollSide, PollState } from "@/lib/poll-types";

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
        Per ogni partita scegli la squadra che merita di più. Poi vedi le
        percentuali casa/trasferta. {compact ? "1 voto per partita." : ""}
      </p>
      {error ? <p className="text-sm text-[var(--warn)]">{error}</p> : null}

      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        {state.candidates.map((c) => {
          const total = c.votes.home + c.votes.away;
          const homePct = pct(c.votes.home, total);
          const awayPct = 100 - homePct;
          const busy = pendingId === c.id;
          const locked = Boolean(c.votedSide);

          return (
            <article key={c.id} className="panel space-y-3 rounded-md p-3">
              <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                <span>{c.leagueName}</span>
                <span>
                  {formatKickoff(c.kickoff)}
                  {c.status === "IN_PLAY" || c.status === "LIVE" ? " · LIVE" : ""}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={busy || locked}
                  onClick={() => void vote(c.id, "home")}
                  className={`rounded-md border px-2 py-3 text-left transition ${
                    c.votedSide === "home"
                      ? "border-[var(--accent)] bg-[var(--accent)]/15"
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
