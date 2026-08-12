import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const BLOG_ADMIN_COOKIE = "sph_blog_admin";
const MAX_AGE_SEC = 60 * 60 * 24 * 14; // 14 giorni

function adminPassword() {
  return process.env.BLOG_ADMIN_PASSWORD?.trim() || "";
}

function adminSecret() {
  return (
    process.env.BLOG_ADMIN_SECRET?.trim() ||
    adminPassword() ||
    "sidepitchhub-blog-dev"
  );
}

export function isBlogAdminConfigured() {
  return Boolean(adminPassword());
}

function sign(payload: string): string {
  return createHmac("sha256", adminSecret()).update(payload).digest("base64url");
}

export function createAdminSessionToken(): string {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function checkAdminPassword(password: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isBlogAdminRequest(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(BLOG_ADMIN_COOKIE)?.value);
}

export function adminCookieOptions(token: string) {
  return {
    name: BLOG_ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}
