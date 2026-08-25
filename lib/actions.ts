"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ApiClient } from "./api";

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

export async function verifyRumahTangga(id: string, status: "verified" | "rejected", catatan?: string) {
  const token = await getToken();
  const result = await ApiClient.rumahTangga.verify(id, { status_verifikasi: status, catatan }, token);
  revalidatePath("/admin/verifikasi");
  return result;
}

export async function createRumahTangga(data: Record<string, unknown>) {
  const token = await getToken();
  const result = await ApiClient.rumahTangga.create(data, token);
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
  biayaOperasional: number,
  skemaAlokasi: string = "flat",
) {
  const token = await getToken();
  await ApiClient.mining.runTopsis(periodeId, { clusterIndexTarget, bobotKriteria }, token);
  const alokasi = await ApiClient.mining.runAlokasi(
    periodeId,
    { skemaAlokasi, nominalDasar, biayaOperasional },
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
