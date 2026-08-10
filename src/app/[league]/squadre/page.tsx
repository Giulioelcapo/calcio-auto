import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { TeamsGrid } from "@/components/DataViews";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import { teamsIntro } from "@/lib/content-templates";
import { getCompetitionBundle } from "@/lib/football-api";
import { getAllLeagueSlugs } from "@/lib/leagues";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export function generateStaticParams() {
  return getAllLeagueSlugs().map((league) => ({ league }));
}

type Props = { params: Promise<{ league: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) return { title: "Squadre" };
  return {
    title: `Squadre ${data.league.name}`,
    description: teamsIntro(data),
  };
}

export default async function SquadrePage({ params }: Props) {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <h1 className="text-3xl font-bold">Squadre {data.league.name}</h1>
      <LeagueNav slug={slug} />
      <AdSlot slot="top" />
      <ContentBlock>{teamsIntro(data)}</ContentBlock>
      <TeamsGrid teams={data.teams} leagueSlug={slug} />
    </div>
  );
}
