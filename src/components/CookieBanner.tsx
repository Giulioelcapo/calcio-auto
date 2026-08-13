"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "calcioauto-cookie-consent";

type Consent = "accepted" | "rejected" | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "accepted" || saved === "rejected") {
      setConsent(saved);
    }
    setReady(true);
  }, []);

  function choose(value: "accepted" | "rejected") {
    window.localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
    // Segnale per eventuali script ads personalizzati
    window.dispatchEvent(
      new CustomEvent("calcioauto-consent", { detail: value }),
    );
  }

  if (!ready || consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--panel)_96%,black)] p-4 shadow-2xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--muted)]">
          Usiamo cookie tecnici e, con il tuo consenso, cookie analitici
          (Google Analytics) e pubblicitari (Google AdSense). Maggiori info
          nella{" "}
          <Link href="/cookie" className="text-[var(--accent)] underline">
            Cookie Policy
          </Link>{" "}
          e nella{" "}
          <Link href="/privacy" className="text-[var(--accent)] underline">
            Privacy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="rounded border border-[var(--line)] px-3 py-2 text-xs uppercase tracking-wide hover:border-[var(--accent)]"
          >
            Rifiuta
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="btn-accent rounded px-3 py-2 text-xs uppercase tracking-wide"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
