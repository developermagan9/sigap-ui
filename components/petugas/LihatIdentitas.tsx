"use client";

import { useState } from "react";
import { PanelIdentitas } from "@/components/verifikator/PanelIdentitas";

/**
 * Buka identitas satu rumah tangga dari daftar petugas. Sama seperti di antrean
 * verifikator, panel baru di-mount saat diklik — setiap pembacaan tercatat
 * `LIHAT_PII` di audit log, jadi daftar tidak boleh memuatnya di muka.
 */
export function LihatIdentitas({ id }: { id: string }) {
  const [buka, setBuka] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setBuka((b) => !b)}
        aria-expanded={buka}
        className="text-[11px] font-medium text-ink-3 underline decoration-[var(--hairline-strong)] underline-offset-2 transition-colors hover:text-ink"
      >
        {buka ? "Tutup identitas" : "Lihat identitas"}
      </button>
      {buka && <PanelIdentitas id={id} />}
    </div>
  );
}
