# SID Form — Resume Note

**Terakhir:** Phase 1+2 selesai ditulis, diamankan, diaudit lebih lanjut, dan dioptimasi. Commit terakhir `c88715a`.

## Status
- `c0c6572` — feat: auth allowlist + /f/[slug] + submit + dashboard
- `eff6ec9` — fix(security): owner_id hilang, API tanpa auth, /builder bocor, 500→401/503
- `c88715a` — fix(security, ux): audit celah ownership, sinkronisasi cookie auth, UX builder & CSV CRLF

Terverifikasi: `npm run build` exit 0, 12/12 tes validator, 14/14 tes HTTP (jalur "ditolak").
**Belum pernah tereksekusi:** semua jalur DB (login Google, insert, publish, submit).

## Audit & Perbaikan Tambahan (c88715a):
1. **Ownership di `DELETE /api/forms/[id]/publish`:** Sebelumnya siapa pun yang login bisa menutup form siapa pun lewat API ini. Sekarang diproteksi ketat.
2. **Form Yatim (`owner_id = null`):** Sebelumnya jika owner form terhapus (set null), pengecekan ownership di bypass. Sekarang diproteksi sehingga hanya admin yang boleh mengedit/melihat datanya.
3. **Cookie Sinkronisasi:** `auth/callback` dan `proxy.ts` sekarang menyalin cookie signOut/token refresh dari hasil mutasi Supabase client ke redirect response asli agar sinkronisasi cookie di browser client bersih dan tidak menggantung.
4. **UX Builder:** Ditambahkan class `group` pada div list properties agar tombol delete `✕` muncul saat di-hover.
5. **CSV Delimiter:** Menggunakan CRLF (`\r\n`) pemisah baris untuk kompatibilitas yang jauh lebih baik dengan MS Excel di Windows/macOS.

## BLOCKER (satu-satunya)
Butuh 3 env var Supabase dari user:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY`

Supabase lama (`usigbjijwycygiaavqys.supabase.co`) sudah NXDOMAIN → harus project baru.

## Langkah user sebelum lanjut
1. Project Supabase baru → SQL Editor → jalankan `001_init.sql` lalu `002_publish_and_slug.sql`
2. Auth → Providers → Google: aktifkan + redirect `https://sid-form.vercel.app/auth/callback`
   dan `http://localhost:3000/auth/callback`
3. Set 3 env var yang sama di **Vercel** (kalau kosong, deploy gagal lagi — ini sebab
   `/api/forms` 404 sebelumnya: commit Phase 0 tidak pernah ter-deploy)

## Begitu kredensial masuk — urutan tes
1. **Risiko tertinggi duluan:** `owner_id` nyambung ke tabel `users` (custom) atau
   `auth.users` (bawaan Supabase)? Kalau ketuker → publish gagal foreign key.
2. Login Google → cek allowlist nolak domain luar (`sekolahmu.net` HARUS ditolak,
   `sekolahmu.co.id` lolos)
3. Bikin form → Publish → dapat link
4. Incognito → `/f/[slug]` → isi → submit
5. Jawaban muncul di dashboard + unduh CSV
