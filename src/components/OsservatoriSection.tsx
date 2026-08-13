import Link from "next/link";
import { Crest } from "@/components/Crest";
import type {
  ClubRadar,
  OsservatoriReport,
  ScoutAlert,
  ScoutPlayer,
} from "@/lib/osservatori";
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

function alertTone(tone: ScoutAlert["tone"]) {
  switch (tone) {
    case "hot":
      return "border-[var(--accent)]/50 text-[var(--accent)]";
    case "gem":
      return "border-[#5b8def]/50 text-[#8eb6ff]";
    case "warn":
      return "border-[var(--warn)]/50 text-[var(--warn)]";
    default:
      return "border-[var(--line)] text-[var(--muted)]";
  }
}

function Kpi({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="rounded border border-[var(--line)] bg-black/20 px-1.5 py-1.5 text-center">
      <div className="data-font text-sm font-bold text-[var(--ink)]">{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
    </div>
  );
}

function SignalRow({ signals }: { signals: string[] }) {
  if (!signals.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {signals.map((s) => (
        <span
          key={s}
          className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--muted)]"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function PlayerCard({ player }: { player: ScoutPlayer }) {
  const k = player.kpis;
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
              {player.teamName}
              {k.teamPosition != null ? ` · #${k.teamPosition}` : ""}
            </span>
          </Link>
        </div>
        <div className="shrink-0 text-right">
          <div className="display-font text-3xl font-bold text-[var(--accent)]">
            {player.scoutScore}
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Score
          </div>
        </div>
      </div>

      <SignalRow signals={player.signals} />

      <div className="mt-auto grid grid-cols-4 gap-1.5 sm:grid-cols-5">
        <Kpi label="Gol" value={k.goals} />
        <Kpi label="Ast" value={k.assists} />
        <Kpi label="G+A" value={k.goalInvolvements} />
        <Kpi label="PG" value={k.played} />
        <Kpi label="G/G" value={k.goalsPerGame} />
        <Kpi label="A/G" value={k.assistsPerGame} />
        <Kpi
          label="%Team"
          value={k.teamGoalShare != null ? `${k.teamGoalShare}%` : null}
        />
        <Kpi label="Dep" value={k.dependencyIndex} />
        <Kpi label="Ctx" value={k.contextIndex} />
        <Kpi
          label="%Open"
          value={k.openPlayShare != null ? `${k.openPlayShare}%` : null}
        />
      </div>
    </article>
  );
}

function ClubCard({ club }: { club: ClubRadar }) {
  const k = club.kpis;
  return (
    <article className="panel flex h-full flex-col gap-3 p-4">
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
              {club.leagueName} · #{k.position} · {club.focus}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="display-font text-2xl font-bold text-[var(--accent)]">
            {club.score}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
            Score
          </div>
        </div>
      </div>

      <SignalRow signals={club.signals} />

      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
        <Kpi label="PPG" value={k.ppg} />
        <Kpi label="H PPG" value={k.homePpg} />
        <Kpi label="A PPG" value={k.awayPpg} />
        <Kpi label="Δ H/A" value={k.homeAwayGap} />
        <Kpi label="Mom" value={k.momentum} />
        <Kpi label="Streak" value={k.streakLabel} />
        <Kpi label="GF/G" value={k.gfPerGame} />
        <Kpi label="GS/G" value={k.gaPerGame} />
        <Kpi label="ATK" value={k.attackIndex} />
        <Kpi label="DEF" value={k.defenseIndex} />
        <Kpi label="Bal" value={k.balanceIndex} />
        <Kpi label="Form" value={k.formScore} />
      </div>
    </article>
  );
}

function AlertsBlock({ alerts }: { alerts: ScoutAlert[] }) {
  if (!alerts.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="display-font text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        Segnali scout
      </h3>
      <div className="grid gap-2 md:grid-cols-2">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className={`rounded border bg-black/25 px-3 py-2.5 ${alertTone(alert.tone)}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
              {alert.kind === "matchup"
                ? "Matchup"
                : alert.kind === "player"
                  ? "Giocatore"
                  : "Club"}
            </p>
            <p className="display-font mt-1 text-base font-bold uppercase tracking-wide text-[var(--ink)]">
              {alert.href ? (
                <Link href={alert.href} className="hover:text-[var(--accent)]">
                  {alert.title}
                </Link>
              ) : (
                alert.title
              )}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              {alert.body}
            </p>
          </article>
        ))}
      </div>
    </div>
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
  const alerts = compact ? report.alerts.slice(0, 4) : report.alerts;

  if (!players.length && !clubs.length && !alerts.length) return null;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[var(--accent)] pb-2">
        <h2 className="display-font text-[clamp(1.35rem,3vw,1.85rem)] font-bold uppercase tracking-[0.04em]">
          Osservatori
        </h2>
        {compact ? (
          <Link
            href="/osservatori"
            className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]"
          >
            Vedi tutti
          </Link>
        ) : null}
      </div>

      {!compact ? <AlertsBlock alerts={alerts} /> : null}

      {players.length ? (
        <div className="space-y-3">
          {!compact ? (
            <h3 className="display-font text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Giocatori · ScoutScore
            </h3>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      ) : null}

      {clubs.length ? (
        <div className="space-y-3">
          <h3 className="display-font text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Club · Radar
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </div>
      ) : null}

      {compact && alerts.length ? <AlertsBlock alerts={alerts} /> : null}
    </section>
  );
}
