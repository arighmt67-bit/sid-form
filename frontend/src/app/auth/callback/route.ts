import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedEmail } from "@/lib/auth/allowlist";

/**
 * GET /auth/callback — tukar `code` OAuth menjadi session.
 *
 * Di sinilah allowlist ditegakkan: kalau domain email tidak diizinkan,
 * session langsung dibatalkan (signOut) sebelum user masuk ke aplikasi.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email) {
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  // Gerbang allowlist — tolak domain di luar organisasi.
  if (!isAllowedEmail(data.user.email)) {
    await supabase.auth.signOut();
    
    // Gunakan response yang sama agar cookie penghapusan session dari signOut()
    // benar-benar terkirim ke browser, bukan dibuang.
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "domain_not_allowed");
    loginUrl.searchParams.set("email", data.user.email);
    
    response.headers.set("Location", loginUrl.toString());
    return response;
  }

  return response;
}
