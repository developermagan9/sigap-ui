/** UUID periode program bawaan yang dibuat `sigap-api/prisma/seed.ts`.
 *
 *  Ini BUKAN lagi "periode aktif" sistem — pemilihan periode sekarang lewat
 *  cookie yang dibaca `lib/periode.ts getPeriodeAktif()`, dan bisa diganti user
 *  lewat pemilih periode di topbar. Konstanta ini tinggal dipakai sebagai jaring
 *  pengaman terakhir kalau `GET /periode-program` tidak bisa dihubungi sama sekali. */
export const PERIODE_FALLBACK_ID = "a1234567-89ab-4def-8123-456789abcdef";

/** Block explorer jaringan yang dipakai — dipakai portal publik untuk menautkan
 *  hash transaksi & alamat kontrak. Default Polygon Amoy sesuai 06-Smart-Contract-Design.md §2. */
export const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_EXPLORER_BASE || "https://amoy.polygonscan.com";

/** Label jaringan untuk ditampilkan ke pengguna. */
export const NAMA_JARINGAN = process.env.NEXT_PUBLIC_CHAIN_NAME || "Polygon Amoy";

/** Username akun super administrator. "Super admin" BUKAN role di database
 *  (enum `UserRole` hanya admin/petugas/verifikator/auditor) — akunnya tetap
 *  `admin` di JWT, dan statusnya hanya dikenali UI lewat username ini: label
 *  "Super Administrator" serta penukar tampilan role saat demo. `ITSUP` adalah
 *  akun bawaan `seed.ts`; `ITSUPPORTSIGAP` adalah nama akun di VPS. */
const USERNAME_SUPERUSER: readonly string[] = ["ITSUP", "ITSUPPORTSIGAP"];

export function isSuperuser(username?: string | null): boolean {
  return !!username && USERNAME_SUPERUSER.includes(username);
}
