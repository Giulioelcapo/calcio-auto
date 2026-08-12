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
