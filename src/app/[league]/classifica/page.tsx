import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { AiAnswerBlock } from "@/components/AiAnswerBlock";
import { Crest } from "@/components/Crest";
import { StandingsTable } from "@/components/DataViews";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import { standingsAnalysis, standingsIntro } from "@/lib/content-templates";
import { getCompetitionBundle } from "@/lib/football-api";
import { sportsLeagueJsonLd, standingsFaqs } from "@/lib/geo";
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
  if (!data) return { title: "Classifica" };
  return {
    title: `Classifica ${data.league.name} ${SEASON_LABEL} aggiornata`,
    description: standingsIntro(data),
  };
}

export default async function ClassificaPage({ params }: Props) {
  const { league: slug } = await params;
  const data = await getCompetitionBundle(slug);
  if (!data) notFound();

  // Classifica unica ufficiale (TOTAL). Per CL/WC con soli gruppi, uniamo i TOTAL.
  const totalTables = data.standingTables.filter(
    (t) => t.type === "TOTAL" && t.table.length > 0,
  );
  const hasOnlyGroups =
    totalTables.length > 0 && totalTables.every((t) => Boolean(t.group));

  let rows = data.standings;
  if ((!rows.length || hasOnlyGroups) && totalTables.length) {
    // Unione ordinata per punti (classifica unica aggregata)
    const merged = totalTables.flatMap((t) => t.table);
    rows = [...merged].sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor,
    );
    rows = rows.map((row, index) => ({ ...row, position: index + 1 }));
  }

  return (
    <div className="space-y-6">
      <JsonLd data={sportsLeagueJsonLd(data)} />
      <MockBanner usingMock={data.usingMock} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Crest
            src={data.meta.emblem ?? data.league.emblem}
            alt={data.league.name}
            size={40}
          />
          <div>
            <h1 className="text-3xl font-bold">
              Classifica {data.league.name}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Stagione {data.seasonLabel || SEASON_LABEL}
              {data.matchday ? ` · Giornata ${data.matchday}` : ""}
              {data.meta.startDate
                ? ` · ${data.meta.startDate} → ${data.meta.endDate ?? "?"}`
                : ""}
            </p>
          </div>
        </div>
      </div>
      <LeagueNav slug={slug} />
      <AiAnswerBlock answer={standingsIntro(data)} />
      <AdSlot slot="top" />
      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          <ContentBlock title="Panoramica">{standingsIntro(data)}</ContentBlock>
          <StandingsTable rows={rows} leagueSlug={slug} />
          <ContentBlock title="Analisi">{standingsAnalysis(data)}</ContentBlock>
          <FaqSection
            items={standingsFaqs(data)}
            path={`/${slug}/classifica`}
            title={`FAQ classifica ${data.league.name}`}
          />
        </div>
        <AdSlot slot="side" className="min-h-[250px]" />
      </div>
    </div>
  );
}
