import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (service role).
 * NEVER import this from a client component — the secret key
 * must not leak into the browser bundle.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY)"
    );
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false },
  });
}
