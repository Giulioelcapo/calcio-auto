import type { MetadataRoute } from "next";
import { LEAGUE_SECTIONS, LEAGUES } from "@/lib/leagues";
import { siteUrl } from "@/lib/site";

const LEGAL = ["privacy", "cookie", "contatti", "chi-siamo"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1 },
    {
      url: `${base}/oggi`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${base}/notizie`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${base}/gol`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${base}/sondaggio`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.85,
    },
    {
      url: `${base}/osservatori`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.85,
    },
    {
      url: `${base}/analisi`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.85,
    },
    {
      url: `${base}/share/oggi`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.7,
    },
  ];

  for (const league of LEAGUES.slice(0, 12)) {
    entries.push({
      url: `${base}/share/classifica/${league.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  for (const path of LEGAL) {
    entries.push({
      url: `${base}/${path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    });
  }

  for (const league of LEAGUES) {
    entries.push({
      url: `${base}/${league.slug}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    });
    for (const section of LEAGUE_SECTIONS) {
      entries.push({
        url: `${base}/${league.slug}/${section.segment}`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
