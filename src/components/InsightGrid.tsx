import type { InsightCard } from "@/lib/types";

const toneClass = {
  positive: "border-l-[var(--accent-2)]",
  neutral: "border-l-[var(--muted)]",
  warning: "border-l-[var(--warn)]",
} as const;

export function InsightGrid({ items }: { items: InsightCard[] }) {
  if (!items.length) return null;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.id}
          className={`fm-panel border-l-4 p-4 ${toneClass[item.tone]}`}
        >
          <h3 className="text-sm font-semibold text-[var(--accent)] mb-1">
            {item.title}
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
