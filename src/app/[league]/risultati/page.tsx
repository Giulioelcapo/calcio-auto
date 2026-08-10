import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { MatchesList } from "@/components/DataViews";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import { resultsIntro } from "@/lib/content-templates";
import {
    finishedMatches,
  getCompetitionBundle,
} from "@/lib/football-api";
import { getAllLeagueSlugs } from "@/lib/leagues";
import { SEASON_LABEL } from "@/lib/season";

export const revalidate = 1800;
export function generateStaticParams() {
  return getAllLeagueSlugs().map((league) => ({ league }));
}

type Props = { params: Promise<{ league: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) return { title: "Risultati" };
  return {
    title: `Risultati ${data.league.name} ${SEASON_LABEL}`,
    description: resultsIntro(data),
  };
}

export default async function RisultatiPage({ params }: Props) {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) notFound();
  const results = finishedMatches(data.matches, 30);

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <h1 className="text-3xl font-bold">
        Risultati {data.league.name} {SEASON_LABEL}
      </h1>
      <LeagueNav slug={slug} />
      <AdSlot slot="top" />
      <ContentBlock>{resultsIntro(data)}</ContentBlock>
      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        {results.length ? (
          <MatchesList matches={results} />
        ) : (
          <div className="panel rounded-md p-6 text-sm text-[var(--muted)]">
            Nessun risultato ancora: la stagione {SEASON_LABEL} non è partita (o
            non ci sono partite finite). Controlla il{" "}
            <a
              href={`/${slug}/calendario`}
              className="text-[var(--accent)] hover:underline"
            >
              calendario
            </a>{" "}
            per le prossime giornate.
          </div>
        )}
        <AdSlot slot="side" className="min-h-[250px]" />
      </div>
    </div>
  );
}
