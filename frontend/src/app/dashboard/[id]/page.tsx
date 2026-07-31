import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { isAnswerable, type FormSchema } from "@/lib/forms/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function SubmissionsPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/dashboard/${id}`);

  const supabase = getSupabaseAdmin();

  const { data: form, error } = await supabase
    .from("forms")
    .select("id, title, slug, schema, status, owner_id, submission_count")
    .eq("id", id)
    .single();

  if (error || !form) notFound();

  if (form.owner_id && form.owner_id !== user.id && user.role !== "admin") {
    return (
      <>
        <Header />
        <main className="flex-1 mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-2xl text-foreground">Akses ditolak</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kamu bukan pemilik form ini.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const { data: rows } = await supabase
    .from("submissions")
    .select("id, data, submitter_email, created_at")
    .eq("form_id", id)
    .order("created_at", { ascending: false })
    .limit(200);

  const columns = ((form.schema as FormSchema)?.components ?? []).filter(
    isAnswerable
  );
  const submissions = rows ?? [];

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-12">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Kembali
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl tracking-tight text-foreground">
              {form.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {submissions.length} jawaban
              {form.slug && (
                <>
                  {" · "}
                  <span className="font-mono text-xs">/f/{form.slug}</span>
                </>
              )}
            </p>
          </div>
          {submissions.length > 0 && (
            <a href={`/api/forms/${id}/submissions?format=csv`}>
              <Button variant="outline">⬇ Unduh CSV</Button>
            </a>
          )}
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <div className="text-3xl mb-3">📭</div>
            <h2 className="font-medium text-foreground">Belum ada jawaban</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {form.status === "published"
                ? "Bagikan link form untuk mulai menerima jawaban."
                : "Publikasikan form dulu agar bisa diisi."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Email
                  </th>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="px-4 py-3 text-left font-medium whitespace-nowrap"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const d = (s.data ?? {}) as Record<string, unknown>;
                  return (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                        {new Date(s.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        {s.submitter_email ?? "—"}
                      </td>
                      {columns.map((c) => (
                        <td key={c.key} className="px-4 py-3 max-w-xs truncate">
                          {render(d[c.key])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function render(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
