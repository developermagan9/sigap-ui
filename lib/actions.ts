"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ApiClient, type ImportCsvResult, type RumahTanggaDetail, type SkemaAlokasi } from "./api";
import { COOKIE_PERIODE } from "./periode";

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sigap_token")?.value;
  if (!token) throw new Error("Sesi tidak ditemukan — silakan masuk kembali.");
  return token;
}

/** Baca `sub` (user id) dari payload JWT tanpa verifikasi ulang — token ini
 *  sudah divalidasi backend tiap request lewat header Authorization; di sini
 *  cuma dipakai untuk mengisi field `approvedBy` di body request. */
function userIdFromToken(token: string): string {
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8"));
  return payload.sub;
}

/**
 * Ambil identitas satu rumah tangga (nama, alamat, NIK, anggota keluarga).
 *
 * Dipanggil hanya saat pengguna benar-benar membuka satu berkas — tiap panggilan
 * meninggalkan entri `LIHAT_PII` di audit log, jadi memuatnya untuk seluruh baris
 * daftar akan membanjiri jejak audit dan membuka PII yang tidak ada yang minta.
 */
export async function getDetailRumahTangga(id: string): Promise<RumahTanggaDetail> {
  const token = await getToken();
  return ApiClient.rumahTangga.getDetail(id, token);
}

export async function verifyRumahTangga(id: string, status: "verified" | "rejected", catatan?: string) {
  const token = await getToken();
  const result = await ApiClient.rumahTangga.verify(id, { status_verifikasi: status, catatan }, token);
  revalidatePath("/admin/verifikasi");
  return result;
}

async function simpanPeriodeAktif(periodeId: string) {
  (await cookies()).set(COOKIE_PERIODE, periodeId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function createRumahTangga(data: Record<string, unknown>) {
  const token = await getToken();
  const result = await ApiClient.rumahTangga.create(data, token);
  // Riwayat/Tugas memfilter periode aktif; tanpa ini data yang baru disimpan ke
  // periode draft tidak muncul di riwayat bila periode aktifnya periode lain.
  await simpanPeriodeAktif(String(data.periode_id));
  revalidatePath("/petugas/tugas");
  revalidatePath("/petugas/riwayat");
  return result;
}

export async function ajukanSanggahan(rumahTanggaId: string, alasan: string, dataBaru: Record<string, unknown>) {
  const token = await getToken();
  const result = await ApiClient.sanggahan.create(rumahTanggaId, { alasan, data_baru: dataBaru }, token);
  revalidatePath("/petugas/riwayat");
  revalidatePath("/admin/sanggahan");
  return result;
}

export async function reviewSanggahan(id: string, status: "diterima" | "ditolak", catatan?: string) {
  const token = await getToken();
  const result = await ApiClient.sanggahan.review(id, { status, catatan }, token);
  revalidatePath("/admin/sanggahan");
  return result;
}

export async function runClustering(periodeId: string, k?: number) {
  const token = await getToken();
  const result = await ApiClient.mining.runClustering(periodeId, { k }, token);
  revalidatePath("/admin/clustering");
  revalidatePath("/admin/clustering/hasil");
  revalidatePath(`/admin/periode/${periodeId}`);
  return result;
}

export async function runTopsisAndAlokasi(
  periodeId: string,
  bobotKriteria: Record<string, number>,
  clusterIndexTarget: number[],
  nominalDasar: number,
  skemaAlokasi: SkemaAlokasi = "flat",
) {
  const token = await getToken();
  await ApiClient.mining.runTopsis(periodeId, { clusterIndexTarget, bobotKriteria }, token);
  // Ketiga skema di 05-Algorithm-Design.md §5.2 bisa dipilih dari UI. Sebelumnya
  // nilai ini dipaku "flat" di sini, sehingga `berjenjang`/`proporsional` yang
  // sudah dihitung & teruji di backend tidak pernah bisa dijangkau operator.
  // Biaya operasional tetap 0 — seluruh pagu disalurkan penuh.
  const alokasi = await ApiClient.mining.runAlokasi(
    periodeId,
    { skemaAlokasi, nominalDasar, biayaOperasional: 0 },
    token,
  );
  const ranking = await ApiClient.mining.getRanking(periodeId, token);
  revalidatePath("/admin/ranking");
  revalidatePath("/admin/bobot");
  revalidatePath(`/admin/periode/${periodeId}`);
  return { alokasi, ranking: ranking.results };
}

export async function finalizeRanking(periodeId: string, catatan: string) {
  const token = await getToken();
  const approvedBy = userIdFromToken(token);
  const result = await ApiClient.mining.finalizeRanking(periodeId, { approvedBy, catatan }, token);
  revalidatePath("/admin/approval");
  revalidatePath("/admin/ranking");
  revalidatePath(`/admin/periode/${periodeId}`);
  return result;
}

export async function buildMerkle(periodeId: string) {
  const token = await getToken();
  const result = await ApiClient.blockchain.buildMerkle(periodeId, token);
  revalidatePath("/admin/on-chain");
  return result;
}

export async function submitOnchain(periodeId: string) {
  const token = await getToken();
  const result = await ApiClient.blockchain.submitOnchain(periodeId, token);
  revalidatePath("/admin/on-chain");
  return result;
}

export async function tambahWilayahPengguna(userId: string, wilayahId: string) {
  const token = await getToken();
  const result = await ApiClient.users.tambahWilayah(userId, wilayahId, token);
  revalidatePath("/admin/pengguna");
  return result;
}

export async function hapusWilayahPengguna(userId: string, wilayahId: string) {
  const token = await getToken();
  const result = await ApiClient.users.hapusWilayah(userId, wilayahId, token);
  revalidatePath("/admin/pengguna");
  return result;
}

export async function danaiKontrak(periodeId: string) {
  const token = await getToken();
  const result = await ApiClient.blockchain.danaiKontrak(periodeId, token);
  revalidatePath("/admin/on-chain");
  return result;
}

/** Ganti periode program yang sedang dilihat (FE-5 / item O).
 *
 *  Disimpan di cookie, bukan query param, supaya kedelapan halaman admin/petugas
 *  yang tidak membawa `[id]` di URL ikut berpindah tanpa prop-drilling — dan
 *  supaya tautan yang dibagikan tidak diam-diam membawa periode milik orang lain.
 *  `revalidatePath("/", "layout")` membuang cache seluruh pohon rute sekaligus,
 *  jadi tidak ada halaman yang tertinggal menampilkan periode lama. */
export async function pilihPeriode(periodeId: string) {
  await simpanPeriodeAktif(periodeId);
  revalidatePath("/", "layout");
}

export async function createPeriode(data: {
  nama_program: string;
  anggaran_total: number;
  biaya_operasional?: number;
  k_cluster?: number;
  bobot_kriteria: Record<string, number>;
  skema_alokasi?: string;
  nominal_dasar?: number;
}) {
  const token = await getToken();
  const periode = await ApiClient.periode.create(data, token);
  // Periode yang baru dibuat langsung jadi periode aktif — kalau tidak, admin
  // harus memilihnya manual dulu sebelum bisa mengisi data ke dalamnya.
  await simpanPeriodeAktif(periode.id);
  revalidatePath("/", "layout");
  return periode;
}

export async function updatePeriode(id: string, data: Record<string, unknown>) {
  const token = await getToken();
  const result = await ApiClient.periode.update(id, data, token);
  revalidatePath("/", "layout");
  return result;
}

/** Satu tingkat referensi wilayah untuk dropdown alamat bertingkat di form
 *  pendataan KK. Dibuat sebagai Server Action supaya token sesi tidak perlu
 *  sampai ke klien. */
export async function daftarWilayahReferensi(induk?: string) {
  const token = await getToken();
  const hasil = await ApiClient.wilayah.referensi(induk, token);
  return hasil.data;
}

/** Cari desa/kelurahan lintas provinsi berikut jalur lengkapnya. */
export async function cariDesaReferensi(q: string) {
  const token = await getToken();
  return ApiClient.wilayah.cariDesa(q, token);
}

/** Unggah CSV massal. Server Action menerima `FormData` langsung dari <form>,
 *  jadi file-nya tidak perlu dibaca ke memori klien dulu. */
export async function importRumahTanggaCsv(formData: FormData): Promise<ImportCsvResult> {
  const token = await getToken();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Pilih file CSV terlebih dahulu.");
  }
  const periodeId = (formData.get("periode_id") as string | null) || undefined;
  const result = await ApiClient.rumahTangga.importCsv(file, periodeId, token);
  if (periodeId && result.sukses > 0) await simpanPeriodeAktif(periodeId);
  revalidatePath("/petugas/tugas");
  revalidatePath("/petugas/riwayat");
  revalidatePath("/admin/verifikasi");
  return result;
}
