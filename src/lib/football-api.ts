import {
  buildInjuryInsights,
  buildLeagueInsights,
  buildTeamInjuryInsights,
  buildTeamInsights,
} from "./insights";
import { getLeagueBySlug, LEAGUES } from "./leagues";
import {
  buildMockMatches,
  buildMockScorers,
  buildMockStandings,
  buildMockStandingTables,
  buildMockTeams,
} from "./mock-data";
import { SEASON_LABEL, SEASON_YEAR, seasonQuery } from "./season";
import { teamPathSlug } from "./slug";
import type {
  CompetitionBundle,
  CompetitionMeta,
  LeagueConfig,
  MatchItem,
  ScorerRow,
  StandingRow,
  StandingTable,
  TeamPageData,
  TeamSummary,
} from "./types";

const API_BASE = "https://api.football-data.org/v4";

interface ApiTeam {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
  address?: string;
  website?: string;
  founded?: number;
  clubColors?: string;
  venue?: string;
  area?: { name?: string; flag?: string };
  coach?: { name?: string | null };
}

interface ApiStandingTableRow {
  position: number;
  team: ApiTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string | null;
}

interface ApiStandingsResponse {
  competition?: {
    id?: number;
    emblem?: string;
  };
  area?: { flag?: string };
  season?: {
    startDate?: string;
    endDate?: string;
    currentMatchday?: number;
    winner?: { name?: string } | null;
  };
  standings?: Array<{
    type: string;
    group?: string | null;
    stage?: string | null;
    table: ApiStandingTableRow[];
  }>;
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage?: string | null;
  group?: string | null;
  venue?: string | null;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score?: {
    fullTime?: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
  referees?: Array<{ name?: string; type?: string }>;
}

interface ApiMatchesResponse {
  matches?: ApiMatch[];
}

interface ApiTeamsResponse {
  teams?: ApiTeam[];
}

interface ApiCompetitionResponse {
  id?: number;
  emblem?: string;
  area?: { flag?: string };
  currentSeason?: {
    startDate?: string;
    endDate?: string;
    currentMatchday?: number;
    winner?: { name?: string } | null;
  };
}

interface ApiScorersResponse {
  scorers?: Array<{
    player: { name: string };
    team: ApiTeam;
    goals: number;
    assists?: number | null;
    penalties?: number | null;
    playedMatches?: number | null;
  }>;
}

interface ApiTeamDetailResponse extends ApiTeam {
  runningCompetitions?: Array<{ name: string; code: string }>;
}

function hasApiToken(): boolean {
  return Boolean((process.env["FOOTBALL_DATA_API_TOKEN"] ?? "").trim());
}

function seasonLabelFromApi(season?: {
  startDate?: string;
  endDate?: string;
}): string {
  if (!season?.startDate) return SEASON_LABEL;
  const start = Number(season.startDate.slice(0, 4));
  if (season.endDate) {
    const end = Number(season.endDate.slice(0, 4));
    if (end !== start) return `${start}/${end}`;
  }
  return `${start}/${start + 1}`;
}

function mapTeam(team: ApiTeam): TeamSummary {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName || team.name,
    tla: team.tla || team.name.slice(0, 3).toUpperCase(),
    crest: team.crest ?? null,
    slug: teamPathSlug(team.name, team.id),
    areaName: team.area?.name ?? null,
    areaFlag: team.area?.flag ?? null,
    address: team.address ?? null,
    website: team.website ?? null,
    founded: team.founded ?? null,
    clubColors: team.clubColors ?? null,
    venue: team.venue ?? null,
    coachName: team.coach?.name ?? null,
  };
}

function mapStandings(table: ApiStandingTableRow[]): StandingRow[] {
  return table.map((row) => ({
    position: row.position,
    teamId: row.team.id,
    teamName: row.team.name,
    teamShortName: row.team.shortName || row.team.tla || row.team.name,
    crest: row.team.crest ?? null,
    playedGames: row.playedGames,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    points: row.points,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    form: row.form ?? null,
  }));
}

function mapStandingTables(
  standings: ApiStandingsResponse["standings"],
): StandingTable[] {
  if (!standings?.length) return [];
  return standings.map((block) => ({
    type: block.type,
    group: block.group ?? null,
    stage: block.stage ?? null,
    table: mapStandings(block.table ?? []),
  }));
}

function mapMatches(matches: ApiMatch[]): MatchItem[] {
  return matches.map((match) => {
    const referee =
      match.referees?.find((r) => r.type === "REFEREE")?.name ||
      match.referees?.[0]?.name ||
      null;
    return {
      id: match.id,
      utcDate: match.utcDate,
      status: match.status,
      matchday: match.matchday,
      stage: match.stage ?? null,
      group: match.group ?? null,
      venue: match.venue ?? null,
      referee,
      homeTeamId: match.homeTeam.id,
      awayTeamId: match.awayTeam.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeCrest: match.homeTeam.crest ?? null,
      awayCrest: match.awayTeam.crest ?? null,
      homeScore: match.score?.fullTime?.home ?? null,
      awayScore: match.score?.fullTime?.away ?? null,
      homeHalf: match.score?.halfTime?.home ?? null,
      awayHalf: match.score?.halfTime?.away ?? null,
    };
  });
}

async function apiFetch<T>(
  path: string,
): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  // Bracket access evita che Next.js “inlined” undefined a build-time
  const token = (process.env["FOOTBALL_DATA_API_TOKEN"] ?? "").trim();
  if (!token) return { ok: false, status: 401 };

  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "X-Auth-Token": token },
    // Runtime fetch: così su Vercel usa sempre il token Production
    cache: "no-store",
  });

  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, data: (await response.json()) as T };
}

function teamsFromStandings(standings: StandingRow[]): TeamSummary[] {
  return standings.map((row) => ({
    id: row.teamId,
    name: row.teamName,
    shortName: row.teamShortName,
    tla: row.teamShortName.slice(0, 3).toUpperCase(),
    crest: row.crest,
    slug: teamPathSlug(row.teamName, row.teamId),
  }));
}

function emptyMeta(league: LeagueConfig): CompetitionMeta {
  return {
    id: null,
    emblem: league.emblem,
    flag: league.flag ?? null,
    currentMatchday: null,
    startDate: `${SEASON_YEAR}-08-01`,
    endDate: `${SEASON_YEAR + 1}-05-31`,
    winnerName: null,
  };
}

function mockBundle(league: LeagueConfig): CompetitionBundle {
  const standingTables = buildMockStandingTables(league);
  const standings =
    standingTables.find((t) => t.type === "TOTAL" && !t.group)?.table ??
    standingTables.find((t) => t.type === "TOTAL")?.table ??
    standingTables[0]?.table ??
    buildMockStandings(league);
  const matches = buildMockMatches(league);
  const teams = buildMockTeams(league);
  const scorers = buildMockScorers(league);
  return {
    league,
    meta: { ...emptyMeta(league), currentMatchday: null },
    matchday: null,
    seasonYear: SEASON_YEAR,
    seasonLabel: SEASON_LABEL,
    updatedAt: new Date().toISOString(),
    standings,
    standingTables,
    matches,
    teams,
    scorers,
    scorersAvailable: false,
    insights: buildLeagueInsights(standings),
    injuryInsights: buildInjuryInsights(standings, matches),
    usingMock: true,
  };
}

/** Solo risultati davvero giocati (non date future / status errati). */
export function isTrulyFinished(match: MatchItem, now = Date.now()): boolean {
  if (match.status !== "FINISHED" && match.status !== "AWARDED") return false;
  if (match.homeScore == null || match.awayScore == null) return false;
  const kickoff = Date.parse(match.utcDate);
  if (!Number.isFinite(kickoff)) return false;
  // Margine 105 min: partita non può risultare finita prima del fischio
  return kickoff + 105 * 60_000 <= now;
}

function sanitizeMatches(matches: MatchItem[]): MatchItem[] {
  const now = Date.now();
  return matches.map((match) => {
    if (
      (match.status === "FINISHED" || match.status === "AWARDED") &&
      !isTrulyFinished(match, now)
    ) {
      return {
        ...match,
        status: Date.parse(match.utcDate) > now ? "TIMED" : "SCHEDULED",
        homeScore: null,
        awayScore: null,
        homeHalf: null,
        awayHalf: null,
        referee: null,
      };
    }
    return match;
  });
}

function seasonStartYear(
  season?: { startDate?: string } | null,
): number | null {
  if (!season?.startDate) return null;
  const y = Number(season.startDate.slice(0, 4));
  return Number.isFinite(y) ? y : null;
}

export async function getCompetitionBundle(
  slug: string,
): Promise<CompetitionBundle | null> {
  const league = getLeagueBySlug(slug);
  if (!league) return null;
  if (!hasApiToken()) return mockBundle(league);

  try {
    const q = seasonQuery();
    const [compRes, standingsRes, matchesRes, teamsRes, scorersRes] =
      await Promise.all([
        apiFetch<ApiCompetitionResponse>(`/competitions/${league.code}`),
        apiFetch<ApiStandingsResponse>(
          `/competitions/${league.code}/standings${q}`,
        ),
        apiFetch<ApiMatchesResponse>(
          `/competitions/${league.code}/matches${q}`,
        ),
        apiFetch<ApiTeamsResponse>(`/competitions/${league.code}/teams${q}`),
        apiFetch<ApiScorersResponse>(
          `/competitions/${league.code}/scorers${seasonQuery("limit=20")}`,
        ),
      ]);

    let standingsData = standingsRes.ok ? standingsRes.data : null;
    let matchesData = matchesRes.ok ? matchesRes.data : null;
    let teamsData = teamsRes.ok ? teamsRes.data : null;
    let scorersData = scorersRes.ok ? scorersRes.data : null;

    // Se season=2026 non risponde: NON usare la stagione precedente
    // (evita risultati 2025/26 passati come 2026/27).
    if (!standingsRes.ok) {
      const teamsOnly = await apiFetch<ApiTeamsResponse>(
        `/competitions/${league.code}/teams${q}`,
      );
      if (teamsOnly.ok && (teamsOnly.data.teams?.length ?? 0) > 0) {
        const teams = (teamsOnly.data.teams ?? []).map(mapTeam);
        const emptyStandings = teams.map((team, index) => ({
          position: index + 1,
          teamId: team.id,
          teamName: team.name,
          teamShortName: team.shortName,
          crest: team.crest,
          playedGames: 0,
          won: 0,
          draw: 0,
          lost: 0,
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          form: null,
        }));
        return {
          league,
          meta: {
            ...emptyMeta(league),
            emblem: (compRes.ok ? compRes.data.emblem : null) ?? league.emblem,
            flag:
              (compRes.ok ? compRes.data.area?.flag : null) ??
              league.flag ??
              null,
            currentMatchday: null,
          },
          matchday: null,
          seasonYear: SEASON_YEAR,
          seasonLabel: SEASON_LABEL,
          updatedAt: new Date().toISOString(),
          standings: emptyStandings,
          standingTables: [
            {
              type: "TOTAL",
              group: null,
              stage: "REGULAR_SEASON",
              table: emptyStandings,
            },
          ],
          matches: sanitizeMatches(
            matchesData ? mapMatches(matchesData.matches ?? []) : [],
          ),
          teams,
          scorers: [],
          scorersAvailable: false,
          insights: [],
          injuryInsights: [
            {
              id: "preseason",
              title: "Stagione non ancora iniziata",
              body: `${league.name} ${SEASON_LABEL}: nessun risultato ufficiale disponibile.`,
              tone: "neutral",
            },
          ],
          usingMock: false,
        };
      }
      return mockBundle(league);
    }

    // Stagione API troppo vecchia rispetto al target 2026 → mock pre-stagione
    const rawSeasonYear = seasonStartYear(standingsData?.season);
    if (rawSeasonYear != null && rawSeasonYear < SEASON_YEAR) {
      return mockBundle(league);
    }

    const standingTables = mapStandingTables(standingsData?.standings);
    const totalTable =
      standingTables.find((s) => s.type === "TOTAL")?.table ??
      standingTables[0]?.table ??
      [];

    const allMatches = sanitizeMatches(
      matchesData ? mapMatches(matchesData.matches ?? []) : [],
    );

    const teams = teamsData
      ? (teamsData.teams ?? []).map(mapTeam)
      : teamsFromStandings(totalTable);

    let scorers: ScorerRow[] = [];
    let scorersAvailable = false;
    if (scorersData?.scorers?.length) {
      scorersAvailable = true;
      scorers = scorersData.scorers.map((row, index) => ({
        rank: index + 1,
        playerName: row.player.name,
        teamName: row.team.name,
        teamId: row.team.id,
        teamCrest: row.team.crest ?? null,
        goals: row.goals,
        assists: row.assists ?? null,
        penalties: row.penalties ?? null,
        playedMatches: row.playedMatches ?? null,
      }));
    }

    const season =
      standingsData?.season ??
      (compRes.ok ? compRes.data.currentSeason : undefined);

    const meta: CompetitionMeta = {
      id:
        standingsData?.competition?.id ??
        (compRes.ok ? (compRes.data.id ?? null) : null),
      emblem:
        standingsData?.competition?.emblem ??
        (compRes.ok ? compRes.data.emblem : null) ??
        league.emblem,
      flag:
        standingsData?.area?.flag ??
        (compRes.ok ? compRes.data.area?.flag : null) ??
        league.flag ??
        null,
      currentMatchday:
        season?.currentMatchday ??
        (compRes.ok
          ? (compRes.data.currentSeason?.currentMatchday ?? null)
          : null),
      startDate: season?.startDate ?? null,
      endDate: season?.endDate ?? null,
      winnerName: season?.winner?.name ?? null,
    };

    return {
      league,
      meta,
      matchday: meta.currentMatchday,
      seasonYear: SEASON_YEAR,
      seasonLabel: seasonLabelFromApi(season),
      updatedAt: new Date().toISOString(),
      standings: totalTable,
      standingTables,
      matches: allMatches,
      teams,
      scorers,
      scorersAvailable,
      insights: buildLeagueInsights(totalTable),
      injuryInsights: buildInjuryInsights(totalTable, allMatches),
      usingMock: false,
    };
  } catch {
    return mockBundle(league);
  }
}

export function upcomingMatches(matches: MatchItem[], limit = 20): MatchItem[] {
  const now = Date.now();
  return matches
    .filter((m) => !isTrulyFinished(m, now))
    .sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate))
    .slice(0, limit);
}

export function finishedMatches(matches: MatchItem[], limit = 30): MatchItem[] {
  const now = Date.now();
  return matches
    .filter((m) => isTrulyFinished(m, now))
    .sort((a, b) => +new Date(b.utcDate) - +new Date(a.utcDate))
    .slice(0, limit);
}

export function filterMatchesByMatchday(
  matches: MatchItem[],
  matchday: number,
): MatchItem[] {
  return matches.filter((m) => m.matchday === matchday);
}

export function availableMatchdays(matches: MatchItem[]): number[] {
  const set = new Set<number>();
  for (const m of matches) {
    if (m.matchday != null) set.add(m.matchday);
  }
  return [...set].sort((a, b) => a - b);
}

export async function getTeamPage(
  leagueSlug: string,
  teamSlug: string,
): Promise<TeamPageData | null> {
  const bundle = await getCompetitionBundle(leagueSlug);
  if (!bundle) return null;

  let team =
    bundle.teams.find((t) => t.slug === teamSlug) ||
    bundle.teams.find((t) => teamSlug.endsWith(`-${t.id}`));
  if (!team) return null;

  if (hasApiToken()) {
    const detail = await apiFetch<ApiTeamDetailResponse>(`/teams/${team.id}`);
    if (detail.ok) {
      team = { ...team, ...mapTeam(detail.data) };
    }
  }

  const standing = bundle.standings.find((s) => s.teamId === team.id) ?? null;
  let recent = finishedMatches(
    bundle.matches.filter(
      (m) => m.homeTeamId === team.id || m.awayTeamId === team.id,
    ),
    8,
  );
  let upcoming = upcomingMatches(
    bundle.matches.filter(
      (m) => m.homeTeamId === team.id || m.awayTeamId === team.id,
    ),
    8,
  );

  if (hasApiToken()) {
    const teamMatches = await apiFetch<ApiMatchesResponse>(
      `/teams/${team.id}/matches${seasonQuery("limit=20")}`,
    );
    if (teamMatches.ok) {
      const mapped = mapMatches(teamMatches.data.matches ?? []);
      recent = finishedMatches(mapped, 8);
      upcoming = upcomingMatches(mapped, 8);
    }
  }

  return {
    league: bundle.league,
    team,
    standing,
    recent,
    upcoming,
    insights: buildTeamInsights(standing, recent, team.name),
    injuryInsights: buildTeamInjuryInsights(standing, team.name),
    seasonLabel: bundle.seasonLabel,
    usingMock: bundle.usingMock,
  };
}

export function listLeagues() {
  return LEAGUES;
}

export function apiTokenConfigured() {
  return hasApiToken();
}
