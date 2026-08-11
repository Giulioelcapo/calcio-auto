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

/** Feed free Google News: when:1d = ultime ~24h, sempre del giorno corrente. */
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

async function fetchFeed(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "CalcioAutoBot/1.0 (+https://calcio-auto.vercel.app)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      // Sempre fresco: 11 agosto → news dell'11, ecc.
      cache: "no-store",
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssItems(xml);
  } catch {
    return [];
  }
}

/** Titoli notizie calcio da Google News RSS (free). Solo headline + link fonte. */
export async function getFootballNews(limit = 24): Promise<NewsItem[]> {
  const batches = await Promise.all(FEEDS.map((f) => fetchFeed(f.url)));
  const seen = new Set<string>();
  const merged: NewsItem[] = [];

  for (const batch of batches) {
    for (const item of batch) {
      const key = item.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }

  const today = romeDayKey();
  merged.sort((a, b) => {
    const aToday = itemDayKey(a.publishedAt) === today ? 1 : 0;
    const bToday = itemDayKey(b.publishedAt) === today ? 1 : 0;
    if (aToday !== bToday) return bToday - aToday;
    const at = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bt = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bt - at;
  });

  // Preferisci news di oggi; se poche, completa con le più recenti when:1d
  const ofToday = merged.filter((i) => itemDayKey(i.publishedAt) === today);
  const rest = merged.filter((i) => itemDayKey(i.publishedAt) !== today);
  return [...ofToday, ...rest].slice(0, limit);
}
