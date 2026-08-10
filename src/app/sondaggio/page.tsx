import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { PollPanel } from "@/components/PollPanel";
import { buildPollState } from "@/lib/poll";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Sondaggio partita della giornata",
  description: `Vota la partita della giornata su ${SITE_NAME}: 4 match del giorno, stile gioco community.`,
  alternates: { canonical: "/sondaggio" },
};

export default async function SondaggioPage() {
  const poll = await buildPollState();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          Mini-gioco
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Partita della giornata
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">{poll.title}</p>
      </section>

      <AdSlot slot="top" />
      <PollPanel initial={poll} />

      <p className="text-xs text-[var(--muted)]">
        Torna alla{" "}
        <Link href="/" className="text-[var(--accent)] hover:underline">
          dashboard
        </Link>{" "}
        per giocare subito, oppure apri{" "}
        <Link href="/gol" className="text-[var(--accent)] hover:underline">
          Gol e marcatori
        </Link>
        .
      </p>
    </div>
  );
}
