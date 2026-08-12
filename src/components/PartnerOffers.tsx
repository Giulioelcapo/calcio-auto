import Image from "next/image";
import Link from "next/link";
import {
  AFFILIATE_OFFERS,
  offerHref,
} from "@/lib/affiliates";

/** Griglia offerte affiliate (home / partner). */
export function PartnerOffers({ compact = false }: { compact?: boolean }) {
  const offers = compact ? AFFILIATE_OFFERS.slice(0, 3) : AFFILIATE_OFFERS;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[var(--accent)] pb-2">
        <h2 className="display-font text-[clamp(1.35rem,3vw,1.85rem)] font-bold uppercase tracking-[0.04em]">
          Shop partner
        </h2>
        <Link
          href="/partner"
          className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]"
        >
          Tutti i partner
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {offers.map((offer) => (
          <a
            key={offer.id}
            href={offerHref(offer)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="panel group block overflow-hidden transition hover:border-[var(--accent)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[var(--panel-2)]">
              <Image
                src={offer.imageSrc}
                alt={offer.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Affiliate · Amazon
              </p>
              <h3 className="display-font mt-2 text-lg font-bold uppercase leading-tight">
                {offer.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">{offer.subtitle}</p>
              <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                {offer.cta} →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
