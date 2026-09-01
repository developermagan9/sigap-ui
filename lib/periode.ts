import "server-only";

import { cookies } from "next/headers";
import { ApiClient, type PeriodeProgram } from "@/lib/api";
import { PERIODE_AKTIF_ID } from "@/lib/constants";

/** Nama cookie penyimpan periode yang sedang dipilih user. */
export const COOKIE_PERIODE = "sigap_periode";

/**
 * Periode program yang sedang aktif untuk sesi ini.
 *
 * Sebelumnya semua halaman admin/petugas tanpa `[id]` di URL memakai satu
 * konstanta `PERIODE_AKTIF_ID` yang di-hardcode, sehingga sistem tidak bisa
 * berpindah periode tanpa mengubah kode. Sekarang pilihannya disimpan di cookie
 * — dibaca server component mana pun tanpa prop-drilling, dan tidak ikut ke URL
 * sehingga tautan yang dibagikan tidak diam-diam membawa periode orang lain.
 *
 * Urutan penentuan:
 *   1. cookie `sigap_periode`, kalau id-nya masih ada di daftar periode;
 *   2. periode terbaru dari `GET /periode-program`;
 *   3. `PERIODE_AKTIF_ID` (periode bawaan seed) sebagai jaring pengaman terakhir,
 *      dipakai kalau API tidak bisa dihubungi.
 */
export async function getPeriodeAktif(token?: string): Promise<{
  id: string;
  daftar: PeriodeProgram[];
}> {
  const dipilih = (await cookies()).get(COOKIE_PERIODE)?.value;

  let daftar: PeriodeProgram[] = [];
  try {
    daftar = await ApiClient.periode.getAll(token);
  } catch {
    // API belum siap / token kedaluwarsa: jangan gagalkan seluruh halaman hanya
    // karena pemilih periode — pakai konstanta lama dan biarkan pemanggil yang
    // menangani error fetch data utamanya.
    return { id: dipilih || PERIODE_AKTIF_ID, daftar: [] };
  }

  if (dipilih && daftar.some((p) => p.id === dipilih)) return { id: dipilih, daftar };
  return { id: daftar[0]?.id ?? PERIODE_AKTIF_ID, daftar };
}

/** Versi ringkas untuk halaman yang cuma butuh id periodenya. */
export async function getPeriodeAktifId(token?: string): Promise<string> {
  return (await getPeriodeAktif(token)).id;
}
