export type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string | null;
};

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function tagValue(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = block.match(re);
  return match ? decodeXml(match[1].trim()) : "";
}

function parseRssItems(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const chunks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

  for (const chunk of chunks) {
    const title = tagValue(chunk, "title");
    const link = tagValue(chunk, "link");
    if (!title || !link) continue;

    const source = tagValue(chunk, "source") || "Google News";
    const publishedAt = tagValue(chunk, "pubDate") || null;
    const cleanTitle = title.replace(/\s+-\s+[^-]+$/, "").trim() || title;

    items.push({
      id: link,
      title: cleanTitle,
      link,
      source,
      publishedAt,
    });
  }

  return items;
}

function romeDayKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function itemDayKey(publishedAt: string | null): string | null {
  if (!publishedAt) return null;
  const t = Date.parse(publishedAt);
  if (Number.isNaN(t)) return null;
  return romeDayKey(new Date(t));
}

/** Solo ultime ~24h: le più vecchie non vengono tenute. */
const FEEDS = [
  {
    id: "calcio",
    url: "https://news.google.com/rss/search?q=calcio%20OR%20%22Serie%20A%22%20when%3A1d&hl=it&gl=IT&ceid=IT:it",
  },
  {
    id: "mercato",
    url: "https://news.google.com/rss/search?q=mercato%20calcio%20Serie%20A%20when%3A1d&hl=it&gl=IT&ceid=IT:it",
  },
] as const;

const MAX_NEWS = 20;

async function fetchFeed(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SidePitchHubBot/1.0 (+https://sidepitchhub.com)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssItems(xml);
  } catch {
    return [];
  }
}

/**
 * News calcio free del giorno (Europa/Roma).
 * Le notizie dei giorni precedenti vengono scartate (niente accumulo).
 */
export async function getFootballNews(limit = 16): Promise<NewsItem[]> {
  const cap = Math.min(Math.max(limit, 1), MAX_NEWS);
  const batches = await Promise.all(FEEDS.map((f) => fetchFeed(f.url)));
  const seen = new Set<string>();
  const today = romeDayKey();
  const ofToday: NewsItem[] = [];

  for (const batch of batches) {
    for (const item of batch) {
      const key = item.title.toLowerCase();
      if (seen.has(key)) continue;

      const day = itemDayKey(item.publishedAt);
      // Tieni solo oggi. Senza data (RSS) ok se il feed è already when:1d.
      if (day !== null && day !== today) continue;

      seen.add(key);
      ofToday.push(item);
      if (ofToday.length >= cap) break;
    }
    if (ofToday.length >= cap) break;
  }

  ofToday.sort((a, b) => {
    const at = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bt = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bt - at;
  });

  return ofToday.slice(0, cap);
}

const LEAGUE_FEED_QUERY: Record<string, string> = {
  "serie-a": "Serie%20A",
  "premier-league": "Premier%20League",
  "la-liga": "La%20Liga",
  bundesliga: "Bundesliga",
  "ligue-1": "Ligue%201",
  championship: "Championship%20EFL",
  eredivisie: "Eredivisie",
  "primeira-liga": "Primeira%20Liga",
  brasileirao: "Brasileir%C3%A3o",
};

/** News del giorno filtrate per campionato (RSS free). */
export async function getLeagueNews(
  leagueSlug: string,
  limit = 8,
): Promise<NewsItem[]> {
  const q = LEAGUE_FEED_QUERY[leagueSlug];
  if (!q) return getFootballNews(limit);

  const url =
    `https://news.google.com/rss/search?q=${q}%20when%3A1d&hl=it&gl=IT&ceid=IT:it`;
  const batch = await fetchFeed(url);
  const today = romeDayKey();
  const seen = new Set<string>();
  const out: NewsItem[] = [];

  for (const item of batch) {
    const key = item.title.toLowerCase();
    if (seen.has(key)) continue;
    const day = itemDayKey(item.publishedAt);
    if (day !== null && day !== today) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}
