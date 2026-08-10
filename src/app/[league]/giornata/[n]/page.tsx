import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { MatchesList } from "@/components/DataViews";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import { fixturesIntro } from "@/lib/content-templates";
import {
    filterMatchesByMatchday,
  getCompetitionBundle,
} from "@/lib/football-api";
import { getAllLeagueSlugs } from "@/lib/leagues";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return getAllLeagueSlugs().flatMap((league) =>
    [10, 11, 12, 13].map((n) => ({ league, n: String(n) })),
  );
}

type Props = { params: Promise<{ league: string; n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league: slug, n } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) return { title: `Giornata ${n}` };
  return {
    title: `${data.league.name} — Giornata ${n}`,
    description: fixturesIntro(data, Number(n)),
  };
}

export default async function GiornataPage({ params }: Props) {
  const { league: slug, n } = await params;
  const matchday = Number(n);
  if (!Number.isFinite(matchday)) notFound();
  const data = await getCompetitionBundle(slug);
  if (!data) notFound();
  const matches = filterMatchesByMatchday(data.matches, matchday);

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <h1 className="text-3xl font-bold">
        {data.league.name} — Giornata {matchday}
      </h1>
      <LeagueNav slug={slug} />
      <AdSlot slot="top" />
      <ContentBlock>{fixturesIntro(data, matchday)}</ContentBlock>
      <MatchesList matches={matches} />
    </div>
  );
}
