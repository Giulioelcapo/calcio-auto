import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { OsservatoriSection } from "@/components/OsservatoriSection";
import { getOsservatoriReport } from "@/lib/football-api";
import { osservatoriMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = osservatoriMetadata();

export default async function OsservatoriPage() {
  const report = await getOsservatoriReport();

  return (
    <div className="space-y-8">
      <h1 className="display-font text-4xl font-bold uppercase tracking-tight sm:text-5xl">
        Osservatori calcio
      </h1>
      <p className="max-w-2xl text-sm text-[var(--muted)]">
        Indici derivati dai dati free: ScoutScore giocatori (share gol, dipendenza,
        contesto), radar club (casa/trasferta, momentum, ATK/DEF) e segnali matchup
        sulle prossime partite.
      </p>
      <AdSlot slot="top" />
      <OsservatoriSection report={report} />
    </div>
  );
}
