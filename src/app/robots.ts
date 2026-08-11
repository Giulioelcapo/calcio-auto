import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ads.txt"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/ads.txt"],
      },
      {
        userAgent: "Mediapartners-Google",
        allow: ["/", "/ads.txt"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
