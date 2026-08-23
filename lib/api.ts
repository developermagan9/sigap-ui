const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

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
    getAll: (token?: string) => fetchApi('/periode-program', { token }),
    getById: (id: string, token?: string) => fetchApi(`/periode-program/${id}`, { token }),
    getSummary: (id: string, token?: string) => fetchApi(`/periode-program/${id}/summary`, { token }),
  },
  rumahTangga: {
    getAll: (token?: string) => fetchApi('/rumah-tangga', { token }),
    create: (data: any, token?: string) => fetchApi('/rumah-tangga', { method: 'POST', body: JSON.stringify(data), token }),
    verify: (id: string, data: any, token?: string) => fetchApi(`/rumah-tangga/${id}/verifikasi`, { method: 'PATCH', body: JSON.stringify(data), token }),
  },
  mining: {
    runClustering: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/run-clustering`, { method: 'POST', body: JSON.stringify(data), token }),
    getClustering: (id: string, token?: string) => fetchApi(`/periode-program/${id}/clustering-result`, { token }),
    runTopsis: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/run-topsis`, { method: 'POST', body: JSON.stringify(data), token }),
    getRanking: (id: string, token?: string) => fetchApi(`/periode-program/${id}/ranking-result`, { token }),
    runAlokasi: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/run-alokasi`, { method: 'POST', body: JSON.stringify(data), token }),
    finalizeRanking: (id: string, data: any, token?: string) => fetchApi(`/periode-program/${id}/finalize-ranking`, { method: 'POST', body: JSON.stringify(data), token }),
  },
  blockchain: {
    buildMerkle: (id: string, token?: string) => fetchApi(`/periode-program/${id}/build-merkle`, { method: 'POST', token }),
    submitOnchain: (id: string, token?: string) => fetchApi(`/periode-program/${id}/submit-onchain`, { method: 'POST', token }),
    getStatus: (id: string, token?: string) => fetchApi(`/periode-program/${id}/disbursement-status`, { token }),
  },
};
