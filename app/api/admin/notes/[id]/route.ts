import { NextRequest, NextResponse } from "next/server";

import { notePatchSchema } from "@/lib/admin-schemas";
import { requireAdminFromRequest } from "@/lib/auth/require-admin";
import { logAdminAction, logServerError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

function parseId(id: string) {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const noteId = parseId(id);
  if (!noteId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const rawBody = await request.json();
  const parsed = notePatchSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const body = parsed.data;
  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.digest !== undefined) patch.digest = body.digest;
    if (body.tags !== undefined) patch.tags = body.tags;
    if (body.content !== undefined) patch.content = body.content || null;
    if (body.isPublished !== undefined) patch.is_published = body.isPublished;

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("admin_notes")
      .update(patch)
      .eq("id", noteId);

    if (error) {
      logServerError("admin.notes.patch", error, {
        adminUserId: auth.user.id,
        noteId,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logAdminAction("note.updated", {
      adminUserId: auth.user.id,
      adminEmail: auth.user.email,
      noteId,
      fields: Object.keys(patch),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerError("admin.notes.patch", error, {
      adminUserId: auth.user.id,
      noteId,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const noteId = parseId(id);
  if (!noteId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("admin_notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      logServerError("admin.notes.delete", error, {
        adminUserId: auth.user.id,
        noteId,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logAdminAction("note.deleted", {
      adminUserId: auth.user.id,
      adminEmail: auth.user.email,
      noteId,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerError("admin.notes.delete", error, {
      adminUserId: auth.user.id,
      noteId,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
