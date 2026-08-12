import { SITE_NAME, SITE_TAGLINE, contactEmail, siteUrl } from "@/lib/site";
import { LEAGUES } from "@/lib/leagues";
import { SEASON_LABEL } from "@/lib/season";
import type { CompetitionBundle } from "@/lib/types";

export type FaqItem = {
  question: string;
  answer: string;
};

/** Timestamp Europa/Roma per citazioni AI. */
export function geoUpdatedAt(date = new Date()): string {
  return date.toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function organizationJsonLd() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: base,
    description: SITE_TAGLINE,
    email: contactEmail(),
    logo: `${base}/logo-sp.png`,
    sameAs: [base],
  };
}

export function websiteJsonLd() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: base,
    description: `${SITE_TAGLINE}. Classifiche, calendari, risultati e analisi sui 12 campionati free di football-data.org, stagione ${SEASON_LABEL}.`,
    inLanguage: "it-IT",
    publisher: { "@type": "Organization", name: SITE_NAME, url: base },
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/oggi`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqPageJsonLd(faqs: FaqItem[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: pageUrl,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function sportsLeagueJsonLd(data: CompetitionBundle) {
  const base = siteUrl();
  const leader = data.standings[0];
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: data.league.name,
    sport: "Soccer",
    url: `${base}/${data.league.slug}`,
    description: leader
      ? `${data.league.name} (${data.league.country}), stagione ${data.seasonLabel}. Capolista: ${leader.teamName} (${leader.points} pt). Dati football-data.org su ${SITE_NAME}.`
      : `${data.league.name} (${data.league.country}), stagione ${data.seasonLabel}. Dati football-data.org su ${SITE_NAME}.`,
  };
}

/** FAQ evergreen (home / chi siamo) — domande naturali per LLM. */
export function siteFaqs(): FaqItem[] {
  const leagues = LEAGUES.map((l) => l.name).join(", ");
  return [
    {
      question: `Cos'è ${SITE_NAME}?`,
      answer: `${SITE_NAME} è un hub di calcio in italiano, pensato anche in modo specifico per osservatori: pubblica automaticamente classifiche, calendari, risultati, marcatori, statistiche, insight e strumenti Osservatori (ScoutScore e KPI club) sui 12 campionati del piano free di football-data.org (tra cui ${leagues}). Stagione di riferimento: ${SEASON_LABEL}. Non pubblica quote scommesse.`,
    },
    {
      question: "Dove vedere le partite di calcio di oggi?",
      answer: `Su ${siteUrl()}/oggi trovi orari e risultati delle partite di oggi (fuso Europa/Roma), aggregati dai campionati free supportati. La pagina si aggiorna automaticamente.`,
    },
    {
      question: `Quali campionati copre ${SITE_NAME}?`,
      answer: `Copre i 12 campionati free di football-data.org: ${leagues}. Per ciascuno trovi hub, classifica, calendario, risultati, squadre e analisi.`,
    },
    {
      question: "Dove trovo la classifica Serie A aggiornata?",
      answer: `La classifica Serie A ${SEASON_LABEL} è su ${siteUrl()}/serie-a/classifica, con tabella unica, punti, differenza reti e aggiornamento automatico.`,
    },
    {
      question: `${SITE_NAME} mostra quote scommesse?`,
      answer: `No. ${SITE_NAME} non pubblica quote o odds di scommesse: solo dati di campionato, news e analisi, più eventuali link shop affiliate (es. Amazon) e annunci display.`,
    },
  ];
}

export function todayFaqs(matchCount: number, updatedAt: string): FaqItem[] {
  return [
    {
      question: "Quali partite di calcio ci sono oggi?",
      answer:
        matchCount > 0
          ? `Oggi su ${SITE_NAME} risultano ${matchCount} partite nei campionati monitorati. Elenco completo con orari (Europa/Roma) su ${siteUrl()}/oggi. Aggiornato: ${updatedAt}.`
          : `Al momento non risultano partite odierne nei 12 campionati free monitorati. Controlla ${siteUrl()}/oggi per l'aggiornamento live. Rilevazione: ${updatedAt}.`,
    },
    {
      question: "Come sono aggiornate le partite di oggi?",
      answer: `Gli orari e gli stati (programmata, live, finita) arrivano da football-data.org e vengono mostrati in italiano su ${SITE_NAME}. Fuso orario di visualizzazione: Europe/Rome.`,
    },
  ];
}

export function leagueFaqs(data: CompetitionBundle): FaqItem[] {
  const base = siteUrl();
  const slug = data.league.slug;
  const leader = data.standings[0];
  const updated = geoUpdatedAt();
  return [
    {
      question: `Chi è primo in ${data.league.name} ${data.seasonLabel}?`,
      answer: leader
        ? `Al momento guida ${leader.teamName} con ${leader.points} punti (partite giocate: ${leader.playedGames}, differenza reti: ${leader.goalDifference}). Fonte: football-data.org via ${SITE_NAME}. Aggiornato: ${updated}. Classifica: ${base}/${slug}/classifica.`
        : `La classifica di ${data.league.name} ${data.seasonLabel} non ha ancora righe complete. Controlla ${base}/${slug}/classifica.`,
    },
    {
      question: `Dove vedere la classifica ${data.league.name} aggiornata?`,
      answer: `Su ${base}/${slug}/classifica trovi la classifica unica ${data.seasonLabel} con punti, gol e forma. Hub campionato: ${base}/${slug}.`,
    },
    {
      question: `Calendario e risultati ${data.league.name}: dove sono?`,
      answer: `Calendario: ${base}/${slug}/calendario. Risultati: ${base}/${slug}/risultati. Marcatori: ${base}/${slug}/marcatori. Dati automatici stagione ${data.seasonLabel}.`,
    },
  ];
}

export function standingsFaqs(data: CompetitionBundle): FaqItem[] {
  const leader = data.standings[0];
  const second = data.standings[1];
  const updated = geoUpdatedAt();
  const base = siteUrl();
  return [
    {
      question: `Classifica ${data.league.name} ${data.seasonLabel}: chi comanda?`,
      answer: leader
        ? `${leader.teamName} è capolista con ${leader.points} punti` +
          (second
            ? `; ${second.teamName} è secondo a ${leader.points - second.points} punti di distanza.`
            : ".") +
          ` Tabella completa: ${base}/${data.league.slug}/classifica. Aggiornato ${updated} (fonte football-data.org).`
        : `Classifica ${data.league.name} in aggiornamento su ${base}/${data.league.slug}/classifica.`,
    },
    {
      question: `Come si legge la classifica ${data.league.name} su ${SITE_NAME}?`,
      answer: `Mostriamo la classifica TOTAL ufficiale: posizione, punti, partite, gol fatti/subiti, differenza reti e forma (W/D/L). Stagione ${data.seasonLabel}, paese ${data.league.country}.`,
    },
  ];
}

/** Blocco risposta diretta (prima frase citabile dai modelli). */
export function directAnswer(text: string, sourceNote?: string): string {
  const note =
    sourceNote ??
    `Fonte dati: football-data.org · Editore: ${SITE_NAME} · Aggiornato: ${geoUpdatedAt()}.`;
  return `${text} ${note}`;
}
