/**
 * Generator data sintetis — menggantikan backend yang belum ada.
 * Distribusi segmen mengikuti 08-Roadmap-Demo-Plan.md §2 (20/30/30/20).
 *
 * PENTING: seluruh NIK/No.KK di sini memakai kode wilayah 99xx yang tidak
 * pernah dipakai Dukcapil, sehingga mustahil bertabrakan dengan identitas
 * orang sungguhan.
 */

import { mulberry32 } from "@/lib/algo/kmeans";

export const WILAYAH = [
  "Sukamaju",
  "Ciparay",
  "Mekarsari",
  "Tanjungrejo",
  "Bojongsari",
  "Karangwangi",
] as const;

export type StatusVerifikasi = "pending" | "verified" | "rejected";

export type RumahTangga = {
  id: string;
  ref: string;              // ID anonim yang boleh tampil publik
  nikKkHash: string;
  noKkHash: string;
  desa: string;
  pendapatanPerKapita: number;
  jumlahTanggungan: number;
  jumlahDisabilitasLansia: number;
  skorKondisiRumah: number;      // 1-5, makin tinggi makin layak
  skorAksesPendidikan: number;   // 1-5
  riwayatBansosSebelumnya: boolean;
  statusVerifikasi: StatusVerifikasi;
  flaggedDuplicate: boolean;
  wallet: string;
  jenisWallet: "mandiri" | "custodial";
  segmenAsli: number;            // ground truth generator, untuk validasi clustering
};

/** Hash mock deterministik — bentuknya menyerupai keccak256 agar UI realistis. */
export function mockHash(input: string, prefix = "0x"): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ input.charCodeAt(i), 0x85ebca6b) >>> 0;
  }
  let out = "";
  let s = h1;
  for (let i = 0; i < 8; i++) {
    s = Math.imul(s ^ (s >>> 13), 0x5bd1e995) >>> 0;
    out += ((s ^ h2) >>> 0).toString(16).padStart(8, "0");
  }
  return prefix + out.slice(0, 64);
}

const SEGMEN = [
  // porsi, rentang pendapatan per kapita, tanggungan, disabilitas/lansia, kondisi rumah, akses pendidikan
  { porsi: 0.20, inc: [240_000, 580_000], tang: [4, 7], dis: [1, 3], rumah: [1, 2], didik: [1, 2] },
  { porsi: 0.30, inc: [640_000, 1_040_000], tang: [2, 5], dis: [0, 2], rumah: [2, 3], didik: [2, 3] },
  { porsi: 0.30, inc: [1_280_000, 1_980_000], tang: [1, 3], dis: [0, 1], rumah: [3, 4], didik: [3, 5] },
  { porsi: 0.20, inc: [2_350_000, 3_800_000], tang: [0, 2], dis: [0, 1], rumah: [4, 5], didik: [4, 5] },
];

export function generateRumahTangga(total = 480, seed = 20260819): RumahTangga[] {
  const rnd = mulberry32(seed);
  const antara = (lo: number, hi: number) => lo + rnd() * (hi - lo);
  const bulat = (lo: number, hi: number) => Math.round(antara(lo, hi));

  const rows: RumahTangga[] = [];
  let seg = 0;
  let sisaSeg = Math.round(SEGMEN[0].porsi * total);

  for (let i = 0; i < total; i++) {
    while (sisaSeg <= 0 && seg < SEGMEN.length - 1) {
      seg += 1;
      sisaSeg = Math.round(SEGMEN[seg].porsi * total);
    }
    sisaSeg -= 1;

    const s = SEGMEN[seg];
    const nik = `99${(1000000000000 + Math.floor(rnd() * 8999999999999)).toString()}`;
    const noKk = `99${(1000000000000 + Math.floor(rnd() * 8999999999999)).toString()}`;
    const ref = `REC-${String(i + 1).padStart(4, "0")}`;

    // 4% data masih menunggu verifikasi, 2% ditolak -> tidak ikut clustering
    const roll = rnd();
    const statusVerifikasi: StatusVerifikasi =
      roll < 0.04 ? "pending" : roll < 0.06 ? "rejected" : "verified";

    rows.push({
      id: `rt-${String(i + 1).padStart(4, "0")}`,
      ref,
      nikKkHash: mockHash(`nik:${nik}`),
      noKkHash: mockHash(`kk:${noKk}`),
      desa: WILAYAH[Math.floor(rnd() * WILAYAH.length)],
      pendapatanPerKapita: Math.round(antara(s.inc[0], s.inc[1]) / 5000) * 5000,
      jumlahTanggungan: bulat(s.tang[0], s.tang[1]),
      jumlahDisabilitasLansia: bulat(s.dis[0], s.dis[1]),
      skorKondisiRumah: bulat(s.rumah[0], s.rumah[1]),
      skorAksesPendidikan: bulat(s.didik[0], s.didik[1]),
      riwayatBansosSebelumnya: rnd() < (seg <= 1 ? 0.42 : 0.12),
      statusVerifikasi,
      // Kemiripan nama+alamat -> ditandai untuk direview, bukan ditolak
      flaggedDuplicate: rnd() < 0.028,
      wallet: mockHash(`w:${nik}`, "0x").slice(0, 42),
      jenisWallet: rnd() < 0.61 ? "custodial" : "mandiri",
      segmenAsli: seg,
    });
  }

  return rows;
}

/** Kasus duplikat yang sengaja disisipkan untuk mendemokan tiap jalur dedup. */
export type KasusDuplikat = {
  ref: string;
  desa: string;
  jenis: "DUPLICATE_NIK" | "DUPLICATE_NO_KK" | "DUPLICATE_NIK_ANGGOTA" | "FUZZY";
  keterangan: string;
  tindakan: "ditolak" | "ditandai";
};

export const KASUS_DUPLIKAT: KasusDuplikat[] = [
  { ref: "IMP-0042", desa: "Ciparay", jenis: "DUPLICATE_NIK", keterangan: "NIK kepala keluarga identik dengan REC-0118", tindakan: "ditolak" },
  { ref: "IMP-0071", desa: "Sukamaju", jenis: "DUPLICATE_NIK", keterangan: "NIK kepala keluarga identik dengan REC-0007", tindakan: "ditolak" },
  { ref: "IMP-0093", desa: "Mekarsari", jenis: "DUPLICATE_NO_KK", keterangan: "No. KK sama dengan REC-0204, kepala keluarga berbeda", tindakan: "ditolak" },
  { ref: "IMP-0110", desa: "Bojongsari", jenis: "DUPLICATE_NIK_ANGGOTA", keterangan: "2 anggota sudah tercatat pada REC-0331 — indikasi pecah KK", tindakan: "ditolak" },
  { ref: "IMP-0128", desa: "Tanjungrejo", jenis: "DUPLICATE_NIK_ANGGOTA", keterangan: "1 anggota sudah tercatat pada REC-0089", tindakan: "ditolak" },
  { ref: "IMP-0155", desa: "Karangwangi", jenis: "FUZZY", keterangan: "Kemiripan nama+alamat 91% dengan REC-0276", tindakan: "ditandai" },
  { ref: "IMP-0161", desa: "Ciparay", jenis: "FUZZY", keterangan: "Kemiripan nama+alamat 88% dengan REC-0412", tindakan: "ditandai" },
];
