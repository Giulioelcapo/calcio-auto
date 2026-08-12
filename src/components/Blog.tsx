import Link from "next/link";
import {
  BLOG_CATEGORIES,
  formatBlogDate,
  type BlogPost,
  blogPath,
} from "@/lib/blog";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="panel overflow-hidden transition hover:border-[var(--accent)]">
      <Link href={blogPath(post.slug)} className="block p-5">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          <span className="text-[var(--accent)]">
            {BLOG_CATEGORIES[post.category]}
          </span>
          <span aria-hidden>·</span>
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
        </div>
        <h2 className="display-font mt-3 text-xl font-bold uppercase leading-tight tracking-wide text-[var(--ink)] sm:text-2xl">
          {post.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {post.description}
        </p>
        <span className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
          Leggi articolo →
        </span>
      </Link>
    </article>
  );
}

export function BlogArticleBody({ post }: { post: BlogPost }) {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
      {post.body.map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i} className="text-[var(--ink)]/90">
              {block.text}
            </p>
          );
        }
        if (block.type === "h2") {
          return (
            <h2
              key={i}
              className="display-font pt-2 text-xl font-bold uppercase tracking-wide text-[var(--ink)]"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 text-[var(--ink)]/85">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <blockquote
            key={i}
            className="border-l-4 border-[var(--accent)] bg-[var(--panel)] px-4 py-3 text-[var(--ink)]"
          >
            {block.text}
          </blockquote>
        );
      })}
    </div>
  );
}
