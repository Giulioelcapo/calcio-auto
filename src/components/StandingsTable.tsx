import Link from "next/link";
import { Crest } from "@/components/Crest";
import type { StandingRow } from "@/lib/types";
import { teamPathSlug } from "@/lib/slug";

function FormPills({ form }: { form: string | null }) {
  if (!form) return <span className="text-[var(--muted)]">—</span>;
  return (
    <span className="inline-flex">
      {form
        .toUpperCase()
        .split("")
        .filter((c) => "WDL".includes(c))
        .slice(-5)
        .map((c, i) => (
          <span
            key={`${c}-${i}`}
            className={`form-dot ${
              c === "W" ? "form-w" : c === "D" ? "form-d" : "form-l"
            }`}
          >
            {c}
          </span>
        ))}
    </span>
  );
}

export function StandingsTable({
  rows,
  leagueSlug,
}: {
  rows: StandingRow[];
  leagueSlug: string;
}) {
  return (
    <div className="fm-panel overflow-x-auto">
      <table className="fm-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Squadra</th>
            <th>G</th>
            <th>V</th>
            <th>N</th>
            <th>P</th>
            <th>GF</th>
            <th>GS</th>
            <th>DR</th>
            <th>Pt</th>
            <th>Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.teamId}>
              <td className="text-[var(--muted)]">{row.position}</td>
              <td>
                <Link
                  href={`/${leagueSlug}/squadra/${teamPathSlug(row.teamName, row.teamId)}`}
                  className="inline-flex items-center gap-2 hover:text-[var(--accent)]"
                >
                  <Crest src={row.crest} alt={row.teamName} size={22} />
                  <span>{row.teamName}</span>
                </Link>
              </td>
              <td>{row.playedGames}</td>
              <td>{row.won}</td>
              <td>{row.draw}</td>
              <td>{row.lost}</td>
              <td>{row.goalsFor}</td>
              <td>{row.goalsAgainst}</td>
              <td>{row.goalDifference}</td>
              <td className="font-bold text-[var(--accent)]">{row.points}</td>
              <td>
                <FormPills form={row.form} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
