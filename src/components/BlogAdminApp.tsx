"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { BlogCategory, BlogPost } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/lib/blog";

type AdminPost = BlogPost;

const emptyForm = {
  slug: "",
  title: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  author: "Giulio · Side Pitch Hub",
  category: "analisi" as BlogCategory,
  tags: "",
  draft: false,
  bodyText: "",
};

function postToForm(post: AdminPost) {
  const bodyText = post.body
    .map((b) => {
      if (b.type === "p") return b.text;
      if (b.type === "h2") return `## ${b.text}`;
      if (b.type === "quote") return `> ${b.text}`;
      if (b.type === "ul") return b.items.map((i) => `- ${i}`).join("\n");
      return "";
    })
    .join("\n\n");
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    author: post.author,
    category: post.category,
    tags: post.tags.join(", "),
    draft: Boolean(post.draft),
    bodyText,
  };
}

export function BlogAdminApp() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [storage, setStorage] = useState<string>("");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function loadPosts() {
    const res = await fetch("/api/blog?admin=1", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error || "Errore caricamento");
      return;
    }
    const data = (await res.json()) as {
      posts: AdminPost[];
      storage: string;
    };
    setAuthed(true);
    setPosts(data.posts);
    setStorage(data.storage);
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  function login() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/blog/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error || "Login fallito");
        return;
      }
      setPassword("");
      await loadPosts();
    });
  }

  function logout() {
    startTransition(async () => {
      await fetch("/api/blog/login", { method: "DELETE" });
      setAuthed(false);
      setPosts([]);
      setForm(emptyForm);
    });
  }

  function save() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: form.slug || undefined,
            title: form.title,
            description: form.description,
            date: form.date,
            author: form.author,
            category: form.category,
            tags: form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            draft: form.draft,
            bodyText: form.bodyText,
          }),
        });
        const data = (await res.json().catch(() => null)) as {
          error?: string;
          post?: AdminPost;
        } | null;
        if (!res.ok) {
          setError(
            data?.error ||
              `Salvataggio fallito (HTTP ${res.status}). Rieffettua il login e riprova.`,
          );
          if (res.status === 401) setAuthed(false);
          return;
        }
        setMessage(
          form.draft
            ? "Bozza salvata (non pubblica)."
            : "Articolo salvato e online.",
        );
        if (data?.post) setForm(postToForm(data.post));
        await loadPosts();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Errore di rete durante il salvataggio",
        );
      }
    });
  }

  function remove(slug: string) {
    if (!confirm(`Eliminare “${slug}”?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Eliminazione fallita");
        return;
      }
      if (form.slug === slug) setForm(emptyForm);
      setMessage("Articolo eliminato.");
      await loadPosts();
    });
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="display-font text-3xl font-bold uppercase">
          Admin blog
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Solo tu: inserisci la password admin.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          placeholder="Password"
          className="w-full border border-[var(--line)] bg-black px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
        <button
          type="button"
          onClick={login}
          disabled={pending || !password}
          className="btn-accent px-4 py-2 text-xs uppercase tracking-[0.14em] disabled:opacity-50"
        >
          Entra
        </button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display-font text-3xl font-bold uppercase">
            Scrivi sul blog
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Storage: {storage} ·{" "}
            <Link href="/blog" className="text-[var(--accent)] hover:underline">
              Vedi blog pubblico
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="border border-[var(--line)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] hover:border-[var(--accent)]"
        >
          Esci
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <section className="panel space-y-3 p-4">
          <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Titolo
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full border border-[var(--line)] bg-black px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Slug URL (opzionale)
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="generato-dal-titolo"
              className="mt-1 w-full border border-[var(--line)] bg-black px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Descrizione (Google)
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="mt-1 w-full border border-[var(--line)] bg-black px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Data
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full border border-[var(--line)] bg-black px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Categoria
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as BlogCategory,
                  })
                }
                className="mt-1 w-full border border-[var(--line)] bg-black px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              >
                {Object.entries(BLOG_CATEGORIES).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Autore
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="mt-1 w-full border border-[var(--line)] bg-black px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              />
            </label>
          </div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Tag (virgola)
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="mt-1 w-full border border-[var(--line)] bg-black px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Testo articolo
            <textarea
              value={form.bodyText}
              onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
              rows={16}
              placeholder={
                "Primo paragrafo...\n\n## Titolo sezione\n\nAltro testo...\n\n- punto 1\n- punto 2\n\n> citazione"
              }
              className="mt-1 w-full border border-[var(--line)] bg-black px-3 py-2 font-mono text-sm font-normal normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <p className="text-[11px] text-[var(--muted)]">
            Formato: paragrafi normali · <code>## titolo</code> ·{" "}
            <code>- elenco</code> · <code>&gt; citazione</code>
          </p>
          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              checked={form.draft}
              onChange={(e) => setForm({ ...form, draft: e.target.checked })}
            />
            Salva come bozza (non pubblica)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={pending || !form.title.trim()}
              className="btn-accent px-4 py-2 text-xs uppercase tracking-[0.14em] disabled:opacity-50"
            >
              Salva
            </button>
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="border border-[var(--line)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] hover:border-[var(--accent)]"
            >
              Nuovo
            </button>
          </div>
          {message ? (
            <p className="text-sm text-[var(--accent)]">{message}</p>
          ) : null}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </section>

        <aside className="space-y-3">
          <h2 className="display-font text-lg font-bold uppercase">
            I tuoi articoli
          </h2>
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.slug} className="panel p-3 text-sm">
                <button
                  type="button"
                  className="text-left font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
                  onClick={() => setForm(postToForm(p))}
                >
                  {p.title}
                </button>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  {p.draft ? "Bozza · " : ""}
                  {p.date}
                </p>
                <div className="mt-2 flex gap-2">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]"
                    target="_blank"
                  >
                    Apri
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(p.slug)}
                    className="text-[10px] font-bold uppercase tracking-wide text-red-400"
                  >
                    Elimina
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
