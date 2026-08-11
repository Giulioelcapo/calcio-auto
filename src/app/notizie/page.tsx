import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { getFootballNews } from "@/lib/news";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Notizie calcio e mercato",
  description: `Ultime notizie di calcio e mercato in italiano su ${SITE_NAME}: titoli aggiornati con link alle fonti originali.`,
  alternates: { canonical: "/notizie" },
};

function formatWhen(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(+date)) return null;
  return date.toLocaleString("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NotiziePage() {
  const news = await getFootballNews(18);
  const featured = news[0];
  const rest = news.slice(1);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="display-font text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
          Aggregatore
        </p>
        <h1 className="display-font text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          Notizie calcio e mercato
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Titoli aggiornati automaticamente. Solo headline e link alle fonti
          originali.
        </p>
      </section>

      <AdSlot slot="top" />

      {featured ? (
        <a
          href={featured.link}
          target="_blank"
          rel="noopener noreferrer"
          className="panel group block p-5 transition hover:border-[var(--accent)] sm:p-7"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            {featured.source}
            {formatWhen(featured.publishedAt)
              ? ` · ${formatWhen(featured.publishedAt)}`
              : ""}
          </p>
          <h2 className="display-font mt-3 text-2xl font-bold uppercase leading-tight tracking-tight group-hover:text-[var(--accent)] sm:text-4xl">
            {featured.title}
          </h2>
        </a>
      ) : null}

      {rest.length ? (
        <section className="space-y-4">
          <div className="section-rule">
            <h2>Cronaca</h2>
          </div>
          <ul className="panel divide-y divide-[var(--line)]">
            {rest.map((item) => {
              const when = formatWhen(item.publishedAt);
              return (
                <li key={item.id}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-4 transition hover:bg-white/[0.03]"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {item.source}
                      {when ? ` · ${when}` : ""}
                    </div>
                    <div className="mt-1 text-base font-semibold leading-snug sm:text-lg">
                      {item.title}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : !featured ? (
        <p className="panel p-4 text-sm text-[var(--muted)]">
          Nessuna notizia disponibile al momento. Riprova tra poco oppure apri{" "}
          <Link href="/oggi" className="text-[var(--accent)] hover:underline">
            Partite di oggi
          </Link>
          .
        </p>
      ) : null}

      <p className="text-xs text-[var(--muted)]">
        CalcioAuto non è affiliato alle testate collegate. I contenuti
        appartengono alle rispettive fonti.
      </p>
    </div>
  );
}
