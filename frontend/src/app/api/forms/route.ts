import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** POST /api/forms — create a form */
export async function POST(req: NextRequest) {
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
    .insert({
      title: body.title.slice(0, 200),
      description: (body.description ?? "").slice(0, 1000),
      schema: { components: Array.isArray(body.components) ? body.components : [] },
    })
    .select("id, title, description, schema, status, created_at")
    .single();

  if (error) {
    console.error("[POST /api/forms]", error.message);
    return NextResponse.json({ error: "Failed to save form" }, { status: 500 });
  }

  return NextResponse.json(
    { ...data, components: data.schema.components },
    { status: 201 }
  );
}

/** GET /api/forms — list forms (dashboard, Phase 3) */
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("forms")
    .select("id, title, description, status, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[GET /api/forms]", error.message);
    return NextResponse.json({ error: "Failed to list forms" }, { status: 500 });
  }

  return NextResponse.json(data);
}
