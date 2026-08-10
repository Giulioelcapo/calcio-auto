import { Crest } from "@/components/Crest";
import type { AdvancedTeamStats } from "@/lib/advanced-stats";
import { teamPathSlug } from "@/lib/slug";
import Link from "next/link";

type Mode = "full" | "xg" | "form";

export function AdvancedStatsTable({
  rows,
  leagueSlug,
  mode = "full",
}: {
  rows: AdvancedTeamStats[];
  leagueSlug: string;
  mode?: Mode;
}) {
  if (!rows.length) {
    return (
      <p className="text-sm text-[var(--muted)]">Statistiche non disponibili.</p>
    );
  }

  const sorted =
    mode === "xg"
      ? [...rows].sort((a, b) => b.xg - a.xg || b.xgd - a.xgd)
      : mode === "form"
        ? [...rows].sort((a, b) => b.formScore - a.formScore || b.ppg - a.ppg)
        : rows;

  return (
    <div className="table-scroll panel rounded-md">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead className="bg-black/40 text-left text-xs uppercase tracking-wider text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Squadra</th>
            <th className="px-3 py-2">PPG</th>
            {(mode === "full" || mode === "xg") && (
              <>
                <th className="px-3 py-2">xG</th>
                <th className="px-3 py-2">xGA</th>
                <th className="px-3 py-2">xGD</th>
              </>
            )}
            {mode === "full" && (
              <>
                <th className="px-3 py-2">GF/G</th>
                <th className="px-3 py-2">GS/G</th>
                <th className="px-3 py-2">ATT</th>
                <th className="px-3 py-2">DIF</th>
                <th className="px-3 py-2">O2.5%</th>
              </>
            )}
            {(mode === "full" || mode === "form") && (
              <>
                <th className="px-3 py-2">Forma</th>
                <th className="px-3 py-2">Idx</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, index) => (
            <tr key={row.teamId} className="border-t border-[var(--line)]">
              <td className="data-font px-3 py-2 text-[var(--accent)]">
                {index + 1}
              </td>
              <td className="px-3 py-2">
                <Link
                  href={`/${leagueSlug}/squadra/${teamPathSlug(row.teamName, row.teamId)}`}
                  className="inline-flex items-center gap-2 hover:text-[var(--accent)]"
                >
                  <Crest src={row.crest} alt={row.teamName} size={18} />
                  {row.teamName}
                </Link>
              </td>
              <td className="data-font px-3 py-2 font-semibold">{row.ppg}</td>
              {(mode === "full" || mode === "xg") && (
                <>
                  <td className="data-font px-3 py-2 text-[var(--accent)]">
                    {row.xg}
                  </td>
                  <td className="data-font px-3 py-2">{row.xga}</td>
                  <td className="data-font px-3 py-2 font-semibold">
                    {row.xgd > 0 ? `+${row.xgd}` : row.xgd}
                  </td>
                </>
              )}
              {mode === "full" && (
                <>
                  <td className="data-font px-3 py-2">{row.gfPerGame}</td>
                  <td className="data-font px-3 py-2">{row.gaPerGame}</td>
                  <td className="data-font px-3 py-2">{row.attackIndex}</td>
                  <td className="data-font px-3 py-2">{row.defenseIndex}</td>
                  <td className="data-font px-3 py-2">
                    {row.over25Rate != null ? `${row.over25Rate}%` : "—"}
                  </td>
                </>
              )}
              {(mode === "full" || mode === "form") && (
                <>
                  <td className="data-font px-3 py-2 text-[var(--muted)]">
                    {row.form ?? "—"}
                  </td>
                  <td className="data-font px-3 py-2 font-semibold">
                    {row.formScore}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
