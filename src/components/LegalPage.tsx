import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-sm text-[var(--muted)]">Ultimo aggiornamento: {updated}</p>
      </header>
      <div className="space-y-4 text-sm leading-relaxed text-[var(--muted)] [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--accent)] [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:text-[var(--accent)] [&_a]:underline">
        {children}
      </div>
    </article>
  );
}
