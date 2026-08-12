import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { BlogPostCard } from "@/components/Blog";
import { listAllBlogPosts } from "@/lib/blog-store";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog calcio: analisi, performance e osservatori",
  description: `Blog ${SITE_NAME}: articoli su analisi calcio, performance, scouting e osservatori. Contenuti originali, senza quote scommesse.`,
  keywords: [
    "blog calcio",
    "analisi calcio",
    "performance calcio",
    "osservatori calcio",
    "scouting",
  ],
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await listAllBlogPosts();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="display-font text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
          Editoriale
        </p>
        <h1 className="display-font text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          Blog calcio
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Analisi, performance e osservatori — articoli originali su{" "}
          {SITE_NAME}. Niente quote scommesse.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/analisi"
            className="border border-[var(--line)] px-3 py-1.5 font-bold uppercase tracking-[0.1em] hover:border-[var(--accent)]"
          >
            Analisi dati
          </Link>
          <Link
            href="/osservatori"
            className="border border-[var(--line)] px-3 py-1.5 font-bold uppercase tracking-[0.1em] hover:border-[var(--accent)]"
          >
            Osservatori
          </Link>
        </div>
      </section>

      <AdSlot slot="top" />

      {posts.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Nessun articolo pubblicato. Scrivi da{" "}
          <Link href="/admin/blog" className="text-[var(--accent)] hover:underline">
            /admin/blog
          </Link>
          .
        </p>
      )}
    </div>
  );
}
