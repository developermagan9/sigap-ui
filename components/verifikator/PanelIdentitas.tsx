"use client";

import { useEffect, useState } from "react";
import { getDetailRumahTangga } from "@/lib/actions";
import type { RumahTanggaDetail } from "@/lib/api";

/**
 * Identitas satu rumah tangga di dalam baris antrean verifikasi.
 *
 * Sebelum panel ini ada, satu-satunya hal yang dilihat verifikator tentang
 * "siapa" yang sedang ia putuskan adalah 12 karakter pertama hash NIK-KK. Nama,
 * alamat, dan susunan keluarga memang dikumpulkan petugas dan disimpan
 * terenkripsi, tapi tidak ada satu pun jalur yang membacanya kembali — sehingga
 * approve/reject tidak punya objek yang bisa dicocokkan dengan kunjungan
 * lapangan atau KTP fisik.
 *
 * **Dimuat malas, per baris.** Backend mencatat tiap pembacaan sebagai
 * `LIHAT_PII` di audit log, jadi panel ini hanya di-mount saat barisnya benar-
 * benar dibuka — bukan saat daftar dirender. Memuat semuanya di muka akan
 * membanjiri jejak audit dengan akses yang tidak pernah diminta siapa pun.
 */
export function PanelIdentitas({ id }: { id: string }) {
  const [data, setData] = useState<RumahTanggaDetail | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    let batal = false;
    getDetailRumahTangga(id)
      .then((d) => !batal && setData(d))
      .catch((e) => !batal && setGalat(e instanceof Error ? e.message : "Gagal memuat identitas."));
    return () => {
      batal = true;
    };
  }, [id]);

  if (galat) return <p className="mt-5 text-[12px] leading-6 text-clay">{galat}</p>;

  if (!data) {
    return (
      <div className="mt-5 space-y-2" aria-busy="true">
        <div className="h-3 w-48 animate-pulse rounded bg-paper-2" />
        <div className="h-3 w-64 animate-pulse rounded bg-paper-2" />
      </div>
    );
  }

  const { identitas, anggota } = data;

  return (
    <div className="mt-5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4">Identitas</p>

      {identitas ? (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Baris label="Kepala keluarga" nilai={identitas.nama_kepala_keluarga} />
          <Baris label="NIK" nilai={samarkan(identitas.nik_kepala_keluarga)} mono />
          <Baris label="No. KK" nilai={samarkan(identitas.no_kk)} mono />
          <Baris
            label="Alamat"
            nilai={`${identitas.alamat_detail} — ${data.wilayah.desa}, Kec. ${data.wilayah.kecamatan}, ${data.wilayah.kabupaten}`}
          />
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-ink-3">
          Baris ini tidak punya data identitas tersimpan.
        </p>
      )}

      <p className="mt-6 text-[10px] uppercase tracking-[0.12em] text-ink-4">
        Anggota keluarga ({anggota.length})
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.1em] text-ink-4">
              <th className="pb-2 font-normal">Nama</th>
              <th className="pb-2 font-normal">NIK</th>
              <th className="pb-2 font-normal">Hubungan</th>
              <th className="pb-2 font-normal">Lahir</th>
              <th className="pb-2 font-normal">Keterangan</th>
            </tr>
          </thead>
          <tbody className="text-ink-2">
            {anggota.map((a) => (
              <tr key={a.id} className="border-t border-[var(--hairline)]">
                <td className="py-2 pr-3">{a.nama}</td>
                <td className="py-2 pr-3 font-mono text-[11px]">{samarkan(a.nik)}</td>
                <td className="py-2 pr-3">{HUBUNGAN[a.hubungan] ?? a.hubungan}</td>
                <td className="py-2 pr-3 font-mono text-[11px]">{a.tanggal_lahir.slice(0, 10)}</td>
                <td className="py-2 text-ink-3">
                  {[a.status_disabilitas && "disabilitas", a.is_tanggungan && "tanggungan"]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-ink-4">
        Enam digit terakhir NIK ditampilkan untuk pencocokan dengan KTP fisik; sisanya disamarkan.
        Setiap pembukaan identitas tercatat di jejak audit atas nama Anda.
      </p>
    </div>
  );
}

function Baris({ label, nilai, mono }: { label: string; nilai: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4">{label}</p>
      <p className={`mt-1.5 text-[12px] text-ink-2 ${mono ? "font-mono" : ""}`}>{nilai}</p>
    </div>
  );
}

/**
 * Tampilkan hanya enam digit terakhir. Cukup untuk mencocokkan berkas dengan KTP
 * yang dipegang di tangan, tanpa menaruh NIK utuh di layar yang bisa terbaca
 * orang lain atau ikut ter-screenshot.
 */
function samarkan(nomor: string): string {
  if (nomor.length <= 6) return nomor;
  return "•".repeat(nomor.length - 6) + nomor.slice(-6);
}

const HUBUNGAN: Record<string, string> = {
  kepala: "Kepala keluarga",
  istri_suami: "Istri/suami",
  anak: "Anak",
  orang_tua: "Orang tua",
  famili_lain: "Famili lain",
};
