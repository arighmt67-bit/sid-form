import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface FormRow {
  id: string;
  title: string;
  slug: string | null;
  status: "draft" | "published" | "closed";
  submission_count: number | null;
  updated_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  published: "bg-green-500/10 text-green-600 dark:text-green-400",
  draft: "bg-muted text-muted-foreground",
  closed: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  published: "Aktif",
  draft: "Draft",
  closed: "Ditutup",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  let forms: FormRow[] = [];
  let dbError: string | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const query = supabase
      .from("forms")
      .select("id, title, slug, status, submission_count, updated_at")
      .order("updated_at", { ascending: false });

    const { data, error } =
      user.role === "admin" ? await query : await query.eq("owner_id", user.id);

    if (error) dbError = error.message;
    else forms = (data ?? []) as FormRow[];
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Koneksi database gagal";
  }

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl tracking-tight text-foreground">
              Form Saya
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Masuk sebagai {user.email}
              {user.role === "admin" && (
                <span className="ml-2 rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-medium">
                  admin
                </span>
              )}
            </p>
          </div>
          <Link href="/builder">
            <Button>+ Form Baru</Button>
          </Link>
        </div>

        {dbError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            Gagal memuat data: {dbError}
          </div>
        )}

        {!dbError && forms.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <div className="text-3xl mb-3">📋</div>
            <h2 className="font-medium text-foreground">Belum ada form</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Buat form pertama kamu lewat builder.
            </p>
            <Link href="/builder">
              <Button className="mt-5">Mulai Bikin Form</Button>
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {forms.map((f) => (
            <div
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-shadow hover:shadow-md"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-medium text-foreground truncate">{f.title}</h3>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                      STATUS_STYLE[f.status] ?? STATUS_STYLE.draft
                    }`}
                  >
                    {STATUS_LABEL[f.status] ?? f.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {f.submission_count ?? 0} jawaban · diubah{" "}
                  {new Date(f.updated_at).toLocaleDateString("id-ID")}
                  {f.slug && (
                    <>
                      {" · "}
                      <span className="font-mono">/f/{f.slug}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {f.status === "published" && f.slug && (
                  <Link href={`/f/${f.slug}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      Buka
                    </Button>
                  </Link>
                )}
                <Link href={`/dashboard/${f.id}`}>
                  <Button variant="outline" size="sm">
                    Jawaban
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
