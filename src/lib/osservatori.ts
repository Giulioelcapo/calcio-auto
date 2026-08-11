import type { ScorerRow, StandingRow } from "./types";

export type ScoutCategory =
  | "hot"
  | "gem"
  | "creator"
  | "clinical"
  | "breakout";

export type ScoutPlayer = {
  id: string;
  playerName: string;
  teamName: string;
  teamId: number;
  teamCrest: string | null;
  leagueName: string;
  leagueSlug: string;
  category: ScoutCategory;
  categoryLabel: string;
  scoutScore: number;
  /** KPI free football-data + derivati */
  kpis: {
    goals: number;
    assists: number;
    penalties: number;
    played: number;
    openPlayGoals: number;
    goalInvolvements: number;
    goalsPerGame: number;
    assistsPerGame: number;
    involvementsPerGame: number;
    penaltyShare: number | null;
    teamPosition: number | null;
    rank: number;
  };
};

export type ClubRadar = {
  id: string;
  teamName: string;
  teamId: number;
  crest: string | null;
  leagueName: string;
  leagueSlug: string;
  focus: string;
  score: number;
  /** KPI free classifica + indici derivati */
  kpis: {
    position: number;
    played: number;
    won: number;
    draw: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
    points: number;
    form: string | null;
    formScore: number;
    ppg: number;
    gfPerGame: number;
    gaPerGame: number;
    attackIndex: number;
    defenseIndex: number;
  };
};

export type OsservatoriReport = {
  players: ScoutPlayer[];
  clubs: ClubRadar[];
  generatedAt: string;
  hasPlayers: boolean;
};

type PlayerInput = ScorerRow & {
  leagueName: string;
  leagueSlug: string;
  teamPosition: number | null;
  teamPlayed: number;
};

const CATEGORY_LABEL: Record<ScoutCategory, string> = {
  hot: "Hot",
  gem: "Gem",
  creator: "Creator",
  clinical: "Clinical",
  breakout: "Breakout",
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function parseFormScore(form: string | null): number {
  if (!form) return 50;
  const chars = form.toUpperCase().replace(/[^WDL]/g, "").split("");
  if (!chars.length) return 50;
  const raw =
    chars.reduce((acc, c) => {
      if (c === "W") return acc + 1;
      if (c === "D") return acc + 0.4;
      return acc;
    }, 0) / chars.length;
  return Math.round(raw * 100);
}

export function computeScoutScore(input: PlayerInput): {
  score: number;
  category: ScoutCategory;
} {
  const played = Math.max(1, input.playedMatches ?? input.teamPlayed ?? 1);
  const goals = input.goals;
  const assists = input.assists ?? 0;
  const pens = input.penalties ?? 0;
  const gpg = goals / played;
  const apg = assists / played;
  const openPlayShare = goals > 0 ? (goals - Math.min(pens, goals)) / goals : 1;
  const pos = input.teamPosition ?? 10;

  const volume = clamp(goals * 8);
  const efficiency = clamp(gpg * 55);
  const creation = clamp(apg * 70 + assists * 4);
  const context = clamp(35 + (pos - 1) * 3);
  const purity = clamp(openPlayShare * 100);

  const ranked = (
    [
      {
        category: "hot" as const,
        score: volume * 0.35 + efficiency * 0.45 + creation * 0.2,
      },
      {
        category: "gem" as const,
        score: efficiency * 0.35 + context * 0.4 + purity * 0.25,
      },
      {
        category: "creator" as const,
        score: creation * 0.55 + volume * 0.2 + efficiency * 0.25,
      },
      {
        category: "clinical" as const,
        score: efficiency * 0.5 + purity * 0.35 + volume * 0.15,
      },
      {
        category: "breakout" as const,
        score:
          efficiency * 0.4 + volume * 0.25 + context * 0.2 + creation * 0.15,
      },
    ] satisfies Array<{ category: ScoutCategory; score: number }>
  ).sort((a, b) => b.score - a.score);

  return {
    score: Math.round(clamp(ranked[0].score)),
    category: ranked[0].category,
  };
}

export function buildScoutPlayers(
  rows: PlayerInput[],
  limit = 8,
): ScoutPlayer[] {
  const seen = new Set<string>();
  const picks: ScoutPlayer[] = [];

  for (const row of rows) {
    if (row.goals <= 0) continue;
    const key = `${row.leagueSlug}:${row.playerName}:${row.teamId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const played = Math.max(1, row.playedMatches ?? row.teamPlayed ?? 1);
    const goals = row.goals;
    const assists = row.assists ?? 0;
    const penalties = row.penalties ?? 0;
    const openPlayGoals = Math.max(0, goals - penalties);
    const goalInvolvements = goals + assists;
    const { score, category } = computeScoutScore(row);

    picks.push({
      id: key,
      playerName: row.playerName,
      teamName: row.teamName,
      teamId: row.teamId,
      teamCrest: row.teamCrest,
      leagueName: row.leagueName,
      leagueSlug: row.leagueSlug,
      category,
      categoryLabel: CATEGORY_LABEL[category],
      scoutScore: score,
      kpis: {
        goals,
        assists,
        penalties,
        played,
        openPlayGoals,
        goalInvolvements,
        goalsPerGame: Number((goals / played).toFixed(2)),
        assistsPerGame: Number((assists / played).toFixed(2)),
        involvementsPerGame: Number((goalInvolvements / played).toFixed(2)),
        penaltyShare:
          goals > 0 ? Number(((penalties / goals) * 100).toFixed(0)) : null,
        teamPosition: row.teamPosition,
        rank: row.rank,
      },
    });
  }

  return picks.sort((a, b) => b.scoutScore - a.scoutScore).slice(0, limit);
}

export function buildClubRadar(
  entries: Array<{
    leagueName: string;
    leagueSlug: string;
    standings: StandingRow[];
  }>,
  limit = 6,
): ClubRadar[] {
  const clubs: ClubRadar[] = [];

  for (const entry of entries) {
    if (!entry.standings.length) continue;
    const leagueGf =
      entry.standings.reduce(
        (a, r) => a + r.goalsFor / Math.max(1, r.playedGames),
        0,
      ) / entry.standings.length;
    const leagueGa =
      entry.standings.reduce(
        (a, r) => a + r.goalsAgainst / Math.max(1, r.playedGames),
        0,
      ) / entry.standings.length;

    for (const row of entry.standings) {
      const played = Math.max(1, row.playedGames);
      const gfRate = row.goalsFor / played;
      const gaRate = row.goalsAgainst / played;
      const formScore = parseFormScore(row.form);
      const attackIndex =
        row.playedGames > 0
          ? Math.round((gfRate / Math.max(0.1, leagueGf)) * 100)
          : 50;
      const defenseIndex =
        row.playedGames > 0
          ? Math.round(
              (Math.max(0.1, leagueGa) / Math.max(0.1, gaRate)) * 100,
            )
          : 50;
      const ppg = row.playedGames > 0 ? row.points / played : 0;
      const score =
        row.playedGames > 0
          ? Math.round(
              clamp(
                attackIndex * 0.35 +
                  defenseIndex * 0.25 +
                  formScore * 0.25 +
                  ppg * 15,
              ),
            )
          : clamp(100 - (row.position - 1) * 4);

      let focus = "Balance";
      if (row.playedGames <= 0) {
        focus = row.position <= 6 ? "Top" : "Watch";
      } else if (attackIndex >= 120 && formScore >= 60) {
        focus = "Attack";
      } else if (defenseIndex >= 120) {
        focus = "Defense";
      } else if (formScore >= 75) {
        focus = "Form";
      } else if (row.position >= 12 && attackIndex >= 100) {
        focus = "Gem club";
      }

      clubs.push({
        id: `${entry.leagueSlug}:${row.teamId}`,
        teamName: row.teamName,
        teamId: row.teamId,
        crest: row.crest,
        leagueName: entry.leagueName,
        leagueSlug: entry.leagueSlug,
        focus,
        score,
        kpis: {
          position: row.position,
          played: row.playedGames,
          won: row.won,
          draw: row.draw,
          lost: row.lost,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          goalDiff: row.goalDifference,
          points: row.points,
          form: row.form,
          formScore,
          ppg: Number(ppg.toFixed(2)),
          gfPerGame: Number(gfRate.toFixed(2)),
          gaPerGame: Number(gaRate.toFixed(2)),
          attackIndex,
          defenseIndex,
        },
      });
    }
  }

  return clubs.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function assembleOsservatoriReport(input: {
  scorers: PlayerInput[];
  clubs: Array<{
    leagueName: string;
    leagueSlug: string;
    standings: StandingRow[];
  }>;
}): OsservatoriReport {
  const players = buildScoutPlayers(input.scorers, 9);
  const clubs = buildClubRadar(input.clubs, players.length ? 3 : 6);
  return {
    players,
    clubs,
    generatedAt: new Date().toISOString(),
    hasPlayers: players.length > 0,
  };
}
