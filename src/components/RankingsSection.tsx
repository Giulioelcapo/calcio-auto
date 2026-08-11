"use client";

import Link from "next/link";
import { useState } from "react";
import { Crest } from "@/components/Crest";
import type { RankingsBoard } from "@/lib/football-api";
import { teamPathSlug } from "@/lib/slug";
import type { StandingRow } from "@/lib/types";

type Filter = "total" | "home" | "away";

function positionTone(pos: number) {
  if (pos <= 2) return "bg-[#1f8a4c]";
  if (pos === 3) return "bg-[#2f6fed]";
  return "bg-[#1f8a4c]";
}

function RankCard({ board }: { board: RankingsBoard }) {
  const [filter, setFilter] = useState<Filter>("total");
  const rows: StandingRow[] =
    filter === "home"
      ? board.home.length
        ? board.home
        : board.total
      : filter === "away"
        ? board.away.length
          ? board.away
          : board.total
        : board.total;

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "total", label: "Tutti" },
    { id: "home", label: "Casa" },
    { id: "away", label: "Trasferta" },
  ];

  return (
    <article className="rank-card flex flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-2 border-b border-black/10 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Crest src={board.emblem} alt={board.name} size={22} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#111]">
              {board.name}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#666]">
              {board.seasonLabel}
            </p>
          </div>
        </div>
        <Link
          href={`/${board.slug}/classifica`}
          className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#111] hover:text-[var(--pitch)]"
        >
          Vedi
        </Link>
      </div>

      <div className="flex gap-1.5 px-3 py-2">
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                active
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-[#ececec] text-[#333] hover:bg-[#e0e0e0]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="px-2 pb-2">
        <div className="grid grid-cols-[28px_1fr_22px_22px_22px_22px_28px] gap-1 px-1 pb-1 text-[9px] font-bold uppercase tracking-wide text-[#888]">
          <span>#</span>
          <span>Squadra</span>
          <span className="text-center">G</span>
          <span className="text-center">V</span>
          <span className="text-center">N</span>
          <span className="text-center">P</span>
          <span className="text-right">Pti</span>
        </div>
        {rows.length ? (
          <ul className="space-y-0.5">
            {rows.map((row) => (
              <li
                key={`${board.slug}-${filter}-${row.teamId}`}
                className="grid grid-cols-[28px_1fr_22px_22px_22px_22px_28px] items-center gap-1 rounded-md px-1 py-1.5 text-[11px] text-[#111] hover:bg-black/[0.03]"
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${positionTone(row.position)}`}
                >
                  {row.position}
                </span>
                <Link
                  href={`/${board.slug}/squadra/${teamPathSlug(row.teamName, row.teamId)}`}
                  className="flex min-w-0 items-center gap-1.5 font-semibold hover:underline"
                >
                  <Crest src={row.crest} alt={row.teamName} size={16} />
                  <span className="truncate">
                    {row.teamShortName || row.teamName}
                  </span>
                </Link>
                <span className="text-center tabular-nums">{row.playedGames}</span>
                <span className="text-center tabular-nums">{row.won}</span>
                <span className="text-center tabular-nums">{row.draw}</span>
                <span className="text-center tabular-nums">{row.lost}</span>
                <span className="text-right font-bold tabular-nums">
                  {row.points}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-2 py-4 text-center text-xs text-[#666]">
            Classifica non ancora disponibile.
          </p>
        )}
      </div>
    </article>
  );
}

export function RankingsSection({ boards }: { boards: RankingsBoard[] }) {
  if (!boards.length) return null;

  return (
    <section className="space-y-5">
      <div className="border-b-2 border-[var(--accent)] pb-2 text-center">
        <h2 className="display-font text-[clamp(1.35rem,3vw,1.85rem)] font-bold uppercase tracking-[0.04em] text-[var(--ink)]">
          Rankings
        </h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {boards.map((board) => (
          <RankCard key={board.slug} board={board} />
        ))}
      </div>
    </section>
  );
}
