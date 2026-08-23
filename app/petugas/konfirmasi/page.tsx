import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Check } from "@/components/ui/Icons";
import { PetugasAsideSummary, PetugasHero, PetugasSubnav, SummaryRow } from "@/components/petugas/PetugasShared";
import { rupiah } from "@/lib/format";

export default function HalamanKonfirmasiPetugas() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <PetugasSubnav />

      <PetugasHero
        eyebrow="Portal Petugas · Konfirmasi & Kirim"
        title={
          <>
            Periksa ulang
            <br />
            sebelum kirim.
          </>
        }
        body={
          <>
            Layar ini merangkum hasil input petugas sebelum disimpan. Tujuannya menekan revisi yang
            tidak perlu dan memberi sinyal jelas bahwa sistem akan tetap mengecek duplikasi otomatis
            setelah data dikirim.
          </>
        }
        aside={<PetugasAsideSummary />}
      />

      <section className="px-4 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Reveal>
            <section className="rule-card p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Ringkasan draft</p>
              <h2 className="mt-4 text-[2rem]">Satu KK siap dikirim ke verifikator</h2>

              <dl className="mt-6 space-y-4 text-[13px]">
                <SummaryRow label="Wilayah" value="Sukamaju" />
                <SummaryRow label="No. KK" value="3273 xxxx xxxx xxxx" />
                <SummaryRow label="Anggota keluarga" value="4 jiwa" mono />
                <SummaryRow label="Jumlah tanggungan" value="3 orang" mono />
                <SummaryRow label="Pendapatan rumah tangga" value={rupiah(2_500_000)} mono />
                <SummaryRow label="Status awal" value="pending review" />
              </dl>

              <div className="mt-8 border-t border-[var(--color-line)] pt-6">
                <div className="flex items-start gap-3 border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
                  <Check className="mt-0.5 h-4 w-4 text-[var(--color-primary)]" />
                  <p className="text-[13px] leading-6 text-[var(--color-ink-2)]">
                    Setelah dikirim, sistem akan mengecek duplikasi NIK kepala keluarga, nomor KK,
                    dan anggota keluarga sebelum masuk antrian verifikator.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/petugas/riwayat">Kirim ke verifikator</Button>
                  <Button href="/petugas/pendataan" variant="ghost">Kembali edit data</Button>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={80}>
            <aside className="rule-card p-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Lampiran minimum</p>
              <ul className="mt-4 space-y-3 text-[13px] leading-6 text-[var(--color-ink-2)]">
                <li>Foto KK atau dokumen pendukung.</li>
                <li>Catatan kondisi rumah bila skor di bawah ambang layak.</li>
                <li>Keterangan khusus untuk lansia atau penyandang disabilitas.</li>
                <li>Konfirmasi petugas bahwa titik lokasi sudah sesuai wilayah tugas.</li>
              </ul>
            </aside>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
