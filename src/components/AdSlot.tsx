"use client";

import Image from "next/image";
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
  const isSide = slot === "side";

  const inner = isSide ? (
    <div className="flex h-full flex-col">
      {partner.imageSrc ? (
        <div className="relative h-36 shrink-0 overflow-hidden bg-[var(--panel-2)]">
          <Image
            src={partner.imageSrc}
            alt={partner.imageAlt || partner.title}
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
            Partner · Affiliate
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
            {partner.title}
          </p>
          <p className="text-xs text-[var(--muted)]">{partner.subtitle}</p>
        </div>
        <span className="btn-accent inline-flex w-fit px-3 py-1.5 text-xs uppercase tracking-[0.12em]">
          {partner.cta}
        </span>
      </div>
    </div>
  ) : (
    <div className="flex h-full min-h-[88px] items-stretch">
      {partner.imageSrc ? (
        <div className="relative w-28 shrink-0 overflow-hidden sm:w-40">
          <Image
            src={partner.imageSrc}
            alt={partner.imageAlt || partner.title}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
            Partner · Affiliate
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--ink)] sm:text-base">
            {partner.title}
          </p>
          <p className="text-xs text-[var(--muted)]">{partner.subtitle}</p>
        </div>
        <span className="btn-accent shrink-0 px-3 py-1.5 text-xs uppercase tracking-[0.12em]">
          {partner.cta}
        </span>
      </div>
    </div>
  );

  return (
    <aside
      className={`panel overflow-hidden ${className}`}
      aria-label={`Spazio partner ${slot}`}
    >
      {partner.external ? (
        <a
          href={partner.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block h-full transition hover:border-[var(--accent)]"
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

  return <PartnerBanner slot={slot} className={className} />;
}
