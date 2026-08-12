import {
  AMAZON_DISCLOSURE,
  amazonHomeUrl,
  amazonSearchUrl,
} from "@/lib/affiliates";

/** Barra full-bleed sopra il footer: un click → Amazon.it */
export function AmazonFooterStrip() {
  const store = amazonHomeUrl();
  const calcio = amazonSearchUrl("calcio");

  return (
    <section
      className="border-t border-[var(--line)] bg-[linear-gradient(90deg,#111_0%,#1a2208_50%,#111_100%)]"
      aria-label="Pubblicità Amazon"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
            Pubblicità · Amazon.it
          </p>
          <p className="display-font mt-1 text-lg font-bold uppercase tracking-wide text-[var(--ink)] sm:text-xl">
            Maglie, scarpe e gear — shop su Amazon
          </p>
          <p className="mt-1 max-w-xl text-[10px] text-[var(--muted)]">
            {AMAZON_DISCLOSURE}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href={calcio}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-accent inline-flex px-4 py-2 text-xs uppercase tracking-[0.14em]"
          >
            Cerca calcio su Amazon
          </a>
          <a
            href={store}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex border border-white/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] hover:border-[var(--accent)]"
          >
            Apri Amazon.it
          </a>
        </div>
      </div>
    </section>
  );
}
