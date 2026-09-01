"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ArrowRight } from "@/components/ui/Icons";
import { importRumahTanggaCsv } from "@/lib/actions";
import type { ImportCsvResult } from "@/lib/api";

/** Contoh isi file, sekaligus dokumentasi format yang bisa langsung diunduh. */
const CONTOH_CSV = [
  "no_kk,nik_kepala_keluarga,nama_kepala_keluarga,alamat_detail,desa,pendapatan_per_kapita,skor_kondisi_rumah,skor_akses_pendidikan,riwayat_bansos_sebelumnya,nik,nama,hubungan,tanggal_lahir,status_disabilitas,is_tanggungan",
  "3273010101800001,3273010101800001,Budi Santoso,Jl. Mawar No. 1,Sukamaju,450000,2,3,false,,,kepala,1980-01-01,false,true",
  "3273010101800002,3273010101800002,Siti Aminah,Jl. Melati No. 2,Sukamaju,380000,1,2,false,,,kepala,1985-02-02,false,true",
  "3273010101800002,,,,,,,,,3273010101800012,Rina Aminah,anak,2015-06-06,true,true",
].join("\n");

/**
 * Unggah CSV massal (BE-3 langkah 5).
 *
 * Tiap baris dilaporkan sendiri-sendiri: satu baris gagal tidak menggagalkan
 * sisa file, jadi hasilnya ditampilkan sebagai tabel per baris — petugas bisa
 * memperbaiki baris yang bermasalah lalu mengunggah ulang baris itu saja.
 */
export function ImportCsv({ periodeId }: { periodeId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [namaFile, setNamaFile] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<ImportCsvResult | null>(null);

  const kirim = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setGalat("Pilih file CSV terlebih dahulu.");
      return;
    }
    setMengirim(true);
    setGalat(null);
    setHasil(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("periode_id", periodeId);
      const res = await importRumahTanggaCsv(fd);
      setHasil(res);
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal mengunggah CSV.");
    } finally {
      setMengirim(false);
    }
  };

  const unduhContoh = () => {
    // Blob + object URL: tidak perlu file statis di server, dan isinya selalu
    // sinkron dengan kolom yang benar-benar dibaca backend.
    const url = URL.createObjectURL(new Blob([CONTOH_CSV], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "contoh-pendataan.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rule-card p-6 sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Import massal</p>
      <h2 className="mt-4 text-[1.6rem]">Unggah CSV hasil pendataan lapangan</h2>
      <p className="mt-3 max-w-3xl text-[13px] leading-6 text-[var(--color-ink-3)]">
        Satu baris = satu anggota keluarga, dikelompokkan lewat kolom <code className="font-mono">no_kk</code>.
        Kolom rumah tangga cukup diisi pada baris <code className="font-mono">hubungan=kepala</code>. Kolom{" "}
        <code className="font-mono">desa</code> boleh diganti <code className="font-mono">wilayah_id</code> kalau
        UUID-nya sudah diketahui. Pemeriksaan duplikat NIK/No. KK sama persis dengan form input satu per satu.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setNamaFile(e.target.files?.[0]?.name ?? null)}
          className="text-[13px] file:mr-3 file:rounded-md file:border file:border-[var(--color-line)] file:bg-white file:px-3 file:py-2 file:text-[13px]"
        />
        <LoadingButton onClick={kirim} loading={mengirim} disabled={!namaFile} icon={<ArrowRight className="h-4 w-4" />}>
          Unggah &amp; proses
        </LoadingButton>
        <button
          type="button"
          onClick={unduhContoh}
          className="text-[13px] text-[var(--color-ink-3)] underline underline-offset-4 hover:text-[var(--color-ink)]"
        >
          Unduh contoh CSV
        </button>
      </div>

      {galat && <p className="mt-5 text-[12px] leading-6 text-[var(--color-alert)]">{galat}</p>}

      {hasil && (
        <div className="mt-6 border-t border-[var(--color-line)] pt-6">
          <p className="text-[13px] text-[var(--color-ink-2)]">
            {hasil.total_baris} baris dibaca · {hasil.total_rumah_tangga} rumah tangga ·{" "}
            <span className="text-[var(--color-primary)]">{hasil.sukses} sukses</span> ·{" "}
            <span className={hasil.gagal > 0 ? "text-[var(--color-alert)]" : ""}>{hasil.gagal} gagal</span>
          </p>

          <div className="mt-4 max-h-96 overflow-auto">
            <table className="w-full min-w-[38rem] border-collapse">
              <thead className="sticky top-0 bg-[var(--color-paper)]">
                <tr className="border-b border-[var(--color-line)] text-left">
                  {["Baris", "No. KK", "Status", "Keterangan"].map((h) => (
                    <th key={h} className="py-2 pr-4 text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-4)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hasil.hasil.map((baris) => (
                  <tr key={`${baris.baris.join("-")}-${baris.no_kk ?? "?"}`} className="border-b border-[var(--color-line)] last:border-b-0">
                    <td className="py-2.5 pr-4 font-mono text-[12px]">{baris.baris.join(", ")}</td>
                    <td className="py-2.5 pr-4 font-mono text-[12px] text-[var(--color-ink-2)]">{baris.no_kk ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-[12px]">
                      <span className={baris.status === "success" ? "text-[var(--color-primary)]" : "text-[var(--color-alert)]"}>
                        {baris.status === "success" ? "masuk" : "gagal"}
                      </span>
                    </td>
                    <td className="py-2.5 text-[12px] text-[var(--color-ink-3)]">
                      {baris.status === "success"
                        ? baris.flagged_duplicate
                          ? "Masuk, tapi ditandai mirip data lain — perlu dicek verifikator."
                          : "Menunggu verifikasi."
                        : `${baris.code}: ${baris.message}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
