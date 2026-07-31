import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedEmail } from "@/lib/auth/allowlist";

/** Rute yang wajib login (creator/admin area). */
const PROTECTED_PREFIXES = ["/dashboard", "/builder"];

export async function proxy(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Kalau env belum diset, jangan bikin seluruh situs mati —
  // biarkan lewat, route handler yang akan melaporkan errornya.
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          req.cookies.set(name, value)
        );
        response = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session token (wajib dipanggil agar cookie tidak kedaluwarsa).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  if (isProtected && (!user || !isAllowedEmail(user.email))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Jalankan di semua rute KECUALI:
     * - _next/static, _next/image, favicon
     * - file statis (svg/png/jpg/dst)
     * - /f/** (halaman isi form publik — auth dicek di level halaman)
     */
    "/((?!_next/static|_next/image|favicon.ico|f/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
