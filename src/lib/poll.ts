import { promises as fs } from "fs";
import path from "path";
import { getPollMatchPool } from "@/lib/football-api";
import type { TodayMatch } from "@/lib/types";
import type { PollCandidate, PollState } from "@/lib/poll-types";

type DayVotes = Record<string, number>;
type FileStore = Record<string, DayVotes>;

const FEATURED_COUNT = 4;

export function cookieName(dateISO: string) {
  return `ca_poll_match_${dateISO}`;
}

function storeFilePath() {
  if (process.env.VERCEL) return "/tmp/calcioauto-poll-votes.json";
  return path.join(process.cwd(), "data", "poll-votes.json");
}

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await fs.readFile(storeFilePath(), "utf8");
    const parsed = JSON.parse(raw) as FileStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeFileStore(store: FileStore): Promise<void> {
  const file = storeFilePath();
  if (!process.env.VERCEL) {
    await fs.mkdir(path.dirname(file), { recursive: true });
  }
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store), "utf8");
  await fs.rename(tmp, file);
}

async function getDayVotes(dateISO: string): Promise<DayVotes> {
  const store = await readFileStore();
  return { ...(store[dateISO] ?? {}) };
}

async function addVote(dateISO: string, matchId: string): Promise<void> {
  const store = await readFileStore();
  const day = { ...(store[dateISO] ?? {}) };
  day[matchId] = (day[matchId] ?? 0) + 1;
  store[dateISO] = day;
  const keys = Object.keys(store).sort();
  while (keys.length > 14) {
    const old = keys.shift();
    if (old) delete store[old];
  }
  await writeFileStore(store);
}

function pickDailyMatches(matches: TodayMatch[], dateISO: string): TodayMatch[] {
  if (!matches.length) return [];
  let seed = 0;
  for (let i = 0; i < dateISO.length; i++) {
    seed = (seed * 31 + dateISO.charCodeAt(i)) >>> 0;
  }
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

export async function buildPollState(
  votedId: string | null = null,
): Promise<PollState> {
  const pool = await getPollMatchPool();
  const votes = await getDayVotes(pool.dateISO);
  const featured = pickDailyMatches(pool.matches, pool.dateISO);
  const candidates = featured
    .map((m) => toCandidate(m, votes[String(m.id)] ?? 0))
    .sort(
      (a, b) => b.votes - a.votes || a.homeTeam.localeCompare(b.homeTeam, "it"),
    );

  return {
    dateISO: pool.dateISO,
    title:
      pool.mode === "today"
        ? `Partita della giornata · ${pool.dateLabel}`
        : `Partita in evidenza · prossimi match · ${pool.dateLabel}`,
    candidates,
    totalVotes: candidates.reduce((sum, c) => sum + c.votes, 0),
    votedId,
  };
}

export async function castPollVote(
  matchId: string,
  alreadyVotedId: string | null,
): Promise<
  | { ok: true; state: PollState; cookieKey: string; cookieValue: string }
  | { ok: false; error: string }
> {
  const preview = await buildPollState(alreadyVotedId);
  if (!preview.candidates.length) {
    return { ok: false, error: "Nessuna partita disponibile per votare." };
  }
  if (!preview.candidates.some((c) => c.id === matchId)) {
    return { ok: false, error: "Partita non in sondaggio." };
  }
  if (alreadyVotedId) {
    return { ok: false, error: "Hai già votato oggi su questo dispositivo." };
  }

  await addVote(preview.dateISO, matchId);
  const state = await buildPollState(matchId);
  return {
    ok: true,
    state,
    cookieKey: cookieName(preview.dateISO),
    cookieValue: matchId,
  };
}
