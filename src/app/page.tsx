import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { listLeagues } from "@/lib/football-api";

export default function HomePage() {
  const leagues = listLeagues();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          Programmatic SEO · Zero gestione manuale
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          <span className="text-[var(--accent)]">CalcioAuto</span>
        </h1>
        <p className="max-w-2xl text-base text-[var(--muted)]">
          Classifiche, calendari, risultati, squadre e insight automatici sui 12
          campionati del piano gratuito football-data.org. Stile Football Manager,
          mobile-first, pronto per AdSense.
        </p>
      </section>

      <AdSlot slot="top" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--accent)]">Campionati</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <article key={league.slug} className="panel rounded-md p-4">
              <div className="data-font text-xs text-[var(--muted)]">
                {league.country} · {league.code}
              </div>
              <h3 className="mt-1 text-lg font-semibold">{league.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Link
                  href={`/${league.slug}`}
                  className="rounded bg-[var(--pitch)] px-2 py-1 hover:brightness-110"
                >
                  Hub
                </Link>
                <Link
                  href={`/${league.slug}/classifica`}
                  className="rounded border border-[var(--line)] px-2 py-1 hover:border-[var(--accent)]"
                >
                  Classifica
                </Link>
                <Link
                  href={`/${league.slug}/calendario`}
                  className="rounded border border-[var(--line)] px-2 py-1 hover:border-[var(--accent)]"
                >
                  Calendario
                </Link>
                <Link
                  href={`/${league.slug}/risultati`}
                  className="rounded border border-[var(--line)] px-2 py-1 hover:border-[var(--accent)]"
                >
                  Risultati
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
