import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { AdvancedStatsTable } from "@/components/AdvancedStatsTable";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import {
  buildAdvancedStats,
  leagueStatSummary,
} from "@/lib/advanced-stats";
import { xgIntro } from "@/lib/content-templates";
import { getCompetitionBundle } from "@/lib/football-api";
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
  if (!data) return { title: "xG" };
  return {
    title: `xG ${data.league.name} ${SEASON_LABEL}: expected goals stimati`,
    description: xgIntro(data),
  };
}

export default async function XgPage({ params }: Props) {
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
          xG {data.league.name} {SEASON_LABEL}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Expected goals stimati · xGA · xGD
        </p>
      </div>
      <LeagueNav slug={slug} />
      <AdSlot slot="top" />
      <ContentBlock>{xgIntro(data)}</ContentBlock>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="panel rounded-md p-4">
          <div className="text-xs uppercase text-[var(--muted)]">Leader xG</div>
          <div className="mt-1 font-semibold">
            {summary.bestXg
              ? `${summary.bestXg.teamName} · ${summary.bestXg.xg}`
              : "—"}
          </div>
        </div>
        <div className="panel rounded-md p-4">
          <div className="text-xs uppercase text-[var(--muted)]">Best attacco</div>
          <div className="mt-1 font-semibold">
            {summary.bestAttack
              ? `${summary.bestAttack.teamName} · ${summary.bestAttack.gfPerGame} GF/G`
              : "—"}
          </div>
        </div>
        <div className="panel rounded-md p-4">
          <div className="text-xs uppercase text-[var(--muted)]">Best difesa</div>
          <div className="mt-1 font-semibold">
            {summary.bestDefense
              ? `${summary.bestDefense.teamName} · ${summary.bestDefense.gaPerGame} GS/G`
              : "—"}
          </div>
        </div>
      </div>

      <AdvancedStatsTable rows={stats} leagueSlug={slug} mode="xg" />
      <ContentBlock title="Come leggiamo l'xG">
        Nel piano gratuito non arrivano feed Opta/StatsBomb. Calcoliamo un xG
        editoriale da gol fatti/subiti e forma recente, utile per confrontare le
        squadre e creare contenuti SEO (overperformance, underperformance, xGD).
      </ContentBlock>
      <AdSlot slot="in-content" />
    </div>
  );
}
