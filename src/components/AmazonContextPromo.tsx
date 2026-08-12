import Image from "next/image";
import {
  AMAZON_DISCLOSURE,
  amazonHomeUrl,
  amazonJerseyHref,
  offerBySlot,
  offerHref,
} from "@/lib/affiliates";

type Props = {
  /** Es. "Serie A" o "Inter" → maglia contestuale. */
  label: string;
  kind?: "league" | "team";
};

/** Promo Amazon contestuale su hub lega / pagina squadra. */
export function AmazonContextPromo({ label, kind = "league" }: Props) {
  const jersey = amazonJerseyHref(label);
  const store = amazonHomeUrl();
  const boots = offerHref(offerBySlot("in-content"));
  const cover = offerBySlot("top");

  return (
    <aside
      className="panel overflow-hidden"
      aria-label={`Shop Amazon ${label}`}
    >
      <div className="grid sm:grid-cols-[140px_1fr]">
        <div className="relative min-h-[120px] bg-[var(--panel-2)]">
          <Image
            src={cover.imageSrc}
            alt={cover.imageAlt}
            fill
            sizes="140px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-3 p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
              Amazon.it · Affiliate
            </p>
            <h2 className="display-font mt-1 text-xl font-bold uppercase leading-tight">
              {kind === "team"
                ? `Maglia ${label} su Amazon`
                : `Kit ${label} su Amazon`}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Offerte aggiornate · spedizione Amazon
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={jersey}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-accent inline-flex px-3 py-1.5 text-xs uppercase tracking-[0.12em]"
            >
              Maglie {label}
            </a>
            <a
              href={boots}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex border border-[var(--line)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] hover:border-[var(--accent)]"
            >
              Scarpe
            </a>
            <a
              href={store}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex border border-[var(--line)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] hover:border-[var(--accent)]"
            >
              Amazon.it
            </a>
          </div>
          <p className="text-[10px] text-[var(--muted)]">{AMAZON_DISCLOSURE}</p>
        </div>
      </div>
    </aside>
  );
}
