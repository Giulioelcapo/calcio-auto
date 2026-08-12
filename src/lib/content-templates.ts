import type { CompetitionBundle, ScorerRow, TeamPageData } from "./types";
import { SITE_NAME } from "./site";
import { geoUpdatedAt } from "./geo";

function cite(): string {
  return `Aggiornato ${geoUpdatedAt()} · ${SITE_NAME}.`;
}

export function standingsIntro(data: CompetitionBundle): string {
  const { league, matchday, standings, seasonLabel } = data;
  const played = standings.some((r) => r.playedGames > 0);
  if (!played) {
    return `Classifica ${league.name} ${seasonLabel}: il campionato non è ancora iniziato, tabella a zero punti. ${cite()}`;
  }
  const md = matchday ? `dopo la giornata ${matchday}` : "in stagione";
  const leader = standings[0];
  if (!leader) {
    return `Classifica ${league.name} ${seasonLabel} in aggiornamento. ${cite()}`;
  }
  const podium = standings
    .slice(0, 3)
    .map((r) => `${r.teamName} ${r.points} pt`)
    .join("; ");
  return `Classifica ${league.name} ${seasonLabel} aggiornata ${md}: comanda ${leader.teamName} con ${leader.points} punti. Podio: ${podium}. ${cite()}`;
}

export function standingsAnalysis(data: CompetitionBundle): string {
  const { league, standings } = data;
  if (standings.length < 3) {
    return `I dati di ${league.name} vengono ricalcolati a ogni aggiornamento automatico. ${cite()}`;
  }
  const leader = standings[0];
  const chase = standings[1];
  const bottom = standings.slice(-2).map((r) => r.teamName).join(" e ");
  return `Nella classifica ${league.name}, ${leader.teamName} precede ${chase.teamName} di ${leader.points - chase.points} punti. Zona bassa sotto pressione: ${bottom}. ${cite()}`;
}

export function fixturesIntro(
  data: CompetitionBundle,
  matchday?: number | null,
): string {
  const { league, seasonLabel, matches } = data;
  const md = matchday ?? data.matchday;
  const label = md ? `giornata ${md}` : "periodo corrente";
  const finished = matches.filter((m) => m.status === "FINISHED").length;
  return `Calendario ${league.name} ${seasonLabel} (${label}): ${finished} risultati e ${matches.length - finished} gare in programma, orari Europa/Roma. ${cite()}`;
}

export function fixturesAnalysis(data: CompetitionBundle): string {
  const next = data.matches.find((m) => m.status !== "FINISHED");
  if (!next) {
    return `Tutte le gare mostrate di ${data.league.name} risultano concluse; la prossima giornata arriva in automatico. ${cite()}`;
  }
  const when = new Date(next.utcDate).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Prossima partita in calendario: ${next.homeTeam} vs ${next.awayTeam} (${when}). ${cite()}`;
}

export function resultsIntro(data: CompetitionBundle): string {
  const finished = data.matches.filter(
    (m) =>
      (m.status === "FINISHED" || m.status === "AWARDED") &&
      m.homeScore != null &&
      Date.parse(m.utcDate) <= Date.now(),
  );
  if (!finished.length) {
    return `Risultati ${data.league.name} ${data.seasonLabel}: nessun punteggio ufficiale ancora disponibile. ${cite()}`;
  }
  return `Risultati ${data.league.name} ${data.seasonLabel}: ${finished.length} partite concluse nella selezione corrente. ${cite()}`;
}

export function scorersIntro(data: CompetitionBundle): string {
  if (!data.scorersAvailable || !data.scorers.length) {
    return `Classifica marcatori ${data.league.name} ${data.seasonLabel}: in aggiornamento non appena il feed gol è disponibile. ${cite()}`;
  }
  const top = data.scorers[0];
  return `Marcatori ${data.league.name} ${data.seasonLabel}: capocannoniere ${top.playerName} (${top.teamName}) con ${top.goals} gol. ${cite()}`;
}

export function scorersAnalysis(scorers: ScorerRow[]): string {
  if (scorers.length < 2) return `Elenco marcatori in aggiornamento. ${cite()}`;
  const top = scorers[0];
  const second = scorers[1];
  return `${top.playerName} precede ${second.playerName} di ${top.goals - second.goals} reti nella classifica marcatori. ${cite()}`;
}

export function teamsIntro(data: CompetitionBundle): string {
  return `Squadre ${data.league.name} ${data.seasonLabel}: ${data.teams.length} club con pagine dedicate a calendario, risultati e forma. ${cite()}`;
}

export function statsIntro(data: CompetitionBundle): string {
  return `Statistiche ${data.league.name} ${data.seasonLabel}: PPG, gol a partita, indici attacco/difesa, over 2.5% e xG stimato. ${cite()}`;
}

export function xgIntro(data: CompetitionBundle): string {
  const leader = data.standings[0]?.teamName ?? "le top squadre";
  return `Expected goals (xG) ${data.league.name} ${data.seasonLabel}: confronto xG, xGA e xGD. In classifica ufficiale guida ${leader}. ${cite()}`;
}

export function formIntro(data: CompetitionBundle): string {
  return `Forma ${data.league.name} ${data.seasonLabel}: sequenza W/D/L, punti per gara (PPG) e momentum delle squadre. ${cite()}`;
}

export function injuriesIntro(data: CompetitionBundle): string {
  return `Infortuni e forma ${data.league.name}: insight di rischio da forma recente e gol subiti (senza elenco ufficiale assenze). ${cite()}`;
}

export function leagueHubIntro(data: CompetitionBundle): string {
  const leader = data.standings[0]?.teamName;
  return leader
    ? `${data.league.name} ${data.seasonLabel}: classifica, calendario, risultati, marcatori e squadre. Capolista attuale: ${leader}. ${cite()}`
    : `${data.league.name} ${data.seasonLabel}: classifica, calendario, risultati e analisi aggiornate su ${SITE_NAME}. ${cite()}`;
}

export function teamIntro(data: TeamPageData): string {
  const pos = data.standing
    ? `è ${data.standing.position}ª in classifica con ${data.standing.points} punti (forma ${data.standing.form ?? "n/d"})`
    : "ha scheda aggiornata";
  return `${data.team.name} in ${data.league.name} ${data.seasonLabel} ${pos}. Ultime partite, calendario e risultati su questa pagina. ${cite()}`;
}
