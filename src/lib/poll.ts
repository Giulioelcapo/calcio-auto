import { promises as fs } from "fs";
import path from "path";
import { getPollMatchPool } from "@/lib/football-api";
import type { TodayMatch } from "@/lib/types";
import type {
  PollCandidate,
  PollMatchVotes,
  PollSide,
  PollState,
} from "@/lib/poll-types";

type DayVotes = Record<string, PollMatchVotes>;
type FileStore = Record<string, DayVotes>;
type VotedMap = Record<string, PollSide>;

const FEATURED_COUNT = 4;

export function cookieName(dateISO: string) {
  return `ca_poll_sides_${dateISO}`;
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
  const day = store[dateISO] ?? {};
  const normalized: DayVotes = {};
  for (const [matchId, value] of Object.entries(day)) {
    if (value && typeof value === "object" && "home" in value) {
      normalized[matchId] = {
        home: Number(value.home) || 0,
        away: Number(value.away) || 0,
      };
    }
  }
  return normalized;
}

async function addSideVote(
  dateISO: string,
  matchId: string,
  side: PollSide,
): Promise<void> {
  const store = await readFileStore();
  const day: DayVotes = { ...(await getDayVotes(dateISO)) };
  const current = day[matchId] ?? { home: 0, away: 0 };
  current[side] += 1;
  day[matchId] = current;
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

function toCandidate(
  match: TodayMatch,
  votes: PollMatchVotes,
  votedSide: PollSide | null,
): PollCandidate {
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
    votedSide,
  };
}

export function parseVotedMap(raw: string | undefined): VotedMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as VotedMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function buildPollState(
  votedMap: VotedMap = {},
): Promise<PollState> {
  const pool = await getPollMatchPool();
  const votes = await getDayVotes(pool.dateISO);
  const featured = pickDailyMatches(pool.matches, pool.dateISO);
  const candidates = featured.map((m) => {
    const id = String(m.id);
    return toCandidate(
      m,
      votes[id] ?? { home: 0, away: 0 },
      votedMap[id] ?? null,
    );
  });

  const totalVotes = candidates.reduce(
    (sum, c) => sum + c.votes.home + c.votes.away,
    0,
  );

  return {
    dateISO: pool.dateISO,
    title:
      pool.mode === "today"
        ? `Chi merita di più? · ${pool.dateLabel}`
        : `Chi merita di più? · prossimi match · ${pool.dateLabel}`,
    candidates,
    totalVotes,
  };
}

export async function castPollVote(
  matchId: string,
  side: PollSide,
  votedMap: VotedMap,
): Promise<
  | {
      ok: true;
      state: PollState;
      cookieKey: string;
      cookieValue: string;
    }
  | { ok: false; error: string }
> {
  if (side !== "home" && side !== "away") {
    return { ok: false, error: "Scelta non valida." };
  }

  const preview = await buildPollState(votedMap);
  if (!preview.candidates.some((c) => c.id === matchId)) {
    return { ok: false, error: "Partita non in sondaggio." };
  }
  if (votedMap[matchId]) {
    return { ok: false, error: "Hai già votato questa partita oggi." };
  }

  await addSideVote(preview.dateISO, matchId, side);
  const nextVoted = { ...votedMap, [matchId]: side };
  const state = await buildPollState(nextVoted);

  return {
    ok: true,
    state,
    cookieKey: cookieName(preview.dateISO),
    cookieValue: JSON.stringify(nextVoted),
  };
}
