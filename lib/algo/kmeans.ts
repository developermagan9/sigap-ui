/**
 * K-Means + K-Means++ init — implementasi dari 05-Algorithm-Design.md §3.
 * Dijalankan di sisi klien terhadap dataset sintetis agar seluruh angka yang
 * tampil di UI benar-benar berasal dari algoritma, bukan nilai yang dikarang.
 */

export type Vec = number[];

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Z-score. K-Means sensitif terhadap skala, jadi ini wajib sebelum clustering. */
export function standardize(X: Vec[]): { z: Vec[]; mean: number[]; std: number[] } {
  const n = X.length;
  const m = X[0].length;
  const mean = Array.from({ length: m }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n);
  const std = Array.from({ length: m }, (_, j) => {
    const v = X.reduce((s, r) => s + (r[j] - mean[j]) ** 2, 0) / n;
    return Math.sqrt(v) || 1; // kolom konstan -> hindari bagi nol
  });
  const z = X.map((r) => r.map((v, j) => (v - mean[j]) / std[j]));
  return { z, mean, std };
}

const dist2 = (a: Vec, b: Vec) => a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0);

export type KMeansResult = {
  assign: number[];
  centroids: Vec[];
  sse: number;
  iterations: number;
};

export function kmeans(X: Vec[], k: number, seed = 42, maxIter = 100): KMeansResult {
  const rnd = mulberry32(seed);
  const n = X.length;

  // --- K-Means++ : centroid pertama acak, sisanya proporsional D^2 ---
  const centroids: Vec[] = [X[Math.floor(rnd() * n)].slice()];
  while (centroids.length < k) {
    const d2 = X.map((x) => Math.min(...centroids.map((c) => dist2(x, c))));
    const total = d2.reduce((s, v) => s + v, 0);
    let target = rnd() * total;
    let idx = 0;
    for (let i = 0; i < n; i++) {
      target -= d2[i];
      if (target <= 0) { idx = i; break; }
    }
    centroids.push(X[idx].slice());
  }

  const assign = new Array<number>(n).fill(-1);
  let iterations = 0;

  for (let it = 0; it < maxIter; it++) {
    iterations = it + 1;
    let moved = false;

    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = dist2(X[i], centroids[c]);
        if (d < bestD) { bestD = d; best = c; }
      }
      if (assign[i] !== best) { assign[i] = best; moved = true; }
    }

    for (let c = 0; c < k; c++) {
      const members = X.filter((_, i) => assign[i] === c);
      if (members.length === 0) continue; // cluster kosong: pertahankan centroid
      centroids[c] = centroids[c].map((_, j) => members.reduce((s, r) => s + r[j], 0) / members.length);
    }

    if (!moved) break;
  }

  const sse = X.reduce((s, x, i) => s + dist2(x, centroids[assign[i]]), 0);
  return { assign, centroids, sse, iterations };
}

export const LABEL_KERENTANAN = ["Sangat Rentan", "Rentan", "Cukup Mampu", "Mampu"] as const;
export type LabelKerentanan = (typeof LABEL_KERENTANAN)[number];

/**
 * Pelabelan otomatis (§3.3): urutkan cluster berdasarkan centroid pendapatan
 * ascending, lalu petakan ke label yang dipahami Dinas Sosial.
 * @returns peta clusterIndex -> peringkat kerentanan (0 = paling rentan)
 */
export function labelByIncome(centroids: Vec[], incomeCol = 0): number[] {
  const order = centroids
    .map((c, i) => ({ i, income: c[incomeCol] }))
    .sort((a, b) => a.income - b.income);
  const rank = new Array<number>(centroids.length);
  order.forEach((o, r) => { rank[o.i] = r; });
  return rank;
}

/** Elbow method — SSE untuk beberapa k, dipakai membenarkan pilihan k=4. */
export function elbow(X: Vec[], maxK = 8, seed = 42) {
  return Array.from({ length: maxK }, (_, i) => {
    const k = i + 1;
    return { k, sse: kmeans(X, k, seed).sse };
  });
}
