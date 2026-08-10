export type LeagueCode =
  | "PL"
  | "ELC"
  | "BL1"
  | "SA"
  | "PD"
  | "FL1"
  | "DED"
  | "PPL"
  | "BSA"
  | "CL"
  | "WC"
  | "EC";

export interface LeagueConfig {
  code: LeagueCode;
  slug: string;
  name: string;
  country: string;
  shortName: string;
  /** Emblema ufficiale football-data (CDN pubblico) */
  emblem: string;
  /** Bandiera area (CDN pubblico) */
  flag?: string;
}

export interface StandingRow {
  position: number;
  teamId: number;
  teamName: string;
  teamShortName: string;
  crest: string | null;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string | null;
}

export interface StandingTable {
  type: "TOTAL" | "HOME" | "AWAY" | string;
  group: string | null;
  stage: string | null;
  table: StandingRow[];
}

export interface MatchItem {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string | null;
  group: string | null;
  venue: string | null;
  referee: string | null;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeHalf: number | null;
  awayHalf: number | null;
}

export interface TodayMatch extends MatchItem {
  leagueName: string;
  leagueSlug: string;
  leagueCode: string;
}

export interface TodaysMatchesResult {
  dateISO: string;
  dateLabel: string;
  matches: TodayMatch[];
  usingMock: boolean;
}

export interface TeamSummary {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
  slug: string;
  areaName?: string | null;
  areaFlag?: string | null;
  address?: string | null;
  website?: string | null;
  founded?: number | null;
  clubColors?: string | null;
  venue?: string | null;
  coachName?: string | null;
}

export interface ScorerRow {
  rank: number;
  playerName: string;
  teamName: string;
  teamId: number;
  teamCrest: string | null;
  goals: number;
  assists: number | null;
  penalties: number | null;
  playedMatches: number | null;
}

export interface InsightCard {
  id: string;
  title: string;
  body: string;
  tone: "positive" | "neutral" | "warning";
}

export interface CompetitionMeta {
  id: number | null;
  emblem: string | null;
  flag: string | null;
  currentMatchday: number | null;
  startDate: string | null;
  endDate: string | null;
  winnerName: string | null;
}

export interface CompetitionBundle {
  league: LeagueConfig;
  meta: CompetitionMeta;
  matchday: number | null;
  seasonYear: number;
  seasonLabel: string;
  updatedAt: string;
  standings: StandingRow[];
  standingTables: StandingTable[];
  matches: MatchItem[];
  teams: TeamSummary[];
  scorers: ScorerRow[];
  scorersAvailable: boolean;
  insights: InsightCard[];
  injuryInsights: InsightCard[];
  usingMock: boolean;
}

export interface TeamPageData {
  league: LeagueConfig;
  team: TeamSummary;
  standing: StandingRow | null;
  recent: MatchItem[];
  upcoming: MatchItem[];
  insights: InsightCard[];
  injuryInsights: InsightCard[];
  seasonLabel: string;
  usingMock: boolean;
}
