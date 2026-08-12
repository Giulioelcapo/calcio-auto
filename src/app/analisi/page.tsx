import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { FreeDeskSection } from "@/components/FreeDeskSection";
import { getFreeDeskReport, listLeagues } from "@/lib/football-api";
import { getLeagueNews } from "@/lib/news";
import { analisiMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = analisiMetadata();

export default async function AnalisiPage() {
  const [report, ...leagueNews] = await Promise.all([
    getFreeDeskReport(),
    ...listLeagues()
      .slice(0, 4)
      .map(async (l) => ({
        slug: l.slug,
        name: l.name,
        news: await getLeagueNews(l.slug, 4),
      })),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="display-font text-4xl font-bold uppercase tracking-tight sm:text-5xl">
        Analisi calcio
      </h1>
      <AdSlot slot="top" />
      <FreeDeskSection report={report} />

      <section className="space-y-4">
        <div className="border-b-2 border-[var(--accent)] pb-2">
          <h2 className="display-font text-xl font-bold uppercase tracking-wide">
            News lega
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {leagueNews.map((block) => (
            <article key={block.slug} className="panel p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="display-font font-bold uppercase">{block.name}</h3>
                <Link
                  href={`/${block.slug}`}
                  className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  Hub
                </Link>
              </div>
              {block.news.length ? (
                <ul className="space-y-2">
                  {block.news.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm hover:text-[var(--accent)]"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <p className="text-xs text-[var(--muted)]">
        <Link href="/share/oggi" className="text-[var(--accent)] hover:underline">
          Card condividibile
        </Link>
      </p>
    </div>
  );
}
