import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { MatchesList } from "@/components/DataViews";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import { fixturesAnalysis, fixturesIntro } from "@/lib/content-templates";
import {
  availableMatchdays,
    getCompetitionBundle,
  upcomingMatches,
} from "@/lib/football-api";
import { getAllLeagueSlugs } from "@/lib/leagues";

export const revalidate = 1800;
export function generateStaticParams() {
  return getAllLeagueSlugs().map((league) => ({ league }));
}

type Props = { params: Promise<{ league: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) return { title: "Calendario" };
  return {
    title: `Calendario ${data.league.name}`,
    description: fixturesIntro(data),
  };
}

export default async function CalendarioPage({ params }: Props) {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) notFound();
  const matches = upcomingMatches(data.matches, 24);
  const days = availableMatchdays(data.matches);

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <h1 className="text-3xl font-bold">Calendario {data.league.name}</h1>
      <LeagueNav slug={slug} />
      <AdSlot slot="top" />
      <ContentBlock title="Prossime partite">{fixturesIntro(data)}</ContentBlock>
      {days.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {days.map((n) => (
            <Link
              key={n}
              href={`/${slug}/giornata/${n}`}
              className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:border-[var(--accent)]"
            >
              Giornata {n}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <MatchesList matches={matches} />
        <AdSlot slot="side" className="min-h-[250px]" />
      </div>
      <ContentBlock title="Nota">{fixturesAnalysis(data)}</ContentBlock>
    </div>
  );
}
