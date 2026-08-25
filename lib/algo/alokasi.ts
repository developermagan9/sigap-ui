/**
 * Alokasi anggaran — 05-Algorithm-Design.md §5.
 * Menerjemahkan ranking menjadi nominal per KK, kuota, dan titik cutoff.
 */

export type KandidatAlokasi = {
  id: string;
  nikKkHash: string;
  peringkatCluster: number; // 0 = cluster paling rentan
  labelCluster: string;
  skor: number;
  pendapatanPerKapita: number;
  jumlahTanggungan: number;
};

export type HasilAlokasi<T extends KandidatAlokasi> = {
  urutan: T[];
  terpilih: Set<string>;
  amount: Map<string, number>;
  kuotaPenerima: number;
  anggaranEfektif: number;
  totalAlokasi: number;
  sisaAnggaran: number;
  cutoff: {
    rankTerakhirTerpilih: number | null;
    skorTerakhirTerpilih: number | null;
    skorPertamaTidakTerpilih: number | null;
    selisih: number | null;
  };
};

/**
 * Urutan global lintas cluster dengan tie-break deterministik (§5.3).
 * Tie-break TIDAK memakai urutan input/insert — kalau iya, "siapa yang
 * didaftarkan petugas lebih dulu" ikut menentukan nasib, yaitu celah
 * nepotisme yang justru ingin ditutup sistem ini.
 */
export function urutanGlobal<T extends KandidatAlokasi>(kandidat: T[]): T[] {
  return [...kandidat].sort((a, b) =>
    a.peringkatCluster - b.peringkatCluster ||
    b.skor - a.skor ||
    a.pendapatanPerKapita - b.pendapatanPerKapita ||
    b.jumlahTanggungan - a.jumlahTanggungan ||
    a.nikKkHash.localeCompare(b.nikKkHash),
  );
}

export function alokasiFlat<T extends KandidatAlokasi>(
  kandidat: T[],
  anggaranTotal: number,
  nominalDasar: number,
  biayaOperasional = 0,
): HasilAlokasi<T> {
  const anggaranEfektif = anggaranTotal - biayaOperasional;
  const urutan = urutanGlobal(kandidat);
  const kuota = Math.min(Math.floor(anggaranEfektif / nominalDasar), urutan.length);

  const terpilih = new Set<string>();
  const amount = new Map<string, number>();
  urutan.slice(0, kuota).forEach((k) => {
    terpilih.add(k.id);
    amount.set(k.id, nominalDasar);
  });

  const totalAlokasi = kuota * nominalDasar;

  const terakhir = kuota > 0 ? urutan[kuota - 1] : null;
  const berikutnya = kuota < urutan.length ? urutan[kuota] : null;

  return {
    urutan,
    terpilih,
    amount,
    kuotaPenerima: kuota,
    anggaranEfektif,
    totalAlokasi,
    sisaAnggaran: anggaranEfektif - totalAlokasi,
    cutoff: {
      rankTerakhirTerpilih: kuota > 0 ? kuota : null,
      skorTerakhirTerpilih: terakhir?.skor ?? null,
      skorPertamaTidakTerpilih: berikutnya?.skor ?? null,
      selisih: terakhir && berikutnya ? terakhir.skor - berikutnya.skor : null,
    },
  };
}

export type Invarian = { nama: string; lolos: boolean; detail: string };

/** Guard §5.4 — dievaluasi sebelum daftar boleh dikirim on-chain. */
export function periksaInvarian<T extends KandidatAlokasi>(
  hasil: HasilAlokasi<T>,
  wallets: Map<string, string>,
): Invarian[] {
  const leaves = [...hasil.terpilih];
  const sumAmount = leaves.reduce((s, id) => s + (hasil.amount.get(id) ?? 0), 0);
  const alamat = leaves.map((id) => wallets.get(id) ?? "");
  const unik = new Set(alamat).size === alamat.length && alamat.every(Boolean);

  return [
    {
      nama: "Σ amount = total alokasi",
      lolos: sumAmount === hasil.totalAlokasi,
      detail: `${sumAmount.toLocaleString("id-ID")} vs ${hasil.totalAlokasi.toLocaleString("id-ID")}`,
    },
    {
      nama: "Total alokasi ≤ pagu efektif",
      lolos: hasil.totalAlokasi <= hasil.anggaranEfektif,
      detail: `sisa ${hasil.sisaAnggaran.toLocaleString("id-ID")}`,
    },
    {
      nama: "Jumlah leaf = jumlah penerima",
      lolos: leaves.length === hasil.kuotaPenerima,
      detail: `${leaves.length} leaf`,
    },
    {
      nama: "Alamat wallet valid & unik",
      lolos: unik,
      detail: `${new Set(alamat).size} alamat unik`,
    },
    {
      nama: "Setiap amount > 0",
      lolos: leaves.every((id) => (hasil.amount.get(id) ?? 0) > 0),
      detail: "tidak ada leaf bernilai nol",
    },
  ];
}
