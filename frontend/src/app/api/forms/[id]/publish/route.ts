import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * POST /api/forms/[id]/publish
 *
 * 1. Menaikkan schema_version
 * 2. Menyimpan SNAPSHOT schema ke form_versions
 * 3. Membuat slug unik (kalau belum ada)
 * 4. Menandai form sebagai published
 *
 * Snapshot penting: submission lama tetap bisa dibaca dengan schema
 * versi saat mereka mengisi, meski form-nya kemudian diubah.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: form, error: fetchErr } = await supabase
    .from("forms")
    .select("id, title, slug, schema, schema_version, owner_id")
    .eq("id", id)
    .single();

  if (fetchErr || !form) {
    return NextResponse.json({ error: "Form tidak ditemukan" }, { status: 404 });
  }

  if (form.owner_id !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Bukan pemilik form ini" }, { status: 403 });
  }

  const components = form.schema?.components ?? [];
  if (!Array.isArray(components) || components.length === 0) {
    return NextResponse.json(
      { error: "Form kosong — tambahkan minimal satu field sebelum publish." },
      { status: 400 }
    );
  }

  const nextVersion = (form.schema_version ?? 1) + 1;

  // Slug unik: base dari judul + suffix acak kalau bentrok.
  let slug = form.slug;
  if (!slug) {
    const base = slugify(form.title) || "form";
    slug = base;
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: clash } = await supabase
        .from("forms")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!clash) break;
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
  }

  const { error: versionErr } = await supabase.from("form_versions").insert({
    form_id: form.id,
    version: nextVersion,
    schema: form.schema,
  });

  if (versionErr) {
    console.error("[publish] gagal simpan versi:", versionErr.message);
    return NextResponse.json(
      { error: "Gagal menyimpan versi schema" },
      { status: 500 }
    );
  }

  const { data: updated, error: updateErr } = await supabase
    .from("forms")
    .update({
      status: "published",
      slug,
      schema_version: nextVersion,
      published_at: new Date().toISOString(),
      owner_id: form.owner_id ?? user.id,
    })
    .eq("id", id)
    .select("id, slug, status, schema_version, published_at")
    .single();

  if (updateErr || !updated) {
    console.error("[publish] gagal update form:", updateErr?.message);
    return NextResponse.json({ error: "Gagal mempublikasikan form" }, { status: 500 });
  }

  return NextResponse.json({ ...updated, url: `/f/${updated.slug}` });
}

/** DELETE /api/forms/[id]/publish — tutup form (berhenti menerima jawaban). */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: form, error: fetchErr } = await supabase
    .from("forms")
    .select("id, owner_id")
    .eq("id", id)
    .single();

  if (fetchErr || !form) {
    return NextResponse.json({ error: "Form tidak ditemukan" }, { status: 404 });
  }

  if (form.owner_id !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Bukan pemilik form ini" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("forms")
    .update({ status: "closed" })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Form tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(data);
}
