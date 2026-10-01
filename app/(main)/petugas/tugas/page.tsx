import { cookies } from "next/headers";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PetugasStatsGrid, PetugasTaskCards, ringkasanDariBaris } from "@/components/petugas/PetugasShared";
import { ApiClient } from "@/lib/api";
import { getPeriodeAktifId } from "@/lib/periode";

/** Jumlah kartu tugas yang ditampilkan di halaman ini. */
const KARTU_TUGAS = 6;

export default async function HalamanTugasPetugas() {
  const token = (await cookies()).get("sigap_token")?.value;
  const periodeId = await getPeriodeAktifId(token);

  // Tugas aktif = berkas yang belum diputuskan, yang ditandai mirip lebih dulu. Dua
  // permintaan kecil ke server (bukan memotong 100 baris acak di sini) supaya berkas
  // ditandai selalu masuk walau periode berisi ratusan data.
  const [ditandai, menunggu] = await Promise.all([
    ApiClient.rumahTangga.getAll({ periode_id: periodeId, status: "pending", flagged: true, limit: KARTU_TUGAS }, token),
    ApiClient.rumahTangga.getAll({ periode_id: periodeId, status: "pending", limit: KARTU_TUGAS }, token),
  ]);
  const idDitandai = new Set(ditandai.data.map((r) => r.id));
  const tugas = [...ditandai.data, ...menunggu.data.filter((r) => !idDitandai.has(r.id))].slice(0, KARTU_TUGAS);

  // Periode yang berkasnya hampir semua sudah diputuskan tetap menampilkan kartu
  // (berlabel "disetujui") alih-alih halaman kosong — itu perilaku sebelumnya, dan
  // tombol "Lihat identitas" di kartu dipakai e2e koreksi.
  if (tugas.length < KARTU_TUGAS) {
    const selesai = await ApiClient.rumahTangga.getAll(
      { periode_id: periodeId, status: "verified", limit: KARTU_TUGAS - tugas.length },
      token,
    );
    tugas.push(...selesai.data);
  }
  const ringkasan = ditandai.meta.ringkasan ?? ringkasanDariBaris([...ditandai.data, ...menunggu.data]);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Petugas"
          title="Daftar Tugas Wilayah"
          description="Antrean rumah tangga di wilayah tugas aktif yang perlu didata atau dilengkapi."
        />
      </div>

      <section className="px-4 pt-8 pb-16 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <PetugasStatsGrid ringkasan={ringkasan} />
        </div>
      </section>

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Reveal>
            <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Antrian wilayah</p>
                <h2 className="mt-4 text-[2rem]">Tugas aktif hari ini</h2>
              </div>
              <Button href="/petugas/pendataan">Mulai input baru</Button>
            </div>
          </Reveal>

          <div className="mt-8">
            <PetugasTaskCards items={tugas} />
          </div>
        </div>
      </section>
    </main>
  );
}
