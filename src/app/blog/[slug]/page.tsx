import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { BlogArticleBody } from "@/components/Blog";
import { JsonLd } from "@/components/JsonLd";
import { BLOG_CATEGORIES, formatBlogDate } from "@/lib/blog";
import {
  getBlogPostBySlug,
  listAllBlogPosts,
} from "@/lib/blog-store";
import { SITE_NAME, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Articolo" };
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const base = siteUrl();
  const url = `${base}/blog/${post.slug}`;
  const related = (await listAllBlogPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: base,
      logo: `${base}/logo-sp.png`,
    },
    mainEntityOfPage: url,
    keywords: post.tags.join(", "),
    articleSection: BLOG_CATEGORIES[post.category],
    inLanguage: "it-IT",
  };

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <JsonLd data={articleLd} />

      <header className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
          <Link href="/blog" className="hover:text-[var(--accent)]">
            Blog
          </Link>
          <span aria-hidden> · </span>
          <span className="text-[var(--accent)]">
            {BLOG_CATEGORIES[post.category]}
          </span>
        </p>
        <h1 className="display-font text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <p className="text-sm text-[var(--muted)]">{post.description}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          <span>{post.author}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
        </div>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="border border-[var(--line)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <AdSlot slot="top" />

      <BlogArticleBody post={post} />

      <AdSlot slot="in-content" />

      <section className="panel space-y-3 p-5">
        <h2 className="display-font text-lg font-bold uppercase">Continua</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/blog"
            className="btn-accent px-3 py-1.5 uppercase tracking-[0.12em]"
          >
            Tutti gli articoli
          </Link>
          <Link
            href="/osservatori"
            className="border border-[var(--line)] px-3 py-1.5 font-bold uppercase tracking-[0.12em] hover:border-[var(--accent)]"
          >
            Osservatori
          </Link>
          <Link
            href="/analisi"
            className="border border-[var(--line)] px-3 py-1.5 font-bold uppercase tracking-[0.12em] hover:border-[var(--accent)]"
          >
            Analisi dati
          </Link>
        </div>
      </section>

      {related.length ? (
        <section className="space-y-3">
          <h2 className="display-font text-lg font-bold uppercase">
            Altri articoli
          </h2>
          <ul className="space-y-2">
            {related.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
