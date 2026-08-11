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

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          Aggregatore free
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Notizie calcio e mercato
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Titoli aggiornati automaticamente da Google News. Mostriamo solo
          headline e link alle fonti originali (niente copia di articoli
          protetti).
        </p>
      </section>

      <AdSlot slot="top" />

      {news.length ? (
        <ul className="fm-panel divide-y divide-[var(--line)]">
          {news.map((item) => {
            const when = formatWhen(item.publishedAt);
            return (
              <li key={item.id}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 hover:bg-white/5"
                >
                  <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    {item.source}
                    {when ? ` · ${when}` : ""}
                  </div>
                  <div className="mt-1 text-sm font-medium sm:text-base">
                    {item.title}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="panel rounded-md p-4 text-sm text-[var(--muted)]">
          Nessuna notizia disponibile al momento. Riprova tra poco oppure apri{" "}
          <Link href="/oggi" className="text-[var(--accent)] hover:underline">
            Partite di oggi
          </Link>
          .
        </p>
      )}

      <p className="text-xs text-[var(--muted)]">
        CalcioAuto non è affiliato alle testate collegate. I contenuti
        appartengono alle rispettive fonti.
      </p>
    </div>
  );
}
