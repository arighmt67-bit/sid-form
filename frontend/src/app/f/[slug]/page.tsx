import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { FormRenderer } from "@/components/forms/form-renderer";
import { Button } from "@/components/ui/button";
import type { FormSchema } from "@/lib/forms/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("forms")
      .select("title, description")
      .eq("slug", slug)
      .single();
    if (data) {
      return { title: `${data.title} — SIDForm`, description: data.description };
    }
  } catch {
    /* env belum siap — pakai metadata default */
  }
  return { title: "Form — SIDForm" };
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md text-center">{children}</div>
    </main>
  );
}

export default async function PublicFormPage({ params }: Props) {
  const { slug } = await params;

  let form;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("forms")
      .select("id, title, description, schema, status, require_login")
      .eq("slug", slug)
      .single();
    if (error || !data) notFound();
    form = data;
  } catch {
    return (
      <Shell>
        <h1 className="font-display text-2xl text-foreground">Belum terhubung</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Koneksi database belum dikonfigurasi. Hubungi admin IT.
        </p>
      </Shell>
    );
  }

  if (form.status === "draft") {
    return (
      <Shell>
        <div className="mx-auto mb-4 text-3xl">📝</div>
        <h1 className="font-display text-2xl text-foreground">Belum dipublikasikan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Form ini masih draft dan belum menerima jawaban.
        </p>
      </Shell>
    );
  }

  if (form.status === "closed") {
    return (
      <Shell>
        <div className="mx-auto mb-4 text-3xl">🔒</div>
        <h1 className="font-display text-2xl text-foreground">Form ditutup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <strong>{form.title}</strong> sudah tidak menerima jawaban baru.
        </p>
      </Shell>
    );
  }

  // Gerbang login per-form.
  if (form.require_login) {
    const user = await getCurrentUser();
    if (!user) {
      return (
        <Shell>
          <div className="mx-auto mb-4 text-3xl">🔐</div>
          <h1 className="font-display text-2xl text-foreground">Khusus karyawan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk dengan akun Google organisasi untuk mengisi{" "}
            <strong>{form.title}</strong>.
          </p>
          <Link href={`/login?next=${encodeURIComponent(`/f/${slug}`)}`}>
            <Button size="lg" className="mt-6 w-full">
              Login dengan Google
            </Button>
          </Link>
        </Shell>
      );
    }
  }

  const components = ((form.schema as FormSchema)?.components ?? []).filter(
    (c) => c && typeof c.key === "string"
  );

  return (
    <main className="flex-1">
      <FormRenderer
        slug={slug}
        title={form.title}
        description={form.description ?? ""}
        components={components}
      />
    </main>
  );
}
