import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { OsservatoriSection } from "@/components/OsservatoriSection";
import { getOsservatoriReport } from "@/lib/football-api";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Osservatori",
  description: `Osservatori ${SITE_NAME}: KPI e ScoutScore su giocatori e club.`,
  alternates: { canonical: "/osservatori" },
};

export default async function OsservatoriPage() {
  const report = await getOsservatoriReport();

  return (
    <div className="space-y-8">
      <h1 className="display-font text-4xl font-bold uppercase tracking-tight sm:text-5xl">
        Osservatori
      </h1>
      <AdSlot slot="top" />
      <OsservatoriSection report={report} />
    </div>
  );
}
