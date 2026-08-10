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

export type PollStorageMode = "redis" | "local-file";

export function cookieName(dateISO: string) {
  return `ca_poll_sides_${dateISO}`;
}

export function getPollStorageMode(): PollStorageMode {
  return redisConfigured() ? "redis" : "local-file";
}

/** Su Vercel serve Redis: altrimenti i voti non sono globali tra utenti/paesi. */
export function isGlobalPollStorageReady(): boolean {
  if (!process.env.VERCEL) return true;
  return redisConfigured();
}

function redisUrl() {
  let url = (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
  // Valori incollati con virgolette o senza https
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }
  if (url && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

function redisToken() {
  let token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }
  return token;
}

function redisConfigured() {
  return Boolean(redisUrl() && redisToken());
}

function dayRedisKey(dateISO: string) {
  return `calcioauto:poll:${dateISO}`;
}

async function redisCommand(command: (string | number)[]): Promise<unknown> {
  const url = redisUrl();
  const token = redisToken();
  if (!url || !token) {
    throw new Error("Redis non configurato");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Redis error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result ?? null;
}

function storeFilePath() {
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
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store), "utf8");
  await fs.rename(tmp, file);
}

function normalizeDay(day: DayVotes | undefined): DayVotes {
  const normalized: DayVotes = {};
  if (!day) return normalized;
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

async function getDayVotesFromRedis(dateISO: string): Promise<DayVotes> {
  // GET/SET JSON: funziona anche se il piano/token non permette comandi HASH.
  const raw = await redisCommand(["GET", dayRedisKey(dateISO)]);
  if (typeof raw !== "string" || !raw) return {};
  try {
    return normalizeDay(JSON.parse(raw) as DayVotes);
  } catch {
    return {};
  }
}

async function getDayVotesFromFile(dateISO: string): Promise<DayVotes> {
  const store = await readFileStore();
  return normalizeDay(store[dateISO]);
}

async function getDayVotes(dateISO: string): Promise<DayVotes> {
  if (redisConfigured()) {
    try {
      return await getDayVotesFromRedis(dateISO);
    } catch {
      // Non bloccare build/runtime se Redis è momentaneamente irraggiungibile.
      return {};
    }
  }
  return getDayVotesFromFile(dateISO);
}

async function addSideVote(
  dateISO: string,
  matchId: string,
  side: PollSide,
): Promise<void> {
  if (redisConfigured()) {
    const key = dayRedisKey(dateISO);
    const day: DayVotes = { ...(await getDayVotesFromRedis(dateISO)) };
    const current = { ...(day[matchId] ?? { home: 0, away: 0 }) };
    current[side] += 1;
    day[matchId] = current;
    try {
      await redisCommand(["SET", key, JSON.stringify(day)]);
      try {
        await redisCommand(["EXPIRE", key, 60 * 60 * 24 * 16]);
      } catch {
        // EXPIRE opzionale su alcuni token ristretti
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/NOPERM|no permissions/i.test(message)) {
        throw new Error(
          "Token Redis in sola lettura. Su Upstash copia il REST Token (non Read-Only) e aggiornalo su Vercel.",
        );
      }
      throw err;
    }
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Storage globale non configurato. Aggiungi UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN su Vercel.",
    );
  }

  const store = await readFileStore();
  const day: DayVotes = { ...normalizeDay(store[dateISO]) };
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
  | { ok: false; error: string; status?: number }
> {
  if (side !== "home" && side !== "away") {
    return { ok: false, error: "Scelta non valida." };
  }

  if (!isGlobalPollStorageReady()) {
    return {
      ok: false,
      status: 503,
      error:
        "Sondaggio globale non attivo: configura Upstash Redis su Vercel (UPSTASH_REDIS_REST_URL / TOKEN).",
    };
  }

  const preview = await buildPollState(votedMap);
  if (!preview.candidates.some((c) => c.id === matchId)) {
    return { ok: false, error: "Partita non in sondaggio." };
  }
  if (votedMap[matchId]) {
    return { ok: false, error: "Hai già votato questa partita oggi." };
  }

  try {
    await addSideVote(preview.dateISO, matchId, side);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore storage voti";
    return { ok: false, status: 503, error: message };
  }

  const nextVoted = { ...votedMap, [matchId]: side };
  const state = await buildPollState(nextVoted);

  return {
    ok: true,
    state,
    cookieKey: cookieName(preview.dateISO),
    cookieValue: JSON.stringify(nextVoted),
  };
}
