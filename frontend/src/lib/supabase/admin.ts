import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (service role).
 * NEVER import this from a client component — the secret key
 * must not leak into the browser bundle.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const client = getSupabaseAdminSafe();
  if (!client) {
    throw new Error(
      "Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY)"
    );
  }
  return client;
}

/**
 * Varian yang mengembalikan null (bukan melempar) ketika env belum diset.
 * Dipakai di jalur yang dilihat pengguna akhir, agar mereka mendapat pesan
 * ramah 503 alih-alih halaman error 500.
 */
export function getSupabaseAdminSafe(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) return null;

  return createClient(url, secretKey, {
    auth: { persistSession: false },
  });
}
