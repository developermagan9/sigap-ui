import * as server from "./actions.server";
import type { HasilAksi } from "./hasil-aksi";

/** Kegagalan Server Action, dengan pesan asli dari API. */
export class GalatAksi extends Error {
  constructor(message: string, readonly status?: number, readonly code?: string) {
    super(message);
    this.name = "GalatAksi";
  }
}

/**
 * Server Action mengembalikan `HasilAksi` (lihat `aman()` di `actions.server.ts`).
 * Di sini hasilnya dibuka lagi: sukses mengembalikan datanya, gagal melempar
 * `GalatAksi` dari sisi klien, sehingga `err.message` di komponen berisi pesan
 * asli, bukan teks generik produksi.
 */
function buka<A extends unknown[], T>(fn: (...args: A) => Promise<HasilAksi<T>>) {
  return async (...args: A): Promise<T> => {
    const hasil = await fn(...args);
    if (!hasil.ok) throw new GalatAksi(hasil.pesan, hasil.status, hasil.kode);
    return hasil.data;
  };
}

export const getDetailRumahTangga = buka(server.getDetailRumahTangga);
export const verifyRumahTangga = buka(server.verifyRumahTangga);
export const createRumahTangga = buka(server.createRumahTangga);
export const ajukanSanggahan = buka(server.ajukanSanggahan);
export const reviewSanggahan = buka(server.reviewSanggahan);
export const runClustering = buka(server.runClustering);
export const runTopsisAndAlokasi = buka(server.runTopsisAndAlokasi);
export const finalizeRanking = buka(server.finalizeRanking);
export const batalkanApproval = buka(server.batalkanApproval);
export const buildMerkle = buka(server.buildMerkle);
export const submitOnchain = buka(server.submitOnchain);
export const tambahWilayahPengguna = buka(server.tambahWilayahPengguna);
export const hapusWilayahPengguna = buka(server.hapusWilayahPengguna);
export const buatPengguna = buka(server.buatPengguna);
export const ubahPengguna = buka(server.ubahPengguna);
export const resetPasswordPengguna = buka(server.resetPasswordPengguna);
export const gantiPassword = buka(server.gantiPassword);
export const tandaiNotifikasiDibaca = buka(server.tandaiNotifikasiDibaca);
export const tandaiSemuaNotifikasiDibaca = buka(server.tandaiSemuaNotifikasiDibaca);
export const syncKlaim = buka(server.syncKlaim);
export const setBatasKlaim = buka(server.setBatasKlaim);
export const tarikSisaDana = buka(server.tarikSisaDana);
export const danaiKontrak = buka(server.danaiKontrak);
export const pilihPeriode = buka(server.pilihPeriode);
export const createPeriode = buka(server.createPeriode);
export const hapusPeriode = buka(server.hapusPeriode);
export const updatePeriode = buka(server.updatePeriode);
export const daftarWilayahReferensi = buka(server.daftarWilayahReferensi);
export const cariDesaReferensi = buka(server.cariDesaReferensi);
export const importRumahTanggaCsv = buka(server.importRumahTanggaCsv);
