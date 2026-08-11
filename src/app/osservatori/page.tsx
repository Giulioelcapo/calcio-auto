import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { OsservatoriSection } from "@/components/OsservatoriSection";
import { getOsservatoriReport } from "@/lib/football-api";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Osservatori — ScoutScore giocatori",
  description: `Radar osservatori di ${SITE_NAME}: ScoutScore su giocatori e club con algoritmi su gol, efficienza, assist e contesto classifica.`,
  alternates: { canonical: "/osservatori" },
};

export default async function OsservatoriPage() {
  const report = await getOsservatoriReport();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="display-font text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
          Algorithms desk
        </p>
        <h1 className="display-font text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          Osservatori
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Lista automatica di profili da seguire. Modelli editoriali CalcioAuto
          (Hot streak, Hidden gem, Playmaker, Clinical, Breakout) + radar club.
        </p>
      </section>

      <AdSlot slot="top" />
      <OsservatoriSection report={report} />

      <p className="text-xs text-[var(--muted)]">
        Dati base da football-data.org. Torna alla{" "}
        <Link href="/" className="text-[var(--accent)] hover:underline">
          home
        </Link>{" "}
        o apri{" "}
        <Link href="/gol" className="text-[var(--accent)] hover:underline">
          Gol e marcatori
        </Link>
        .
      </p>
    </div>
  );
}
