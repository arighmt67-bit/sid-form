import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Penjaga server-side untuk /builder.
 *
 * Halaman builder adalah client component sehingga tidak bisa memeriksa
 * auth sendiri, dan karena ter-prerender statis, proxy tidak selalu
 * menyaringnya. Layout ini memaksa pengecekan di server.
 */
export default async function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/builder");

  return <>{children}</>;
}
