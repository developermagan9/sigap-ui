"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ElbowChart } from "@/components/charts/ElbowChart";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ArrowRight } from "@/components/ui/Icons";
import { runClustering } from "@/lib/actions";
import { angka } from "@/lib/format";

/** Tafsir kasar silhouette untuk pembaca non-teknis. Ambangnya konvensi umum
 *  (Kaufman & Rousseeuw), bukan aturan baku — karena itu kalimatnya berhati-hati. */
function tafsirSilhouette(nilai: number): string {
  if (nilai >= 0.7) return "cluster terpisah sangat jelas.";
  if (nilai >= 0.5) return "pemisahan cluster tergolong wajar.";
  if (nilai >= 0.25) return "struktur cluster lemah tapi masih terlihat.";
  return "cluster banyak tumpang tindih pada data ini.";
}

export function JalankanClustering({
  periodeId,
  defaultK,
  totalVerified,
}: {
  periodeId: string;
  defaultK: number;
  totalVerified: number;
}) {
  const router = useRouter();
  const [k, setK] = useState(defaultK);
  const [menjalankan, setMenjalankan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<{
    sse: { k: number; sse: number }[];
    iterations: number;
    kPakai: number;
    silhouette: number | null;
  } | null>(null);

  const jalankan = async () => {
    setMenjalankan(true);
    setGalat(null);
    try {
      const res = (await runClustering(periodeId, k)) as any;
      setHasil({
        sse: res.elbow,
        iterations: res.iterations,
        kPakai: res.k,
        silhouette: typeof res.silhouette_score === "number" ? res.silhouette_score : null,
      });
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal menjalankan clustering.");
    } finally {
      setMenjalankan(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <section className="rule-card h-full p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Konfigurasi</p>
          <h2 className="mt-4 text-[2rem]">Jalankan clustering</h2>
          <p className="mt-3 text-[13px] leading-6 text-[var(--color-ink-3)]">
            {angka(totalVerified)} rumah tangga terverifikasi siap dikelompokkan.
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[var(--color-ink-3)]">Jumlah cluster (k)</span>
              <input
                type="number"
                min={2}
                max={8}
                value={k}
                onChange={(e) => setK(+e.target.value)}
                className="w-24 border border-[var(--color-line)] bg-white px-3 py-2 text-[14px] outline-none focus:border-[var(--color-ink)]"
              />
            </label>
            <LoadingButton onClick={jalankan} loading={menjalankan} icon={<ArrowRight className="h-4 w-4" />}>
              Jalankan clustering
            </LoadingButton>
          </div>

          {galat && <p className="mt-4 text-[12px] leading-6 text-[var(--color-alert)]">{galat}</p>}
          {hasil && (
            <div className="mt-4 space-y-2">
              <p className="text-[12px] leading-6 text-[var(--color-primary)]">
                Selesai — k={hasil.kPakai}, konvergen dalam {hasil.iterations} iterasi.
              </p>
              {hasil.silhouette !== null && (
                <p className="text-[12px] leading-6 text-[var(--color-ink-3)]">
                  Silhouette score{" "}
                  <span className="font-mono text-[var(--color-ink)]">{hasil.silhouette.toFixed(3)}</span> —{" "}
                  {tafsirSilhouette(hasil.silhouette)} Coba beberapa nilai k dan bandingkan angkanya
                  sebelum memutuskan.
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="lg:col-span-5">
        <section className="rule-card h-full p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Elbow chart</p>
          {hasil ? (
            <>
              <h2 className="mt-4 text-[2rem]">Titik siku di k = {hasil.kPakai}</h2>
              <div className="mt-6">
                <ElbowChart data={hasil.sse} pilih={hasil.kPakai} />
              </div>
            </>
          ) : (
            <p className="mt-4 text-[13px] leading-6 text-[var(--color-ink-3)]">
              Kurva SSE vs k muncul setelah clustering dijalankan — datanya tidak disimpan server,
              cuma tersedia sesaat setelah dijalankan.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
