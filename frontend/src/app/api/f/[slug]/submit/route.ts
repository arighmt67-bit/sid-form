import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { validateSubmission } from "@/lib/forms/validate";
import type { FormSchema } from "@/lib/forms/types";

/** Hash IP + salt harian — untuk rate limit tanpa menyimpan IP mentah. */
function hashIp(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}|${day}`).digest("hex").slice(0, 32);
}

/**
 * POST /api/f/[slug]/submit — terima jawaban form publik.
 *
 * Aturan yang ditegakkan di server:
 *  - form harus berstatus `published`
 *  - kalau require_login = true, wajib user dari domain allowlist
 *  - semua jawaban divalidasi ulang terhadap schema
 *  - jawaban dicatat bersama schema_version yang berlaku saat itu
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: { data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: form, error } = await supabase
    .from("forms")
    .select("id, title, schema, status, require_login, schema_version")
    .eq("slug", slug)
    .single();

  if (error || !form) {
    return NextResponse.json({ error: "Form tidak ditemukan" }, { status: 404 });
  }

  if (form.status !== "published") {
    return NextResponse.json(
      { error: "Form ini sedang tidak menerima jawaban." },
      { status: 403 }
    );
  }

  // Gerbang login per-form.
  let submittedBy: string | null = null;
  let submitterEmail: string | null = null;

  if (form.require_login) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Form ini hanya untuk karyawan. Silakan login dulu.", needLogin: true },
        { status: 401 }
      );
    }
    submittedBy = user.id;
    submitterEmail = user.email;
  } else {
    const user = await getCurrentUser();
    if (user) {
      submittedBy = user.id;
      submitterEmail = user.email;
    }
  }

  const result = validateSubmission(form.schema as FormSchema, body.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Ada isian yang belum benar.", fields: result.errors },
      { status: 422 }
    );
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("submissions")
    .insert({
      form_id: form.id,
      schema_version: form.schema_version ?? 1,
      data: result.clean,
      submitted_by: submittedBy,
      submitter_email: submitterEmail,
      ip_hash: hashIp(req),
    })
    .select("id, created_at")
    .single();

  if (insertErr || !inserted) {
    console.error("[submit] gagal insert:", insertErr?.message);
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban. Coba lagi." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { id: inserted.id, submitted_at: inserted.created_at, form_title: form.title },
    { status: 201 }
  );
}
