import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";

/** POST /api/forms — buat form baru (wajib login) */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  let body: { title?: string; description?: string; components?: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title wajib diisi" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("forms")
    .insert({
      // owner_id WAJIB — tanpa ini form jadi yatim dan tidak muncul di dashboard.
      owner_id: user.id,
      title: body.title.slice(0, 200),
      description: (body.description ?? "").slice(0, 1000),
      schema: { components: Array.isArray(body.components) ? body.components : [] },
    })
    .select("id, title, description, schema, status, created_at")
    .single();

  if (error) {
    console.error("[POST /api/forms]", error.message);
    return NextResponse.json({ error: "Gagal menyimpan form" }, { status: 500 });
  }

  return NextResponse.json(
    { ...data, components: data.schema.components },
    { status: 201 }
  );
}

/** GET /api/forms — daftar form milik user (admin melihat semua) */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const query = supabase
    .from("forms")
    .select(
      "id, slug, title, description, status, submission_count, created_at, updated_at"
    )
    .order("updated_at", { ascending: false });

  const { data, error } =
    user.role === "admin" ? await query : await query.eq("owner_id", user.id);

  if (error) {
    console.error("[GET /api/forms]", error.message);
    return NextResponse.json({ error: "Gagal mengambil daftar form" }, { status: 500 });
  }

  return NextResponse.json(data);
}
