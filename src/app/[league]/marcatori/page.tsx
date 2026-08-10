import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { ScorersTable } from "@/components/DataViews";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import { scorersAnalysis, scorersIntro } from "@/lib/content-templates";
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
  if (!data) return { title: "Marcatori" };
  return {
    title: `Marcatori ${data.league.name}`,
    description: scorersIntro(data),
  };
}

export default async function MarcatoriPage({ params }: Props) {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <h1 className="text-3xl font-bold">Marcatori {data.league.name}</h1>
      <LeagueNav slug={slug} />
      <AdSlot slot="top" />
      <ContentBlock>{scorersIntro(data)}</ContentBlock>
      {!data.scorersAvailable ? (
        <p className="rounded border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-3 py-2 text-sm text-[var(--warn)]">
          Endpoint scorers non incluso nel piano free puro — fallback/demo attivo se presenti dati mock.
        </p>
      ) : null}
      <ScorersTable rows={data.scorers} />
      <ContentBlock title="Analisi">{scorersAnalysis(data.scorers)}</ContentBlock>
    </div>
  );
}
