import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

/** GET /api/forms/[id] — fetch one form */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("forms")
    .select("id, title, description, schema, status, require_login, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json({ ...data, components: data.schema.components });
}

/** PUT /api/forms/[id] — update a form */
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;

  let body: { title?: string; description?: string; components?: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("forms")
    .update({
      title: body.title.slice(0, 200),
      description: (body.description ?? "").slice(0, 1000),
      schema: { components: Array.isArray(body.components) ? body.components : [] },
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, title, description, schema, status, created_at, updated_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json({ ...data, components: data.schema.components });
}
