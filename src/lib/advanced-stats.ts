import type { MatchItem, StandingRow } from "./types";

export interface AdvancedTeamStats {
  teamId: number;
  teamName: string;
  crest: string | null;
  played: number;
  points: number;
  ppg: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  gfPerGame: number;
  gaPerGame: number;
  /** Expected goals stimati (modello editoriale, non Opta) */
  xg: number;
  xga: number;
  xgd: number;
  attackIndex: number;
  defenseIndex: number;
  formScore: number;
  form: string | null;
  over25Rate: number | null;
}

function parseForm(form: string | null): number {
  if (!form) return 0.5;
  const chars = form.toUpperCase().replace(/[^WDL]/g, "").split("");
  if (!chars.length) return 0.5;
  const score = chars.reduce((acc, c) => {
    if (c === "W") return acc + 1;
    if (c === "D") return acc + 0.4;
    return acc;
  }, 0);
  return score / chars.length;
}

/**
 * xG/xGA editoriali da GF/GA + forma.
 * Non sono Opta/StatsBomb: ranking relativo per SEO e insight.
 */
export function estimateXg(row: StandingRow): { xg: number; xga: number } {
  const played = Math.max(1, row.playedGames);
  const form = parseForm(row.form);
  const gfRate = row.goalsFor / played;
  const gaRate = row.goalsAgainst / played;
  const xg = Number((gfRate * (0.85 + form * 0.3) * played).toFixed(2));
  const xga = Number((gaRate * (1.15 - form * 0.25) * played).toFixed(2));
  return { xg, xga };
}

export function buildAdvancedStats(
  standings: StandingRow[],
  matches: MatchItem[] = [],
): AdvancedTeamStats[] {
  if (!standings.length) return [];

  const leagueGfAvg =
    standings.reduce((a, r) => a + r.goalsFor / Math.max(1, r.playedGames), 0) /
    standings.length;
  const leagueGaAvg =
    standings.reduce(
      (a, r) => a + r.goalsAgainst / Math.max(1, r.playedGames),
      0,
    ) / standings.length;

  const overByTeam = new Map<number, { games: number; overs: number }>();
  for (const m of matches) {
    if (m.status !== "FINISHED" && m.status !== "AWARDED") continue;
    if (m.homeScore == null || m.awayScore == null) continue;
    const over = m.homeScore + m.awayScore >= 3 ? 1 : 0;
    for (const id of [m.homeTeamId, m.awayTeamId]) {
      const cur = overByTeam.get(id) ?? { games: 0, overs: 0 };
      cur.games += 1;
      cur.overs += over;
      overByTeam.set(id, cur);
    }
  }

  return standings
    .map((row) => {
      const played = Math.max(1, row.playedGames);
      const gfPerGame = row.goalsFor / played;
      const gaPerGame = row.goalsAgainst / played;
      const { xg, xga } = estimateXg(row);
      const formScore = Number((parseForm(row.form) * 100).toFixed(0));
      const attackIndex = Number(
        ((gfPerGame / Math.max(0.1, leagueGfAvg)) * 100).toFixed(0),
      );
      const defenseIndex = Number(
        ((Math.max(0.1, leagueGaAvg) / Math.max(0.1, gaPerGame)) * 100).toFixed(
          0,
        ),
      );
      const over = overByTeam.get(row.teamId);
      return {
        teamId: row.teamId,
        teamName: row.teamName,
        crest: row.crest,
        played: row.playedGames,
        points: row.points,
        ppg: Number((row.points / played).toFixed(2)),
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDiff: row.goalDifference,
        gfPerGame: Number(gfPerGame.toFixed(2)),
        gaPerGame: Number(gaPerGame.toFixed(2)),
        xg,
        xga,
        xgd: Number((xg - xga).toFixed(2)),
        attackIndex,
        defenseIndex,
        formScore,
        form: row.form,
        over25Rate: over?.games
          ? Number(((over.overs / over.games) * 100).toFixed(0))
          : null,
      };
    })
    .sort((a, b) => b.points - a.points || b.xgd - a.xgd);
}

export function leagueStatSummary(stats: AdvancedTeamStats[]) {
  if (!stats.length) {
    return {
      avgPpg: 0,
      avgXg: 0,
      bestAttack: null as AdvancedTeamStats | null,
      bestDefense: null as AdvancedTeamStats | null,
      bestXg: null as AdvancedTeamStats | null,
      hottestForm: null as AdvancedTeamStats | null,
    };
  }
  return {
    avgPpg: Number(
      (stats.reduce((a, s) => a + s.ppg, 0) / stats.length).toFixed(2),
    ),
    avgXg: Number(
      (stats.reduce((a, s) => a + s.xg, 0) / stats.length).toFixed(2),
    ),
    bestAttack: [...stats].sort((a, b) => b.gfPerGame - a.gfPerGame)[0],
    bestDefense: [...stats].sort((a, b) => a.gaPerGame - b.gaPerGame)[0],
    bestXg: [...stats].sort((a, b) => b.xg - a.xg)[0],
    hottestForm: [...stats].sort((a, b) => b.formScore - a.formScore)[0],
  };
}
