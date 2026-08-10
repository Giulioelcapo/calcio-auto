"use client";

import { useEffect, useState } from "react";
import { Crest } from "@/components/Crest";
import type { PollState } from "@/lib/poll-types";

export function PollPanel({ initial }: { initial: PollState }) {
  const [state, setState] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setState(initial);
  }, [initial]);

  async function vote(teamId: string) {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/sondaggio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
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
        Oggi non ci sono ancora partite nei campionati monitorati: il sondaggio
        si attiva quando c’è il calendario della giornata.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Vota la miglior squadra tra quelle in campo oggi. 1 voto per
        dispositivo al giorno. Totale voti: {state.totalVotes}.
      </p>
      {error ? <p className="text-sm text-[var(--warn)]">{error}</p> : null}
      <ul className="fm-panel divide-y divide-[var(--line)]">
        {state.candidates.map((c) => {
          const pct =
            state.totalVotes > 0
              ? Math.round((c.votes / state.totalVotes) * 100)
              : 0;
          const selected = state.votedId === c.id;
          return (
            <li key={c.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Crest src={c.crest} alt={c.name} size={28} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                      {c.leagueName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="data-font text-sm text-[var(--accent)]">
                    {c.votes} ({pct}%)
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
                    {selected ? "Il tuo voto" : "Vota"}
                  </button>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded bg-black/40">
                <div
                  className="h-full bg-[var(--accent)] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
