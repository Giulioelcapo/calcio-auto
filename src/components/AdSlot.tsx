"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  adsenseClient,
  adsenseSlot,
  partnerSlot,
  type PartnerSlotKind,
} from "@/lib/site";

type AdSlotProps = {
  slot?: PartnerSlotKind;
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const STORAGE_KEY = "calcioauto-cookie-consent";

function PartnerBanner({
  slot,
  className,
}: {
  slot: PartnerSlotKind;
  className: string;
}) {
  const partner = partnerSlot(slot);
  const minH = slot === "side" ? "min-h-[120px]" : "min-h-[72px]";

  const inner = (
    <div className="flex h-full flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Partner
        </p>
        <p className="truncate text-sm font-semibold text-[var(--accent)]">
          {partner.title}
        </p>
        <p className="text-xs text-[var(--muted)]">{partner.subtitle}</p>
      </div>
      <span className="shrink-0 rounded bg-[var(--pitch)] px-3 py-1.5 text-xs font-medium hover:brightness-110">
        {partner.cta}
      </span>
    </div>
  );

  return (
    <aside
      className={`panel overflow-hidden rounded-md ${minH} ${className}`}
      aria-label={`Spazio partner ${slot}`}
    >
      {partner.external ? (
        <a
          href={partner.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block h-full"
        >
          {inner}
        </a>
      ) : (
        <Link href={partner.href} className="block h-full">
          {inner}
        </Link>
      )}
    </aside>
  );
}

export function AdSlot({ slot = "top", className = "" }: AdSlotProps) {
  const client = adsenseClient();
  const adSlotId = adsenseSlot(slot);
  const pushed = useRef(false);
  const [allowed, setAllowed] = useState(false);

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

  // AdSense solo se hai client + slot + consenso cookie
  if (client && adSlotId && allowed) {
    const minH = slot === "side" ? "min-h-[250px]" : "min-h-[90px]";
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

  // Senza AdSense: banner partner / affiliate / contatto sponsor
  return <PartnerBanner slot={slot} className={className} />;
}
