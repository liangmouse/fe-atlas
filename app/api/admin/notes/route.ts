import { NextRequest, NextResponse } from "next/server";

import { noteFormSchema } from "@/lib/admin-schemas";
import { requireAdminFromRequest } from "@/lib/auth/require-admin";
import { logAdminAction, logServerError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("admin_notes")
      .select("id,title,digest,tags,content,is_published,created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notes = (data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      digest: item.digest,
      tags: item.tags ?? [],
      content: item.content ?? "",
      isPublished: item.is_published,
      createdAt: item.created_at,
    }));

    return NextResponse.json({ notes });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: "admin:notes:write",
    ipLike: request.headers.get("x-forwarded-for"),
    limit: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many requests, please retry later" },
      { status: 429 },
    );
  }

  const rawBody = await request.json();
  const parsed = noteFormSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const body = parsed.data;

  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("admin_notes").insert({
      title: body.title,
      digest: body.digest,
      tags: body.tags,
      content: body.content || null,
      is_published: body.isPublished,
      created_by: auth.user.id,
      created_by_email: auth.user.email ?? null,
    });

    if (error) {
      logServerError("admin.notes.create", error, { adminUserId: auth.user.id });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logAdminAction("note.created", {
      adminUserId: auth.user.id,
      adminEmail: auth.user.email,
      title: body.title,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerError("admin.notes.create", error, { adminUserId: auth.user.id });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
