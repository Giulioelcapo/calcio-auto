import Link from "next/link";
import { AmazonProductImage } from "@/components/AmazonProductImage";
import {
  AMAZON_DISCLOSURE,
  AMAZON_TRAFFIC_DEALS,
  amazonHomeUrl,
  offerHref,
} from "@/lib/affiliates";

type Props = {
  limit?: number;
  title?: string;
};

/** Rail shop Amazon: prodotti reali (foto CDN Amazon + link ASIN). */
export function AmazonShopRail({
  limit = 6,
  title = "Shop Amazon",
}: Props) {
  const deals = AMAZON_TRAFFIC_DEALS.slice(0, limit);
  const store = amazonHomeUrl();

  return (
    <section className="space-y-4" aria-label="Shop Amazon affiliate">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[var(--accent)] pb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
            Affiliate · Foto prodotto Amazon
          </p>
          <h2 className="display-font text-[clamp(1.35rem,3vw,1.85rem)] font-bold uppercase tracking-[0.04em]">
            {title}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={store}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-accent inline-flex px-3 py-1.5 text-xs uppercase tracking-[0.12em]"
          >
            Vai su Amazon.it
          </a>
          <Link
            href="/partner"
            className="inline-flex border border-[var(--line)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] hover:border-[var(--accent)]"
          >
            Tutte le offerte
          </Link>
        </div>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
        {deals.map((offer) => (
          <a
            key={offer.id}
            href={offerHref(offer)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="panel group w-[72%] max-w-[220px] shrink-0 overflow-hidden transition hover:border-[var(--accent)] sm:w-auto sm:max-w-none"
          >
            <div className="relative aspect-square overflow-hidden bg-white">
              <AmazonProductImage
                src={offer.imageSrc}
                alt={offer.imageAlt}
                sizes="180px"
              />
            </div>
            <div className="space-y-1 p-3">
              <h3 className="display-font text-sm font-bold uppercase leading-tight">
                {offer.title}
              </h3>
              <p className="text-[11px] text-[var(--muted)]">{offer.subtitle}</p>
              <span className="inline-block pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                {offer.cta} →
              </span>
            </div>
          </a>
        ))}
      </div>

      <p className="text-[10px] leading-relaxed text-[var(--muted)]">
        {AMAZON_DISCLOSURE}
      </p>
    </section>
  );
}
