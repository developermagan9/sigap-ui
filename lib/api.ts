const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

/** Bentuk satu baris dari `GET /rumah-tangga` (lihat rumah-tangga.service.ts findAll()), sudah
 *  dinormalisasi — lihat catatan Decimal di bawah. */
export type RumahTanggaRow = {
  id: string;
  nikKkHash: string;
  statusVerifikasi: 'pending' | 'verified' | 'rejected';
  flaggedDuplicate: boolean;
  pendapatanPerKapita: number;
  jumlahTanggungan: number;
  jumlahDisabilitasLansia: number;
  skorKondisiRumah: number;
  skorAksesPendidikan: number;
  riwayatBansosSebelumnya: boolean;
  createdAt: string;
  wilayah: { desa: string };
};

/** Bentuk `periode_program` dari backend, sudah dinormalisasi (lihat catatan Decimal di bawah). */
export type PeriodeProgram = {
  id: string;
  namaProgram: string;
  anggaranTotal: number;
  biayaOperasional: number;
  kCluster: number;
  clusterPrioritas: number[];
  bobotKriteria: Record<string, number>;
  skemaAlokasi: string;
  nominalDasar: number;
  kuotaPenerima: number | null;
  totalAlokasi: number | null;
  sisaAnggaran: number | null;
  merkleRoot: string | null;
  contractAddress: string | null;
  txHash: string | null;
  status: string;
  createdAt: string;
  clusterResults?: { id: string; clusterIndex: number; label: string; centroid: Record<string, number>; jumlahAnggota: number }[];
};

export type WilayahRow = { id: string; provinsi: string; kabupaten: string; kecamatan: string; desa: string };

/** Prisma `Decimal` serialize jadi STRING di JSON (bukan number) — dikonfirmasi lewat panggilan
 *  API nyata (`totalAlokasi: "2000000"`, bukan `2000000`). `ApiClient` menormalisasi field yang
 *  memang Decimal di skema (uang, pendapatan) supaya komponen di sisi UI selalu menerima `number`
 *  sesuai tipe yang dideklarasikan — jangan hapus normalisasi ini walau terlihat redundan. */
function normalizeRumahTangga(r: any): RumahTanggaRow {
  return { ...r, pendapatanPerKapita: Number(r.pendapatanPerKapita) };
}

function normalizePeriode(p: any): PeriodeProgram {
  return {
    ...p,
    anggaranTotal: Number(p.anggaranTotal),
    biayaOperasional: Number(p.biayaOperasional),
    nominalDasar: Number(p.nominalDasar),
    totalAlokasi: p.totalAlokasi == null ? null : Number(p.totalAlokasi),
    sisaAnggaran: p.sisaAnggaran == null ? null : Number(p.sisaAnggaran),
  };
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options || {};

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    throw new Error(errorData?.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

export const ApiClient = {
  public: {
    getDisbursementSummary: () => fetchApi('/public/disbursement-summary'),
    checkClaimStatus: (q: string) => fetchApi(`/public/claim-status?q=${encodeURIComponent(q)}`),
  },
  auth: {
    login: (data: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },
  periode: {
    getAll: async (token?: string): Promise<PeriodeProgram[]> =>
      (await fetchApi<any[]>('/periode-program', { token })).map(normalizePeriode),
    getById: async (id: string, token?: string): Promise<PeriodeProgram> =>
      normalizePeriode(await fetchApi<any>(`/periode-program/${id}`, { token })),
    getSummary: (id: string, token?: string) =>
      fetchApi<{
        periode_id: string;
        nama_program: string;
        status: string;
        anggaran_total: number;
        biaya_operasional: number;
        nominal_dasar: number;
        k_cluster: number;
        kuota_penerima: number | null;
        total_alokasi: number | null;
        sisa_anggaran: number | null;
        total_rumah_tangga: number;
        total_verified: number;
        total_clusters: number;
        total_ranked: number;
        total_terpilih: number;
        total_claimed: number;
      }>(`/periode-program/${id}/summary`, { token }),
  },
  rumahTangga: {
    getAll: async (
      filters?: { periode_id?: string; wilayah_id?: string; status?: string; page?: number; limit?: number },
      token?: string,
    ): Promise<{ data: RumahTanggaRow[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
      const params = new URLSearchParams();
      if (filters?.periode_id) params.set('periode_id', filters.periode_id);
      if (filters?.wilayah_id) params.set('wilayah_id', filters.wilayah_id);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));
      const qs = params.toString();
      const res = await fetchApi<{ data: any[]; meta: any }>(`/rumah-tangga${qs ? `?${qs}` : ''}`, { token });
      return { data: res.data.map(normalizeRumahTangga), meta: res.meta };
    },
    create: (data: any, token?: string) => fetchApi('/rumah-tangga', { method: 'POST', body: JSON.stringify(data), token }),
    verify: (id: string, data: any, token?: string) => fetchApi(`/rumah-tangga/${id}/verifikasi`, { method: 'PATCH', body: JSON.stringify(data), token }),
  },
  wilayah: {
    getAll: (token?: string) => fetchApi<WilayahRow[]>('/wilayah', { token }),
  },
  mining: {
    runClustering: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/run-clustering`, { method: 'POST', body: JSON.stringify(data), token }),
    getClustering: (id: string, token?: string) => fetchApi<{ clusters: any[] }>(`/periode-program/${id}/clustering-result`, { token }),
    runTopsis: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/run-topsis`, { method: 'POST', body: JSON.stringify(data), token }),
    getRanking: (id: string, token?: string) => fetchApi<{ results: any[] }>(`/periode-program/${id}/ranking-result`, { token }),
    runAlokasi: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/run-alokasi`, { method: 'POST', body: JSON.stringify(data), token }),
    finalizeRanking: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/finalize-ranking`, { method: 'POST', body: JSON.stringify(data), token }),
  },
  blockchain: {
    buildMerkle: (id: string, token?: string) => fetchApi(`/periode-program/${id}/build-merkle`, { method: 'POST', token }),
    submitOnchain: (id: string, token?: string) => fetchApi(`/periode-program/${id}/submit-onchain`, { method: 'POST', token }),
    getStatus: (id: string, token?: string) =>
      fetchApi<{ total_recipients: number; total_claimed: number; total_pending: number; explorer_url: string }>(
        `/periode-program/${id}/disbursement-status`,
        { token },
      ),
  },
};
