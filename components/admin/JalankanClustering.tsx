"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ElbowChart } from "@/components/charts/ElbowChart";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ArrowRight } from "@/components/ui/Icons";
import { runClustering } from "@/lib/actions";
import { angka } from "@/lib/format";

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
  const [hasil, setHasil] = useState<{ sse: { k: number; sse: number }[]; iterations: number; kPakai: number } | null>(null);

  const jalankan = async () => {
    setMenjalankan(true);
    setGalat(null);
    try {
      const res = (await runClustering(periodeId, k)) as any;
      setHasil({ sse: res.elbow, iterations: res.iterations, kPakai: res.k });
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
            <p className="mt-4 text-[12px] leading-6 text-[var(--color-primary)]">
              Selesai — k={hasil.kPakai}, konvergen dalam {hasil.iterations} iterasi.
            </p>
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
