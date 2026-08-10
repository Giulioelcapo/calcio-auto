import { Crest } from "@/components/Crest";
import type { InsightCard, MatchItem, ScorerRow, StandingRow, TeamSummary } from "@/lib/types";
import { teamPathSlug } from "@/lib/slug";
import Link from "next/link";

export function StandingsTable({
  rows,
  leagueSlug,
}: {
  rows: StandingRow[];
  leagueSlug: string;
}) {
  if (!rows.length) {
    return (
      <p className="text-sm text-[var(--muted)]">Classifica non disponibile.</p>
    );
  }

  return (
    <div className="table-scroll panel rounded-md">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead className="bg-black/40 text-left text-xs uppercase tracking-wider text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Squadra</th>
            <th className="px-3 py-2">G</th>
            <th className="px-3 py-2">V</th>
            <th className="px-3 py-2">N</th>
            <th className="px-3 py-2">P</th>
            <th className="px-3 py-2">GF</th>
            <th className="px-3 py-2">GS</th>
            <th className="px-3 py-2">DR</th>
            <th className="px-3 py-2">Pt</th>
            <th className="px-3 py-2">Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.teamId} className="border-t border-[var(--line)]">
              <td className="data-font px-3 py-2 text-[var(--accent)]">
                {row.position}
              </td>
              <td className="px-3 py-2">
                <Link
                  href={`/${leagueSlug}/squadra/${teamPathSlug(row.teamName, row.teamId)}`}
                  className="inline-flex items-center gap-2 hover:text-[var(--accent)]"
                >
                  <Crest src={row.crest} alt={row.teamName} size={20} />
                  <span>{row.teamName}</span>
                </Link>
              </td>
              <td className="data-font px-3 py-2">{row.playedGames}</td>
              <td className="data-font px-3 py-2">{row.won}</td>
              <td className="data-font px-3 py-2">{row.draw}</td>
              <td className="data-font px-3 py-2">{row.lost}</td>
              <td className="data-font px-3 py-2">{row.goalsFor}</td>
              <td className="data-font px-3 py-2">{row.goalsAgainst}</td>
              <td className="data-font px-3 py-2">{row.goalDifference}</td>
              <td className="data-font px-3 py-2 font-bold">{row.points}</td>
              <td className="data-font px-3 py-2 text-[var(--muted)]">
                {row.form ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MatchesList({ matches }: { matches: MatchItem[] }) {
  if (!matches.length) {
    return <p className="text-sm text-[var(--muted)]">Nessuna partita in questa selezione.</p>;
  }
  return (
    <ul className="space-y-2">
      {matches.map((match) => {
        const when = new Date(match.utcDate).toLocaleString("it-IT", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
        const score =
          match.homeScore != null && match.awayScore != null
            ? `${match.homeScore} - ${match.awayScore}`
            : "vs";
        return (
          <li
            key={match.id}
            className="panel grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md px-3 py-3 text-sm"
          >
            <span className="text-right">{match.homeTeam}</span>
            <span className="data-font min-w-[4.5rem] text-center font-semibold text-[var(--accent)]">
              {score}
            </span>
            <span>{match.awayTeam}</span>
            <span className="col-span-3 text-center text-xs text-[var(--muted)]">
              {when}
              {match.matchday != null ? ` · Giornata ${match.matchday}` : ""} · {match.status}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ScorersTable({ rows }: { rows: ScorerRow[] }) {
  if (!rows.length) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Marcatori non disponibili sul piano free (endpoint spesso 403).
      </p>
    );
  }
  return (
    <div className="table-scroll panel rounded-md">
      <table className="w-full min-w-[480px] text-sm">
        <thead className="bg-black/40 text-left text-xs uppercase text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Giocatore</th>
            <th className="px-3 py-2">Squadra</th>
            <th className="px-3 py-2">Gol</th>
            <th className="px-3 py-2">Assist</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.rank}-${row.playerName}`} className="border-t border-[var(--line)]">
              <td className="data-font px-3 py-2">{row.rank}</td>
              <td className="px-3 py-2">{row.playerName}</td>
              <td className="px-3 py-2">{row.teamName}</td>
              <td className="data-font px-3 py-2 font-bold text-[var(--accent)]">{row.goals}</td>
              <td className="data-font px-3 py-2">{row.assists ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TeamsGrid({
  teams,
  leagueSlug,
}: {
  teams: TeamSummary[];
  leagueSlug: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
      {teams.map((team) => (
        <Link
          key={team.id}
          href={`/${leagueSlug}/squadra/${team.slug}`}
          className="panel rounded-md px-3 py-3 text-sm hover:border-[var(--accent)]"
        >
          <div className="font-semibold">{team.name}</div>
          <div className="data-font text-xs text-[var(--muted)]">{team.tla}</div>
        </Link>
      ))}
    </div>
  );
}

export function InsightCards({ cards }: { cards: InsightCard[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {cards.map((card) => (
        <article key={card.id} className="panel rounded-md p-4">
          <h3
            className={`text-sm font-semibold ${
              card.tone === "warning"
                ? "text-[var(--warn)]"
                : card.tone === "positive"
                  ? "text-[var(--accent)]"
                  : "text-[var(--ink)]"
            }`}
          >
            {card.title}
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)]">{card.body}</p>
        </article>
      ))}
    </div>
  );
}
