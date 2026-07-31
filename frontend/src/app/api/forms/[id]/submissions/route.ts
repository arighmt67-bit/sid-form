import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { isAnswerable, type FormSchema } from "@/lib/forms/types";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/forms/[id]/submissions — daftar jawaban (khusus pemilik/admin).
 * Query: ?format=csv untuk unduh CSV.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: form, error: formErr } = await supabase
    .from("forms")
    .select("id, title, schema, owner_id")
    .eq("id", id)
    .single();

  if (formErr || !form) {
    return NextResponse.json({ error: "Form tidak ditemukan" }, { status: 404 });
  }

  if (form.owner_id !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Bukan pemilik form ini" }, { status: 403 });
  }

  const { data: rows, error } = await supabase
    .from("submissions")
    .select("id, data, submitter_email, schema_version, created_at")
    .eq("form_id", id)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("[submissions] gagal ambil:", error.message);
    return NextResponse.json({ error: "Gagal mengambil jawaban" }, { status: 500 });
  }

  const components = ((form.schema as FormSchema)?.components ?? []).filter(
    isAnswerable
  );

  if (new URL(req.url).searchParams.get("format") === "csv") {
    const header = ["Waktu", "Email", ...components.map((c) => c.label)];
    const lines = [header.map(csvCell).join(",")];

    for (const r of rows ?? []) {
      const d = (r.data ?? {}) as Record<string, unknown>;
      lines.push(
        [
          new Date(r.created_at).toLocaleString("id-ID"),
          r.submitter_email ?? "",
          ...components.map((c) => stringifyValue(d[c.key])),
        ]
          .map(csvCell)
          .join(",")
      );
    }

    const filename = `${form.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`;
    return new NextResponse("\uFEFF" + lines.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return NextResponse.json({
    form: { id: form.id, title: form.title },
    columns: components.map((c) => ({ key: c.key, label: c.label, type: c.type })),
    submissions: rows ?? [],
    total: rows?.length ?? 0,
  });
}

function stringifyValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join("; ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function csvCell(v: string): string {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
