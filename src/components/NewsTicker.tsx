import Link from "next/link";
import type { NewsItem } from "@/lib/news";

export function NewsTicker({ items }: { items: NewsItem[] }) {
  if (!items.length) {
    return (
      <p className="py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-ink)]/70">
        Ultime notizie in aggiornamento
      </p>
    );
  }

  const loop = [...items, ...items];

  return (
    <div className="news-ticker-viewport min-w-0 py-0.5">
      <div className="news-ticker-track">
        {loop.map((item, index) => (
          <a
            key={`${item.id}-${index}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="news-ticker-item"
          >
            <span className="opacity-70">{item.source}</span>
            <span className="opacity-40"> · </span>
            <span>{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
