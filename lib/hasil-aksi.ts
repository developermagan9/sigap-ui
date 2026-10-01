/** Bentuk kembalian Server Action di `lib/actions.server.ts`. */
export type HasilAksi<T> =
  | { ok: true; data: T }
  | { ok: false; pesan: string; status?: number; kode?: string };
