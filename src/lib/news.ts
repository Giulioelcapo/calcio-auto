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

const FEEDS = [
  {
    id: "calcio",
    url: "https://news.google.com/rss/search?q=calcio+OR+%22Serie+A%22&hl=it&gl=IT&ceid=IT:it",
  },
  {
    id: "mercato",
    url: "https://news.google.com/rss/search?q=mercato+calcio+Serie+A&hl=it&gl=IT&ceid=IT:it",
  },
] as const;

async function fetchFeed(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "CalcioAutoBot/1.0 (+https://calcio-auto.vercel.app)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      next: { revalidate: 1800 },
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
      if (merged.length >= limit) return merged;
    }
  }

  return merged;
}
