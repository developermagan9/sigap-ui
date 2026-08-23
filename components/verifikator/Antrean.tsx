"use client";

import { useMemo, useState } from "react";
import { Bezel } from "@/components/ui/Bezel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Alert, Check, Cross, Filter, Search } from "@/components/ui/Icons";
import { angka, rupiah } from "@/lib/format";
import type { RumahTangga } from "@/lib/mock/generate";

type Keputusan = "verified" | "rejected";

export function Antrean({ baris }: { baris: RumahTangga[] }) {
  const [q, setQ] = useState("");
  const [saring, setSaring] = useState<"semua" | "flagged">("semua");
  const [putusan, setPutusan] = useState<Record<string, Keputusan>>({});
  const [alasan, setAlasan] = useState<Record<string, string>>({});
  const [buka, setBuka] = useState<string | null>(null);

  const tersaring = useMemo(() => {
    const t = q.trim().toLowerCase();
    return baris.filter(
      (r) =>
        (saring === "semua" || r.flaggedDuplicate) &&
        (!t || r.ref.toLowerCase().includes(t) || r.desa.toLowerCase().includes(t)),
    );
  }, [baris, q, saring]);

  const belum = tersaring.filter((r) => !putusan[r.id]).length;

  return (
    <section className="px-4 sm:px-8">
      <div className="mx-auto max-w-[78rem]">
        <Bezel>
          <div className="p-7 sm:p-9">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>Antrean review</Eyebrow>
                <h2 className="mt-4 font-display text-[1.75rem] leading-tight tracking-[-0.03em]">
                  {angka(belum)} berkas menunggu keputusan
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-4">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari kode atau desa"
                    className="w-56 rounded-full bg-paper-2 py-2.5 pl-11 pr-4 text-[13px] ring-1
                      ring-[var(--hairline)] outline-none transition-all duration-500
                      ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-ink-4 focus:bg-card focus:ring-sage/40"
                  />
                </div>
                <button
                  onClick={() => setSaring((s) => (s === "semua" ? "flagged" : "semua"))}
                  className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] ring-1
                    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
                      saring === "flagged"
                        ? "bg-gold/10 text-gold ring-gold/25"
                        : "bg-paper-2 text-ink-2 ring-[var(--hairline)] hover:bg-ink/[0.05]"
                    }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  {saring === "flagged" ? "Hanya yang ditandai" : "Semua berkas"}
                </button>
              </div>
            </div>

            <ul className="mt-8 flex flex-col gap-3">
              {tersaring.slice(0, 14).map((r) => {
                const p = putusan[r.id];
                const terbuka = buka === r.id;
                return (
                  <li
                    key={r.id}
                    className={`rounded-[1.375rem] p-1 ring-1 transition-all duration-700
                      ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        p === "verified"
                          ? "bg-sage-soft ring-sage/20"
                          : p === "rejected"
                            ? "bg-clay-soft ring-clay/20"
                            : "bg-paper-2 ring-[var(--hairline)]"
                      }`}
                  >
                    <div className="rounded-[calc(1.375rem-0.25rem)] bg-card p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-[13px]">{r.ref}</span>
                            <span className="text-[13px] text-ink-3">{r.desa}</span>
                            {r.flaggedDuplicate && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1
                                text-[10px] uppercase tracking-[0.1em] text-gold ring-1 ring-gold/20">
                                <Alert className="h-3 w-3" />
                                Mirip data lain
                              </span>
                            )}
                            {p && (
                              <span className={`text-[11px] ${p === "verified" ? "text-sage" : "text-clay"}`}>
                                {p === "verified" ? "Disetujui" : "Ditolak"}
                              </span>
                            )}
                          </div>
                          <p className="mt-2.5 text-[12px] text-ink-3">
                            {rupiah(r.pendapatanPerKapita)}/kapita · {r.jumlahTanggungan} tanggungan ·{" "}
                            {r.jumlahDisabilitasLansia} lansia/disabilitas · rumah {r.skorKondisiRumah}/5
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => setBuka(terbuka ? null : r.id)}
                            className="rounded-full bg-ink/[0.05] px-4 py-2 text-[12px] ring-1
                              ring-[var(--hairline)] transition-all duration-500
                              ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.09] active:scale-[0.97]"
                          >
                            {terbuka ? "Tutup" : "Rincian"}
                          </button>
                          <button
                            onClick={() => setPutusan((s) => ({ ...s, [r.id]: "verified" }))}
                            aria-label="Setujui"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-soft
                              text-sage ring-1 ring-sage/20 transition-all duration-500
                              ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setPutusan((s) => ({ ...s, [r.id]: "rejected" })); setBuka(r.id); }}
                            aria-label="Tolak"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-clay-soft
                              text-clay ring-1 ring-clay/20 transition-all duration-500
                              ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
                          >
                            <Cross className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div
                        className="grid transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                        style={{ gridTemplateRows: terbuka ? "1fr" : "0fr", opacity: terbuka ? 1 : 0 }}
                      >
                        <div className="overflow-hidden">
                          <div className="mt-5 border-t border-[var(--hairline)] pt-5">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                              {[
                                ["Hash NIK KK", `${r.nikKkHash.slice(0, 12)}···`],
                                ["Hash No. KK", `${r.noKkHash.slice(0, 12)}···`],
                                ["Akses pendidikan", `${r.skorAksesPendidikan}/5`],
                                ["Riwayat bansos", r.riwayatBansosSebelumnya ? "Pernah" : "Belum pernah"],
                              ].map(([k, v]) => (
                                <div key={k}>
                                  <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4">{k}</p>
                                  <p className="mt-1.5 font-mono text-[12px] text-ink-2">{v}</p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-5">
                              <p className="text-[12px] font-medium">
                                Alasan keputusan
                                {putusan[r.id] === "rejected" && <span className="ml-1 text-clay">*</span>}
                              </p>
                              <textarea
                                value={alasan[r.id] ?? ""}
                                onChange={(e) => setAlasan((s) => ({ ...s, [r.id]: e.target.value }))}
                                rows={2}
                                placeholder="Mis. sesuai hasil kunjungan lapangan 18 Agustus 2026"
                                className="mt-2 w-full resize-none rounded-2xl bg-paper-2 px-4 py-3 text-[13px]
                                  ring-1 ring-[var(--hairline)] outline-none transition-all duration-500
                                  ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-ink-4
                                  focus:bg-card focus:ring-sage/40"
                              />
                              <p className="mt-2.5 text-[11px] leading-relaxed text-ink-4">
                                Alasan ikut tersimpan di jejak audit bersama identitas verifikator dan
                                waktunya. Verifikator dapat menerima atau menolak data, tetapi tidak
                                pernah bisa menyunting skor TOPSIS secara langsung.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {tersaring.length === 0 && (
              <p className="mt-10 text-center text-[13px] text-ink-3">
                Tidak ada berkas yang cocok dengan penyaringan ini.
              </p>
            )}
          </div>
        </Bezel>
      </div>
    </section>
  );
}
