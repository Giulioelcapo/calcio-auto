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
  blurb: string;
  goals: number;
  assists: number;
  played: number;
  goalsPerGame: number;
  teamPosition: number | null;
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
  blurb: string;
  metrics: {
    position: number;
    formScore: number;
    attackIndex: number;
    defenseIndex: number;
    ppg: number;
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
  hot: "Hot streak",
  gem: "Hidden gem",
  creator: "Playmaker",
  clinical: "Clinical finisher",
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

/**
 * Algoritmo ScoutScore (0–100): volume gol, efficienza, assist,
 * contesto classifica e dipendenza dai rigori.
 */
export function computeScoutScore(input: PlayerInput): {
  score: number;
  category: ScoutCategory;
  blurb: string;
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
  const context = clamp(35 + (pos - 1) * 3); // squadre più basse = gem potenziale
  const purity = clamp(openPlayShare * 100);

  const hotScore = volume * 0.35 + efficiency * 0.45 + creation * 0.2;
  const gemScore = efficiency * 0.35 + context * 0.4 + purity * 0.25;
  const creatorScore = creation * 0.55 + volume * 0.2 + efficiency * 0.25;
  const clinicalScore = efficiency * 0.5 + purity * 0.35 + volume * 0.15;
  const breakoutScore =
    efficiency * 0.4 + volume * 0.25 + context * 0.2 + creation * 0.15;

  const ranked: Array<{ category: ScoutCategory; score: number }> = [
    { category: "hot" as const, score: hotScore },
    { category: "gem" as const, score: gemScore },
    { category: "creator" as const, score: creatorScore },
    { category: "clinical" as const, score: clinicalScore },
    { category: "breakout" as const, score: breakoutScore },
  ].sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const score = Math.round(clamp(best.score));

  const blurbs: Record<ScoutCategory, string> = {
    hot: `${goals} gol in ${played} partite (${gpg.toFixed(2)}/gara): volume e ritmo da monitoraggio prioritario.`,
    gem: `Rende ${gpg.toFixed(2)} gol/gara in una squadra ${pos <= 6 ? "già alta" : `intorno al ${pos}° posto`}: profilo da approfondire.`,
    creator: `${assists} assist e ${goals} gol: contributo creativo sopra la media del campione.`,
    clinical: `Alta efficienza (${gpg.toFixed(2)} gol/gara)${pens ? ` con ${pens} su rigore` : " soprattutto a gioco aperto"}.`,
    breakout: `Mix crescita/impatto (ScoutScore ${score}): candidato breakout per la lista osservatori.`,
  };

  return { score, category: best.category, blurb: blurbs[best.category] };
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
    const { score, category, blurb } = computeScoutScore(row);

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
      blurb,
      goals: row.goals,
      assists: row.assists ?? 0,
      played,
      goalsPerGame: Number((row.goals / played).toFixed(2)),
      teamPosition: row.teamPosition,
    });
  }

  return picks.sort((a, b) => b.scoutScore - a.scoutScore).slice(0, limit);
}

/**
 * Radar club quando i marcatori non sono ancora disponibili:
 * attacco, difesa, forma e punti/gara.
 */
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
      if (row.playedGames <= 0 && row.points <= 0 && row.goalsFor <= 0) {
        // Pre-stagione: ranking editoriale su posizione seed
        const seed = clamp(100 - (row.position - 1) * 4);
        clubs.push({
          id: `${entry.leagueSlug}:${row.teamId}`,
          teamName: row.teamName,
          teamId: row.teamId,
          crest: row.crest,
          leagueName: entry.leagueName,
          leagueSlug: entry.leagueSlug,
          focus: row.position <= 6 ? "Big club watch" : "Sviluppo / under radar",
          score: seed,
          blurb:
            row.position <= 6
              ? "Club di fascia alta: priorità scouting su reparti offensivi e giovani pronti."
              : "Club di medio-bassa classifica: terreno tipico per gemme e breakout.",
          metrics: {
            position: row.position,
            formScore: 50,
            attackIndex: 50,
            defenseIndex: 50,
            ppg: 0,
          },
        });
        continue;
      }

      const gfRate = row.goalsFor / played;
      const gaRate = row.goalsAgainst / played;
      const formScore = parseFormScore(row.form);
      const attackIndex = Math.round(
        (gfRate / Math.max(0.1, leagueGf)) * 100,
      );
      const defenseIndex = Math.round(
        (Math.max(0.1, leagueGa) / Math.max(0.1, gaRate)) * 100,
      );
      const ppg = row.points / played;
      const score = Math.round(
        clamp(
          attackIndex * 0.35 +
            defenseIndex * 0.25 +
            formScore * 0.25 +
            ppg * 15,
        ),
      );

      let focus = "Equilibrio";
      if (attackIndex >= 120 && formScore >= 60) focus = "Attacco da seguire";
      else if (defenseIndex >= 120) focus = "Blocco difensivo";
      else if (formScore >= 75) focus = "Forma calda";
      else if (row.position >= 12 && attackIndex >= 100) focus = "Talenti nascosti";

      clubs.push({
        id: `${entry.leagueSlug}:${row.teamId}`,
        teamName: row.teamName,
        teamId: row.teamId,
        crest: row.crest,
        leagueName: entry.leagueName,
        leagueSlug: entry.leagueSlug,
        focus,
        score,
        blurb: `${focus}: attacco ${attackIndex}, difesa ${defenseIndex}, forma ${formScore}.`,
        metrics: {
          position: row.position,
          formScore,
          attackIndex,
          defenseIndex,
          ppg: Number(ppg.toFixed(2)),
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
