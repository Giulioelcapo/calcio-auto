import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { InsightCards, MatchesList } from "@/components/DataViews";
import { ContentBlock, LeagueNav, MockBanner } from "@/components/LeagueNav";
import { teamIntro } from "@/lib/content-templates";
import { buildHeadToHead, currentStreak } from "@/lib/free-stats";
import {
  getCompetitionBundle,
  getLeagueFreeBundle,
  getTeamPage,
} from "@/lib/football-api";
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

  const free = await getLeagueFreeBundle(league);
  const streak = currentStreak(data.standing?.form ?? null);
  const difficulty = free?.teamDifficulty(data.team.id);
  const nextOpp = data.upcoming[0];
  const h2h =
    nextOpp && free
      ? buildHeadToHead(
          free.matches,
          data.team.id,
          nextOpp.homeTeamId === data.team.id
            ? nextOpp.awayTeamId
            : nextOpp.homeTeamId,
        )
      : null;

  return (
    <div className="space-y-6">
      <MockBanner usingMock={data.usingMock} />
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {data.league.name} · {data.seasonLabel}
        </p>
        <h1 className="text-3xl font-bold">{data.team.name}</h1>
        {data.standing ? (
          <p className="data-font mt-1 text-[var(--accent)]">
            #{data.standing.position} · {data.standing.points} pt · form{" "}
            {data.standing.form ?? "—"}
            {streak ? ` · ${streak.type}×${streak.length}` : ""}
          </p>
        ) : null}
      </div>
      <LeagueNav slug={league} />
      <AdSlot slot="top" />
      <ContentBlock>{teamIntro(data)}</ContentBlock>

      {(streak || difficulty?.next.length) ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {streak ? (
            <div className="panel p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Streak
              </p>
              <p className="display-font mt-1 text-3xl font-bold text-[var(--accent)]">
                {streak.type}×{streak.length}
              </p>
            </div>
          ) : null}
          {difficulty?.next.length ? (
            <div className="panel p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Difficoltà prossime
              </p>
              <p className="display-font mt-1 text-3xl font-bold text-[var(--accent)]">
                {difficulty.avg}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
                {difficulty.next.slice(0, 3).map((f) => (
                  <li key={f.matchId}>
                    {f.homeAway} vs {f.opponent}
                    {f.opponentPosition != null
                      ? ` (#${f.opponentPosition})`
                      : ""}{" "}
                    · {f.difficulty}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {h2h ? (
        <section className="panel space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="display-font text-lg font-bold uppercase">H2H</h2>
            <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
              vs prossimo
            </span>
          </div>
          <p className="text-sm">
            {h2h.teamAName} {h2h.aWins}-{h2h.draws}-{h2h.bWins} {h2h.teamBName}
            <span className="text-[var(--muted)]">
              {" "}
              · {h2h.played} gare · gol {h2h.aGoals}-{h2h.bGoals}
            </span>
          </p>
          <ul className="space-y-1 text-xs text-[var(--muted)]">
            {h2h.recent.slice(0, 4).map((m) => (
              <li key={m.id}>
                {m.homeTeam} {m.homeScore}-{m.awayScore} {m.awayTeam}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <InsightCards cards={[...data.insights, ...data.injuryInsights]} />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--accent)]">
          Ultime partite
        </h2>
        <MatchesList matches={data.recent} />
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--accent)]">
          Prossimi impegni
        </h2>
        <MatchesList matches={data.upcoming} />
      </section>

      <p className="text-xs text-[var(--muted)]">
        <Link
          href={`/share/classifica/${league}`}
          className="hover:text-[var(--accent)]"
        >
          Card classifica
        </Link>
      </p>
    </div>
  );
}
