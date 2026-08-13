"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "calcioauto-cookie-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** GA4 solo dopo consenso cookie (come AdSense). */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function read() {
      setAllowed(window.localStorage.getItem(STORAGE_KEY) === "accepted");
    }
    read();
    window.addEventListener("calcioauto-consent", read as EventListener);
    return () =>
      window.removeEventListener("calcioauto-consent", read as EventListener);
  }, []);

  useEffect(() => {
    if (!allowed || !measurementId) return;
    if (typeof window.gtag !== "function") return;
    window.gtag("config", measurementId, { page_path: pathname });
  }, [allowed, measurementId, pathname]);

  if (!allowed || !measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${measurementId}', {
  anonymize_ip: true,
  send_page_view: true
});
`}</Script>
    </>
  );
}
