import type { Metadata } from "next";
import Link from "next/link";
import { Crest } from "@/components/Crest";
import { getTodaysMatches } from "@/lib/football-api";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Card partite di oggi",
  description: `Card condividibile partite di oggi — ${SITE_NAME}`,
  alternates: { canonical: "/share/oggi" },
};

function kick(iso: string) {
  return new Date(iso).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });
}

export default async function ShareOggiPage() {
  const today = await getTodaysMatches();
  const list = today.matches.slice(0, 12);

  return (
    <div className="mx-auto max-w-lg space-y-4 py-4">
      <div className="panel overflow-hidden">
        <div className="bg-[var(--accent)] px-4 py-3 text-[var(--accent-ink)]">
          <p className="display-font text-xs font-bold uppercase tracking-[0.2em]">
            {SITE_NAME}
          </p>
          <h1 className="display-font text-2xl font-bold uppercase">
            Partite di oggi
          </h1>
          <p className="text-xs font-semibold">{today.dateLabel}</p>
        </div>
        <ul className="divide-y divide-[var(--line)]">
          {list.map((m) => (
            <li key={m.id} className="px-4 py-3">
              <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {m.leagueName} · {kick(m.utcDate)}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Crest src={m.homeCrest} alt={m.homeTeam} size={18} />
                  <span className="truncate">{m.homeTeam}</span>
                </span>
                <span className="data-font text-[var(--accent)]">
                  {m.homeScore != null && m.awayScore != null
                    ? `${m.homeScore}-${m.awayScore}`
                    : "vs"}
                </span>
                <span className="flex min-w-0 items-center justify-end gap-1.5">
                  <span className="truncate text-right">{m.awayTeam}</span>
                  <Crest src={m.awayCrest} alt={m.awayTeam} size={18} />
                </span>
              </div>
            </li>
          ))}
          {!list.length ? (
            <li className="px-4 py-6 text-center text-sm text-[var(--muted)]">
              —
            </li>
          ) : null}
        </ul>
      </div>
      <p className="text-center text-xs text-[var(--muted)]">
        <Link href="/oggi" className="hover:text-[var(--accent)]">
          /oggi
        </Link>
        {" · "}
        <Link href="/" className="hover:text-[var(--accent)]">
          home
        </Link>
      </p>
    </div>
  );
}
