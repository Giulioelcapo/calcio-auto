import Link from "next/link";
import { Crest } from "@/components/Crest";
import type { FreeDeskReport } from "@/lib/football-api";
import { teamPathSlug } from "@/lib/slug";

function formatKick(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });
}

export function FreeDeskSection({
  report,
  compact = false,
}: {
  report: FreeDeskReport;
  compact?: boolean;
}) {
  const leagues = compact ? report.leagues.slice(0, 2) : report.leagues;
  const hasBody =
    report.meteo.length > 0 ||
    leagues.some(
      (l) =>
        l.streaks.length ||
        l.hardFixtures.length ||
        l.nextMatchday != null,
    );

  if (!hasBody && report.todayCount === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[var(--accent)] pb-2">
        <h2 className="display-font text-[clamp(1.35rem,3vw,1.85rem)] font-bold uppercase tracking-[0.04em]">
          Free desk
        </h2>
        <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          <Link href="/analisi" className="hover:text-[var(--accent)]">
            Analisi
          </Link>
          <Link href="/share/oggi" className="hover:text-[var(--accent)]">
            Card oggi
          </Link>
        </div>
      </div>

      {report.meteo.length ? (
        <div className="flex flex-wrap gap-2">
          {report.meteo.map((m) => (
            <div
              key={m.label}
              className="panel px-3 py-2 text-xs"
            >
              <span className="font-bold text-[var(--ink)]">{m.label}</span>
              <span className="text-[var(--muted)]">
                {" "}
                · {m.summary}
                {m.tempC != null ? ` · ${Math.round(m.tempC)}°C` : ""}
                {m.windKmh != null ? ` · vento ${Math.round(m.windKmh)}` : ""}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {leagues.map((league) => (
          <article key={league.slug} className="panel space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="display-font text-lg font-bold uppercase">
                {league.name}
              </h3>
              <Link
                href={`/${league.slug}`}
                className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)] hover:text-[var(--accent)]"
              >
                Hub
              </Link>
            </div>

            {league.nextMatchday ? (
              <div className="rounded border border-[var(--line)] px-3 py-2 text-sm">
                <span className="text-[var(--muted)]">Giornata </span>
                <span className="font-bold text-[var(--accent)]">
                  {league.nextMatchday.matchday}
                </span>
                <span className="text-[var(--muted)]">
                  {" "}
                  · {league.nextMatchday.matchCount} gare
                  {league.nextMatchday.hoursToFirst != null
                    ? ` · tra ${league.nextMatchday.hoursToFirst}h`
                    : ""}
                </span>
              </div>
            ) : null}

            {league.streaks.length ? (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Streak
                </p>
                <ul className="space-y-1">
                  {(compact ? league.streaks.slice(0, 3) : league.streaks).map(
                    (s) => (
                      <li
                        key={`${league.slug}-${s.teamId}`}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <Link
                          href={`/${league.slug}/squadra/${teamPathSlug(s.teamName, s.teamId)}`}
                          className="flex min-w-0 items-center gap-2 hover:text-[var(--accent)]"
                        >
                          <Crest src={s.crest} alt={s.teamName} size={18} />
                          <span className="truncate">{s.teamName}</span>
                        </Link>
                        <span
                          className={`data-font shrink-0 font-bold ${
                            s.type === "W"
                              ? "text-[var(--accent)]"
                              : s.type === "L"
                                ? "text-[var(--warn)]"
                                : "text-[var(--muted)]"
                          }`}
                        >
                          {s.type}×{s.length}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}

            {league.hardFixtures.length ? (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Calendario duro
                </p>
                <ul className="space-y-1.5">
                  {(compact
                    ? league.hardFixtures.slice(0, 2)
                    : league.hardFixtures
                  ).map((f) => (
                    <li key={`${league.slug}-${f.matchId}`} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          {f.focusTeam}{" "}
                          <span className="text-[var(--muted)]">
                            vs {f.opponent}
                          </span>
                        </span>
                        <span className="data-font shrink-0 text-[var(--accent)]">
                          {f.difficulty}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">
                        {formatKick(f.utcDate)} · {f.homeAway}
                        {f.opponentPosition != null
                          ? ` · avversario #${f.opponentPosition}`
                          : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
