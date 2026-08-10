import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { InsightCards, MatchesList } from "@/components/DataViews";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import { teamIntro } from "@/lib/content-templates";
import { getCompetitionBundle, getTeamPage } from "@/lib/football-api";
import { getAllLeagueSlugs } from "@/lib/leagues";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  const params: Array<{ league: string; team: string }> = [];
  for (const league of getAllLeagueSlugs()) {
    const data = await getCompetitionBundle(league);
    for (const team of data?.teams ?? []) {
      params.push({ league, team: team.slug });
    }
  }
  return params;
}

type Props = { params: Promise<{ league: string; team: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league, team } = await params;
  const data = await getTeamPage(league, team);
  if (!data) return { title: "Squadra" };
  return {
    title: `${data.team.name} — ${data.league.name}`,
    description: teamIntro(data),
  };
}

export default async function SquadraPage({ params }: Props) {
  const { league, team } = await params;
  const data = await getTeamPage(league, team);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {data.league.name} · {data.seasonLabel}
        </p>
        <h1 className="text-3xl font-bold">{data.team.name}</h1>
        {data.standing ? (
          <p className="mt-1 data-font text-[var(--accent)]">
            #{data.standing.position} · {data.standing.points} pt · form{" "}
            {data.standing.form ?? "—"}
          </p>
        ) : null}
      </div>
      <LeagueNav slug={league} />
      <AdSlot slot="top" />
      <ContentBlock>{teamIntro(data)}</ContentBlock>
      <InsightCards cards={[...data.insights, ...data.injuryInsights]} />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--accent)]">Ultime partite</h2>
        <MatchesList matches={data.recent} />
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--accent)]">Prossimi impegni</h2>
        <MatchesList matches={data.upcoming} />
      </section>
    </div>
  );
}
