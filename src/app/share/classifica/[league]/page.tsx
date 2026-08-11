import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crest } from "@/components/Crest";
import { getLeagueFreeBundle } from "@/lib/football-api";
import { getAllLeagueSlugs, getLeagueBySlug } from "@/lib/leagues";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ league: string }> };

export function generateStaticParams() {
  return getAllLeagueSlugs().map((league) => ({ league }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league } = await params;
  const cfg = getLeagueBySlug(league);
  return {
    title: cfg ? `Card ${cfg.name}` : "Card classifica",
    alternates: { canonical: `/share/classifica/${league}` },
  };
}

export default async function ShareClassificaPage({ params }: Props) {
  const { league: slug } = await params;
  const cfg = getLeagueBySlug(slug);
  if (!cfg) notFound();

  const free = await getLeagueFreeBundle(slug);
  const rows = free?.table.slice(0, 8) ?? [];
  const seasonLabel = free?.board.seasonLabel ?? "";

  return (
    <div className="mx-auto max-w-md space-y-4 py-4">
      <div className="overflow-hidden rounded-xl bg-white text-[#111] shadow-lg">
        <div className="flex items-center justify-between gap-2 bg-[var(--accent)] px-4 py-3 text-[var(--accent-ink)]">
          <div>
            <p className="display-font text-[10px] font-bold uppercase tracking-[0.2em]">
              {SITE_NAME}
            </p>
            <h1 className="display-font text-xl font-bold uppercase">
              {cfg.name}
            </h1>
            <p className="text-[10px] font-semibold">{seasonLabel}</p>
          </div>
          <Crest src={cfg.emblem} alt={cfg.name} size={36} />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-[10px] uppercase text-[#666]">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Squadra</th>
              <th className="px-3 py-2 text-center">G</th>
              <th className="px-3 py-2 text-right">Pt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.teamId} className="border-b border-black/5">
                <td className="px-3 py-2 font-bold">{r.position}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Crest src={r.crest} alt={r.teamName} size={16} />
                    {r.teamShortName || r.teamName}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">{r.playedGames}</td>
                <td className="px-3 py-2 text-right font-bold">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-xs text-[var(--muted)]">
        <Link
          href={`/${slug}/classifica`}
          className="hover:text-[var(--accent)]"
        >
          Classifica completa
        </Link>
      </p>
    </div>
  );
}
