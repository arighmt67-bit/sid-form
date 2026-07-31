"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ALLOWED_DOMAINS_LABEL } from "@/lib/auth/allowlist";

function errorMessage(code: string | null, email: string | null): string | null {
  switch (code) {
    case "domain_not_allowed":
      return `Email ${email ?? ""} tidak diizinkan. Gunakan akun organisasi (${ALLOWED_DOMAINS_LABEL}).`;
    case "exchange_failed":
      return "Login gagal diproses. Coba lagi.";
    case "missing_code":
      return "Kode otorisasi hilang. Ulangi login.";
    default:
      return code ? "Terjadi kesalahan saat login." : null;
  }
}

function LoginInner() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const next = params.get("next") ?? "/dashboard";
  const errMsg = errorMessage(params.get("error"), params.get("email"));

  const signIn = async () => {
    setLoading(true);
    const supabase = getSupabaseBrowser();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next
    )}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "select_account" },
      },
    });
    if (error) {
      setLoading(false);
      alert("Gagal memulai login Google: " + error.message);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FDCE1B] to-[#FFE98F] text-white font-bold text-xl shadow-sm shadow-accent/20">
          SF
        </div>
        <h1 className="font-display text-2xl tracking-tight text-foreground">
          Masuk ke SID<span className="gradient-text">Form</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Khusus karyawan. Gunakan akun Google organisasi kamu.
        </p>

        {errMsg && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {errMsg}
          </div>
        )}

        <Button
          onClick={signIn}
          disabled={loading}
          size="lg"
          variant="outline"
          className="mt-6 w-full"
        >
          {loading ? "Mengalihkan…" : "Lanjut dengan Google"}
        </Button>

        <p className="mt-5 text-xs text-muted-foreground/70">
          Domain yang diizinkan: {ALLOWED_DOMAINS_LABEL}
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
