/** UUID periode program yang dipakai demo ini (dibuat oleh `sigap-api/prisma/seed.ts`).
 *  Sistem belum punya UI pemilih periode — semua halaman admin/petugas yang tidak
 *  membawa `[id]` di URL-nya (verifikasi, clustering, ranking, bobot, approval,
 *  on-chain) beroperasi pada satu periode aktif ini. Ganti nilainya kalau seed
 *  diubah, atau kembangkan jadi UI pemilih periode di kemudian hari. */
export const PERIODE_AKTIF_ID = "a1234567-89ab-4def-8123-456789abcdef";
