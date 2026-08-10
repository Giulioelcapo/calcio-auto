import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { AdvancedStatsTable } from "@/components/AdvancedStatsTable";
import { InsightCards } from "@/components/DataViews";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import {
  buildAdvancedStats,
  leagueStatSummary,
} from "@/lib/advanced-stats";
import { statsIntro } from "@/lib/content-templates";
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
  if (!data) return { title: "Statistiche" };
  return {
    title: `Statistiche ${data.league.name} ${SEASON_LABEL}: PPG, xG, forma`,
    description: statsIntro(data),
  };
}

export default async function StatistichePage({ params }: Props) {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) notFound();

  const stats = buildAdvancedStats(data.standings, data.matches);
  const summary = leagueStatSummary(stats);
  const totalGoals = data.standings.reduce((acc, row) => acc + row.goalsFor, 0);

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <div>
        <h1 className="text-3xl font-bold">Statistiche {data.league.name}</h1>
        <p className="text-sm text-[var(--muted)]">
          Stagione {data.seasonLabel || SEASON_LABEL} · metriche free + xG stimato
        </p>
      </div>
      <LeagueNav slug={slug} />
      <AdSlot slot="top" />
      <ContentBlock>{statsIntro(data)}</ContentBlock>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel rounded-md p-4">
          <div className="text-xs uppercase text-[var(--muted)]">Gol totali</div>
          <div className="data-font mt-1 text-2xl text-[var(--accent)]">
            {totalGoals}
          </div>
        </div>
        <div className="panel rounded-md p-4">
          <div className="text-xs uppercase text-[var(--muted)]">PPG medio</div>
          <div className="data-font mt-1 text-2xl text-[var(--accent)]">
            {summary.avgPpg}
          </div>
        </div>
        <div className="panel rounded-md p-4">
          <div className="text-xs uppercase text-[var(--muted)]">xG medio (stima)</div>
          <div className="data-font mt-1 text-2xl text-[var(--accent)]">
            {summary.avgXg}
          </div>
        </div>
        <div className="panel rounded-md p-4">
          <div className="text-xs uppercase text-[var(--muted)]">Best xG</div>
          <div className="mt-1 text-sm font-semibold">
            {summary.bestXg
              ? `${summary.bestXg.teamName} (${summary.bestXg.xg})`
              : "—"}
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--accent)]">
          Tabella advanced {SEASON_LABEL}
        </h2>
        <AdvancedStatsTable rows={stats} leagueSlug={slug} mode="full" />
        <p className="text-xs text-[var(--muted)]">
          Nota: xG/xGA sono stime editoriali derivate da gol e forma (piano free
          football-data.org non include xG Opta). Ideali per ranking relativo e SEO.
        </p>
      </section>

      <InsightCards cards={data.insights} />
      <AdSlot slot="in-content" />
    </div>
  );
}
