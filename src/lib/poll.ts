import { cookies } from "next/headers";
import { getTodaysMatches } from "@/lib/football-api";
import type { TodayMatch } from "@/lib/types";
import type { PollCandidate, PollState } from "@/lib/poll-types";

type Store = {
  dateISO: string;
  votes: Record<string, number>;
};

declare global {
  // eslint-disable-next-line no-var
  var __calcioautoPollStore: Store | undefined;
}

const FEATURED_COUNT = 4;

function cookieName(dateISO: string) {
  return `ca_poll_match_${dateISO}`;
}

function getStore(dateISO: string): Store {
  const current = globalThis.__calcioautoPollStore;
  if (!current || current.dateISO !== dateISO) {
    globalThis.__calcioautoPollStore = { dateISO, votes: {} };
  }
  return globalThis.__calcioautoPollStore!;
}

/** Shuffle stabile per giorno: stesse partite per tutti oggi. */
function pickDailyMatches(matches: TodayMatch[], dateISO: string): TodayMatch[] {
  if (!matches.length) return [];
  let seed = 0;
  for (let i = 0; i < dateISO.length; i++) seed = (seed * 31 + dateISO.charCodeAt(i)) >>> 0;
  const arr = [...matches];
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(FEATURED_COUNT, arr.length));
}

function toCandidate(match: TodayMatch, votes: number): PollCandidate {
  return {
    id: String(match.id),
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeCrest: match.homeCrest,
    awayCrest: match.awayCrest,
    leagueName: match.leagueName,
    kickoff: match.utcDate,
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    votes,
  };
}

export async function buildPollState(): Promise<PollState> {
  const today = await getTodaysMatches();
  const store = getStore(today.dateISO);
  const jar = await cookies();
  const votedId = jar.get(cookieName(today.dateISO))?.value ?? null;

  const featured = pickDailyMatches(today.matches, today.dateISO);
  const candidates = featured
    .map((m) => toCandidate(m, store.votes[String(m.id)] ?? 0))
    .sort((a, b) => b.votes - a.votes || a.homeTeam.localeCompare(b.homeTeam, "it"));

  return {
    dateISO: today.dateISO,
    title: `Partita della giornata · ${today.dateLabel}`,
    candidates,
    totalVotes: candidates.reduce((sum, c) => sum + c.votes, 0),
    votedId,
  };
}

export async function castPollVote(
  matchId: string,
): Promise<{ ok: true; state: PollState } | { ok: false; error: string }> {
  const state = await buildPollState();
  if (!state.candidates.length) {
    return { ok: false, error: "Nessuna partita oggi: sondaggio chiuso." };
  }
  if (!state.candidates.some((c) => c.id === matchId)) {
    return { ok: false, error: "Partita non in sondaggio oggi." };
  }
  if (state.votedId) {
    return { ok: false, error: "Hai già votato oggi su questo dispositivo." };
  }

  const store = getStore(state.dateISO);
  store.votes[matchId] = (store.votes[matchId] ?? 0) + 1;

  const jar = await cookies();
  jar.set(cookieName(state.dateISO), matchId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 36,
  });

  return { ok: true, state: await buildPollState() };
}
