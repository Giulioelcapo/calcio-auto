import { Crest } from "@/components/Crest";
import type { MatchItem } from "@/lib/types";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MatchesList({ matches }: { matches: MatchItem[] }) {
  if (!matches.length) {
    return (
      <div className="fm-panel space-y-1 p-4">
        <p className="text-sm font-medium">Campionati non ancora iniziati</p>
        <p className="text-sm text-[var(--muted)]">
          Qui compariranno le partite appena parte la stagione.
        </p>
      </div>
    );
  }

  return (
    <div className="fm-panel divide-y divide-[var(--line)]">
      {matches.map((match) => {
        const done = match.status === "FINISHED" || match.status === "AWARDED";
        return (
          <div key={match.id} className="px-4 py-3 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
              <span>
                {formatWhen(match.utcDate)}
                {match.matchday != null ? ` · G${match.matchday}` : ""}
                {match.stage && match.stage !== "REGULAR_SEASON"
                  ? ` · ${match.stage}`
                  : ""}
              </span>
              {match.venue ? <span className="truncate max-w-[50%]">{match.venue}</span> : null}
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="flex items-center justify-end gap-2 text-sm font-medium">
                <span className="text-right">{match.homeTeam}</span>
                <Crest src={match.homeCrest} alt={match.homeTeam} size={26} />
              </div>
              <div className="min-w-[4.5rem] text-center font-mono text-sm">
                {done ? (
                  <span className="text-[var(--accent)] font-bold">
                    {match.homeScore}-{match.awayScore}
                  </span>
                ) : (
                  <span className="text-[var(--muted)] uppercase text-[10px] tracking-wide">
                    {match.status === "TIMED" || match.status === "SCHEDULED"
                      ? "vs"
                      : match.status}
                  </span>
                )}
                {done && match.homeHalf != null && match.awayHalf != null ? (
                  <div className="text-[10px] text-[var(--muted)] mt-0.5">
                    1T {match.homeHalf}-{match.awayHalf}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Crest src={match.awayCrest} alt={match.awayTeam} size={26} />
                <span>{match.awayTeam}</span>
              </div>
            </div>
            {match.referee ? (
              <div className="text-[10px] text-[var(--muted)]">
                Arbitro: {match.referee}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
