import type { Metadata } from "next";
import Link from "next/link";
import {
  AMAZON_ASSOCIATES_JOIN,
  AMAZON_DISCLOSURE,
  amazonAssociateTag,
  amazonHomeUrl,
  amazonSearchUrl,
  SPONSOR_MAIL,
} from "@/lib/affiliates";
import { AmazonShopRail } from "@/components/AmazonShopRail";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop Amazon — maglie, scarpe e gear",
  description: `Shop Amazon.it su ${SITE_NAME}: maglie ufficiali, palloni, scarpe e gadget calcio. Link affiliate.`,
  alternates: { canonical: "/partner" },
};

const QUICK = [
  { label: "Maglie ufficiali", q: "maglia calcio ufficiale" },
  { label: "Serie A kit", q: "maglia Serie A ufficiale" },
  { label: "Premier League", q: "maglia Premier League ufficiale" },
  { label: "Scarpe calcio", q: "scarpe calcio tacchetti" },
  { label: "Palloni", q: "pallone calcio professionale" },
  { label: "Regali tifo", q: "regalo tifoso calcio" },
] as const;

export default function PartnerPage() {
  const tag = amazonAssociateTag();
  const store = amazonHomeUrl();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="display-font text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
          Affiliate · Amazon.it
        </p>
        <h1 className="display-font text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          Shop Amazon
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Offerte calcio su Amazon.it. Ogni click supporta {SITE_NAME}.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={store}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-accent inline-flex px-4 py-2 text-xs uppercase tracking-[0.14em]"
          >
            Apri Amazon.it
          </a>
          <a
            href={amazonSearchUrl("calcio")}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex border border-[var(--line)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] hover:border-[var(--accent)]"
          >
            Cerca “calcio”
          </a>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="display-font text-lg font-bold uppercase">
          Ricerche rapide
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((item) => (
            <a
              key={item.q}
              href={amazonSearchUrl(item.q)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="border border-[var(--line)] px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {item.label} →
            </a>
          ))}
        </div>
      </section>

      <AmazonShopRail title="Categorie in evidenza" limit={6} />

      <section className="panel space-y-3 p-5">
        <h2 className="display-font text-lg font-bold uppercase">Sponsor</h2>
        <p className="text-sm text-[var(--muted)]">
          Banner e collaborazioni:{" "}
          <a
            href={SPONSOR_MAIL}
            className="text-[var(--accent)] hover:underline"
          >
            info@sidepitchhub.com
          </a>
        </p>
        <Link
          href="/contatti"
          className="inline-flex text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)] hover:text-[var(--accent)]"
        >
          Contatti →
        </Link>
      </section>

      <section className="space-y-2 text-sm text-[var(--muted)]">
        <p>{AMAZON_DISCLOSURE}</p>
        {tag ? (
          <p>
            Tag: <span className="data-font text-[var(--accent)]">{tag}</span>
          </p>
        ) : null}
        <a
          href={AMAZON_ASSOCIATES_JOIN}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-[var(--accent)] hover:underline"
        >
          Programma Affiliazione Amazon →
        </a>
      </section>
    </div>
  );
}
