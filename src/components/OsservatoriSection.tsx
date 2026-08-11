import Link from "next/link";
import { Crest } from "@/components/Crest";
import type { ClubRadar, OsservatoriReport, ScoutPlayer } from "@/lib/osservatori";
import { teamPathSlug } from "@/lib/slug";

function categoryTone(category: ScoutPlayer["category"]) {
  switch (category) {
    case "hot":
      return "border-[var(--accent)] text-[var(--accent)]";
    case "gem":
      return "border-[#5b8def] text-[#8eb6ff]";
    case "creator":
      return "border-[#c084fc] text-[#d8b4fe]";
    case "clinical":
      return "border-[#f0b429] text-[var(--warn)]";
    default:
      return "border-[var(--line)] text-[var(--muted)]";
  }
}

function PlayerCard({ player }: { player: ScoutPlayer }) {
  return (
    <article className="panel flex h-full flex-col gap-3 p-4 transition hover:border-[var(--accent)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${categoryTone(player.category)}`}
          >
            {player.categoryLabel}
          </p>
          <h3 className="display-font mt-2 text-xl font-bold uppercase leading-tight tracking-wide">
            {player.playerName}
          </h3>
          <Link
            href={`/${player.leagueSlug}/squadra/${teamPathSlug(player.teamName, player.teamId)}`}
            className="mt-1 flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)]"
          >
            <Crest src={player.teamCrest} alt={player.teamName} size={18} />
            <span className="truncate">
              {player.teamName} · {player.leagueName}
            </span>
          </Link>
        </div>
        <div className="shrink-0 text-right">
          <div className="display-font text-3xl font-bold text-[var(--accent)]">
            {player.scoutScore}
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            ScoutScore
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-[var(--muted)]">{player.blurb}</p>

      <div className="mt-auto grid grid-cols-4 gap-2 border-t border-[var(--line)] pt-3 text-center text-[11px]">
        <div>
          <div className="data-font text-base font-bold text-[var(--ink)]">
            {player.goals}
          </div>
          <div className="text-[var(--muted)]">Gol</div>
        </div>
        <div>
          <div className="data-font text-base font-bold text-[var(--ink)]">
            {player.assists}
          </div>
          <div className="text-[var(--muted)]">Assist</div>
        </div>
        <div>
          <div className="data-font text-base font-bold text-[var(--ink)]">
            {player.goalsPerGame}
          </div>
          <div className="text-[var(--muted)]">Gol/G</div>
        </div>
        <div>
          <div className="data-font text-base font-bold text-[var(--ink)]">
            {player.played}
          </div>
          <div className="text-[var(--muted)]">Partite</div>
        </div>
      </div>
    </article>
  );
}

function ClubCard({ club }: { club: ClubRadar }) {
  return (
    <article className="panel flex h-full flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Crest src={club.crest} alt={club.teamName} size={28} />
          <div className="min-w-0">
            <Link
              href={`/${club.leagueSlug}/squadra/${teamPathSlug(club.teamName, club.teamId)}`}
              className="display-font block truncate text-lg font-bold uppercase hover:text-[var(--accent)]"
            >
              {club.teamName}
            </Link>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              {club.leagueName} · #{club.metrics.position}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="display-font text-2xl font-bold text-[var(--accent)]">
            {club.score}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
            Radar
          </div>
        </div>
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
        {club.focus}
      </p>
      <p className="text-sm text-[var(--muted)]">{club.blurb}</p>
    </article>
  );
}

export function OsservatoriSection({
  report,
  compact = false,
}: {
  report: OsservatoriReport;
  compact?: boolean;
}) {
  const players = compact ? report.players.slice(0, 3) : report.players;
  const clubs = compact ? report.clubs.slice(0, 3) : report.clubs;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[var(--accent)] pb-2">
        <div>
          <h2 className="display-font text-[clamp(1.35rem,3vw,1.85rem)] font-bold uppercase tracking-[0.04em]">
            Osservatori
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
            ScoutScore CalcioAuto: algoritmi su gol, efficienza, assist e
            contesto classifica. Non è un report ufficiale di agenzie.
          </p>
        </div>
        {compact ? (
          <Link
            href="/osservatori"
            className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]"
          >
            Vedi tutti
          </Link>
        ) : null}
      </div>

      {report.hasPlayers ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="panel space-y-2 p-4">
          <p className="text-sm font-medium">
            Marcatori ufficiali non ancora disponibili
          </p>
          <p className="text-sm text-[var(--muted)]">
            Gli algoritmi giocatore si attivano con i primi gol di stagione. Nel
            frattempo resta attivo il radar club.
          </p>
        </div>
      )}

      {clubs.length ? (
        <div className="space-y-3">
          <h3 className="display-font text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Radar club
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
