export type BlogCategory =
  | "analisi"
  | "performance"
  | "osservatori"
  | "guida";

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  updated?: string;
  author: string;
  category: BlogCategory;
  tags: string[];
  /** Se true non compare in listing/sitemap */
  draft?: boolean;
  body: BlogBlock[];
};

export const BLOG_CATEGORIES: Record<BlogCategory, string> = {
  analisi: "Analisi",
  performance: "Performance",
  osservatori: "Osservatori",
  guida: "Guida",
};

/**
 * Articoli editoriali — aggiungi un oggetto qui per pubblicare.
 * Poi appare su /blog e /blog/[slug].
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "coppa-italia-come-leggere-le-partite-dei-trentaduesimi",
    title: "Coppa Italia: come leggere le partite dei trentaduesimi",
    description:
      "Guida pratica alle partite di Coppa Italia (trentaduesimi): cosa guardare oltre il risultato, turnover, ritmo e come seguire aggiornamenti su Side Pitch Hub.",
    date: "2026-08-14",
    author: "Giulio · Side Pitch Hub",
    category: "analisi",
    tags: [
      "coppa italia",
      "trentaduesimi",
      "partite coppa italia",
      "analisi calcio",
      "turno preliminare",
    ],
    body: [
      {
        type: "p",
        text: "La Coppa Italia entra nel vivo con i trentaduesimi: partite spesso sottovalutate, ma ricche di segnali. Ci sono big che ruotano la rosa, squadre di Serie B o C che giocano la “partita dell’anno”, e ritmi diversi dal campionato. Qui un metodo semplice per leggere queste gare — senza quote scommesse.",
      },
      {
        type: "h2",
        text: "Perché i trentaduesimi non sono “amichevoli”",
      },
      {
        type: "p",
        text: "Per le favorite è gestione del carico e test di profondità di rosa. Per le outsider è eliminazione diretta: pressione, aggressività e pochi ripensamenti. Il risultato conta, ma per un osservatore contano anche intenzioni di gioco, tenuta dopo l’ora di gioco e reazione ai cambi.",
      },
      {
        type: "ul",
        items: [
          "Turnover: quanti titolari di campionato restano fuori?",
          "Intensità primi 20’: le outsider spesso partono fortissime",
          "Gestione del vantaggio: le big chiudono o lasciano spazio?",
        ],
      },
      {
        type: "h2",
        text: "Cosa guardare minuto per minuto",
      },
      {
        type: "p",
        text: "Non serve un modello complicato. Bastano quattro domande durante la partita:",
      },
      {
        type: "ul",
        items: [
          "Chi impone il campo? (possesso sterile vs progressioni in area)",
          "Quante conclusioni chiare arrivano, non solo tiri da lontano?",
          "Il pressing alto è organizzato o solo “corsa”?",
          "Dopo il 60’: cala la squadra inferiore di categoria o tiene?",
        ],
      },
      {
        type: "quote",
        text: "In Coppa Italia il risultato elimina. L’analisi spiega se quel risultato era sostenibile.",
      },
      {
        type: "h2",
        text: "Segnali utili post-partita (anche senza xG pagati)",
      },
      {
        type: "p",
        text: "Con i dati free puoi comunque costruire un giudizio onesto: gol e risultato ufficiale, andamento della squadra in campionato (forma, PPG, casa/trasferta) e confronto con il prossimo impegno di Serie A. Se una big fatica contro un avversario di categoria inferiore, il segnale non è “crisi totale”, ma va annotato su ritmo e attenzione difensiva.",
      },
      {
        type: "ul",
        items: [
          "Risultato + scarto: 1-0 di misura ≠ 4-0 di controllo",
          "Forma in campionato delle due squadre (se disponibili)",
          "Note su giocatori giovani o riserve che hanno impattato",
        ],
      },
      {
        type: "h2",
        text: "Come seguirla su Side Pitch Hub",
      },
      {
        type: "p",
        text: "Per orari e risultati aggregati del giorno usa Partite di oggi. Per il contesto di campionato delle squadre di Serie A apri classifica, calendario e Osservatori. Le news del giorno raccolgono spesso i pezzi ufficiali sulle gare di Coppa (comunicati Lega, biglietti, anteprime).",
      },
      {
        type: "ul",
        items: [
          "Partite di oggi: https://sidepitchhub.com/oggi",
          "Notizie calcio: https://sidepitchhub.com/notizie",
          "Classifica Serie A: https://sidepitchhub.com/serie-a/classifica",
          "Osservatori (KPI club / ScoutScore): https://sidepitchhub.com/osservatori",
        ],
      },
      {
        type: "h2",
        text: "In sintesi",
      },
      {
        type: "p",
        text: "Nei trentaduesimi di Coppa Italia guarda oltre lo score: turnover, intensità iniziale, qualità delle conclusioni e tenuta nel finale. È il turno in cui le outsider possono creare l’impresa — e le big mostrano quanto sono profonde. Usa i dati di campionato come contesto, non come verdetto sulla singola sera di coppa.",
      },
    ],
  },
  {
    slug: "prime-giornate-serie-a-cosa-guardare-oltre-la-classifica",
    title: "Prime giornate Serie A: cosa guardare oltre la classifica",
    description:
      "Inizio stagione 2026/2027: come leggere le prime giornate di Serie A senza farsi ingannare dai punti. Forma, calendario, casa/trasferta e segnali Osservatori.",
    date: "2026-08-14",
    author: "Giulio · Side Pitch Hub",
    category: "analisi",
    tags: [
      "serie a",
      "prime giornate",
      "classifica serie a",
      "analisi calcio",
      "inizio stagione",
    ],
    body: [
      {
        type: "p",
        text: "All’inizio di una stagione di Serie A la classifica mente spesso. Tre punti dopo la prima giornata non fanno un progetto; zero punti non chiudono un campionato. Per tifosi, media e osservatori conta leggere i segnali giusti: ritmo gol, contesto del calendario e differenza tra risultato e prestazione.",
      },
      {
        type: "p",
        text: "Su Side Pitch Hub i dati si aggiornano in automatico (football-data.org, stagione 2026/2027). Qui sotto trovi un metodo semplice, senza quote scommesse, per non farti trascinare dal solo ordinamento a punti.",
      },
      {
        type: "h2",
        text: "1. I punti delle prime giornate sono rumore (quasi sempre)",
      },
      {
        type: "p",
        text: "Nelle prime 3–5 giornate il campione di partite è troppo piccolo. Una vittoria di misura in casa contro una neopromossa e una sconfitta in trasferta contro una big pesano uguale in classifica, ma raccontano storie diverse. Meglio affiancare ai punti: gol fatti/subiti a partita, differenza reti e andamento casa/trasferta.",
      },
      {
        type: "ul",
        items: [
          "PPG (punti a gara): utile già dopo 3 match, meglio del solo “posti in classifica”",
          "GF/G e GS/G: ritmo offensivo e tenuta",
          "Forma W/D/L: momentum, da leggere sempre col calendario",
        ],
      },
      {
        type: "h2",
        text: "2. Il calendario iniziale decide chi “sembra” forte",
      },
      {
        type: "p",
        text: "Due squadre con 7 punti su 9 possono aver affrontato percorsi opposti. Prima di proclamare crisi o boom, apri il calendario e chiediti: avversari sopra o sotto la metà classifica? Quante trasferte? Quanti match a 48–72 ore di distanza?",
      },
      {
        type: "quote",
        text: "All’inizio stagione la classifica misura il percorso quanto la qualità.",
      },
      {
        type: "h2",
        text: "3. Casa e trasferta: lo split che molti ignorano",
      },
      {
        type: "p",
        text: "Alcuni club partono fortissimi in casa e soffrono fuori. Altri fanno il contrario. Confrontare PPG casa vs trasferta evita giudizi grossolani. In Osservatori Side Pitch Hub il radar club mostra anche questo gap, insieme a indici di attacco e difesa relativi alla media del campionato.",
      },
      {
        type: "h2",
        text: "4. Cosa guardare lato giocatori (quando arrivano i gol)",
      },
      {
        type: "p",
        text: "Appena l’API pubblica i marcatori, ha senso guardare chi produce gol/assist e quanto pesa sul totale della propria squadra (share). Un attaccante che segna molto in un contesto difficile (squadra a metà-bassa classifica) è un segnale diverso da chi gonfia i numeri in un attacco già dominante.",
      },
      {
        type: "ul",
        items: [
          "ScoutScore e categorie (Hot, Gem, Creator…): ordinano segnali, non sostituiscono la visione live",
          "% gol sulla squadra: dipendenza / uomo-chiave",
          "Open-play vs rigori: qualità della produzione",
        ],
      },
      {
        type: "h2",
        text: "5. Routine pratica per ogni weekend",
      },
      {
        type: "ul",
        items: [
          "Partite di oggi → orari e risultati: https://sidepitchhub.com/oggi",
          "Classifica Serie A → punti + contesto: https://sidepitchhub.com/serie-a/classifica",
          "Osservatori → radar club e (quando attivi) giocatori: https://sidepitchhub.com/osservatori",
          "Blog → metodo e approfondimenti senza rumor di mercato",
        ],
      },
      {
        type: "h2",
        text: "In sintesi",
      },
      {
        type: "p",
        text: "Nelle prime giornate di Serie A non cercare verdetti: cerca pattern. Punti sì, ma con PPG, ritmo gol, split casa/trasferta e difficoltà del calendario. È il modo più onesto di seguire l’inizio stagione — e di usare i dati senza trasformarli in scommesse.",
      },
    ],
  },
  {
    slug: "come-leggere-la-forma-di-una-squadra",
    title: "Come leggere la forma di una squadra (senza farsi ingannare)",
    description:
      "Guida pratica: W/D/L, PPG, avversari e contesto. Come usare la forma per analisi calcio e preview giornata.",
    date: "2026-08-12",
    author: "Giulio · Side Pitch Hub",
    category: "analisi",
    tags: ["forma", "ppg", "analisi calcio", "serie a"],
    body: [
      {
        type: "p",
        text: "La forma di una squadra è una delle metriche più cercate prima di una giornata, ma anche una delle più fraintese. Tre vittorie di fila non dicono tutto: conta contro chi, dove e con quale carico di gol.",
      },
      {
        type: "h2",
        text: "Cosa misura davvero la forma",
      },
      {
        type: "p",
        text: "In Side Pitch Hub la forma parte dalla sequenza W/D/L (vittoria, pareggio, sconfitta) e dal PPG (punti per gara). È un riassunto della fase recente, non una previsione automatica.",
      },
      {
        type: "ul",
        items: [
          "W/D/L: momentum emotivo e risultati grezzi",
          "PPG recente: densità di punti, più utile del solo streak",
          "Contesto: casa/trasferta e livello degli avversari",
        ],
      },
      {
        type: "h2",
        text: "Tre errori comuni",
      },
      {
        type: "ul",
        items: [
          "Guardare solo le ultime 5 senza leggere il calendario",
          "Ignorare la differenza reti (una 1-0 e una 4-0 non sono uguali)",
          "Confondere forma con qualità di roster o xG",
        ],
      },
      {
        type: "quote",
        text: "La forma spiega il momento. L’analisi spiega se quel momento è sostenibile.",
      },
      {
        type: "h2",
        text: "Come usarla su Side Pitch Hub",
      },
      {
        type: "p",
        text: "Apri la sezione Forma del campionato, incrocia con Classifica e Calendario, e per un focus club passa alla pagina squadra. Per un angolo scouting, combina forma e Osservatori (ScoutScore / KPI).",
      },
      {
        type: "p",
        text: "Questo pezzo è editoriale: puoi riscriverlo con i tuoi esempi (Serie A, Premier, ecc.) e aggiungere screenshot o tabelle quando la stagione è in corso.",
      },
    ],
  },
  {
    slug: "osservatori-kpi-e-scoutscore-spiegati",
    title: "Osservatori: KPI club e ScoutScore spiegati in pratica",
    description:
      "Cosa guarda un osservatore moderno: performance, profilo giocatore e KPI di squadra. Come leggere ScoutScore su Side Pitch Hub.",
    date: "2026-08-12",
    author: "Giulio · Side Pitch Hub",
    category: "osservatori",
    tags: ["osservatori", "scoutscore", "kpi", "performance", "scouting"],
    body: [
      {
        type: "p",
        text: "Side Pitch Hub non è solo classifica live: la sezione Osservatori serve a chi valuta performance e profili, non solo il risultato della domenica.",
      },
      {
        type: "h2",
        text: "ScoutScore in una frase",
      },
      {
        type: "p",
        text: "ScoutScore è un indice sintetico per confrontare giocatori nel contesto dei dati disponibili. Non sostituisce la visione dal vivo, ma ordina segnali utili: produzione, regolarità, impatto relativo al ruolo.",
      },
      {
        type: "h2",
        text: "KPI club: cosa conta",
      },
      {
        type: "ul",
        items: [
          "Solidità: gol subiti, forma difensiva, streak negativi",
          "Output: gol fatti, PPG, capacità di chiudere le partite",
          "Equilibrio: quando attacco e difesa non vanno di pari passo",
        ],
      },
      {
        type: "quote",
        text: "Un buon osservatore non cerca il numero più alto: cerca il profilo giusto per un sistema di gioco.",
      },
      {
        type: "h2",
        text: "Workflow consigliato",
      },
      {
        type: "p",
        text: "1) Filtra per campionato. 2) Guarda i top ScoutScore. 3) Apri il club correlato e confronta i KPI. 4) Torna a calendario e forma per capire se i numeri arrivano contro avversari forti o deboli.",
      },
      {
        type: "p",
        text: "Usa questo articolo come base: sostituisci gli esempi con i tuoi report di osservazione (Under, senior, focus ruolo) quando pubblichi pezzi nuovi.",
      },
    ],
  },
  {
    slug: "performance-senza-quote-come-analizzare-una-giornata",
    title: "Performance senza quote: come analizzare una giornata",
    description:
      "Metodo AdSense-safe: difficoltà calendario, streak, H2H e contesto. Analisi performance calcio senza scommesse.",
    date: "2026-08-12",
    author: "Giulio · Side Pitch Hub",
    category: "performance",
    tags: ["performance", "giornata", "h2h", "analisi"],
    body: [
      {
        type: "p",
        text: "Analizzare una giornata non significa cercare una “puntata”. Significa capire carico, matchup e stato di forma — linguaggio chiaro per tifosi, media e osservatori.",
      },
      {
        type: "h2",
        text: "Checklist pre-giornata",
      },
      {
        type: "ul",
        items: [
          "Difficoltà del calendario recente e prossimo",
          "Streak W o L e se è gonfiato da avversari deboli",
          "H2H solo come contesto storico, non come verità",
          "Note su ritmi gol (fatti/subiti) e eventuali vuoti di rosa",
        ],
      },
      {
        type: "h2",
        text: "Dove trovare i pezzi su Side Pitch Hub",
      },
      {
        type: "p",
        text: "Usa Analisi (free desk), le pagine Forma/Statistiche del campionato e le schede squadra. Le partite di oggi restano l’entry point operativo.",
      },
      {
        type: "p",
        text: "Quando scrivi i tuoi articoli, resta su performance e lettura dati: niente odds, niente “pronostici paganti”.",
      },
    ],
  },
];

export function listBlogPosts(): BlogPost[] {
  return BLOG_POSTS.filter((p) => !p.draft).sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return listBlogPosts().find((p) => p.slug === slug);
}

export function getBlogSlugs(): string[] {
  return listBlogPosts().map((p) => p.slug);
}

export function formatBlogDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function blogPath(slug: string): string {
  return `/blog/${slug}`;
}
