import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { PollPanel } from "@/components/PollPanel";
import { buildPollState } from "@/lib/poll";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Sondaggio miglior squadra di oggi",
  description: `Vota la miglior squadra della giornata su ${SITE_NAME}. Sondaggio tra le squadre realmente in campo oggi.`,
  alternates: { canonical: "/sondaggio" },
};

export default async function SondaggioPage() {
  const poll = await buildPollState();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          Community
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Sondaggio
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">{poll.title}</p>
      </section>

      <AdSlot slot="top" />
      <PollPanel initial={poll} />

      <p className="text-xs text-[var(--muted)]">
        Vedi anche{" "}
        <Link href="/gol" className="text-[var(--accent)] hover:underline">
          Gol e risultati ufficiali
        </Link>{" "}
        e{" "}
        <Link href="/oggi" className="text-[var(--accent)] hover:underline">
          Partite di oggi
        </Link>
        .
      </p>
    </div>
  );
}
