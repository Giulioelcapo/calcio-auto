import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { AdvancedStatsTable } from "@/components/AdvancedStatsTable";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import {
  buildAdvancedStats,
  leagueStatSummary,
} from "@/lib/advanced-stats";
import { formIntro } from "@/lib/content-templates";
import { getCompetitionBundle } from "@/lib/football-api";
import { getAllLeagueSlugs } from "@/lib/leagues";
import { SEASON_LABEL } from "@/lib/season";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export function generateStaticParams() {
  return getAllLeagueSlugs().map((league) => ({ league }));
}

type Props = { params: Promise<{ league: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) return { title: "Forma" };
  return {
    title: `Forma ${data.league.name} ${SEASON_LABEL}: indice e PPG`,
    description: formIntro(data),
  };
}

export default async function FormaPage({ params }: Props) {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) notFound();

  const stats = buildAdvancedStats(data.standings, data.matches);
  const summary = leagueStatSummary(stats);

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <div>
        <h1 className="text-3xl font-bold">
          Forma {data.league.name} {SEASON_LABEL}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Indice forma · PPG · sequenza W/D/L
        </p>
      </div>
      <LeagueNav slug={slug} />
      <AdSlot slot="top" />
      <ContentBlock>{formIntro(data)}</ContentBlock>

      <div className="panel rounded-md p-4">
        <div className="text-xs uppercase text-[var(--muted)]">Forma migliore</div>
        <div className="mt-1 font-semibold">
          {summary.hottestForm
            ? `${summary.hottestForm.teamName} · indice ${summary.hottestForm.formScore} · PPG ${summary.hottestForm.ppg}`
            : "—"}
        </div>
      </div>

      <AdvancedStatsTable rows={stats} leagueSlug={slug} mode="form" />
      <AdSlot slot="in-content" />
    </div>
  );
}
