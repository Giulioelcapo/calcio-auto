import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { SEASON_LABEL } from "@/lib/season";
import type { CompetitionBundle, TeamPageData } from "@/lib/types";

/** Meta description max ~155–160 char per snippet Google. */
export function clipMeta(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function homeMetadata(): Metadata {
  return {
    title: {
      absolute: `Classifiche calcio e partite di oggi ${SEASON_LABEL} | ${SITE_NAME}`,
    },
    description: clipMeta(
      `Classifica Serie A, Premier League e altri campionati ${SEASON_LABEL}: partite di oggi, risultati, calendari e marcatori aggiornati. Hub calcio italiano ${SITE_NAME}.`,
    ),
    keywords: [
      "partite di oggi",
      "classifica serie a",
      "classifica premier league",
      "calendario serie a",
      "risultati calcio",
      "marcatori serie a",
      SEASON_LABEL,
      SITE_NAME,
    ],
    alternates: { canonical: "/" },
  };
}

export function oggiMetadata(): Metadata {
  return {
    title: `Partite di calcio di oggi: orari e risultati live`,
    description: clipMeta(
      `Partite di calcio di oggi con orari Europa/Roma e risultati live: Serie A, Premier League, Liga, Bundesliga e altri campionati. Aggiornamento automatico su ${SITE_NAME}.`,
    ),
    keywords: [
      "partite di oggi",
      "partite calcio oggi",
      "orari partite oggi",
      "risultati calcio oggi",
      "live score oggi",
    ],
    alternates: { canonical: "/oggi" },
  };
}

export function leagueHubMetadata(data: CompetitionBundle): Metadata {
  const name = data.league.name;
  return {
    title: `${name} ${data.seasonLabel}: classifica, calendario e risultati`,
    description: clipMeta(
      `${name} ${data.seasonLabel}: classifica aggiornata, calendario partite, risultati, marcatori e squadre. Consulta l'hub completo su ${SITE_NAME}.`,
    ),
    keywords: [
      name.toLowerCase(),
      `classifica ${name.toLowerCase()}`,
      `calendario ${name.toLowerCase()}`,
      `risultati ${name.toLowerCase()}`,
      data.seasonLabel,
    ],
    alternates: { canonical: `/${data.league.slug}` },
  };
}

export function classificaMetadata(data: CompetitionBundle): Metadata {
  const name = data.league.name;
  const leader = data.standings[0];
  const leadBit = leader
    ? ` In vetta ${leader.teamName} con ${leader.points} punti.`
    : "";
  return {
    title: `Classifica ${name} ${data.seasonLabel} aggiornata`,
    description: clipMeta(
      `Classifica ${name} ${data.seasonLabel} aggiornata oggi: punti, differenza reti e forma.${leadBit} Tabella completa su ${SITE_NAME}.`,
    ),
    keywords: [
      `classifica ${name.toLowerCase()}`,
      `classifica ${name.toLowerCase()} ${data.seasonLabel}`,
      `classifica ${name.toLowerCase()} aggiornata`,
      "punti classifica calcio",
    ],
    alternates: { canonical: `/${data.league.slug}/classifica` },
  };
}

export function calendarioMetadata(data: CompetitionBundle): Metadata {
  const name = data.league.name;
  return {
    title: `Calendario ${name} ${data.seasonLabel}: date e orari`,
    description: clipMeta(
      `Calendario ${name} ${data.seasonLabel}: prossime partite, date e orari Europa/Roma. Programma giornate aggiornato su ${SITE_NAME}.`,
    ),
    keywords: [
      `calendario ${name.toLowerCase()}`,
      `calendario ${name.toLowerCase()} ${data.seasonLabel}`,
      `prossime partite ${name.toLowerCase()}`,
    ],
    alternates: { canonical: `/${data.league.slug}/calendario` },
  };
}

export function risultatiMetadata(data: CompetitionBundle): Metadata {
  const name = data.league.name;
  return {
    title: `Risultati ${name} ${data.seasonLabel}`,
    description: clipMeta(
      `Risultati ${name} ${data.seasonLabel}: punteggi ufficiali e ultime partite concluse. Aggiornamento automatico su ${SITE_NAME}.`,
    ),
    keywords: [
      `risultati ${name.toLowerCase()}`,
      `risultati ${name.toLowerCase()} ${data.seasonLabel}`,
      `punteggi ${name.toLowerCase()}`,
    ],
    alternates: { canonical: `/${data.league.slug}/risultati` },
  };
}

export function marcatoriMetadata(data: CompetitionBundle): Metadata {
  const name = data.league.name;
  const top = data.scorers[0];
  const topBit =
    top && data.scorersAvailable
      ? ` Capocannoniere: ${top.playerName} (${top.goals} gol).`
      : "";
  return {
    title: `Marcatori ${name} ${data.seasonLabel}: classifica gol`,
    description: clipMeta(
      `Classifica marcatori ${name} ${data.seasonLabel}: gol e top scorer.${topBit} Aggiornata su ${SITE_NAME}.`,
    ),
    keywords: [
      `marcatori ${name.toLowerCase()}`,
      `classifica marcatori ${name.toLowerCase()}`,
      `capocannoniere ${name.toLowerCase()}`,
    ],
    alternates: { canonical: `/${data.league.slug}/marcatori` },
  };
}

export function teamMetadata(data: TeamPageData): Metadata {
  const pos = data.standing
    ? ` ${data.standing.position}ª in classifica con ${data.standing.points} punti.`
    : "";
  return {
    title: `${data.team.name}: classifica, risultati e calendario — ${data.league.name}`,
    description: clipMeta(
      `${data.team.name} in ${data.league.name} ${data.seasonLabel}:${pos} Ultime partite, prossimi impegni e forma su ${SITE_NAME}.`,
    ),
    keywords: [
      data.team.name.toLowerCase(),
      `classifica ${data.team.name.toLowerCase()}`,
      `calendario ${data.team.name.toLowerCase()}`,
      data.league.name.toLowerCase(),
    ],
  };
}

export function notizieMetadata(): Metadata {
  return {
    title: `Notizie calcio oggi: ultime news e mercato`,
    description: clipMeta(
      `Notizie calcio oggi e mercato: titoli aggiornati su Serie A, Premier League e campionati europei. Feed news su ${SITE_NAME}.`,
    ),
    keywords: ["notizie calcio", "news calcio oggi", "mercato calcio"],
    alternates: { canonical: "/notizie" },
  };
}

export function golMetadata(): Metadata {
  return {
    title: `Gol e marcatori calcio oggi — multi-lega`,
    description: clipMeta(
      `Gol e marcatori di oggi e classifica cannonieri multi-lega. Risultati e top scorer aggiornati su ${SITE_NAME}.`,
    ),
    keywords: ["gol oggi", "marcatori", "capocannoniere", "risultati gol"],
    alternates: { canonical: "/gol" },
  };
}

export function osservatoriMetadata(): Metadata {
  return {
    title: `Osservatori calcio: ScoutScore e KPI club`,
    description: clipMeta(
      `Osservatori calcio ${SITE_NAME}: ScoutScore giocatori e KPI club su Serie A, Premier League e altri campionati ${SEASON_LABEL}.`,
    ),
    keywords: [
      "osservatori calcio",
      "scout calcio",
      "statistiche giocatori",
      "kpi club",
    ],
    alternates: { canonical: "/osservatori" },
  };
}

export function analisiMetadata(): Metadata {
  return {
    title: `Analisi calcio: forma, streak e difficoltà calendario`,
    description: clipMeta(
      `Analisi calcio free: streak vittorie, difficoltà calendario, prossima giornata e meteo partite. Insight automatici su ${SITE_NAME}.`,
    ),
    keywords: [
      "analisi calcio",
      "forma squadre",
      "difficoltà calendario",
      "streak calcio",
    ],
    alternates: { canonical: "/analisi" },
  };
}
