import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Consentiamo crawler classici e bot AI/GEO (citazioni generative). */
const AI_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "GoogleOther",
  "anthropic-ai",
  "ClaudeBot",
  "PerplexityBot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "meta-externalagent",
] as const;

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ads.txt", "/llms.txt"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/ads.txt", "/llms.txt"],
      },
      {
        userAgent: "Mediapartners-Google",
        allow: ["/", "/ads.txt"],
      },
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: ["/", "/llms.txt", "/oggi", "/notizie", "/analisi"] as string[],
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
