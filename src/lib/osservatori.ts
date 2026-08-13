import { currentStreak } from "./free-stats";
import type { MatchItem, ScorerRow, StandingRow } from "./types";

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
  signals: string[];
  /** KPI free football-data + derivati da classifica */
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
    openPlayShare: number | null;
    teamPosition: number | null;
    teamGoalsFor: number | null;
    teamGoalShare: number | null;
    dependencyIndex: number;
    contextIndex: number;
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
  signals: string[];
  /** KPI free classifica + casa/trasferta + forma */
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
    momentum: number;
    streakLabel: string | null;
    ppg: number;
    homePpg: number | null;
    awayPpg: number | null;
    homeAwayGap: number | null;
    gfPerGame: number;
    gaPerGame: number;
    attackIndex: number;
    defenseIndex: number;
    balanceIndex: number;
  };
};

/** Segnale sintetico per l’osservatore (giocatore / club / matchup). */
export type ScoutAlert = {
  id: string;
  kind: "player" | "club" | "matchup";
  title: string;
  body: string;
  tone: "hot" | "gem" | "warn" | "info";
  leagueSlug?: string;
  href?: string;
};

export type OsservatoriReport = {
  players: ScoutPlayer[];
  clubs: ClubRadar[];
  alerts: ScoutAlert[];
  generatedAt: string;
  hasPlayers: boolean;
};

type PlayerInput = ScorerRow & {
  leagueName: string;
  leagueSlug: string;
  teamPosition: number | null;
  teamPlayed: number;
  teamGoalsFor: number | null;
  teamFormScore: number | null;
};

type ClubInput = {
  leagueName: string;
  leagueSlug: string;
  standings: StandingRow[];
  homeByTeam?: Map<number, StandingRow>;
  awayByTeam?: Map<number, StandingRow>;
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

export function parseFormScore(form: string | null): number {
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

/** Ultime 3 (più recenti a sinistra nella stringa forma FD). */
export function parseMomentum(form: string | null): number {
  if (!form) return 50;
  const chars = form
    .toUpperCase()
    .replace(/[^WDL]/g, "")
    .slice(0, 3)
    .split("");
  if (!chars.length) return 50;
  const weights = [0.5, 0.3, 0.2];
  let acc = 0;
  let wSum = 0;
  chars.forEach((c, i) => {
    const w = weights[i] ?? 0.1;
    const v = c === "W" ? 1 : c === "D" ? 0.4 : 0;
    acc += v * w;
    wSum += w;
  });
  return Math.round((acc / Math.max(0.01, wSum)) * 100);
}

function ppgOf(row: StandingRow | undefined): number | null {
  if (!row || row.playedGames <= 0) return null;
  return Number((row.points / row.playedGames).toFixed(2));
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
  const teamGf = Math.max(1, input.teamGoalsFor ?? goals);
  const share = clamp((goals / teamGf) * 100);
  const dependency = clamp(share * 1.1);
  const context = clamp(30 + (pos - 1) * 3.5);

  const volume = clamp(goals * 8 + assists * 3);
  const efficiency = clamp(gpg * 55 + apg * 25);
  const creation = clamp(apg * 70 + assists * 4);
  const purity = clamp(openPlayShare * 100);
  const formBoost = clamp((input.teamFormScore ?? 50) * 0.35 + 30);

  const ranked = (
    [
      {
        category: "hot" as const,
        score:
          volume * 0.3 +
          efficiency * 0.35 +
          creation * 0.15 +
          formBoost * 0.2,
      },
      {
        category: "gem" as const,
        score:
          efficiency * 0.3 +
          context * 0.35 +
          purity * 0.2 +
          dependency * 0.15,
      },
      {
        category: "creator" as const,
        score: creation * 0.5 + volume * 0.2 + efficiency * 0.2 + share * 0.1,
      },
      {
        category: "clinical" as const,
        score: efficiency * 0.45 + purity * 0.35 + volume * 0.2,
      },
      {
        category: "breakout" as const,
        score:
          efficiency * 0.35 +
          volume * 0.2 +
          context * 0.25 +
          creation * 0.1 +
          dependency * 0.1,
      },
    ] satisfies Array<{ category: ScoutCategory; score: number }>
  ).sort((a, b) => b.score - a.score);

  return {
    score: Math.round(clamp(ranked[0].score)),
    category: ranked[0].category,
  };
}

function playerSignals(p: ScoutPlayer): string[] {
  const s: string[] = [];
  const k = p.kpis;
  if (k.teamGoalShare != null && k.teamGoalShare >= 35) {
    s.push("Dipendenza gol");
  }
  if (k.goalsPerGame >= 0.55 && (k.teamPosition ?? 10) >= 10) {
    s.push("Overperform");
  }
  if (k.openPlayShare != null && k.openPlayShare >= 85 && k.goals >= 3) {
    s.push("Open-play");
  }
  if (k.assists >= 3 && k.assists >= k.goals) {
    s.push("Creatore");
  }
  if (k.penaltyShare != null && k.penaltyShare >= 40) {
    s.push("Rigori alti");
  }
  if (k.dependencyIndex >= 55) {
    s.push("Uomo-chiave");
  }
  if (k.contextIndex >= 70) {
    s.push("Contesto duro");
  }
  return s.slice(0, 3);
}

export function buildScoutPlayers(
  rows: PlayerInput[],
  limit = 12,
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
    const teamGf = row.teamGoalsFor;
    const teamGoalShare =
      teamGf != null && teamGf > 0
        ? Number(((goals / teamGf) * 100).toFixed(0))
        : null;
    const openPlayShare =
      goals > 0
        ? Number(((openPlayGoals / goals) * 100).toFixed(0))
        : null;
    const dependencyIndex = clamp(
      (teamGoalShare ?? 0) * 1.15 + (assists / Math.max(1, played)) * 20,
    );
    const contextIndex = clamp(25 + ((row.teamPosition ?? 10) - 1) * 4);
    const { score, category } = computeScoutScore(row);

    const player: ScoutPlayer = {
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
      signals: [],
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
        openPlayShare,
        teamPosition: row.teamPosition,
        teamGoalsFor: teamGf,
        teamGoalShare,
        dependencyIndex: Math.round(dependencyIndex),
        contextIndex: Math.round(contextIndex),
        rank: row.rank,
      },
    };
    player.signals = playerSignals(player);
    picks.push(player);
  }

  return picks.sort((a, b) => b.scoutScore - a.scoutScore).slice(0, limit);
}

function clubSignals(club: ClubRadar): string[] {
  const s: string[] = [];
  const k = club.kpis;
  if (k.momentum >= 80) s.push("Momentum alto");
  if (k.streakLabel?.startsWith("W")) s.push(`Streak ${k.streakLabel}`);
  if (k.streakLabel?.startsWith("L") && (k.streakLabel.length ?? 0) >= 2) {
    s.push("Crisi forma");
  }
  if (k.homeAwayGap != null && k.homeAwayGap >= 0.8) s.push("Casa forte");
  if (k.homeAwayGap != null && k.homeAwayGap <= -0.6) s.push("Trasferta ok");
  if (k.attackIndex >= 125) s.push("Attacco top");
  if (k.defenseIndex >= 125) s.push("Difesa top");
  if (k.attackIndex >= 110 && k.defenseIndex <= 85) s.push("Sbilanciata");
  if (k.position >= 12 && k.ppg >= 1.3) s.push("Under radar");
  return s.slice(0, 3);
}

export function buildClubRadar(entries: ClubInput[], limit = 8): ClubRadar[] {
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
      const momentum = parseMomentum(row.form);
      const streak = currentStreak(row.form);
      const streakLabel = streak ? `${streak.type}×${streak.length}` : null;
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
      const balanceIndex = Math.round(
        100 - Math.min(100, Math.abs(attackIndex - defenseIndex) * 0.7),
      );
      const ppg = row.playedGames > 0 ? row.points / played : 0;
      const homePpg = ppgOf(entry.homeByTeam?.get(row.teamId));
      const awayPpg = ppgOf(entry.awayByTeam?.get(row.teamId));
      const homeAwayGap =
        homePpg != null && awayPpg != null
          ? Number((homePpg - awayPpg).toFixed(2))
          : null;

      const score =
        row.playedGames > 0
          ? Math.round(
              clamp(
                attackIndex * 0.28 +
                  defenseIndex * 0.22 +
                  formScore * 0.18 +
                  momentum * 0.17 +
                  ppg * 14 +
                  balanceIndex * 0.05,
              ),
            )
          : clamp(100 - (row.position - 1) * 4);

      let focus = "Balance";
      if (row.playedGames <= 0) {
        focus = row.position <= 6 ? "Top" : "Watch";
      } else if (attackIndex >= 120 && momentum >= 60) {
        focus = "Attack";
      } else if (defenseIndex >= 120) {
        focus = "Defense";
      } else if (momentum >= 80) {
        focus = "Form";
      } else if (row.position >= 12 && attackIndex >= 100) {
        focus = "Gem club";
      } else if (homeAwayGap != null && homeAwayGap >= 1) {
        focus = "Home side";
      }

      const club: ClubRadar = {
        id: `${entry.leagueSlug}:${row.teamId}`,
        teamName: row.teamName,
        teamId: row.teamId,
        crest: row.crest,
        leagueName: entry.leagueName,
        leagueSlug: entry.leagueSlug,
        focus,
        score,
        signals: [],
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
          momentum,
          streakLabel,
          ppg: Number(ppg.toFixed(2)),
          homePpg,
          awayPpg,
          homeAwayGap,
          gfPerGame: Number(gfRate.toFixed(2)),
          gaPerGame: Number(gaRate.toFixed(2)),
          attackIndex,
          defenseIndex,
          balanceIndex,
        },
      };
      club.signals = clubSignals(club);
      clubs.push(club);
    }
  }

  return clubs.sort((a, b) => b.score - a.score).slice(0, limit);
}

function buildMatchupAlerts(
  clubs: ClubRadar[],
  matchesByLeague: Array<{
    leagueSlug: string;
    leagueName: string;
    matches: MatchItem[];
  }>,
  limit = 6,
): ScoutAlert[] {
  const byId = new Map(clubs.map((c) => [`${c.leagueSlug}:${c.teamId}`, c]));
  const alerts: ScoutAlert[] = [];
  const now = Date.now();

  for (const block of matchesByLeague) {
    const upcoming = block.matches
      .filter((m) => m.status !== "FINISHED" && m.status !== "AWARDED")
      .filter((m) => new Date(m.utcDate).getTime() >= now - 60 * 60 * 1000)
      .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
      .slice(0, 40);

    for (const m of upcoming) {
      const home = byId.get(`${block.leagueSlug}:${m.homeTeamId}`);
      const away = byId.get(`${block.leagueSlug}:${m.awayTeamId}`);
      if (!home || !away) continue;

      const atkEdge = home.kpis.attackIndex - away.kpis.defenseIndex;
      const defEdge = away.kpis.attackIndex - home.kpis.defenseIndex;
      const formGap = home.kpis.momentum - away.kpis.momentum;

      if (atkEdge >= 35 && home.kpis.momentum >= 55) {
        alerts.push({
          id: `mu-h-${m.id}`,
          kind: "matchup",
          title: `${home.teamName} vs ${away.teamName}`,
          body: `Mismatch attacco casa (ATK ${home.kpis.attackIndex}) contro difesa ospite (DEF ${away.kpis.defenseIndex}).`,
          tone: "hot",
          leagueSlug: block.leagueSlug,
        });
      } else if (defEdge >= 35 && away.kpis.momentum >= 55) {
        alerts.push({
          id: `mu-a-${m.id}`,
          kind: "matchup",
          title: `${home.teamName} vs ${away.teamName}`,
          body: `Ospite pericoloso in ripartenza: ATK ${away.kpis.attackIndex} vs DEF casa ${home.kpis.defenseIndex}.`,
          tone: "warn",
          leagueSlug: block.leagueSlug,
        });
      } else if (Math.abs(formGap) >= 40) {
        const hot = formGap > 0 ? home.teamName : away.teamName;
        alerts.push({
          id: `mu-f-${m.id}`,
          kind: "matchup",
          title: `${home.teamName} vs ${away.teamName}`,
          body: `Gap di momentum a favore di ${hot} (${Math.abs(formGap)} pt).`,
          tone: "info",
          leagueSlug: block.leagueSlug,
        });
      }
    }
  }

  return alerts
    .sort((a, b) => {
      const rank = { hot: 0, warn: 1, gem: 2, info: 3 } as const;
      return rank[a.tone] - rank[b.tone];
    })
    .slice(0, limit);
}

function buildPlayerClubAlerts(
  players: ScoutPlayer[],
  clubs: ClubRadar[],
): ScoutAlert[] {
  const alerts: ScoutAlert[] = [];

  for (const p of players.slice(0, 8)) {
    if (p.kpis.teamGoalShare != null && p.kpis.teamGoalShare >= 35) {
      alerts.push({
        id: `pl-dep-${p.id}`,
        kind: "player",
        title: p.playerName,
        body: `Produce il ${p.kpis.teamGoalShare}% dei gol di ${p.teamName} (dipendenza alta).`,
        tone: "gem",
        leagueSlug: p.leagueSlug,
        href: `/${p.leagueSlug}`,
      });
    } else if (p.category === "gem" || p.category === "breakout") {
      alerts.push({
        id: `pl-cat-${p.id}`,
        kind: "player",
        title: `${p.playerName} · ${p.categoryLabel}`,
        body: `ScoutScore ${p.scoutScore} · ${p.kpis.goals}G ${p.kpis.assists}A in ${p.kpis.played} PG (${p.leagueName}).`,
        tone: p.category === "gem" ? "gem" : "info",
        leagueSlug: p.leagueSlug,
      });
    }
  }

  for (const c of clubs.slice(0, 6)) {
    if (c.signals.includes("Under radar") || c.focus === "Gem club") {
      alerts.push({
        id: `cl-ur-${c.id}`,
        kind: "club",
        title: c.teamName,
        body: `#${c.kpis.position} con PPG ${c.kpis.ppg} · ATK ${c.kpis.attackIndex} / DEF ${c.kpis.defenseIndex}.`,
        tone: "gem",
        leagueSlug: c.leagueSlug,
        href: `/${c.leagueSlug}`,
      });
    }
    if (c.kpis.momentum >= 85 && c.kpis.attackIndex >= 110) {
      alerts.push({
        id: `cl-hot-${c.id}`,
        kind: "club",
        title: c.teamName,
        body: `Momento caldo: momentum ${c.kpis.momentum}, attacco indice ${c.kpis.attackIndex}.`,
        tone: "hot",
        leagueSlug: c.leagueSlug,
      });
    }
  }

  return alerts;
}

export function assembleOsservatoriReport(input: {
  scorers: PlayerInput[];
  clubs: ClubInput[];
  matches?: Array<{
    leagueSlug: string;
    leagueName: string;
    matches: MatchItem[];
  }>;
}): OsservatoriReport {
  // Club radar su tutta la classifica per matchup, poi top slice
  const allClubs = buildClubRadar(input.clubs, 80);
  const clubs = allClubs.slice(0, 8);
  const players = buildScoutPlayers(input.scorers, 12);
  const matchupAlerts = buildMatchupAlerts(
    allClubs,
    input.matches ?? [],
    5,
  );
  const entityAlerts = buildPlayerClubAlerts(players, clubs);

  const alerts = [...matchupAlerts, ...entityAlerts]
    .filter(
      (a, i, arr) => arr.findIndex((x) => x.id === a.id) === i,
    )
    .slice(0, 10);

  return {
    players,
    clubs,
    alerts,
    generatedAt: new Date().toISOString(),
    hasPlayers: players.length > 0,
  };
}
