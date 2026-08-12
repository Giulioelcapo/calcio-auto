import type { Metadata } from "next";
import Link from "next/link";
import {
  AFFILIATE_OFFERS,
  AMAZON_ASSOCIATES_JOIN,
  amazonAssociateTag,
  offerHref,
  SPONSOR_MAIL,
} from "@/lib/affiliates";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Partner e affiliazioni",
  description: `Partner commerciali di ${SITE_NAME}: shop calcio, sponsor e collaborazioni.`,
  alternates: { canonical: "/partner" },
};

export default function PartnerPage() {
  const tag = amazonAssociateTag();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="display-font text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
          Monetizzazione
        </p>
        <h1 className="display-font text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          Partner
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Offerte shop e spazi sponsor. Nessuna scommessa.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {AFFILIATE_OFFERS.map((offer) => (
          <a
            key={offer.id}
            href={offerHref(offer)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="panel block p-4 transition hover:border-[var(--accent)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Affiliate
            </p>
            <h2 className="display-font mt-2 text-xl font-bold uppercase">
              {offer.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{offer.subtitle}</p>
            <span className="btn-accent mt-4 inline-flex px-3 py-1.5 text-xs uppercase tracking-[0.12em]">
              {offer.cta}
            </span>
          </a>
        ))}
      </section>

      <section className="panel space-y-3 p-5">
        <h2 className="display-font text-lg font-bold uppercase">Sponsor</h2>
        <p className="text-sm text-[var(--muted)]">
          Banner e collaborazioni su {SITE_NAME}. Scrivi a{" "}
          <a
            href={SPONSOR_MAIL}
            className="text-[var(--accent)] hover:underline"
          >
            info@sidepitchhub.com
          </a>
          .
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={SPONSOR_MAIL}
            className="btn-accent inline-flex px-3 py-1.5 text-xs uppercase tracking-[0.12em]"
          >
            Contatta sponsor
          </a>
          <Link
            href="/contatti"
            className="inline-flex border border-[var(--line)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] hover:border-[var(--accent)]"
          >
            Contatti
          </Link>
        </div>
      </section>

      <section className="panel space-y-2 p-5 text-sm text-[var(--muted)]">
        <h2 className="display-font text-base font-bold uppercase text-[var(--ink)]">
          Amazon Associates
        </h2>
        <p>
          {SITE_NAME} è partecipante al Programma Affiliazione Amazon EU.
          Acquistando dai link potremmo ricevere una commissione, senza costi
          extra per te.
        </p>
        {tag ? (
          <p>
            Tag attivo:{" "}
            <span className="data-font text-[var(--accent)]">{tag}</span>
          </p>
        ) : (
          <p>
            Per le commissioni: iscriviti e imposta{" "}
            <span className="data-font">NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG</span>{" "}
            su Vercel (es. <span className="data-font">tuonome-21</span>).
          </p>
        )}
        <a
          href={AMAZON_ASSOCIATES_JOIN}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-[var(--accent)] hover:underline"
        >
          programma-affiliazione.amazon.it →
        </a>
      </section>
    </div>
  );
}
