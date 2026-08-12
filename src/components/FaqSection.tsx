import { JsonLd } from "@/components/JsonLd";
import { faqPageJsonLd, type FaqItem } from "@/lib/geo";
import { siteUrl } from "@/lib/site";

type Props = {
  items: FaqItem[];
  /** Path relativo es. /oggi */
  path: string;
  title?: string;
};

/**
 * FAQ visibili + FAQPage schema — formato preferito da ricerca AI / overview.
 */
export function FaqSection({
  items,
  path,
  title = "Domande frequenti",
}: Props) {
  if (!items.length) return null;
  const pageUrl = `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  return (
    <section className="space-y-4" aria-labelledby="faq-heading">
      <JsonLd data={faqPageJsonLd(items, pageUrl)} />
      <div className="section-rule">
        <h2 id="faq-heading">{title}</h2>
        <span className="section-meta">Per ricerca e AI</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="panel group open:border-[var(--accent)]"
          >
            <summary className="cursor-pointer list-none px-4 py-3 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="display-font text-sm uppercase tracking-wide text-[var(--ink)] sm:text-base">
                {item.question}
              </span>
            </summary>
            <p className="border-t border-[var(--line)] px-4 py-3 text-sm leading-relaxed text-[var(--muted)]">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
