import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { InsightCards } from "@/components/DataViews";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import { leagueHubIntro } from "@/lib/content-templates";
import { getCompetitionBundle, getLeagueFreeBundle } from "@/lib/football-api";
import { getAllLeagueSlugs } from "@/lib/leagues";
import { getLeagueNews } from "@/lib/news";
import { Crest } from "@/components/Crest";
import { teamPathSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return getAllLeagueSlugs().map((league) => ({ league }));
}

type Props = { params: Promise<{ league: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) return { title: "Campionato non trovato" };
  return {
    title: `${data.league.name} — hub classifica e calendario`,
    description: leagueHubIntro(data),
  };
}

const LINKS = [
  ["classifica", "Classifica"],
  ["calendario", "Calendario"],
  ["risultati", "Risultati"],
  ["marcatori", "Marcatori"],
  ["squadre", "Squadre"],
  ["statistiche", "Statistiche"],
  ["infortuni", "Infortuni & forma"],
] as const;

export default async function LeagueHubPage({ params }: Props) {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) notFound();

  const [news, free] = await Promise.all([
    getLeagueNews(slug, 5),
    getLeagueFreeBundle(slug),
  ]);
  const hotStreaks = (free?.streaks ?? []).filter((s) => s.type === "W").slice(0, 3);
  const next = free?.nextMatchday;

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {data.league.country} · {data.seasonLabel}
        </p>
        <h1 className="text-3xl font-bold">{data.league.name}</h1>
        {next ? (
          <p className="text-sm text-[var(--muted)]">
            Giornata {next.matchday} · {next.matchCount} gare
            {next.hoursToFirst != null ? ` · tra ${next.hoursToFirst}h` : ""}
          </p>
        ) : null}
      </div>
      <LeagueNav slug={slug} />
      <AdSlot slot="top" />
      <ContentBlock>{leagueHubIntro(data)}</ContentBlock>

      {hotStreaks.length ? (
        <section className="panel space-y-2 p-4">
          <div className="flex items-center justify-between">
            <h2 className="display-font text-sm font-bold uppercase tracking-wide">
              Streak W
            </h2>
            <Link
              href={`/share/classifica/${slug}`}
              className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)] hover:text-[var(--accent)]"
            >
              Card
            </Link>
          </div>
          <ul className="space-y-1">
            {hotStreaks.map((s) => (
              <li key={s.teamId} className="flex items-center justify-between text-sm">
                <Link
                  href={`/${slug}/squadra/${teamPathSlug(s.teamName, s.teamId)}`}
                  className="flex items-center gap-2 hover:text-[var(--accent)]"
                >
                  <Crest src={s.crest} alt={s.teamName} size={18} />
                  {s.teamName}
                </Link>
                <span className="data-font text-[var(--accent)]">
                  W×{s.length}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {news.length ? (
        <section className="space-y-2">
          <h2 className="display-font text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
            News
          </h2>
          <ul className="panel divide-y divide-[var(--line)]">
            {news.map((item) => (
              <li key={item.id}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-sm hover:bg-white/[0.03]"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <InsightCards cards={data.insights.slice(0, 4)} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map(([seg, label]) => (
          <Link
            key={seg}
            href={`/${slug}/${seg}`}
            className="panel block rounded-md p-4 hover:border-[var(--accent)]"
          >
            <h2 className="font-semibold text-[var(--accent)]">{label}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Apri la sezione {label.toLowerCase()} di {data.league.name}.
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
