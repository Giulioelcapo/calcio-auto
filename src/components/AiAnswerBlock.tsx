import { geoUpdatedAt } from "@/lib/geo";

type Props = {
  /** Risposta diretta, prima frase citabile. */
  answer: string;
  title?: string;
};

/**
 * Blocco “answer-first” per Generative Engine Optimization:
 * affermazione chiara + fonte + timestamp.
 */
export function AiAnswerBlock({
  answer,
  title = "Risposta rapida",
}: Props) {
  return (
    <aside
      className="border-l-4 border-[var(--accent)] bg-[var(--panel)] px-4 py-3"
      aria-label={title}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
        {title} · aggiornato {geoUpdatedAt()}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">{answer}</p>
      <p className="mt-2 text-[10px] text-[var(--muted)]">
        Fonte dati: football-data.org · Contenuto verificabile su questa pagina
      </p>
    </aside>
  );
}
