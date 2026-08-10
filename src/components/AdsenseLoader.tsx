"use client";

import Script from "next/script";
import { adsenseClient } from "@/lib/site";

/** Script publisher sempre presente se configurato (serve anche alla review AdSense). */
export function AdsenseLoader() {
  const client = adsenseClient();
  if (!client) return null;

  return (
    <Script
      id="adsense-loader"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
}
