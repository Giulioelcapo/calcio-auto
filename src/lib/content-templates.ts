import type { CompetitionBundle, ScorerRow, TeamPageData } from "./types";

export function standingsIntro(data: CompetitionBundle): string {
  const { league, matchday, standings, seasonLabel } = data;
  const played = standings.some((r) => r.playedGames > 0);
  if (!played) {
    return `Classifica ${league.name} stagione ${seasonLabel}: il campionato non è ancora iniziato. Tabella a zero punti, pronta ad aggiornarsi automaticamente al via.`;
  }
  const md = matchday ? `dopo la giornata ${matchday}` : "in stagione";
  const leader = standings[0];
  if (!leader) {
    return `Classifica unica aggiornata di ${league.name} (${seasonLabel}). Aggiornamento automatico senza editing manuale.`;
  }
  const podium = standings
    .slice(0, 3)
    .map((r) => `${r.teamName} (${r.points} pt)`)
    .join(", ");
  return `Ecco la classifica unica aggiornata di ${league.name} (${league.country}) per la stagione ${seasonLabel}, ${md}. In vetta ${leader.teamName} con ${leader.points} punti. Podio: ${podium}.`;
}

export function standingsAnalysis(data: CompetitionBundle): string {
  const { league, standings } = data;
  if (standings.length < 3) {
    return `I dati di ${league.name} vengono ricalcolati a ogni sync automatico sulla stagione in corso.`;
  }
  const leader = standings[0];
  const chase = standings[1];
  const bottom = standings.slice(-2).map((r) => r.teamName).join(" e ");
  return `Il vantaggio di ${leader.teamName} su ${chase.teamName} è di ${leader.points - chase.points} punti. Nella zona bassa restano sotto pressione ${bottom}. Testo generato da template SEO + dati API.`;
}

export function fixturesIntro(data: CompetitionBundle, matchday?: number | null): string {
  const { league, seasonLabel, matches } = data;
  const md = matchday ?? data.matchday;
  const label = md ? `della giornata ${md}` : "del periodo corrente";
  const finished = matches.filter((m) => m.status === "FINISHED").length;
  return `Calendario ${label} di ${league.name} (${seasonLabel}): ${finished} risultati e ${matches.length - finished} gare in programma, orari in italiano.`;
}

export function fixturesAnalysis(data: CompetitionBundle): string {
  const next = data.matches.find((m) => m.status !== "FINISHED");
  if (!next) {
    return `Tutte le gare mostrate di ${data.league.name} risultano concluse. La prossima giornata arriverà in automatico.`;
  }
  const when = new Date(next.utcDate).toLocaleString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Prossimo highlight: ${next.homeTeam} vs ${next.awayTeam} (${when}).`;
}

export function resultsIntro(data: CompetitionBundle): string {
  const finished = data.matches.filter(
    (m) =>
      (m.status === "FINISHED" || m.status === "AWARDED") &&
      m.homeScore != null &&
      Date.parse(m.utcDate) <= Date.now(),
  );
  if (!finished.length) {
    return `Nessun risultato ufficiale per ${data.league.name} nella stagione ${data.seasonLabel}: il campionato non è ancora iniziato. Qui compariranno i punteggi appena le partite saranno terminate.`;
  }
  return `Risultati recenti di ${data.league.name} (${data.seasonLabel}): ${finished.length} partite concluse nella selezione corrente.`;
}

export function scorersIntro(data: CompetitionBundle): string {
  if (!data.scorersAvailable || !data.scorers.length) {
    return `I marcatori ufficiali di ${data.league.name} richiedono spesso il piano Deep Data di football-data.org. In assenza di feed, mostriamo comunque la sezione SEO pronta e, se disponibili, dati di esempio/cache.`;
  }
  const top = data.scorers[0];
  return `Classifica marcatori di ${data.league.name}: guida ${top.playerName} (${top.teamName}) con ${top.goals} gol.`;
}

export function scorersAnalysis(scorers: ScorerRow[]): string {
  if (scorers.length < 2) return "Elenco marcatori in aggiornamento.";
  const top = scorers[0];
  const second = scorers[1];
  return `Gap al vertice: ${top.playerName} precede ${second.playerName} di ${top.goals - second.goals} reti.`;
}

export function teamsIntro(data: CompetitionBundle): string {
  return `Elenco squadre di ${data.league.name} (${data.seasonLabel}): ${data.teams.length} club con pagine dedicate a calendario, risultati e insight di forma.`;
}

export function statsIntro(data: CompetitionBundle): string {
  return `Statistiche ${data.league.name} stagione ${data.seasonLabel}: PPG, gol per gara, indici attacco/difesa, over 2.5% e xG stimato. Aggiornamento automatico dai dati free.`;
}

export function xgIntro(data: CompetitionBundle): string {
  const leader = data.standings[0]?.teamName ?? "le top squadre";
  return `Expected goals (xG) stimati per ${data.league.name} ${data.seasonLabel}. Confronto xG, xGA e xGD per capire chi overperforma rispetto ai gol reali. In classifica ufficiale guida ${leader}.`;
}

export function formIntro(data: CompetitionBundle): string {
  return `Indice di forma ${data.league.name} ${data.seasonLabel}: sequenza W/D/L, punti per gara (PPG) e momentum delle squadre. Ideale per preview giornata e traffico SEO ricorrente.`;
}

export function injuriesIntro(data: CompetitionBundle): string {
  return `Sezione infortuni & forma di ${data.league.name}: il piano free non fornisce un elenco ufficiale assenze. Generiamo insight di rischio da form W/D/L, gol subiti e scarti di risultato.`;
}

export function leagueHubIntro(data: CompetitionBundle): string {
  const leader = data.standings[0]?.teamName ?? "la vetta";
  return `${data.league.name} — hub automatico classifica, calendario, risultati, squadre, marcatori, statistiche e monitoraggio forma (${data.seasonLabel}). Al momento guida ${leader}.`;
}

export function teamIntro(data: TeamPageData): string {
  const pos = data.standing
    ? `attualmente ${data.standing.position}ª con ${data.standing.points} punti`
    : "con scheda aggiornata";
  return `${data.team.name} in ${data.league.name}: ${pos}. Ultime partite, prossimi impegni e insight automatici per la stagione ${data.seasonLabel}.`;
}
