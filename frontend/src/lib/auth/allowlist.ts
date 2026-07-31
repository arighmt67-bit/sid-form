/**
 * Domain allowlist — dievaluasi SERVER-SIDE saja.
 * Jangan pernah import ini dari client component untuk keputusan keamanan.
 *
 * Catatan penting: domain email karyawan PT SID adalah `sekolahmu.co.id`
 * (BUKAN `sekolahmu.net` yang dipakai untuk infrastruktur internal).
 */
export const ALLOWED_DOMAINS = [
  "sekolahmu.co.id",
  "ktmsolutions.id",
  "smm.sch.id",
  "uci.id",
] as const;

/** Ambil domain dari alamat email, lowercase. Null kalau formatnya bukan email. */
export function emailDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return null;
  return email.slice(at + 1).toLowerCase().trim();
}

/** True kalau email berasal dari domain organisasi yang diizinkan. */
export function isAllowedEmail(email: string | null | undefined): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  return (ALLOWED_DOMAINS as readonly string[]).includes(domain);
}

export const ALLOWED_DOMAINS_LABEL = ALLOWED_DOMAINS.join(", ");
