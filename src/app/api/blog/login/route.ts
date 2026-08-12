import { NextResponse } from "next/server";
import {
  adminCookieOptions,
  checkAdminPassword,
  createAdminSessionToken,
  isBlogAdminConfigured,
} from "@/lib/blog-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isBlogAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Imposta BLOG_ADMIN_PASSWORD su Vercel (Environment Variables) e ridistribuisci.",
      },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    password?: string;
  } | null;
  const password = body?.password?.trim() ?? "";
  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Password errata" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieOptions(token));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "sph_blog_admin",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
