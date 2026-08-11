import type { MatchItem, StandingRow } from "./types";

export type FormStreak = {
  teamId: number;
  teamName: string;
  crest: string | null;
  type: "W" | "D" | "L";
  length: number;
  form: string;
  position: number;
  points: number;
};

export type FixtureDifficulty = {
  matchId: number;
  utcDate: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  homeId: number;
  awayId: number;
  focusTeamId: number;
  focusTeam: string;
  opponent: string;
  opponentPosition: number | null;
  difficulty: number;
  homeAway: "H" | "A";
  matchday: number | null;
};

export type HeadToHeadSummary = {
  teamAId: number;
  teamBId: number;
  teamAName: string;
  teamBName: string;
  played: number;
  aWins: number;
  bWins: number;
  draws: number;
  aGoals: number;
  bGoals: number;
  recent: MatchItem[];
};

export type NextMatchdayInfo = {
  matchday: number;
  kickoffFirst: string | null;
  matchCount: number;
  hoursToFirst: number | null;
};

/** Streak corrente dalla stringa forma (es. WWDLW → W×1). */
export function currentStreak(form: string | null): {
  type: "W" | "D" | "L";
  length: number;
} | null {
  if (!form) return null;
  const chars = form
    .toUpperCase()
    .replace(/[^WDL]/g, "")
    .split("");
  if (!chars.length) return null;
  // football-data form: leftmost = most recent
  const first = chars[0] as "W" | "D" | "L";
  let length = 1;
  for (let i = 1; i < chars.length; i++) {
    if (chars[i] !== first) break;
    length += 1;
  }
  return { type: first, length };
}

export function buildFormStreaks(
  standings: StandingRow[],
  opts?: { minLength?: number; limit?: number },
): FormStreak[] {
  const minLength = opts?.minLength ?? 2;
  const limit = opts?.limit ?? 8;
  const out: FormStreak[] = [];

  for (const row of standings) {
    const streak = currentStreak(row.form);
    if (!streak || streak.length < minLength) continue;
    out.push({
      teamId: row.teamId,
      teamName: row.teamName,
      crest: row.crest,
      type: streak.type,
      length: streak.length,
      form: row.form ?? "",
      position: row.position,
      points: row.points,
    });
  }

  return out
    .sort(
      (a, b) =>
        b.length - a.length ||
        (a.type === "W" ? 0 : 1) - (b.type === "W" ? 0 : 1) ||
        a.position - b.position,
    )
    .slice(0, limit);
}

function positionMap(standings: StandingRow[]) {
  return new Map(standings.map((s) => [s.teamId, s.position]));
}

/** Difficoltà 1–20 ≈ posizione avversario (più alto = più duro). */
export function buildFixtureDifficulties(
  upcoming: MatchItem[],
  standings: StandingRow[],
  opts?: { limit?: number },
): FixtureDifficulty[] {
  const pos = positionMap(standings);
  const limit = opts?.limit ?? 10;
  const rows: FixtureDifficulty[] = [];

  for (const m of upcoming) {
    if (m.status === "FINISHED" || m.status === "AWARDED") continue;
    const homePos = pos.get(m.homeTeamId) ?? null;
    const awayPos = pos.get(m.awayTeamId) ?? null;

    // due prospettive: casa vs trasferta
    for (const side of ["home", "away"] as const) {
      const focusTeamId = side === "home" ? m.homeTeamId : m.awayTeamId;
      const focusTeam = side === "home" ? m.homeTeam : m.awayTeam;
      const opponent = side === "home" ? m.awayTeam : m.homeTeam;
      const opponentPosition = side === "home" ? awayPos : homePos;
      const difficulty = opponentPosition ?? 10;
      rows.push({
        matchId: m.id,
        utcDate: m.utcDate,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeCrest: m.homeCrest,
        awayCrest: m.awayCrest,
        homeId: m.homeTeamId,
        awayId: m.awayTeamId,
        focusTeamId,
        focusTeam,
        opponent,
        opponentPosition,
        difficulty,
        homeAway: side === "home" ? "H" : "A",
        matchday: m.matchday,
      });
    }
  }

  // Una riga per match: la prospettiva della squadra con calendario più duro
  const byMatch = new Map<number, FixtureDifficulty>();
  for (const row of rows) {
    const prev = byMatch.get(row.matchId);
    // difficoltà invertita: avversario alto in classifica (pos bassa) = più duro
    const hardScore = row.opponentPosition == null ? 10 : 21 - row.opponentPosition;
    const prevHard =
      prev?.opponentPosition == null ? 10 : 21 - (prev.opponentPosition ?? 10);
    if (!prev || hardScore > prevHard) byMatch.set(row.matchId, row);
  }

  return [...byMatch.values()]
    .map((r) => ({
      ...r,
      difficulty:
        r.opponentPosition == null ? 10 : 21 - r.opponentPosition,
    }))
    .sort((a, b) => b.difficulty - a.difficulty || a.utcDate.localeCompare(b.utcDate))
    .slice(0, limit);
}

export function buildHeadToHead(
  matches: MatchItem[],
  teamAId: number,
  teamBId: number,
): HeadToHeadSummary | null {
  const duo = matches
    .filter(
      (m) =>
        (m.homeTeamId === teamAId && m.awayTeamId === teamBId) ||
        (m.homeTeamId === teamBId && m.awayTeamId === teamAId),
    )
    .filter((m) => m.status === "FINISHED" || m.status === "AWARDED")
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate));

  if (!duo.length) return null;

  let aWins = 0;
  let bWins = 0;
  let draws = 0;
  let aGoals = 0;
  let bGoals = 0;
  let teamAName = "";
  let teamBName = "";

  for (const m of duo) {
    const aIsHome = m.homeTeamId === teamAId;
    teamAName = aIsHome ? m.homeTeam : m.awayTeam;
    teamBName = aIsHome ? m.awayTeam : m.homeTeam;
    const aG = aIsHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
    const bG = aIsHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
    aGoals += aG;
    bGoals += bG;
    if (aG > bG) aWins += 1;
    else if (bG > aG) bWins += 1;
    else draws += 1;
  }

  return {
    teamAId,
    teamBId,
    teamAName,
    teamBName,
    played: duo.length,
    aWins,
    bWins,
    draws,
    aGoals,
    bGoals,
    recent: duo.slice(0, 6),
  };
}

export function nextMatchdayInfo(
  matches: MatchItem[],
  now = Date.now(),
): NextMatchdayInfo | null {
  const upcoming = matches
    .filter(
      (m) =>
        m.status !== "FINISHED" &&
        m.status !== "AWARDED" &&
        m.matchday != null &&
        Date.parse(m.utcDate) >= now - 3 * 3600_000,
    )
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));

  if (!upcoming.length) return null;
  const matchday = upcoming[0].matchday!;
  const same = upcoming.filter((m) => m.matchday === matchday);
  const kickoffFirst = same[0]?.utcDate ?? null;
  const hoursToFirst = kickoffFirst
    ? Math.max(0, (Date.parse(kickoffFirst) - now) / 3600_000)
    : null;

  return {
    matchday,
    kickoffFirst,
    matchCount: same.length,
    hoursToFirst:
      hoursToFirst == null ? null : Number(hoursToFirst.toFixed(1)),
  };
}

/** Difficoltà media prossimi N match per squadra. */
export function teamUpcomingDifficulty(
  teamId: number,
  upcoming: MatchItem[],
  standings: StandingRow[],
  n = 5,
): { avg: number; next: FixtureDifficulty[] } {
  const pos = positionMap(standings);
  const mine = upcoming
    .filter(
      (m) =>
        (m.homeTeamId === teamId || m.awayTeamId === teamId) &&
        m.status !== "FINISHED" &&
        m.status !== "AWARDED",
    )
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
    .slice(0, n);

  const next: FixtureDifficulty[] = mine.map((m) => {
    const home = m.homeTeamId === teamId;
    const opponentId = home ? m.awayTeamId : m.homeTeamId;
    const opponentPosition = pos.get(opponentId) ?? null;
    return {
      matchId: m.id,
      utcDate: m.utcDate,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeCrest: m.homeCrest,
      awayCrest: m.awayCrest,
      homeId: m.homeTeamId,
      awayId: m.awayTeamId,
      focusTeamId: teamId,
      focusTeam: home ? m.homeTeam : m.awayTeam,
      opponent: home ? m.awayTeam : m.homeTeam,
      opponentPosition,
      difficulty:
        opponentPosition == null ? 10 : 21 - opponentPosition,
      homeAway: home ? "H" : "A",
      matchday: m.matchday,
    };
  });

  const avg = next.length
    ? Number(
        (
          next.reduce((a, r) => a + r.difficulty, 0) / next.length
        ).toFixed(1),
      )
    : 0;

  return { avg, next };
}
