import { cookies } from "next/headers";
import { RuangKerja } from "@/components/admin/RuangKerja";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { BobotList } from "@/components/admin/AdminShared";
import { ApiClient } from "@/lib/api";
import { getPeriodeAktifId } from "@/lib/periode";

export default async function HalamanBobot() {
  const token = (await cookies()).get("sigap_token")?.value;
  const periodeId = await getPeriodeAktifId(token);
  const [periode, ranking] = await Promise.all([
    ApiClient.periode.getById(periodeId, token),
    ApiClient.mining.getRanking(periodeId, token),
  ]);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Konfigurasi Bobot TOPSIS"
          description="Bobot resmi terpisah dari simulasi — uji dampak perubahan sebelum re-run ranking."
        />
      </div>

      <section className="px-4 pt-8 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <Reveal>
            <section className="rule-card p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Bobot resmi saat ini</p>
              <h2 className="mt-4 text-[2rem]">Empat kriteria, satu keputusan yang bisa diuji ulang</h2>
              <div className="mt-6">
                <BobotList bobot={periode.bobotKriteria} />
              </div>
            </section>
          </Reveal>
          <Reveal delay={80}>
            <section className="rule-card p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Catatan kebijakan</p>
              <ul className="mt-4 space-y-3 text-[13px] leading-6 text-[var(--color-ink-2)]">
                <li>Pendapatan per kapita diperlakukan sebagai cost utama.</li>
                <li>Jumlah tanggungan, disabilitas/lansia, dan kondisi rumah menjadi penyeimbang sosial.</li>
                <li>Total bobot harus tetap 100% sebelum ranking boleh dijalankan ulang.</li>
              </ul>
            </section>
          </Reveal>
        </div>
      </section>

      <section className="py-5">
        <RuangKerja
          periodeId={periodeId}
          initialBobot={periode.bobotKriteria}
          initialRanking={ranking.results as any}
          clusterIndexTarget={periode.clusterPrioritas}
          nominalDasar={periode.nominalDasar}
          terkunci={periode.status === "approved" || periode.status === "disbursed"}
        />
      </section>
    </main>
  );
}
