import type { LeagueCode, LeagueConfig } from "./types";

/** Solo campionati del piano gratuito football-data.org */
export const LEAGUES: LeagueConfig[] = [
  {
    code: "PL",
    slug: "premier-league",
    name: "Premier League",
    country: "Inghilterra",
    shortName: "PL",
    emblem: "https://crests.football-data.org/PL.png",
    flag: "https://crests.football-data.org/770.svg",
  },
  {
    code: "ELC",
    slug: "championship",
    name: "Championship",
    country: "Inghilterra",
    shortName: "ELC",
    emblem: "https://crests.football-data.org/ELC.png",
    flag: "https://crests.football-data.org/770.svg",
  },
  {
    code: "BL1",
    slug: "bundesliga",
    name: "Bundesliga",
    country: "Germania",
    shortName: "BL1",
    emblem: "https://crests.football-data.org/BL1.png",
    flag: "https://crests.football-data.org/759.svg",
  },
  {
    code: "SA",
    slug: "serie-a",
    name: "Serie A",
    country: "Italia",
    shortName: "SA",
    emblem: "https://crests.football-data.org/SA.png",
    flag: "https://crests.football-data.org/784.svg",
  },
  {
    code: "PD",
    slug: "la-liga",
    name: "La Liga",
    country: "Spagna",
    shortName: "PD",
    emblem: "https://crests.football-data.org/PD.png",
    flag: "https://crests.football-data.org/760.svg",
  },
  {
    code: "FL1",
    slug: "ligue-1",
    name: "Ligue 1",
    country: "Francia",
    shortName: "FL1",
    emblem: "https://crests.football-data.org/FL1.png",
    flag: "https://crests.football-data.org/773.svg",
  },
  {
    code: "DED",
    slug: "eredivisie",
    name: "Eredivisie",
    country: "Paesi Bassi",
    shortName: "DED",
    emblem: "https://crests.football-data.org/ED.png",
    flag: "https://crests.football-data.org/8601.svg",
  },
  {
    code: "PPL",
    slug: "primeira-liga",
    name: "Primeira Liga",
    country: "Portogallo",
    shortName: "PPL",
    emblem: "https://crests.football-data.org/PPL.png",
    flag: "https://crests.football-data.org/765.svg",
  },
  {
    code: "BSA",
    slug: "brasileirao",
    name: "Brasileirão",
    country: "Brasile",
    shortName: "BSA",
    emblem: "https://crests.football-data.org/BSA.png",
    flag: "https://crests.football-data.org/764.svg",
  },
  {
    code: "CL",
    slug: "champions-league",
    name: "Champions League",
    country: "Europa",
    shortName: "UCL",
    emblem: "https://crests.football-data.org/CL.png",
    flag: "https://crests.football-data.org/EUR.svg",
  },
  {
    code: "WC",
    slug: "world-cup",
    name: "Mondiali",
    country: "Mondo",
    shortName: "WC",
    emblem: "https://crests.football-data.org/WC.png",
  },
  {
    code: "EC",
    slug: "europeo",
    name: "Europeo",
    country: "Europa",
    shortName: "EURO",
    emblem: "https://crests.football-data.org/EUR.png",
    flag: "https://crests.football-data.org/EUR.svg",
  },
];

const bySlug = new Map(LEAGUES.map((l) => [l.slug, l]));
const byCode = new Map(LEAGUES.map((l) => [l.code, l]));

export function getLeagueBySlug(slug: string): LeagueConfig | undefined {
  return bySlug.get(slug);
}

export function getLeagueByCode(code: LeagueCode): LeagueConfig | undefined {
  return byCode.get(code);
}

export function getAllLeagueSlugs(): string[] {
  return LEAGUES.map((l) => l.slug);
}

export const LEAGUE_SECTIONS = [
  { segment: "classifica", label: "Classifica" },
  { segment: "calendario", label: "Calendario" },
  { segment: "risultati", label: "Risultati" },
  { segment: "marcatori", label: "Marcatori" },
  { segment: "squadre", label: "Squadre" },
  { segment: "statistiche", label: "Statistiche" },
  { segment: "xg", label: "xG & advanced" },
  { segment: "forma", label: "Forma" },
  { segment: "infortuni", label: "Infortuni & forma" },
] as const;
