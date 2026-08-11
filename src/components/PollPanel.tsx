"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Crest } from "@/components/Crest";
import type { PollCandidate, PollSide, PollState } from "@/lib/poll-types";

type PollApiState = PollState & {
  storage?: "redis" | "local-file";
  globalReady?: boolean;
};

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
  side: PollSide | "tie";
  name: string;
  crest: string | null;
  percent: number;
  votes: number;
  total: number;
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
      total,
    };
  }
  const homeWins = c.votes.home > c.votes.away;
  return {
    side: homeWins ? "home" : "away",
    name: homeWins ? c.homeTeam : c.awayTeam,
    crest: homeWins ? c.homeCrest : c.awayCrest,
    percent: pct(homeWins ? c.votes.home : c.votes.away, total),
    votes: homeWins ? c.votes.home : c.votes.away,
    total,
  };
}

function WinnersBoard({
  winners,
  highlight,
  boardRef,
}: {
  winners: Array<{
    match: PollCandidate;
    leader: NonNullable<ReturnType<typeof matchLeader>>;
  }>;
  highlight: boolean;
  boardRef: RefObject<HTMLElement | null>;
}) {
  return (
    <section
      ref={boardRef}
      className={`panel space-y-3 rounded-md p-4 ${
        highlight ? "ring-1 ring-[var(--accent)]" : ""
      }`}
    >
      <div className="flex items-end justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--accent)]">
          Vincitori del sondaggio
        </h3>
        <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
          {winners.length ? "Community live" : "In attesa dei voti"}
        </span>
      </div>

      {winners.length ? (
        <ol className="space-y-2">
          {winners.map(({ match, leader }, index) => (
            <li
              key={match.id}
              className="flex items-center justify-between gap-3 rounded border border-[var(--line)] bg-black/20 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="data-font w-5 text-[var(--accent)]">
                  #{index + 1}
                </span>
                {leader.crest ? (
                  <Crest src={leader.crest} alt={leader.name} size={28} />
                ) : null}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {leader.side === "tie" ? "Pareggio" : leader.name}
                  </div>
                  <div className="truncate text-[10px] text-[var(--muted)]">
                    {match.homeTeam} vs {match.awayTeam}
                  </div>
                </div>
              </div>
              <div className="data-font shrink-0 text-right">
                <div className="text-lg font-bold text-[var(--accent)]">
                  {leader.percent}%
                </div>
                <div className="text-[10px] text-[var(--muted)]">
                  {leader.total} voti
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Ancora nessun voto. Chiunque nel mondo può votare: i totali si
          aggiornano qui in live.
        </p>
      )}
    </section>
  );
}

export function PollPanel({
  initial,
  compact = false,
}: {
  initial: PollState;
  compact?: boolean;
}) {
  const [state, setState] = useState<PollApiState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [justVoted, setJustVoted] = useState(false);
  const winnersRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setState(initial);
  }, [initial]);

  // Aggiorna i % se qualcuno vota da un altro paese.
  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch("/api/sondaggio", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as PollApiState;
        if (cancelled) return;
        setState((prev) => {
          const locked = new Map(
            prev.candidates.map((c) => [c.id, c.votedSide] as const),
          );
          return {
            ...data,
            candidates: data.candidates.map((c) => ({
              ...c,
              votedSide: locked.get(c.id) ?? c.votedSide,
            })),
          };
        });
      } catch {
        /* ignore transient network errors */
      }
    }

    const id = window.setInterval(() => void refresh(), 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const winners = useMemo(() => {
    return state.candidates
      .map((c) => {
        const leader = matchLeader(c);
        if (!leader) return null;
        return { match: c, leader };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          (b?.leader.percent ?? 0) - (a?.leader.percent ?? 0) ||
          (b?.leader.total ?? 0) - (a?.leader.total ?? 0),
      ) as Array<{
      match: PollCandidate;
      leader: NonNullable<ReturnType<typeof matchLeader>>;
    }>;
  }, [state.candidates]);

  const votedCount = state.candidates.filter((c) => c.votedSide).length;
  const showWinnersFirst = winners.length > 0;

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
      setState(data as PollApiState);
      setJustVoted(true);
      window.setTimeout(() => {
        winnersRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 80);
    } catch {
      setError("Errore di rete");
    } finally {
      setPendingId(null);
    }
  }

  if (!state.candidates.length) {
    return (
      <p className="panel rounded-md p-4 text-sm text-[var(--muted)]">
        Nessuna partita disponibile. Riprova tra poco.
      </p>
    );
  }

  const board = (
    <WinnersBoard
      winners={winners}
      highlight={justVoted}
      boardRef={winnersRef}
    />
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Voti globali: Italia, Germania o ovunque — stesso totale, aggiornato in
        live.
        {votedCount
          ? ` Voti dati: ${votedCount}/${state.candidates.length}.`
          : ""}
      </p>
      {state.globalReady === false ? (
        <p className="text-sm text-[var(--warn)]">
          Storage globale non attivo su questo deploy. Serve Upstash Redis.
        </p>
      ) : null}
      {error ? <p className="text-sm text-[var(--warn)]">{error}</p> : null}

      {showWinnersFirst ? board : null}

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
                <span>{formatKickoff(c.kickoff)}</span>
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
                        {total ? `${homePct}%` : "—"} · {c.votes.home}
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
                        {total ? `${awayPct}%` : "—"} · {c.votes.away}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex h-2 overflow-hidden rounded bg-black/40">
                <div
                  className="h-full bg-[var(--accent)] transition-all"
                  style={{ width: `${total ? homePct : 50}%` }}
                />
                <div
                  className="h-full bg-[var(--pitch)] transition-all"
                  style={{ width: `${total ? awayPct : 50}%` }}
                />
              </div>

              <div className="text-center text-[11px] text-[var(--muted)]">
                {locked
                  ? `Hai votato: ${c.votedSide === "home" ? c.homeTeam : c.awayTeam}`
                  : "Tocca una delle due squadre"}
                {leader && leader.side !== "tie"
                  ? ` · Vince il poll: ${leader.name} ${leader.percent}%`
                  : ""}
                {leader?.side === "tie" ? " · Pareggio nei voti" : ""}
              </div>
            </article>
          );
        })}
      </div>

      {!showWinnersFirst ? board : null}
    </div>
  );
}
