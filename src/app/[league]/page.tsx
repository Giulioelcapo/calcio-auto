import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { InsightCards } from "@/components/DataViews";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import { leagueHubIntro } from "@/lib/content-templates";
import { getCompetitionBundle } from "@/lib/football-api";
import { getAllLeagueSlugs } from "@/lib/leagues";

export const revalidate = 1800;

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

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {data.league.country} · {data.seasonLabel}
        </p>
        <h1 className="text-3xl font-bold">{data.league.name}</h1>
      </div>
      <LeagueNav slug={slug} />
      <AdSlot slot="top" />
      <ContentBlock>{leagueHubIntro(data)}</ContentBlock>
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
