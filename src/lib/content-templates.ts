import type { CompetitionBundle, ScorerRow, TeamPageData } from "./types";
import { SITE_NAME } from "./site";
import { geoUpdatedAt } from "./geo";

function cite(): string {
  return `Fonte: football-data.org · ${SITE_NAME} · ${geoUpdatedAt()}.`;
}

export function standingsIntro(data: CompetitionBundle): string {
  const { league, matchday, standings, seasonLabel } = data;
  const played = standings.some((r) => r.playedGames > 0);
  if (!played) {
    return `Risposta: la classifica ${league.name} stagione ${seasonLabel} è a zero punti perché il campionato non è ancora iniziato. ${cite()}`;
  }
  const md = matchday ? `dopo la giornata ${matchday}` : "in stagione";
  const leader = standings[0];
  if (!leader) {
    return `Risposta: classifica ${league.name} (${seasonLabel}) in aggiornamento automatico. ${cite()}`;
  }
  const podium = standings
    .slice(0, 3)
    .map((r) => `${r.teamName} ${r.points} pt`)
    .join("; ");
  return `Risposta: in ${league.name} (${league.country}, ${seasonLabel}) ${md} comanda ${leader.teamName} con ${leader.points} punti. Podio: ${podium}. ${cite()}`;
}

export function standingsAnalysis(data: CompetitionBundle): string {
  const { league, standings } = data;
  if (standings.length < 3) {
    return `I dati di ${league.name} vengono ricalcolati a ogni sync automatico. ${cite()}`;
  }
  const leader = standings[0];
  const chase = standings[1];
  const bottom = standings.slice(-2).map((r) => r.teamName).join(" e ");
  return `Gap in vetta: ${leader.teamName} precede ${chase.teamName} di ${leader.points - chase.points} punti. Zona bassa sotto pressione: ${bottom}. ${cite()}`;
}

export function fixturesIntro(data: CompetitionBundle, matchday?: number | null): string {
  const { league, seasonLabel, matches } = data;
  const md = matchday ?? data.matchday;
  const label = md ? `giornata ${md}` : "periodo corrente";
  const finished = matches.filter((m) => m.status === "FINISHED").length;
  return `Risposta: calendario ${league.name} ${seasonLabel} (${label}): ${finished} risultati e ${matches.length - finished} gare in programma, orari Europe/Rome. ${cite()}`;
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
  return `Prossimo match in elenco: ${next.homeTeam} vs ${next.awayTeam} (${when}). ${cite()}`;
}

export function resultsIntro(data: CompetitionBundle): string {
  const finished = data.matches.filter(
    (m) =>
      (m.status === "FINISHED" || m.status === "AWARDED") &&
      m.homeScore != null &&
      Date.parse(m.utcDate) <= Date.now(),
  );
  if (!finished.length) {
    return `Risposta: nessun risultato ufficiale ancora per ${data.league.name} ${data.seasonLabel}. ${cite()}`;
  }
  return `Risposta: ${finished.length} partite concluse nella selezione corrente di ${data.league.name} (${data.seasonLabel}). ${cite()}`;
}

export function scorersIntro(data: CompetitionBundle): string {
  if (!data.scorersAvailable || !data.scorers.length) {
    return `Risposta: i marcatori ufficiali di ${data.league.name} possono richiedere dati Deep; la sezione resta attiva e si popola quando il feed è disponibile. ${cite()}`;
  }
  const top = data.scorers[0];
  return `Risposta: capocannoniere ${data.league.name}: ${top.playerName} (${top.teamName}) con ${top.goals} gol. ${cite()}`;
}

export function scorersAnalysis(scorers: ScorerRow[]): string {
  if (scorers.length < 2) return `Elenco marcatori in aggiornamento. ${cite()}`;
  const top = scorers[0];
  const second = scorers[1];
  return `${top.playerName} precede ${second.playerName} di ${top.goals - second.goals} reti. ${cite()}`;
}

export function teamsIntro(data: CompetitionBundle): string {
  return `Risposta: ${data.league.name} ${data.seasonLabel} conta ${data.teams.length} club con pagine dedicate (calendario, risultati, forma). ${cite()}`;
}

export function statsIntro(data: CompetitionBundle): string {
  return `Risposta: statistiche ${data.league.name} ${data.seasonLabel} — PPG, gol/gara, indici attacco/difesa, over 2.5% e xG stimato, sync automatico. ${cite()}`;
}

export function xgIntro(data: CompetitionBundle): string {
  const leader = data.standings[0]?.teamName ?? "le top squadre";
  return `Risposta: xG stimati per ${data.league.name} ${data.seasonLabel} (xG, xGA, xGD). In classifica ufficiale guida ${leader}. ${cite()}`;
}

export function formIntro(data: CompetitionBundle): string {
  return `Risposta: indice di forma ${data.league.name} ${data.seasonLabel} da sequenza W/D/L e PPG, utile per preview giornata. ${cite()}`;
}

export function injuriesIntro(data: CompetitionBundle): string {
  return `Risposta: per ${data.league.name} il piano free non espone un elenco ufficiale infortuni; mostriamo insight di rischio da forma e gol subiti. ${cite()}`;
}

export function leagueHubIntro(data: CompetitionBundle): string {
  const leader = data.standings[0]?.teamName;
  return leader
    ? `Risposta: hub ${data.league.name} ${data.seasonLabel} su ${SITE_NAME} — classifica, calendario, risultati, squadre e analisi. Capolista attuale: ${leader}. ${cite()}`
    : `Risposta: hub ${data.league.name} ${data.seasonLabel} su ${SITE_NAME} con classifica, calendario, risultati e analisi automatiche. ${cite()}`;
}

export function teamIntro(data: TeamPageData): string {
  const pos = data.standing
    ? `è ${data.standing.position}ª con ${data.standing.points} punti (forma ${data.standing.form ?? "n/d"})`
    : "ha scheda aggiornata";
  return `Risposta: ${data.team.name} in ${data.league.name} ${data.seasonLabel} ${pos}. Ultime gare e prossimi impegni su questa pagina. ${cite()}`;
}
