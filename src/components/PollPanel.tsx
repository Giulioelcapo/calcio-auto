"use client";

import { useEffect, useState } from "react";
import { Crest } from "@/components/Crest";
import type { PollState } from "@/lib/poll-types";

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleTimeString("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setState(initial);
  }, [initial]);

  async function vote(matchId: string) {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/sondaggio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
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
      setPending(false);
    }
  }

  if (!state.candidates.length) {
    return (
      <p className="panel rounded-md p-4 text-sm text-[var(--muted)]">
        Oggi non ci sono partite in programma: il gioco si attiva quando c’è il
        calendario.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        {compact
          ? "Scegli la partita della giornata tra 4 match pescati dal calendario di oggi. 1 voto/giorno."
          : "Ogni giorno 4 partite diverse (fisse per la giornata). Vota quella che merita di più. 1 voto per dispositivo."}{" "}
        Totale: {state.totalVotes}
      </p>
      {error ? <p className="text-sm text-[var(--warn)]">{error}</p> : null}
      {!state.votedId ? (
        <p className="text-xs text-[var(--accent)]">
          Tocca Vota su una partita per esprimere il tuo voto.
        </p>
      ) : (
        <p className="text-xs text-[var(--muted)]">
          Voto salvato. I totali restano visibili a tutti.
        </p>
      )}
      <div
        className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}
      >
        {state.candidates.map((c) => {
          const pct =
            state.totalVotes > 0
              ? Math.round((c.votes / state.totalVotes) * 100)
              : 0;
          const selected = state.votedId === c.id;
          const score =
            c.homeScore != null && c.awayScore != null
              ? `${c.homeScore}-${c.awayScore}`
              : "vs";
          return (
            <article
              key={c.id}
              className={`panel rounded-md p-3 ${
                selected ? "border-[var(--accent)]" : ""
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                <span>{c.leagueName}</span>
                <span>
                  {formatKickoff(c.kickoff)}
                  {c.status === "IN_PLAY" || c.status === "LIVE"
                    ? " · LIVE"
                    : ""}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="flex items-center justify-end gap-1.5 text-xs font-medium sm:text-sm">
                  <span className="text-right leading-tight">{c.homeTeam}</span>
                  <Crest src={c.homeCrest} alt={c.homeTeam} size={22} />
                </div>
                <div className="data-font min-w-[2.5rem] text-center text-sm font-bold text-[var(--accent)]">
                  {score}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                  <Crest src={c.awayCrest} alt={c.awayTeam} size={22} />
                  <span className="leading-tight">{c.awayTeam}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="data-font text-xs text-[var(--accent)]">
                  {c.votes} voti · {pct}%
                </span>
                <button
                  type="button"
                  disabled={pending || Boolean(state.votedId)}
                  onClick={() => void vote(c.id)}
                  className={`rounded px-3 py-1.5 text-xs ${
                    selected
                      ? "bg-[var(--accent)] text-black"
                      : "border border-[var(--line)] hover:border-[var(--accent)] disabled:opacity-40"
                  }`}
                >
                  {selected ? "Scelta" : "Vota"}
                </button>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded bg-black/40">
                <div
                  className="h-full bg-[var(--accent)] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
