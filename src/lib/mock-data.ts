import { crestUrl, SEASON_LABEL, SEASON_YEAR } from "./season";
import { teamPathSlug } from "./slug";
import type {
  LeagueConfig,
  MatchItem,
  ScorerRow,
  StandingRow,
  StandingTable,
  TeamSummary,
} from "./types";

const GROUPED_COMPETITIONS = new Set(["CL", "WC", "EC"]);

/** Organici completi (ID football-data.org per stemmi CDN). Demo pre-stagione. */
const MOCK_TEAMS: Record<string, Array<{ id: number; name: string }>> = {
  PL: [
    { id: 57, name: "Arsenal" },
    { id: 65, name: "Manchester City" },
    { id: 64, name: "Liverpool" },
    { id: 61, name: "Chelsea" },
    { id: 73, name: "Tottenham Hotspur" },
    { id: 67, name: "Newcastle United" },
    { id: 58, name: "Aston Villa" },
    { id: 66, name: "Manchester United" },
    { id: 397, name: "Brighton & Hove Albion" },
    { id: 563, name: "West Ham United" },
    { id: 63, name: "Fulham" },
    { id: 402, name: "Brentford" },
    { id: 354, name: "Crystal Palace" },
    { id: 62, name: "Everton" },
    { id: 76, name: "Wolverhampton Wanderers" },
    { id: 1044, name: "AFC Bournemouth" },
    { id: 351, name: "Nottingham Forest" },
    { id: 338, name: "Leicester City" },
    { id: 340, name: "Southampton" },
    { id: 341, name: "Leeds United" },
  ],
  SA: [
    { id: 108, name: "Inter" },
    { id: 113, name: "Napoli" },
    { id: 109, name: "Juventus" },
    { id: 98, name: "Milan" },
    { id: 102, name: "Atalanta" },
    { id: 100, name: "Roma" },
    { id: 110, name: "Lazio" },
    { id: 99, name: "Fiorentina" },
    { id: 103, name: "Bologna" },
    { id: 586, name: "Torino" },
    { id: 115, name: "Udinese" },
    { id: 107, name: "Genoa" },
    { id: 450, name: "Hellas Verona" },
    { id: 104, name: "Cagliari" },
    { id: 112, name: "Parma" },
    { id: 445, name: "Empoli" },
    { id: 471, name: "Sassuolo" },
    { id: 454, name: "Venezia" },
    { id: 5911, name: "Como" },
    { id: 457, name: "Cremonese" },
  ],
  BL1: [
    { id: 5, name: "Bayern Monaco" },
    { id: 4, name: "Borussia Dortmund" },
    { id: 721, name: "RB Leipzig" },
    { id: 3, name: "Bayer Leverkusen" },
    { id: 19, name: "Eintracht Frankfurt" },
    { id: 16, name: "VfB Stuttgart" },
    { id: 11, name: "VfL Wolfsburg" },
    { id: 17, name: "SC Freiburg" },
    { id: 2, name: "TSG Hoffenheim" },
    { id: 12, name: "Werder Brema" },
    { id: 15, name: "Mainz 05" },
    { id: 18, name: "Borussia Mönchengladbach" },
    { id: 10, name: "VfL Bochum" },
    { id: 28, name: "Union Berlin" },
    { id: 44, name: "Heidenheim" },
    { id: 36, name: "FC Augsburg" },
    { id: 720, name: "Holstein Kiel" },
    { id: 1, name: "FC Köln" },
  ],
  PD: [
    { id: 86, name: "Real Madrid" },
    { id: 81, name: "FC Barcelona" },
    { id: 78, name: "Atlético Madrid" },
    { id: 77, name: "Athletic Club" },
    { id: 92, name: "Real Sociedad" },
    { id: 94, name: "Villarreal" },
    { id: 90, name: "Real Betis" },
    { id: 559, name: "Sevilla" },
    { id: 95, name: "Valencia" },
    { id: 79, name: "Osasuna" },
    { id: 263, name: "Deportivo Alavés" },
    { id: 89, name: "Mallorca" },
    { id: 82, name: "Getafe" },
    { id: 87, name: "Rayo Vallecano" },
    { id: 80, name: "Espanyol" },
    { id: 250, name: "Real Valladolid" },
    { id: 558, name: "Celta Vigo" },
    { id: 745, name: "Leganés" },
    { id: 298, name: "Girona" },
    { id: 278, name: "Las Palmas" },
  ],
  FL1: [
    { id: 524, name: "Paris Saint-Germain" },
    { id: 548, name: "AS Monaco" },
    { id: 523, name: "Olympique Lyonnais" },
    { id: 516, name: "Olympique de Marseille" },
    { id: 521, name: "Lille OSC" },
    { id: 522, name: "OGC Nice" },
    { id: 529, name: "Stade Rennais" },
    { id: 546, name: "RC Lens" },
    { id: 576, name: "RC Strasbourg" },
    { id: 543, name: "FC Nantes" },
    { id: 511, name: "Toulouse" },
    { id: 518, name: "Montpellier" },
    { id: 512, name: "Stade Brestois" },
    { id: 528, name: "AS Saint-Étienne" },
    { id: 556, name: "Le Havre" },
    { id: 532, name: "Angers SCO" },
    { id: 533, name: "AJ Auxerre" },
    { id: 545, name: "FC Metz" },
  ],
  ELC: [
    { id: 341, name: "Leeds United" },
    { id: 338, name: "Leicester City" },
    { id: 349, name: "Ipswich Town" },
    { id: 340, name: "Southampton" },
    { id: 68, name: "Norwich City" },
    { id: 74, name: "West Bromwich Albion" },
    { id: 1076, name: "Coventry City" },
    { id: 343, name: "Middlesbrough" },
    { id: 322, name: "Hull City" },
    { id: 346, name: "Watford" },
    { id: 69, name: "Queens Park Rangers" },
    { id: 356, name: "Sheffield United" },
    { id: 342, name: "Derby County" },
    { id: 59, name: "Blackburn Rovers" },
    { id: 70, name: "Stoke City" },
    { id: 71, name: "Sunderland" },
    { id: 1082, name: "Preston North End" },
    { id: 328, name: "Burnley" },
    { id: 345, name: "Sheffield Wednesday" },
    { id: 387, name: "Bristol City" },
    { id: 1075, name: "Oxford United" },
    { id: 1077, name: "Portsmouth" },
    { id: 1081, name: "Swansea City" },
    { id: 325, name: "Millwall" },
  ],
  DED: [
    { id: 678, name: "Ajax" },
    { id: 674, name: "PSV" },
    { id: 675, name: "Feyenoord" },
    { id: 682, name: "AZ Alkmaar" },
    { id: 666, name: "Twente" },
    { id: 676, name: "Utrecht" },
    { id: 680, name: "Sparta Rotterdam" },
    { id: 673, name: "Heerenveen" },
    { id: 677, name: "Groningen" },
    { id: 679, name: "Willem II" },
    { id: 684, name: "NEC Nijmegen" },
    { id: 681, name: "Go Ahead Eagles" },
    { id: 1915, name: "PEC Zwolle" },
    { id: 1914, name: "Heracles Almelo" },
    { id: 683, name: "RKC Waalwijk" },
    { id: 718, name: "Fortuna Sittard" },
    { id: 1919, name: "Almere City" },
    { id: 672, name: "NAC Breda" },
  ],
  PPL: [
    { id: 1903, name: "Benfica" },
    { id: 503, name: "FC Porto" },
    { id: 498, name: "Sporting CP" },
    { id: 5613, name: "SC Braga" },
    { id: 5531, name: "Vitória SC" },
    { id: 5543, name: "Guimarães" },
    { id: 583, name: "Moreirense" },
    { id: 810, name: "Boavista" },
    { id: 11065, name: "Famalicão" },
    { id: 496, name: "Rio Ave" },
    { id: 5529, name: "Casa Pia" },
    { id: 6618, name: "Estoril" },
    { id: 5826, name: "Arouca" },
    { id: 6619, name: "Estrela Amadora" },
    { id: 11064, name: "Farense" },
    { id: 5568, name: "Nacional" },
    { id: 5530, name: "Santa Clara" },
    { id: 11063, name: "AVS" },
  ],
  BSA: [
    { id: 1783, name: "Flamengo" },
    { id: 1767, name: "Palmeiras" },
    { id: 1770, name: "São Paulo" },
    { id: 1779, name: "Corinthians" },
    { id: 1765, name: "Fluminense" },
    { id: 1766, name: "Atlético Mineiro" },
    { id: 6684, name: "Internacional" },
    { id: 1768, name: "Grêmio" },
    { id: 1769, name: "Santos" },
    { id: 1777, name: "Botafogo" },
    { id: 1776, name: "Cruzeiro" },
    { id: 1780, name: "Vasco da Gama" },
    { id: 1771, name: "Bahia" },
    { id: 1772, name: "Fortaleza" },
    { id: 4245, name: "Athletico Paranaense" },
    { id: 1778, name: "Cuiabá" },
    { id: 1782, name: "Red Bull Bragantino" },
    { id: 3984, name: "Juventude" },
    { id: 1837, name: "Vitória" },
    { id: 1825, name: "Criciúma" },
  ],
  CL: [
    { id: 86, name: "Real Madrid" },
    { id: 65, name: "Manchester City" },
    { id: 5, name: "Bayern Monaco" },
    { id: 108, name: "Inter" },
    { id: 524, name: "Paris Saint-Germain" },
    { id: 81, name: "FC Barcelona" },
    { id: 57, name: "Arsenal" },
    { id: 4, name: "Borussia Dortmund" },
    { id: 78, name: "Atlético Madrid" },
    { id: 64, name: "Liverpool" },
    { id: 61, name: "Chelsea" },
    { id: 98, name: "Milan" },
    { id: 109, name: "Juventus" },
    { id: 113, name: "Napoli" },
    { id: 674, name: "PSV" },
    { id: 503, name: "FC Porto" },
    { id: 1903, name: "Benfica" },
    { id: 498, name: "Sporting CP" },
    { id: 721, name: "RB Leipzig" },
    { id: 3, name: "Bayer Leverkusen" },
    { id: 516, name: "Olympique de Marseille" },
    { id: 548, name: "AS Monaco" },
    { id: 678, name: "Ajax" },
    { id: 19, name: "Eintracht Frankfurt" },
    { id: 521, name: "Lille OSC" },
    { id: 102, name: "Atalanta" },
    { id: 66, name: "Manchester United" },
    { id: 73, name: "Tottenham Hotspur" },
    { id: 675, name: "Feyenoord" },
    { id: 559, name: "Sevilla" },
    { id: 94, name: "Villarreal" },
    { id: 16, name: "VfB Stuttgart" },
  ],
  WC: [
    { id: 764, name: "Brasile" },
    { id: 762, name: "Argentina" },
    { id: 773, name: "Francia" },
    { id: 770, name: "Inghilterra" },
    { id: 760, name: "Spagna" },
    { id: 759, name: "Germania" },
    { id: 765, name: "Portogallo" },
    { id: 8601, name: "Paesi Bassi" },
    { id: 784, name: "Italia" },
    { id: 799, name: "Croazia" },
    { id: 805, name: "Belgio" },
    { id: 788, name: "Uruguay" },
    { id: 758, name: "Colombia" },
    { id: 832, name: "Giappone" },
    { id: 779, name: "Marocco" },
    { id: 769, name: "USA" },
    { id: 833, name: "Corea del Sud" },
    { id: 775, name: "Messico" },
    { id: 790, name: "Senegal" },
    { id: 787, name: "Svizzera" },
    { id: 782, name: "Danimarca" },
    { id: 801, name: "Serbia" },
    { id: 803, name: "Polonia" },
    { id: 766, name: "Canada" },
    { id: 814, name: "Australia" },
    { id: 793, name: "Iran" },
    { id: 780, name: "Ecuador" },
    { id: 794, name: "Ghana" },
    { id: 802, name: "Camerun" },
    { id: 804, name: "Qatar" },
    { id: 815, name: "Arabia Saudita" },
    { id: 7990, name: "Nuova Zelanda" },
  ],
  EC: [
    { id: 773, name: "Francia" },
    { id: 760, name: "Spagna" },
    { id: 770, name: "Inghilterra" },
    { id: 759, name: "Germania" },
    { id: 765, name: "Portogallo" },
    { id: 8601, name: "Paesi Bassi" },
    { id: 784, name: "Italia" },
    { id: 805, name: "Belgio" },
    { id: 799, name: "Croazia" },
    { id: 782, name: "Danimarca" },
    { id: 787, name: "Svizzera" },
    { id: 816, name: "Austria" },
    { id: 789, name: "Turchia" },
    { id: 798, name: "Ungheria" },
    { id: 797, name: "Repubblica Ceca" },
    { id: 7888, name: "Scozia" },
    { id: 811, name: "Ucraina" },
    { id: 803, name: "Polonia" },
    { id: 7908, name: "Romania" },
    { id: 7914, name: "Slovacchia" },
    { id: 7920, name: "Slovenia" },
    { id: 7926, name: "Georgia" },
    { id: 7932, name: "Albania" },
    { id: 801, name: "Serbia" },
  ],
};

function teamList(code: string) {
  return MOCK_TEAMS[code] ?? MOCK_TEAMS.PL;
}

/** Kickoff tipico stagione europea 2026/27 (sabato 15 agosto 2026) */
function seasonKickoffMs(): number {
  return Date.UTC(SEASON_YEAR, 7, 15, 16, 0, 0);
}

export function buildMockTeams(league: LeagueConfig): TeamSummary[] {
  return teamList(league.code).map(({ id, name }) => ({
    id,
    name,
    shortName: name,
    tla: name.slice(0, 3).toUpperCase(),
    crest: crestUrl(id),
    slug: teamPathSlug(name, id),
    venue: `Stadio ${name}`,
    founded: 1900 + (id % 90),
    clubColors: "Verde / Bianco",
  }));
}

/** Pre-stagione: 0 partite giocate, classifica a zero */
export function buildMockStandings(league: LeagueConfig): StandingRow[] {
  const teams = buildMockTeams(league);
  return teams.map((team, index) => ({
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
}

function renumber(rows: StandingRow[]): StandingRow[] {
  return rows.map((row, index) => ({ ...row, position: index + 1 }));
}

/** Solo classifica unica a zero (pre-stagione) */
export function buildMockStandingTables(league: LeagueConfig): StandingTable[] {
  const full = buildMockStandings(league);

  if (GROUPED_COMPETITIONS.has(league.code)) {
    const size = league.code === "CL" ? 4 : 5;
    const groups: StandingTable[] = [];
    for (let i = 0; i * size < full.length; i++) {
      const slice = renumber(full.slice(i * size, i * size + size));
      if (!slice.length) break;
      groups.push({
        type: "TOTAL",
        group: `GROUP_${String.fromCharCode(65 + i)}`,
        stage: "GROUP_STAGE",
        table: slice,
      });
    }
    return groups;
  }

  return [
    {
      type: "TOTAL",
      group: null,
      stage: "REGULAR_SEASON",
      table: full,
    },
  ];
}

/**
 * Solo partite future TIMED — nessun risultato inventato.
 * Una giornata completa: tutte le squadre accoppiate.
 */
export function buildMockMatches(league: LeagueConfig): MatchItem[] {
  const teams = buildMockTeams(league);
  const kickoff = seasonKickoffMs();
  const matches: MatchItem[] = [];
  const n = teams.length;
  if (n < 2) return matches;

  // Genera 4 giornate con pairing rotativo (tutte le squadre)
  for (let md = 1; md <= 4; md++) {
    const rotated = [...teams];
    // rotazione semplice per variare gli accoppiamenti
    for (let r = 0; r < md - 1; r++) {
      const last = rotated.pop();
      if (last) rotated.splice(1, 0, last);
    }
    const pairs = Math.floor(n / 2);
    for (let i = 0; i < pairs; i++) {
      const home = rotated[i];
      const away = rotated[n - 1 - i];
      const idx = matches.length;
      const utc = new Date(
        kickoff + (md - 1) * 7 * 86_400_000 + i * 2 * 3_600_000,
      );
      matches.push({
        id: league.code.charCodeAt(0) * 10000 + idx,
        utcDate: utc.toISOString(),
        status: "TIMED",
        matchday: md,
        stage: "REGULAR_SEASON",
        group: null,
        venue: home.venue ?? null,
        referee: null,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeTeam: home.name,
        awayTeam: away.name,
        homeCrest: home.crest,
        awayCrest: away.crest,
        homeScore: null,
        awayScore: null,
        homeHalf: null,
        awayHalf: null,
      });
    }
  }
  return matches;
}

/** Nessun marcatore prima del via */
export function buildMockScorers(_league: LeagueConfig): ScorerRow[] {
  return [];
}

export { SEASON_LABEL };
