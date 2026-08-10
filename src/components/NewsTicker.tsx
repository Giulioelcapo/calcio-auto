import Link from "next/link";
import type { NewsItem } from "@/lib/news";

export function NewsTicker({ items }: { items: NewsItem[] }) {
  if (!items.length) return null;

  const loop = [...items, ...items];

  return (
    <div className="news-ticker border-b border-[var(--line)] bg-black/40">
      <div className="mx-auto flex max-w-6xl items-stretch gap-3 px-2 sm:px-4">
        <Link
          href="/notizie"
          className="flex shrink-0 items-center px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]"
        >
          News
        </Link>
        <div className="news-ticker-viewport min-w-0 flex-1 py-2">
          <div className="news-ticker-track">
            {loop.map((item, index) => (
              <a
                key={`${item.id}-${index}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-ticker-item"
              >
                <span className="text-[var(--accent)]">{item.source}</span>
                <span className="text-[var(--muted)]"> · </span>
                <span>{item.title}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
