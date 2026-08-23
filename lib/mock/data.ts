/**
 * Pipeline lengkap: data sintetis -> K-Means -> TOPSIS -> alokasi -> pencairan.
 * Semua angka yang tampil di UI berasal dari sini, bukan konstanta karangan.
 */

import { kmeans, labelByIncome, standardize, elbow, LABEL_KERENTANAN, mulberry32 } from "@/lib/algo/kmeans";
import { topsis, type KriteriaSpec } from "@/lib/algo/topsis";
import { alokasiFlat, periksaInvarian, type KandidatAlokasi } from "@/lib/algo/alokasi";
import { generateRumahTangga, mockHash, WILAYAH, type RumahTangga } from "@/lib/mock/generate";

export const PROGRAM = {
  id: 12,
  nama: "BLT Desa — Kecamatan Sukamaju",
  periode: "Agustus 2026",
  anggaranTotal: 92_750_000,
  biayaOperasional: 0,
  nominalDasar: 500_000,
  skemaAlokasi: "flat" as const,
  kCluster: 4,
  jaringan: "Polygon Amoy",
  registry: "0x7a1c9F4b2E8d3A5c6B0f1D8e4C2a9B7d3E5f0A16",
  disbursement: "0xC4e2B9a7D1f83605Ae4C7b2F9d0E13a86B5c4D27",
  explorer: "https://amoy.polygonscan.com",
};

export const KRITERIA: KriteriaSpec[] = [
  { key: "pendapatanPerKapita", label: "Pendapatan per kapita", benefit: false, unit: "rupiah" },
  { key: "jumlahTanggungan", label: "Jumlah tanggungan", benefit: true, unit: "orang" },
  { key: "jumlahDisabilitasLansia", label: "Disabilitas / lansia", benefit: true, unit: "orang" },
  { key: "skorKondisiRumah", label: "Kondisi rumah", benefit: false, unit: "skor" },
];

export const BOBOT_DEFAULT: Record<string, number> = {
  pendapatanPerKapita: 0.35,
  jumlahTanggungan: 0.25,
  jumlahDisabilitasLansia: 0.2,
  skorKondisiRumah: 0.2,
};

export type Peserta = RumahTangga & {
  cluster: number;
  peringkatCluster: number;
  labelCluster: string;
};

export type BarisRanking = KandidatAlokasi & {
  peserta: Peserta;
  rank: number;
  breakdown: Record<string, { nilaiAsli: number; terbobot: number; kontribusi: number; kesenjangan: number }>;
  dPlus: number;
  dMinus: number;
};

export type StatusKlaim = "claimed" | "pending";

export type Pencairan = {
  ref: string;
  desa: string;
  amount: number;
  status: StatusKlaim;
  txHash: string | null;
  leafHash: string;
  wallet: string;
  jenisWallet: "mandiri" | "custodial";
  submitter: "penerima" | "relayer";
  waktu: string | null;
};

function bangunDataset() {
  const semua = generateRumahTangga(480);
  const verified = semua.filter((r) => r.statusVerifikasi === "verified");

  // ---- Tahap 2: K-Means pada fitur terstandardisasi ----
  const fitur = verified.map((r) => [
    r.pendapatanPerKapita,
    r.jumlahTanggungan,
    r.jumlahDisabilitasLansia,
    r.skorKondisiRumah,
  ]);
  const { z, mean, std } = standardize(fitur);
  const km = kmeans(z, PROGRAM.kCluster, 42);
  const peringkat = labelByIncome(km.centroids, 0);

  const peserta: Peserta[] = verified.map((r, i) => ({
    ...r,
    cluster: km.assign[i],
    peringkatCluster: peringkat[km.assign[i]],
    labelCluster: LABEL_KERENTANAN[peringkat[km.assign[i]]],
  }));

  const clusters = km.centroids.map((c, idx) => {
    const anggota = peserta.filter((p) => p.cluster === idx);
    return {
      index: idx,
      peringkat: peringkat[idx],
      label: LABEL_KERENTANAN[peringkat[idx]],
      jumlahAnggota: anggota.length,
      // centroid dikembalikan ke satuan asli agar bisa dibaca Dinas Sosial
      centroid: {
        pendapatanPerKapita: Math.round(c[0] * std[0] + mean[0]),
        jumlahTanggungan: +(c[1] * std[1] + mean[1]).toFixed(2),
        jumlahDisabilitasLansia: +(c[2] * std[2] + mean[2]).toFixed(2),
        skorKondisiRumah: +(c[3] * std[3] + mean[3]).toFixed(2),
      },
      // seberapa cocok cluster hasil algoritma dengan segmen generator
      kecocokanSegmen:
        anggota.length === 0
          ? 0
          : anggota.filter((a) => a.segmenAsli === peringkat[idx]).length / anggota.length,
    };
  }).sort((a, b) => a.peringkat - b.peringkat);

  return { semua, verified, peserta, clusters, km, z, mean, std };
}

const DS = bangunDataset();

/** Jalankan TOPSIS per cluster prioritas — bisa dipanggil ulang dari UI what-if. */
export function hitungRanking(bobot: Record<string, number>, clusterPrioritas = [0, 1]): BarisRanking[] {
  const hasil: BarisRanking[] = [];

  for (const peringkat of clusterPrioritas) {
    const anggota = DS.peserta.filter((p) => p.peringkatCluster === peringkat);
    if (anggota.length === 0) continue;

    const matrix = anggota.map((a) => KRITERIA.map((k) => (a as unknown as Record<string, number>)[k.key]));
    const skor = topsis(matrix, KRITERIA, bobot);

    anggota.forEach((a, i) => {
      hasil.push({
        id: a.id,
        nikKkHash: a.nikKkHash,
        peringkatCluster: a.peringkatCluster,
        labelCluster: a.labelCluster,
        skor: skor[i].skor,
        pendapatanPerKapita: a.pendapatanPerKapita,
        jumlahTanggungan: a.jumlahTanggungan,
        peserta: a,
        rank: 0,
        breakdown: skor[i].breakdown,
        dPlus: skor[i].dPlus,
        dMinus: skor[i].dMinus,
      });
    });
  }

  return hasil;
}

export function hitungAlokasi(bobot: Record<string, number> = BOBOT_DEFAULT) {
  const ranking = hitungRanking(bobot);
  const hasil = alokasiFlat(ranking, PROGRAM.anggaranTotal, PROGRAM.nominalDasar, PROGRAM.biayaOperasional);
  hasil.urutan.forEach((r, i) => { (r as BarisRanking).rank = i + 1; });

  const wallets = new Map(hasil.urutan.map((r) => [r.id, (r as BarisRanking).peserta.wallet]));
  const invarian = periksaInvarian(hasil, wallets);

  return { ranking: hasil.urutan as BarisRanking[], hasil, invarian };
}

const ALOKASI_DEFAULT = hitungAlokasi(BOBOT_DEFAULT);

/** Status pencairan on-chain — sebagian sudah diklaim, sebagian menunggu. */
function bangunPencairan(): Pencairan[] {
  const rnd = mulberry32(7);
  const penerima = ALOKASI_DEFAULT.ranking.filter((r) => ALOKASI_DEFAULT.hasil.terpilih.has(r.id));
  const mulai = Date.parse("2026-08-14T08:05:00Z");

  return penerima.map((r, i) => {
    const sudah = rnd() < 0.63;
    const p = r.peserta;
    return {
      ref: p.ref,
      desa: p.desa,
      amount: ALOKASI_DEFAULT.hasil.amount.get(r.id) ?? 0,
      status: sudah ? "claimed" : "pending",
      txHash: sudah ? mockHash(`tx:${p.id}`) : null,
      leafHash: mockHash(`leaf:${p.id}`),
      wallet: p.wallet,
      jenisWallet: p.jenisWallet,
      submitter: p.jenisWallet === "custodial" ? "relayer" : "penerima",
      waktu: sudah ? new Date(mulai + i * 1_140_000 + Math.floor(rnd() * 900_000)).toISOString() : null,
    };
  });
}

const PENCAIRAN = bangunPencairan();

export const dataset = {
  semua: DS.semua,
  peserta: DS.peserta,
  clusters: DS.clusters,
  km: { sse: DS.km.sse, iterations: DS.km.iterations },
  elbow: elbow(DS.z, 8),
  scatter: DS.peserta.map((p) => ({
    x: p.pendapatanPerKapita,
    y: p.jumlahTanggungan,
    peringkat: p.peringkatCluster,
    ref: p.ref,
  })),
  ranking: ALOKASI_DEFAULT.ranking,
  alokasi: ALOKASI_DEFAULT.hasil,
  invarian: ALOKASI_DEFAULT.invarian,
  pencairan: PENCAIRAN,
  merkleRoot: mockHash(`root:${PROGRAM.id}:${ALOKASI_DEFAULT.hasil.kuotaPenerima}`),
  txRegister: mockHash(`register:${PROGRAM.id}`),
};

export const ringkasanPublik = (() => {
  const claimed = PENCAIRAN.filter((p) => p.status === "claimed");
  const perWilayah = WILAYAH.map((desa) => {
    const rows = PENCAIRAN.filter((p) => p.desa === desa);
    const c = rows.filter((p) => p.status === "claimed");
    return {
      desa,
      jumlahPenerima: rows.length,
      totalDana: rows.reduce((s, p) => s + p.amount, 0),
      tersalur: c.reduce((s, p) => s + p.amount, 0),
      klaim: rows.length ? c.length / rows.length : 0,
    };
  }).sort((a, b) => b.jumlahPenerima - a.jumlahPenerima);

  return {
    totalAnggaran: PROGRAM.anggaranTotal,
    totalAlokasi: dataset.alokasi.totalAlokasi,
    totalTersalur: claimed.reduce((s, p) => s + p.amount, 0),
    sisaAnggaran: dataset.alokasi.sisaAnggaran,
    jumlahPenerima: dataset.alokasi.kuotaPenerima,
    jumlahTerklaim: claimed.length,
    jumlahDidata: DS.semua.length,
    jumlahTerverifikasi: DS.peserta.length,
    perWilayah,
    transaksiTerbaru: [...claimed]
      .sort((a, b) => (b.waktu ?? "").localeCompare(a.waktu ?? ""))
      .slice(0, 8),
  };
})();
