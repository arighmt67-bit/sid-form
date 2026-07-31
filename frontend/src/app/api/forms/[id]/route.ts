import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser, type AppUser } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

/** Pastikan user berhak menyentuh form ini (pemilik atau admin). */
async function assertOwner(id: string, user: AppUser) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("forms")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!data) return { ok: false as const, status: 404, error: "Form tidak ditemukan" };
  if (data.owner_id && data.owner_id !== user.id && user.role !== "admin") {
    return { ok: false as const, status: 403, error: "Bukan pemilik form ini" };
  }
  return { ok: true as const };
}

/** GET /api/forms/[id] — ambil satu form (khusus pemilik/admin) */
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { id } = await params;
  const guard = await assertOwner(id, user);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("forms")
    .select(
      "id, slug, title, description, schema, status, require_login, schema_version, submission_count, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Form tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ ...data, components: data.schema.components });
}

/** PUT /api/forms/[id] — perbarui form (khusus pemilik/admin) */
export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { id } = await params;
  const guard = await assertOwner(id, user);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: {
    title?: string;
    description?: string;
    components?: unknown[];
    require_login?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title wajib diisi" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    title: body.title.slice(0, 200),
    description: (body.description ?? "").slice(0, 1000),
    schema: { components: Array.isArray(body.components) ? body.components : [] },
    updated_at: new Date().toISOString(),
  };
  if (typeof body.require_login === "boolean") {
    patch.require_login = body.require_login;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("forms")
    .update(patch)
    .eq("id", id)
    .select(
      "id, slug, title, description, schema, status, require_login, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Form tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ ...data, components: data.schema.components });
}

/** DELETE /api/forms/[id] — hapus form beserta jawabannya (cascade) */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { id } = await params;
  const guard = await assertOwner(id, user);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("forms").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Gagal menghapus form" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
