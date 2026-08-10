"use client";

import { useEffect, useRef, useState } from "react";
import { adsenseClient, adsenseSlot } from "@/lib/site";

type AdSlotProps = {
  slot?: "top" | "side" | "in-content";
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const STORAGE_KEY = "calcioauto-cookie-consent";

export function AdSlot({ slot = "top", className = "" }: AdSlotProps) {
  const client = adsenseClient();
  const adSlotId = adsenseSlot(slot);
  const pushed = useRef(false);
  const [allowed, setAllowed] = useState(false);
  const minH = slot === "side" ? "min-h-[250px]" : "min-h-[90px]";

  useEffect(() => {
    function read() {
      setAllowed(window.localStorage.getItem(STORAGE_KEY) === "accepted");
    }
    read();
    window.addEventListener("calcioauto-consent", read);
    return () => window.removeEventListener("calcioauto-consent", read);
  }, []);

  useEffect(() => {
    if (!client || !adSlotId || !allowed || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adblock / race
    }
  }, [client, adSlotId, allowed]);

  // Niente placeholder pubblici finché non ci sono slot reali
  if (!client || !adSlotId) {
    return null;
  }

  if (!allowed) {
    return null;
  }

  return (
    <aside
      className={`overflow-hidden ${minH} ${className}`}
      aria-label={`Annuncio ${slot}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={adSlotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
