import type { InsightCard, MatchItem, StandingRow } from "./types";

function parseForm(form: string | null): string[] {
  if (!form) return [];
  return form.replace(/[^WDL]/gi, "").toUpperCase().split("");
}

export function buildLeagueInsights(standings: StandingRow[]): InsightCard[] {
  if (!standings.length) return [];
  const cards: InsightCard[] = [];
  const leader = standings[0];
  const second = standings[1];
  if (leader && second) {
    cards.push({
      id: "gap",
      title: "Gap in vetta",
      body: `${leader.teamName} guida con ${leader.points} punti, ${leader.points - second.points} in più di ${second.teamName}.`,
      tone: "positive",
    });
  }

  const bestAttack = [...standings].sort((a, b) => b.goalsFor - a.goalsFor)[0];
  const worstDefense = [...standings].sort((a, b) => b.goalsAgainst - a.goalsAgainst)[0];
  if (bestAttack) {
    cards.push({
      id: "attack",
      title: "Attacco più prolifico",
      body: `${bestAttack.teamName} ha segnato ${bestAttack.goalsFor} gol (${(bestAttack.goalsFor / Math.max(1, bestAttack.playedGames)).toFixed(2)} a partita).`,
      tone: "positive",
    });
  }
  if (worstDefense) {
    cards.push({
      id: "defense",
      title: "Difesa sotto pressione",
      body: `${worstDefense.teamName} ha subito ${worstDefense.goalsAgainst} reti: monito per il rendimento recente.`,
      tone: "warning",
    });
  }

  const hot = standings
    .map((row) => ({ row, wins: parseForm(row.form).filter((r) => r === "W").length }))
    .sort((a, b) => b.wins - a.wins)[0];
  if (hot?.wins) {
    cards.push({
      id: "form",
      title: "Forma migliore",
      body: `${hot.row.teamName} ha ${hot.wins} vittorie nelle ultime uscite (form ${hot.row.form}).`,
      tone: "neutral",
    });
  }

  return cards;
}

export function buildInjuryInsights(
  standings: StandingRow[],
  matches: MatchItem[],
): InsightCard[] {
  // Nessun endpoint infortuni nel piano free: deriviamo rischi da forma e gol subiti.
  const cards: InsightCard[] = [];
  const cold = standings
    .map((row) => {
      const form = parseForm(row.form);
      const losses = form.filter((r) => r === "L").length;
      const concededRate = row.goalsAgainst / Math.max(1, row.playedGames);
      return { row, losses, concededRate, score: losses * 2 + concededRate };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  for (const item of cold) {
    cards.push({
      id: `risk-${item.row.teamId}`,
      title: `Allerta forma: ${item.row.teamName}`,
      body: `Nelle ultime partite risultano ${item.losses} sconfitte e ${item.row.goalsAgainst} gol subiti in stagione. Possibile impatto di turn-over, squalifiche o assenze (stima editoriale, non lista ufficiale infortuni).`,
      tone: "warning",
    });
  }

  const heavy = matches
    .filter((m) => m.status === "FINISHED" && m.homeScore != null && m.awayScore != null)
    .map((m) => ({
      match: m,
      total: (m.homeScore ?? 0) + (m.awayScore ?? 0),
      margin: Math.abs((m.homeScore ?? 0) - (m.awayScore ?? 0)),
    }))
    .sort((a, b) => b.margin - a.margin || b.total - a.total)[0];

  if (heavy) {
    cards.push({
      id: "heavy-defeat",
      title: "Partita ad alto stress fisico",
      body: `${heavy.match.homeTeam} ${heavy.match.homeScore}-${heavy.match.awayScore} ${heavy.match.awayTeam}: scarti ampi spesso correlano a rotazioni e recupero nelle giornate successive.`,
      tone: "neutral",
    });
  }

  if (!cards.length) {
    cards.push({
      id: "no-injury-feed",
      title: "Feed infortuni non incluso nel piano free",
      body: "football-data.org non espone un elenco ufficiale infortuni nel tier gratuito. Qui mostriamo insight di rischio basati su form e risultati.",
      tone: "neutral",
    });
  }

  return cards;
}

export function buildTeamInsights(
  standing: StandingRow | null,
  recent: MatchItem[],
  teamName: string,
): InsightCard[] {
  const cards: InsightCard[] = [];
  if (standing) {
    cards.push({
      id: "pos",
      title: "Posizione in classifica",
      body: `${teamName} è ${standing.position}ª con ${standing.points} punti (${standing.won}V ${standing.draw}N ${standing.lost}P), differenza reti ${standing.goalDifference >= 0 ? "+" : ""}${standing.goalDifference}.`,
      tone: standing.position <= 4 ? "positive" : standing.position >= 15 ? "warning" : "neutral",
    });
    if (standing.form) {
      cards.push({
        id: "team-form",
        title: "Forma recente",
        body: `Sequenza form: ${standing.form}. Utile per stimare carico e possibile gestione rosa.`,
        tone: "neutral",
      });
    }
  }

  const finished = recent.filter((m) => m.status === "FINISHED");
  if (finished.length) {
    const scored = finished.reduce((acc, m) => {
      const isHome = m.homeTeam === teamName;
      return acc + (isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0));
    }, 0);
    cards.push({
      id: "recent-goals",
      title: "Gol nelle ultime gare",
      body: `${teamName} ha segnato ${scored} gol nelle ultime ${finished.length} partite analizzate.`,
      tone: scored >= finished.length ? "positive" : "warning",
    });
  }

  return cards;
}

export function buildTeamInjuryInsights(standing: StandingRow | null, teamName: string): InsightCard[] {
  const form = parseForm(standing?.form ?? null);
  const losses = form.filter((r) => r === "L").length;
  if (losses >= 2) {
    return [
      {
        id: "team-risk",
        title: `Monitoraggio ${teamName}`,
        body: `${losses} sconfitte recenti nella form string. Senza API infortuni free, segnaliamo un rischio elevato di assenze/turn-over rispetto alla media del campionato.`,
        tone: "warning",
      },
    ];
  }
  return [
    {
      id: "team-ok",
      title: `Stabilità apparente: ${teamName}`,
      body: "Nessun segnale forte di crisi di risultati. La lista ufficiale infortuni non è disponibile nel piano API gratuito.",
      tone: "positive",
    },
  ];
}
