/**
 * TOPSIS + dekomposisi kontribusi kriteria.
 * Rumus persis mengikuti 05-Algorithm-Design.md §4.1 dan §4.4, termasuk
 * penanganan kasus tepi §4.5 supaya tidak pernah menghasilkan NaN di UI.
 */

const EPS = 1e-12;

export type KriteriaSpec = {
  key: string;
  label: string;
  benefit: boolean;
  /** satuan untuk ditampilkan di panel penjelasan */
  unit?: "rupiah" | "orang" | "skor";
};

export type BreakdownItem = {
  nilaiAsli: number;
  terbobot: number;
  /** proporsi sumbangan kriteria ini terhadap D⁻² — seluruhnya berjumlah 1 */
  kontribusi: number;
  /** proporsi sumbangan terhadap D⁺² — alasan belum di peringkat teratas */
  kesenjangan: number;
};

export type TopsisRow = {
  index: number;
  skor: number;
  dPlus: number;
  dMinus: number;
  breakdown: Record<string, BreakdownItem>;
};

export function topsis(
  matrix: number[][],
  kriteria: KriteriaSpec[],
  bobot: Record<string, number>,
): TopsisRow[] {
  const n = matrix.length;
  if (n === 0) return [];

  // §4.5 — kolom dengan norm 0 tidak informatif; drop lalu normalisasi ulang bobot
  const normKolom = kriteria.map((_, j) => Math.sqrt(matrix.reduce((s, r) => s + r[j] ** 2, 0)));
  const aktifIdx = kriteria.map((_, j) => j).filter((j) => normKolom[j] > EPS);
  const aktif = aktifIdx.map((j) => kriteria[j]);
  const bobotTotal = aktif.reduce((s, c) => s + (bobot[c.key] ?? 0), 0) || 1;
  const w = aktif.map((c) => (bobot[c.key] ?? 0) / bobotTotal);

  // Langkah 1-2: normalisasi vektor lalu pembobotan
  const v = matrix.map((row) => aktifIdx.map((j, jj) => (row[j] / normKolom[j]) * w[jj]));

  // Langkah 3: solusi ideal positif & negatif, arah tergantung benefit/cost
  const idealPos = aktif.map((c, jj) => {
    const col = v.map((r) => r[jj]);
    return c.benefit ? Math.max(...col) : Math.min(...col);
  });
  const idealNeg = aktif.map((c, jj) => {
    const col = v.map((r) => r[jj]);
    return c.benefit ? Math.min(...col) : Math.max(...col);
  });

  return v.map((row, i) => {
    const sqPos = row.map((val, jj) => (val - idealPos[jj]) ** 2);
    const sqNeg = row.map((val, jj) => (val - idealNeg[jj]) ** 2);

    const sumPos = sqPos.reduce((s, x) => s + x, 0);
    const sumNeg = sqNeg.reduce((s, x) => s + x, 0);
    const dPlus = Math.sqrt(sumPos);
    const dMinus = Math.sqrt(sumNeg);

    // §4.5 — semua alternatif identik: skor netral, ranking jatuh ke tie-break
    const denom = dPlus + dMinus;
    const skor = denom > EPS ? dMinus / denom : 0.5;

    const breakdown: Record<string, BreakdownItem> = {};
    aktif.forEach((c, jj) => {
      breakdown[c.key] = {
        nilaiAsli: matrix[i][aktifIdx[jj]],
        terbobot: row[jj],
        // Pembagi di-clamp: bila D⁻² = 0, bagi rata agar tetap berjumlah 1
        kontribusi: sumNeg > EPS ? sqNeg[jj] / sumNeg : 1 / aktif.length,
        kesenjangan: sumPos > EPS ? sqPos[jj] / sumPos : 1 / aktif.length,
      };
    });

    return { index: i, skor, dPlus, dMinus, breakdown };
  });
}

/** Analisis sensitivitas (§7): seberapa berubah 20 besar bila satu bobot digeser. */
export function pergeseranRanking<T>(a: T[], b: T[], topN = 20): number {
  const setA = new Set(a.slice(0, topN));
  const berubah = b.slice(0, topN).filter((x) => !setA.has(x)).length;
  return berubah / topN;
}
