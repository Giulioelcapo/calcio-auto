import { promises as fs } from "fs";
import path from "path";
import {
  BLOG_POSTS,
  type BlogBlock,
  type BlogCategory,
  type BlogPost,
} from "@/lib/blog";
import { isRedisConfigured, redisCommand } from "@/lib/redis-rest";

/** Un solo chiave JSON (GET/SET) — come i poll: i token Upstash free spesso non permettono HASH. */
const REDIS_KEY = "sidepitchhub:blog:posts-map";
const LOCAL_FILE = path.join(process.cwd(), "data", "blog-posts.json");

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ensureSlug(title: string, slug?: string): string {
  const s = (slug || title).trim();
  return slugify(s) || `articolo-${Date.now()}`;
}

/** Testo semplice → blocchi (scrivi online senza JSON). */
export function parseBodyFromText(raw: string): BlogBlock[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: BlogBlock[] = [];
  let para: string[] = [];
  let list: string[] = [];

  function flushPara() {
    const text = para.join(" ").trim();
    if (text) blocks.push({ type: "p", text });
    para = [];
  }
  function flushList() {
    if (list.length) blocks.push({ type: "ul", items: list });
    list = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushPara();
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      flushPara();
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushList();
      flushPara();
      blocks.push({ type: "h2", text: trimmed.slice(2).trim() });
      continue;
    }
    if (trimmed.startsWith("> ")) {
      flushList();
      flushPara();
      blocks.push({ type: "quote", text: trimmed.slice(2).trim() });
      continue;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushPara();
      list.push(trimmed.slice(2).trim());
      continue;
    }
    flushList();
    para.push(trimmed);
  }
  flushList();
  flushPara();

  if (!blocks.length && raw.trim()) {
    blocks.push({ type: "p", text: raw.trim() });
  }
  return blocks;
}

export function serializeBodyToText(body: BlogBlock[]): string {
  const parts: string[] = [];
  for (const block of body) {
    if (block.type === "p") parts.push(block.text);
    else if (block.type === "h2") parts.push(`## ${block.text}`);
    else if (block.type === "quote") parts.push(`> ${block.text}`);
    else if (block.type === "ul") {
      parts.push(block.items.map((i) => `- ${i}`).join("\n"));
    }
    parts.push("");
  }
  return `${parts.join("\n").trim()}\n`;
}

function isCategory(v: unknown): v is BlogCategory {
  return (
    v === "analisi" ||
    v === "performance" ||
    v === "osservatori" ||
    v === "guida"
  );
}

export function normalizePost(
  input: Partial<BlogPost> & { title: string },
): BlogPost {
  const slug = ensureSlug(input.title, input.slug);
  const body = Array.isArray(input.body) ? input.body : [];
  return {
    slug,
    title: input.title.trim(),
    description: (input.description || input.title).trim(),
    date: input.date || new Date().toISOString().slice(0, 10),
    updated: input.updated,
    author: (input.author || "Giulio · Side Pitch Hub").trim(),
    category: isCategory(input.category) ? input.category : "analisi",
    tags: Array.isArray(input.tags)
      ? input.tags.map((t) => String(t).trim()).filter(Boolean)
      : [],
    draft: Boolean(input.draft),
    body,
  };
}

async function readLocalStore(): Promise<Record<string, BlogPost>> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    const data = JSON.parse(raw) as Record<string, BlogPost>;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

async function writeLocalStore(map: Record<string, BlogPost>) {
  if (process.env.VERCEL) {
    throw new Error(
      "Su Vercel serve Upstash Redis (UPSTASH_REDIS_REST_URL / TOKEN).",
    );
  }
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(map, null, 2), "utf8");
}

async function readRedisStore(): Promise<Record<string, BlogPost>> {
  const raw = await redisCommand(["GET", REDIS_KEY]);
  if (typeof raw !== "string" || !raw) return {};
  try {
    const data = JSON.parse(raw) as Record<string, BlogPost>;
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

async function writeRedisStore(map: Record<string, BlogPost>) {
  await redisCommand(["SET", REDIS_KEY, JSON.stringify(map)]);
}

async function readDynamicStore(): Promise<Record<string, BlogPost>> {
  if (isRedisConfigured()) {
    try {
      return await readRedisStore();
    } catch (err) {
      if (process.env.VERCEL) throw err;
      return readLocalStore();
    }
  }
  return readLocalStore();
}

export function blogStorageMode(): "redis" | "local-file" {
  return isRedisConfigured() ? "redis" : "local-file";
}

/** Statici + dinamici (dinamici vincono sullo stesso slug). */
export async function listAllBlogPosts(opts?: {
  includeDrafts?: boolean;
}): Promise<BlogPost[]> {
  const dynamic = await readDynamicStore();
  const bySlug = new Map<string, BlogPost>();
  for (const post of BLOG_POSTS) bySlug.set(post.slug, post);
  for (const post of Object.values(dynamic)) bySlug.set(post.slug, post);

  let posts = [...bySlug.values()];
  if (!opts?.includeDrafts) {
    posts = posts.filter((p) => !p.draft);
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export async function getBlogPostBySlug(
  slug: string,
  opts?: { includeDrafts?: boolean },
): Promise<BlogPost | undefined> {
  const posts = await listAllBlogPosts({
    includeDrafts: opts?.includeDrafts,
  });
  return posts.find((p) => p.slug === slug);
}

export async function saveBlogPost(post: BlogPost): Promise<BlogPost> {
  const normalized = normalizePost({
    ...post,
    updated: new Date().toISOString().slice(0, 10),
  });

  if (isRedisConfigured()) {
    const map = await readRedisStore();
    map[normalized.slug] = normalized;
    await writeRedisStore(map);
    return normalized;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Redis non configurato su Vercel: aggiungi UPSTASH_REDIS_REST_URL e TOKEN.",
    );
  }

  const map = await readLocalStore();
  map[normalized.slug] = normalized;
  await writeLocalStore(map);
  return normalized;
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  if (isRedisConfigured()) {
    const map = await readRedisStore();
    if (!(slug in map)) return false;
    delete map[slug];
    await writeRedisStore(map);
    return true;
  }
  if (process.env.VERCEL) {
    throw new Error("Redis non configurato su Vercel.");
  }
  const map = await readLocalStore();
  if (!(slug in map)) return false;
  delete map[slug];
  await writeLocalStore(map);
  return true;
}
