import { NextResponse } from "next/server";
import { isBlogAdminRequest, isBlogAdminConfigured } from "@/lib/blog-auth";
import {
  blogStorageMode,
  deleteBlogPost,
  getBlogPostBySlug,
  listAllBlogPosts,
  normalizePost,
  parseBodyFromText,
  saveBlogPost,
} from "@/lib/blog-store";
import type { BlogPost } from "@/lib/blog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const admin = url.searchParams.get("admin") === "1";
    if (admin) {
      if (!(await isBlogAdminRequest())) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
      }
      const posts = await listAllBlogPosts({ includeDrafts: true });
      return NextResponse.json({
        posts,
        storage: blogStorageMode(),
        adminConfigured: isBlogAdminConfigured(),
      });
    }

    const posts = await listAllBlogPosts();
    return NextResponse.json({ posts, storage: blogStorageMode() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore lettura blog";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isBlogAdminRequest())) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
      | (Partial<BlogPost> & {
          title?: string;
          bodyText?: string;
        })
      | null;

    if (!body?.title?.trim()) {
      return NextResponse.json(
        { error: "Titolo obbligatorio" },
        { status: 400 },
      );
    }

    const blocks =
      typeof body.bodyText === "string"
        ? parseBodyFromText(body.bodyText)
        : Array.isArray(body.body)
          ? body.body
          : [];

    if (!blocks.length) {
      return NextResponse.json(
        {
          error:
            "Scrivi almeno un paragrafo nel testo (o un titolo ## / elenco).",
        },
        { status: 400 },
      );
    }

    const existing = body.slug
      ? await getBlogPostBySlug(body.slug, { includeDrafts: true })
      : undefined;

    const post = normalizePost({
      slug: body.slug || existing?.slug,
      title: body.title,
      description: body.description ?? existing?.description,
      date: body.date || existing?.date,
      author: body.author ?? existing?.author,
      category: body.category ?? existing?.category,
      tags: body.tags ?? existing?.tags,
      draft: body.draft ?? existing?.draft,
      body: blocks,
    });

    const saved = await saveBlogPost(post);
    return NextResponse.json({
      ok: true,
      post: saved,
      storage: blogStorageMode(),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Salvataggio fallito (server)";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isBlogAdminRequest())) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug")?.trim();
    if (!slug) {
      return NextResponse.json({ error: "Slug mancante" }, { status: 400 });
    }
    const ok = await deleteBlogPost(slug);
    return NextResponse.json({ ok });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eliminazione fallita";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
