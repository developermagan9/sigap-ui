"use client";

import { useState } from "react";
import { angka, rupiahRingkas } from "@/lib/format";

export type ClusterAgregat = {
  clusterIndex: number;
  label: string;
  jumlahAnggota: number;
  centroid: Record<string, number>;
};

export type TitikRumahTangga = {
  pendapatanPerKapita: number;
  jumlahTanggungan: number;
  clusterIndex: number;
};

/**
 * Warna kategorikal 4-slot (biru/oranye/aqua/ungu) — divalidasi lolos semua
 * pengecekan all-pairs (CVD + normal-vision floor) lewat validator skill
 * dataviz untuk mode terang; palet warna cluster lama (--color-c0..c3) gagal
 * di floor normal-vision (Cukup Mampu vs Mampu nyaris tak terbedakan).
 */
const WARNA = ["#2a78d6", "#eb6834", "#1baf7a", "#4a3aa7"];

const W = 640;
const H = 380;
const PAD = { l: 64, r: 24, t: 24, b: 48 };
const R_MIN = 22;
const R_MAX = 58;

/** Jitter vertikal kecil, deterministik dari index — tanggungan cuma bilangan
 *  bulat jadi tanpa ini ratusan titik akan bertumpuk persis di baris yang sama. */
function jitter(i: number, amp: number) {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * 2 * amp;
}

export function ClusterBubbleChart({
  clusters,
  households = [],
}: {
  clusters: ClusterAgregat[];
  households?: TitikRumahTangga[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [aktif, setAktif] = useState<number | null>(null);
  const [mode, setMode] = useState<"ringkas" | "sebaran">("ringkas");

  const data = [...clusters].sort((a, b) => a.clusterIndex - b.clusterIndex);
  if (data.length === 0) return null;

  const punyaTitik = households.length > 0;
  const tampilTitik = mode === "sebaran" && punyaTitik;

  const maxX =
    Math.max(
      ...data.map((d) => d.centroid.pendapatanPerKapita),
      ...(punyaTitik ? households.map((h) => h.pendapatanPerKapita) : []),
    ) * 1.15;
  const maxY =
    Math.max(
      ...data.map((d) => d.centroid.jumlahTanggungan),
      ...(punyaTitik ? households.map((h) => h.jumlahTanggungan) : []),
    ) * 1.3 || 1;
  const maxN = Math.max(...data.map((d) => d.jumlahAnggota)) || 1;

  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const sx = (v: number) => PAD.l + (v / maxX) * plotW;
  const sy = (v: number) => H - PAD.b - (v / maxY) * plotH;
  const sr = (n: number) => R_MIN + (R_MAX - R_MIN) * Math.sqrt(n / maxN);

  const tickX = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxX);
  const tickY = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxY);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {data.map((d) => (
            <button
              key={d.clusterIndex}
              type="button"
              onMouseEnter={() => setAktif(d.clusterIndex)}
              onMouseLeave={() => setAktif(null)}
              onClick={() => setAktif((v) => (v === d.clusterIndex ? null : d.clusterIndex))}
              className="group flex items-center gap-2 text-[11px] text-ink-2 transition-opacity duration-300"
              style={{ opacity: aktif === null || aktif === d.clusterIndex ? 1 : 0.35 }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full transition-transform duration-300 group-hover:scale-125"
                style={{ background: WARNA[d.clusterIndex % WARNA.length] }}
              />
              {d.label}
            </button>
          ))}
        </div>

        {punyaTitik && (
          <div className="flex rounded-md border border-[var(--color-line)] p-0.5 text-[11px]">
            {(["ringkas", "sebaran"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded px-2.5 py-1 transition-colors ${
                  mode === m ? "bg-[var(--color-ink)] text-white" : "text-ink-3 hover:text-ink"
                }`}
              >
                {m === "ringkas" ? "Ringkas" : "Sebaran"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label="Sebaran cluster berdasarkan pendapatan per kapita dan jumlah tanggungan"
        >
          {tickY.map((t, i) => (
            <g key={`gy${i}`}>
              <line x1={PAD.l} x2={W - PAD.r} y1={sy(t)} y2={sy(t)} stroke="var(--hairline)" strokeWidth={1} />
              <text x={PAD.l - 10} y={sy(t) + 3.5} textAnchor="end" className="fill-ink-4 text-[9px] tnum">
                {t.toFixed(1)}
              </text>
            </g>
          ))}
          {tickX.map((t, i) => (
            <text key={`tx${i}`} x={sx(t)} y={H - PAD.b + 18} textAnchor="middle" className="fill-ink-4 text-[9px] tnum">
              {rupiahRingkas(t)}
            </text>
          ))}

          {tampilTitik &&
            households.map((h, i) => {
              const redup = aktif !== null && aktif !== h.clusterIndex;
              return (
                <circle
                  key={i}
                  cx={sx(h.pendapatanPerKapita)}
                  cy={sy(Math.max(0, h.jumlahTanggungan + jitter(i, 0.22)))}
                  r={2.6}
                  fill={WARNA[h.clusterIndex % WARNA.length]}
                  opacity={redup ? 0.06 : 0.55}
                  className="pointer-events-none transition-opacity duration-300"
                />
              );
            })}

          {data.map((d) => {
            const cx = sx(d.centroid.pendapatanPerKapita);
            const cy = sy(d.centroid.jumlahTanggungan);
            const r = tampilTitik ? 10 : sr(d.jumlahAnggota);
            const redup = aktif !== null && aktif !== d.clusterIndex;
            const warna = WARNA[d.clusterIndex % WARNA.length];
            const isHover = hover === d.clusterIndex;

            return (
              <g key={d.clusterIndex}>
                {/* hit target: minimal 24px, lebih besar dari bubble kecil */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={Math.max(r, 14)}
                  fill="transparent"
                  onMouseEnter={() => setHover(d.clusterIndex)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(d.clusterIndex)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.label}: ${angka(d.jumlahAnggota)} keluarga`}
                  className="cursor-pointer outline-none"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={tampilTitik ? "var(--color-paper)" : warna}
                  stroke={warna}
                  strokeWidth={tampilTitik ? 3 : 2}
                  className="pointer-events-none transition-all duration-300"
                  style={{
                    opacity: redup ? 0.12 : isHover ? 1 : tampilTitik ? 0.95 : 0.72,
                    stroke: tampilTitik ? warna : "var(--color-paper)",
                  }}
                />
                {!tampilTitik && (
                  <>
                    <text
                      x={cx}
                      y={cy - 3}
                      textAnchor="middle"
                      className="pointer-events-none fill-white text-[11px] font-medium"
                      style={{ opacity: redup ? 0 : 1 }}
                    >
                      {angka(d.jumlahAnggota)}
                    </text>
                    <text
                      x={cx}
                      y={cy + 11}
                      textAnchor="middle"
                      className="pointer-events-none fill-white text-[8.5px] uppercase tracking-[0.06em]"
                      style={{ opacity: redup ? 0 : 0.85 }}
                    >
                      KK
                    </text>
                  </>
                )}
              </g>
            );
          })}

          <text x={PAD.l} y={H - 6} className="fill-ink-4 text-[9px] uppercase tracking-[0.16em]">
            Pendapatan per kapita{!tampilTitik ? " (rata-rata)" : ""}
          </text>
          <text
            x={-(H / 2)}
            y={16}
            transform="rotate(-90)"
            textAnchor="middle"
            className="fill-ink-4 text-[9px] uppercase tracking-[0.16em]"
          >
            Jumlah tanggungan{!tampilTitik ? " (rata-rata)" : ""}
          </text>
        </svg>

        {hover !== null && (
          <TooltipCluster d={data.find((d) => d.clusterIndex === hover)!} warna={WARNA[hover % WARNA.length]} />
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-ink-4">
        {tampilTitik ? (
          <>
            Tiap titik kecil = satu rumah tangga terverifikasi (pendapatan × tanggungan asli, dengan jitter
            vertikal kecil supaya tidak bertumpuk), diwarnai per cluster. Warnanya hasil klasifikasi ke
            centroid resmi terdekat — pendekatan, bukan assignment asli hasil training K-Means, karena
            backend tidak menyimpan cluster per rumah tangga. Lingkaran bercincin = centroid resmi tiap
            cluster.
          </>
        ) : (
          <>
            Posisi lingkaran = centroid cluster (pendapatan × tanggungan). Ukuran = jumlah anggota. Data
            agregat hasil K-Means, bukan titik per rumah tangga — assignment individual belum disimpan di
            backend.
          </>
        )}
      </p>
    </div>
  );
}

function TooltipCluster({ d, warna }: { d: ClusterAgregat; warna: string }) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 w-56 rounded-lg border border-[var(--color-line)] bg-[var(--color-card)] p-3.5 lift-2">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: warna }} />
        <p className="text-[12px] font-medium text-ink">{d.label}</p>
      </div>
      <p className="mt-1 text-[11px] text-ink-3">{angka(d.jumlahAnggota)} keluarga</p>
      <dl className="mt-2.5 space-y-1.5 border-t border-[var(--hairline)] pt-2.5 text-[11px]">
        <Baris label="Pendapatan/kapita" value={rupiahRingkas(d.centroid.pendapatanPerKapita)} />
        <Baris label="Tanggungan" value={d.centroid.jumlahTanggungan.toFixed(1)} />
        <Baris label="Disabilitas/lansia" value={d.centroid.jumlahDisabilitasLansia.toFixed(1)} />
        <Baris label="Kondisi rumah" value={`${d.centroid.skorKondisiRumah.toFixed(1)} / 5`} />
      </dl>
    </div>
  );
}

function Baris({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-4">{label}</dt>
      <dd className="tnum font-mono text-ink-2">{value}</dd>
    </div>
  );
}
