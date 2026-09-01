"use client";

import { useState } from "react";
import { Bezel } from "@/components/ui/Bezel";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Hash } from "@/components/ui/Hash";
import { Alert, Check, Coins, Search } from "@/components/ui/Icons";
import { EXPLORER_BASE } from "@/lib/constants";
import { rupiah, waktu } from "@/lib/format";
import { ApiClient, type ClaimStatus } from "@/lib/api";

export function CekKlaim() {
  const [q, setQ] = useState("");
  const [cari, setCari] = useState<string | null>(null);
  const [hasil, setHasil] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorNotFound, setErrorNotFound] = useState(false);
  const [errorLain, setErrorLain] = useState<string | null>(null);

  const jalankan = async (v: string) => {
    setQ(v);
    setCari(v);
    setLoading(true);
    setErrorNotFound(false);
    setErrorLain(null);
    setHasil(null);

    try {
      const res = await ApiClient.public.checkClaimStatus(v);
      setHasil(res);
    } catch (e: unknown) {
      const pesan = e instanceof Error ? e.message : String(e);
      if (pesan.includes("404")) {
        setErrorNotFound(true);
      } else {
        // Gagal jaringan/5xx tidak boleh berakhir senyap di console — sebelumnya
        // layar hanya kembali kosong dan tidak terbedakan dari "tidak ditemukan".
        setErrorLain(pesan);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Bezel>
            <div className="p-7 sm:p-9">
              <Eyebrow>Cek status bantuan</Eyebrow>
              <h2 className="mt-5 font-display text-[1.75rem] leading-tight tracking-[-0.03em]">
                Masukkan kode penerima atau alamat dompet
              </h2>

              <form
                onSubmit={(e) => { e.preventDefault(); jalankan(q); }}
                className="mt-7 flex flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-4">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="REC-0231 atau 0x…"
                    className="w-full rounded-full bg-paper-2 py-3.5 pl-11 pr-4 text-[14px] ring-1
                      ring-[var(--hairline)] outline-none transition-all duration-500
                      ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-ink-4 focus:bg-card focus:ring-sage/40"
                  />
                </div>
                <Button type="submit" disabled={loading} icon={<Search className="h-[15px] w-[15px]" />}>
                  {loading ? "Mencari..." : "Cari"}
                </Button>
              </form>

              {/* ---------- Hasil ---------- */}
              {cari && errorNotFound && !loading && (
                <div className="mt-8 flex items-start gap-3 rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                  <span className="mt-px text-ink-3"><Alert className="h-4 w-4" /></span>
                  <div>
                    <p className="text-[13px] font-medium">Tidak ditemukan pada periode ini</p>
                    <p className="mt-2 text-[12px] leading-[1.65] text-ink-3">
                      Belum terverifikasi atau di luar kuota pagu. Ajukan koreksi lewat pendamping desa.
                    </p>
                  </div>
                </div>
              )}

              {cari && errorLain && !loading && (
                <div className="mt-8 flex items-start gap-3 rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                  <span className="mt-px text-ink-3"><Alert className="h-4 w-4" /></span>
                  <div>
                    <p className="text-[13px] font-medium">Pencarian gagal</p>
                    <p className="mt-2 text-[12px] leading-[1.65] text-ink-3">
                      Layanan tidak dapat dihubungi. Coba lagi beberapa saat lagi.
                    </p>
                  </div>
                </div>
              )}

              {hasil && !loading && (
                <div className="mt-8">
                  <div className={`rounded-[1.5rem] p-1 ring-1 ${
                    hasil.status === "claimed" ? "bg-sage-soft ring-sage/20" : "bg-gold/8 ring-gold/20"
                  }`}>
                    <div className="rounded-[calc(1.5rem-0.25rem)] bg-card p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <Eyebrow tone={hasil.status === "claimed" ? "sage" : "gold"}>
                            {hasil.status === "claimed" ? "Sudah diterima" : "Menunggu klaim"}
                          </Eyebrow>
                          <p className="mt-4 font-display text-[2.5rem] leading-none tnum tracking-[-0.035em]">
                            {rupiah(hasil.amount)}
                          </p>
                          <p className="mt-2.5 text-[13px] text-ink-3">
                            {hasil.reference} · Desa {hasil.desa} · {hasil.program}
                          </p>
                        </div>
                        <span className={`flex h-11 w-11 items-center justify-center rounded-full ${
                          hasil.status === "claimed" ? "bg-sage-soft text-sage" : "bg-gold/12 text-gold"
                        }`}>
                          {hasil.status === "claimed" ? <Check className="h-5 w-5" /> : <Coins className="h-5 w-5" />}
                        </span>
                      </div>

                      <dl className="mt-7 flex flex-col divide-y divide-[var(--hairline)] text-[13px]">
                        {[
                          ["Dompet tujuan", <Hash key="w" value={hasil.wallet} kepala={10} ekor={8} />],
                          ["Jenis dompet", <span key="j" className="text-ink-2">
                            {hasil.jenis_wallet === "mandiri" ? "Milik sendiri" : "Dikelola program (custodial)"}
                          </span>],
                          ["Merkle leaf", <Hash key="l" value={hasil.leaf_hash} kepala={10} ekor={6} />],
                          hasil.tx_hash
                            ? ["Transaksi", <Hash key="t" value={hasil.tx_hash} kepala={10} ekor={6} href={`${EXPLORER_BASE}/tx/${hasil.tx_hash}`} />]
                            : ["Transaksi", <span key="t" className="text-ink-4">belum ada</span>],
                          ["Waktu pencairan", <span key="v" className="tnum text-ink-2">{hasil.claimed_at ? waktu(hasil.claimed_at) : "-"}</span>],
                        ].map(([k, v]) => (
                          <div key={String(k)} className="flex items-center justify-between gap-4 py-3">
                            <dt className="text-ink-3">{k}</dt>
                            <dd>{v}</dd>
                          </div>
                        ))}
                      </dl>

                      {/* Tombol klaim di sini dulunya palsu: `setTimeout(1400)` lalu
                          mengumumkan "Simulasi berhasil. Rp X dikirim ke dompet di atas,
                          event FundDisbursed tercatat publik." Tidak ada transaksi yang
                          dikirim, tidak ada event yang tercatat, dan record tetap `pending`
                          — persis "menyamarkan simulasi sebagai transaksi nyata" yang
                          dilarang 07-Security-Privacy-Ethics.md §7, dan yang justru
                          dinyatakan tidak dilakukan oleh 16-Konfigurasi-Kredensial.md §3.
                          Penandatanganan klaim lewat wallet warga/relayer belum dibangun,
                          jadi status ditampilkan apa adanya. */}
                      {hasil.status === "pending" && (
                        <div className="mt-7 border-t border-[var(--hairline)] pt-6">
                          <div className="flex items-start gap-3 rounded-2xl bg-paper-2 p-4 ring-1 ring-[var(--hairline)]">
                            <span className="mt-px text-ink-3"><Coins className="h-4 w-4" /></span>
                            <div>
                              <p className="text-[12px] font-medium text-ink-2">Dana belum ditarik</p>
                              <p className="mt-2 text-[12px] leading-[1.65] text-ink-3">
                                Anda terdaftar sebagai penerima dan bukti Merkle Anda sudah terkunci
                                pada root periode ini. Penarikan dilakukan lewat pendamping desa —
                                penandatanganan klaim langsung dari dompet warga belum tersedia di
                                portal ini.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Bezel>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <Bezel tone="sunken">
            <div className="p-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
                Hak Anda sebagai warga
              </p>
              <ul className="mt-5 flex flex-col gap-2.5 text-[13px] text-ink-2">
                <li>Kriteria dan bobot penilaian dipublikasikan.</li>
                <li>Koreksi data lewat pendamping desa memicu perhitungan ulang.</li>
                <li>Nominal diterima utuh, tanpa potongan administrasi.</li>
                <li>Nama, NIK, dan penghasilan tidak dipublikasikan.</li>
              </ul>
            </div>
          </Bezel>
        </div>
      </div>
  );
}
