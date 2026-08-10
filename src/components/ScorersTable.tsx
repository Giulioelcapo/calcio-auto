import { Crest } from "@/components/Crest";
import type { ScorerRow } from "@/lib/types";

export function ScorersTable({ rows }: { rows: ScorerRow[] }) {
  if (!rows.length) {
    return (
      <div className="fm-panel p-4 text-sm text-[var(--muted)]">
        Marcatori non disponibili nel piano free corrente (serve spesso Deep Data).
      </div>
    );
  }

  return (
    <div className="fm-panel overflow-x-auto">
      <table className="fm-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Giocatore</th>
            <th>Squadra</th>
            <th>Gol</th>
            <th>Assist</th>
            <th>Rigori</th>
            <th>Partite</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.rank}-${row.playerName}`}>
              <td>{row.rank}</td>
              <td>{row.playerName}</td>
              <td>
                <span className="inline-flex items-center gap-2">
                  <Crest src={row.teamCrest} alt={row.teamName} size={18} />
                  {row.teamName}
                </span>
              </td>
              <td className="font-bold text-[var(--accent)]">{row.goals}</td>
              <td>{row.assists ?? "—"}</td>
              <td>{row.penalties ?? "—"}</td>
              <td>{row.playedMatches ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
