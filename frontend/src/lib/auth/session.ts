import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAllowedEmail, emailDomain } from "@/lib/auth/allowlist";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: "admin" | "creator";
}

/**
 * Ambil user aktif dari cookie session, validasi terhadap allowlist,
 * lalu sinkronkan (upsert) ke tabel `users`.
 *
 * Mengembalikan null kalau belum login ATAU domainnya tidak diizinkan —
 * jadi pemanggil cukup mengecek null untuk menolak akses.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  // Env belum dikonfigurasi -> perlakukan sebagai "tidak ada user",
  // jangan sampai melempar 500. Pemanggil akan membalas 401 / redirect login.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SECRET_KEY
  ) {
    return null;
  }

  let user;
  try {
    const supabase = await getSupabaseServer();

    // getUser() memverifikasi JWT ke server Supabase (bukan sekadar baca cookie).
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) return null;
    user = data.user;
  } catch (e) {
    console.error("[getCurrentUser] auth gagal:", (e as Error).message);
    return null;
  }

  if (!isAllowedEmail(user.email)) return null;

  const domain = emailDomain(user.email)!;

  try {
    const admin = getSupabaseAdmin();

    const { data, error: upsertError } = await admin
      .from("users")
      .upsert(
        {
          email: user.email!.toLowerCase(),
          email_domain: domain,
          name:
            (user.user_metadata?.full_name as string | undefined) ??
            (user.user_metadata?.name as string | undefined) ??
            null,
          avatar_url:
            (user.user_metadata?.avatar_url as string | undefined) ?? null,
        },
        { onConflict: "email" }
      )
      .select("id, email, name, avatar_url, role")
      .single();

    if (upsertError || !data) {
      console.error("[getCurrentUser] upsert gagal:", upsertError?.message);
      return null;
    }

    return data as AppUser;
  } catch (e) {
    console.error("[getCurrentUser] DB gagal:", (e as Error).message);
    return null;
  }
}

/** Versi ketat: melempar 401-able error kalau tidak ada user. */
export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
