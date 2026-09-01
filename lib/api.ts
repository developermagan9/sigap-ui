const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

/** Hasil `POST /rumah-tangga/import` — satu entri per rumah tangga di file CSV. */
export type ImportCsvResult = {
  total_baris: number;
  total_rumah_tangga: number;
  sukses: number;
  gagal: number;
  hasil: {
    baris: number[];
    no_kk: string | null;
    status: 'success' | 'error';
    code?: string;
    message?: string;
    id?: string;
    flagged_duplicate?: boolean;
  }[];
};

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
  /** Assignment K-Means yang tersimpan (0 = Sangat Rentan). `null` selama clustering belum pernah dijalankan. */
  clusterIndex: number | null;
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
  /** Skema `berjenjang` saja — pengali nominal per label cluster. `null` kalau belum pernah disetel. */
  faktorCluster: Record<string, number> | null;
  kuotaPenerima: number | null;
  totalAlokasi: number | null;
  sisaAnggaran: number | null;
  merkleRoot: string | null;
  contractAddress: string | null;
  txHash: string | null;
  status: string;
  silhouetteScore: number | null;
  createdAt: string;
  clusterResults?: { id: string; clusterIndex: number; label: string; centroid: Record<string, number>; jumlahAnggota: number }[];
};

/** Satu wilayah KERJA program dari `GET /wilayah`. `kode` null hanya untuk baris
 *  lama yang dibuat sebelum referensi Kepmendagri dipakai. */
export type WilayahRow = {
  id: string;
  kode: string | null;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
};

/** Satu tingkat referensi wilayah dari `GET /wilayah/referensi`.
 *  `level`: 1 provinsi, 2 kabupaten/kota, 3 kecamatan, 4 desa/kelurahan. */
export type WilayahReferensi = { kode: string; nama: string; level: number };

/** Satu hasil `GET /wilayah/referensi/cari` — selalu berikut jalur lengkapnya,
 *  karena nama desa tidak unik di Indonesia. */
export type WilayahHasilCari = {
  kode: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
};

/** Satu baris `audit_log` dari `GET /audit-log` (audit.service.ts findAll()). */
export type AuditLogRow = {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeState: unknown;
  afterState: unknown;
  createdAt: string;
  actor: { id: string; nama: string; username: string; role: string } | null;
};

/** Ringkas satu program dari `GET /public/programs` — tanpa auth. */
export type PublicProgram = {
  id: string;
  nama_program: string;
  status: string;
  anggaran_total: number;
  kuota_penerima: number | null;
  total_alokasi: number | null;
  dibuat_pada: string;
};

/** Detail satu program dari `GET /public/programs/:id`. Hanya angka agregat +
 *  definisi kriteria — tidak ada skor atau identitas individu (07-Security §4). */
export type PublicProgramDetail = {
  id: string;
  nama_program: string;
  status: string;
  anggaran_total: number;
  biaya_operasional: number;
  nominal_dasar: number;
  skema_alokasi: string;
  bobot_kriteria: Record<string, number>;
  k_cluster: number;
  silhouette_score: number | null;
  kuota_penerima: number | null;
  total_alokasi: number | null;
  sisa_anggaran: number | null;
  merkle_root: string | null;
  contract_address: string | null;
  tx_hash: string | null;
  total_verifikasi: number;
  total_masuk_ranking: number;
  clusters: { cluster_index: number; label: string; jumlah_anggota: number }[];
  cutoff: {
    rank_terakhir_terpilih: number | null;
    skor_terakhir_terpilih: number | null;
    skor_pertama_tidak_terpilih: number | null;
    selisih: number | null;
  };
  jumlah_penerima: number;
  jumlah_terklaim: number;
  total_tersalur: number;
  per_wilayah: { desa: string; jumlah_penerima: number; total_dana: number; total_cair: number }[];
};

/** Satu transaksi publik dari `GET /public/transactions` (identitas sudah dianonimkan jadi REC-XXXX). */
export type PublicTransaksi = {
  reference: string;
  desa: string;
  kecamatan: string;
  amount: number;
  status: 'pending' | 'claimed' | 'failed';
  jenis_wallet: 'mandiri' | 'custodial';
  tx_hash: string | null;
  leaf_hash: string;
  claimed_at: string | null;
};

/** Hasil `GET /public/claim-status` (public.service.ts checkClaimStatus()).
 *  Kuncinya snake_case persis seperti yang dikirim backend — jangan menebak
 *  camelCase di komponen, itu membuat seluruh kartu hasil terisi `undefined`. */
export type ClaimStatus = {
  reference: string;
  status: 'pending' | 'claimed' | 'failed';
  amount: number;
  wallet: string;
  jenis_wallet: 'mandiri' | 'custodial';
  desa: string;
  kecamatan: string;
  tx_hash: string | null;
  claimed_at: string | null;
  program: string;
  leaf_hash: string;
};

/** Ringkasan `GET /public/disbursement-summary`. */
export type DisbursementSummary = {
  program: string | null;
  total_anggaran: number;
  total_tersalur: number;
  jumlah_penerima: number;
  per_wilayah: { desa: string; jumlah_penerima: number; total_dana: number; total_cair: number }[];
  transaksi_terbaru: { tx_hash: string; amount: number; timestamp: string; recipient_ref: string }[];
};

/** Prisma `Decimal` serialize jadi STRING di JSON (bukan number) — dikonfirmasi lewat panggilan
 *  API nyata (`totalAlokasi: "2000000"`, bukan `2000000`). `ApiClient` menormalisasi field yang
 *  memang Decimal di skema (uang, pendapatan) supaya komponen di sisi UI selalu menerima `number`
 *  sesuai tipe yang dideklarasikan — jangan hapus normalisasi ini walau terlihat redundan. */
function normalizeRumahTangga(r: any): RumahTanggaRow {
  return { ...r, pendapatanPerKapita: Number(r.pendapatanPerKapita) };
}

/** `silhouetteScore` juga Decimal di skema — ikut dinormalisasi jadi number. */
function normalizePeriode(p: any): PeriodeProgram {
  return {
    ...p,
    anggaranTotal: Number(p.anggaranTotal),
    biayaOperasional: Number(p.biayaOperasional),
    nominalDasar: Number(p.nominalDasar),
    totalAlokasi: p.totalAlokasi == null ? null : Number(p.totalAlokasi),
    sisaAnggaran: p.sisaAnggaran == null ? null : Number(p.sisaAnggaran),
    silhouetteScore: p.silhouetteScore == null ? null : Number(p.silhouetteScore),
  };
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options || {};

  const headers = new Headers(fetchOptions.headers);
  // FormData harus menentukan Content-Type-nya sendiri (`multipart/form-data`
  // + boundary). Memaksanya jadi application/json membuat backend tidak bisa
  // mem-parse unggahan file sama sekali.
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
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
    getDisbursementSummary: () => fetchApi<DisbursementSummary>('/public/disbursement-summary'),
    checkClaimStatus: (q: string) =>
      fetchApi<ClaimStatus>(`/public/claim-status?q=${encodeURIComponent(q)}`),
    getPrograms: async (): Promise<PublicProgram[]> =>
      (await fetchApi<{ programs: PublicProgram[] }>('/public/programs')).programs,
    getProgramDetail: (id: string) => fetchApi<PublicProgramDetail>(`/public/programs/${id}`),
    getTransactions: (params?: { periode_id?: string; page?: number; limit?: number; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.periode_id) qs.set('periode_id', params.periode_id);
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.status) qs.set('status', params.status);
      const q = qs.toString();
      return fetchApi<{
        periode_id: string | null;
        data: PublicTransaksi[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/public/transactions${q ? `?${q}` : ''}`);
    },
  },
  audit: {
    getAll: (page = 1, limit = 20, token?: string) =>
      fetchApi<{ data: AuditLogRow[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
        `/audit-log?page=${page}&limit=${limit}`,
        { token },
      ),
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
    create: async (data: {
      nama_program: string;
      anggaran_total: number;
      biaya_operasional?: number;
      k_cluster?: number;
      bobot_kriteria: Record<string, number>;
      skema_alokasi?: string;
      nominal_dasar?: number;
      faktor_cluster?: Record<string, number>;
    }, token?: string): Promise<PeriodeProgram> =>
      normalizePeriode(await fetchApi<any>('/periode-program', { method: 'POST', body: JSON.stringify(data), token })),
    update: async (id: string, data: Record<string, unknown>, token?: string): Promise<PeriodeProgram> =>
      normalizePeriode(await fetchApi<any>(`/periode-program/${id}`, { method: 'PATCH', body: JSON.stringify(data), token })),
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
    /** Unggah CSV massal. `FormData` mengatur Content-Type-nya sendiri (butuh boundary),
     *  jadi header itu sengaja tidak diisi di sini — lihat catatan di fetchApi(). */
    importCsv: (file: File, periodeId: string | undefined, token?: string) => {
      const body = new FormData();
      body.append('file', file);
      return fetchApi<ImportCsvResult>(
        `/rumah-tangga/import${periodeId ? `?periode_id=${periodeId}` : ''}`,
        { method: 'POST', body, token },
      );
    },
  },
  wilayah: {
    getAll: (token?: string) => fetchApi<WilayahRow[]>('/wilayah', { token }),
    /** Satu tingkat referensi. Tanpa `induk` -> 38 provinsi; `induk='34'` -> kabupaten/kota DIY. */
    referensi: (induk: string | undefined, token?: string) =>
      fetchApi<{ induk: string | null; jumlah: number; data: WilayahReferensi[] }>(
        `/wilayah/referensi${induk ? `?induk=${encodeURIComponent(induk)}` : ''}`,
        { token },
      ),
    cariDesa: (q: string, token?: string) =>
      fetchApi<{ jumlah: number; dipotong?: boolean; data: WilayahHasilCari[] }>(
        `/wilayah/referensi/cari?q=${encodeURIComponent(q)}`,
        { token },
      ),
  },
  sanggahan: {
    create: (rumahTanggaId: string, data: { alasan: string; data_baru: Record<string, unknown> }, token?: string) =>
      fetchApi(`/rumah-tangga/${rumahTanggaId}/sanggahan`, { method: 'POST', body: JSON.stringify(data), token }),
    getAll: (status?: string, token?: string) =>
      fetchApi<any[]>(`/sanggahan${status ? `?status=${status}` : ''}`, { token }),
    review: (id: string, data: { status: 'diterima' | 'ditolak'; catatan?: string }, token?: string) =>
      fetchApi(`/sanggahan/${id}/review`, { method: 'PATCH', body: JSON.stringify(data), token }),
  },
  mining: {
    runClustering: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/run-clustering`, { method: 'POST', body: JSON.stringify(data), token }),
    getClustering: (id: string, token?: string) =>
      fetchApi<{ clusters: any[]; silhouette_score: number | null }>(`/periode-program/${id}/clustering-result`, { token }),
    runTopsis: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/run-topsis`, { method: 'POST', body: JSON.stringify(data), token }),
    getRanking: (id: string, token?: string) => fetchApi<{ results: any[] }>(`/periode-program/${id}/ranking-result`, { token }),
    runAlokasi: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/run-alokasi`, { method: 'POST', body: JSON.stringify(data), token }),
    finalizeRanking: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/finalize-ranking`, { method: 'POST', body: JSON.stringify(data), token }),
  },
  blockchain: {
    buildMerkle: (id: string, token?: string) => fetchApi(`/periode-program/${id}/build-merkle`, { method: 'POST', token }),
    submitOnchain: (id: string, token?: string) => fetchApi(`/periode-program/${id}/submit-onchain`, { method: 'POST', token }),
    getStatus: (id: string, token?: string) =>
      fetchApi<{
        total_recipients: number;
        total_claimed: number;
        total_pending: number;
        /** `null` selama periode masih mode simulasi — belum ada alamat kontrak nyata untuk ditautkan. */
        explorer_url: string | null;
      }>(
        `/periode-program/${id}/disbursement-status`,
        { token },
      ),
  },
};
