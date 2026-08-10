import { cookies } from "next/headers";
import { getTodaysMatches } from "@/lib/football-api";
import type { PollCandidate, PollState } from "@/lib/poll-types";

type Store = {
  dateISO: string;
  votes: Record<string, number>;
};

declare global {
  // eslint-disable-next-line no-var
  var __calcioautoPollStore: Store | undefined;
}

function cookieName(dateISO: string) {
  return `ca_poll_${dateISO}`;
}

function getStore(dateISO: string): Store {
  const current = globalThis.__calcioautoPollStore;
  if (!current || current.dateISO !== dateISO) {
    globalThis.__calcioautoPollStore = { dateISO, votes: {} };
  }
  return globalThis.__calcioautoPollStore!;
}

export async function buildPollState(): Promise<PollState> {
  const today = await getTodaysMatches();
  const store = getStore(today.dateISO);
  const jar = await cookies();
  const votedId = jar.get(cookieName(today.dateISO))?.value ?? null;

  const byTeam = new Map<
    string,
    { name: string; crest: string | null; leagueName: string }
  >();

  for (const match of today.matches) {
    const homeId = String(match.homeTeamId);
    const awayId = String(match.awayTeamId);
    if (!byTeam.has(homeId)) {
      byTeam.set(homeId, {
        name: match.homeTeam,
        crest: match.homeCrest,
        leagueName: match.leagueName,
      });
    }
    if (!byTeam.has(awayId)) {
      byTeam.set(awayId, {
        name: match.awayTeam,
        crest: match.awayCrest,
        leagueName: match.leagueName,
      });
    }
  }

  const candidates: PollCandidate[] = [...byTeam.entries()]
    .map(([id, meta]) => ({
      id,
      name: meta.name,
      crest: meta.crest,
      leagueName: meta.leagueName,
      votes: store.votes[id] ?? 0,
    }))
    .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, "it"));

  return {
    dateISO: today.dateISO,
    title: `Miglior squadra di oggi · ${today.dateLabel}`,
    candidates,
    totalVotes: candidates.reduce((sum, c) => sum + c.votes, 0),
    votedId,
  };
}

export async function castPollVote(
  teamId: string,
): Promise<{ ok: true; state: PollState } | { ok: false; error: string }> {
  const state = await buildPollState();
  if (!state.candidates.length) {
    return { ok: false, error: "Nessuna partita oggi: sondaggio chiuso." };
  }
  if (!state.candidates.some((c) => c.id === teamId)) {
    return { ok: false, error: "Squadra non valida per la giornata." };
  }
  if (state.votedId) {
    return { ok: false, error: "Hai già votato oggi su questo dispositivo." };
  }

  const store = getStore(state.dateISO);
  store.votes[teamId] = (store.votes[teamId] ?? 0) + 1;

  const jar = await cookies();
  jar.set(cookieName(state.dateISO), teamId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 36,
  });

  return { ok: true, state: await buildPollState() };
}
