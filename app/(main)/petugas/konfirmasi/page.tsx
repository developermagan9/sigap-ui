import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Check } from "@/components/ui/Icons";
import { PageHeader } from "@/components/ui/PageHeader";

export default function HalamanKonfirmasiPetugas() {
  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Petugas"
          title="Konfirmasi & Kirim"
          description="Data rumah tangga sekarang dikirim langsung dari Form Input KK — tidak ada tahap tinjau terpisah."
        />
      </div>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Reveal>
            <section className="rule-card p-6 sm:p-8">
              <div className="flex items-start gap-3 border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
                <Check className="mt-0.5 h-4 w-4 text-[var(--color-primary)]" />
                <p className="text-[13px] leading-6 text-[var(--color-ink-2)]">
                  Tombol &ldquo;Simpan data rumah tangga&rdquo; di halaman Form Input KK sudah memicu
                  pengecekan duplikasi NIK kepala keluarga, No. KK, dan tiap anggota secara langsung —
                  begitu tersimpan, entri langsung masuk antrean verifikator dan bisa dipantau dari
                  halaman Riwayat.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/petugas/pendataan">Buka Form Input KK</Button>
                <Button href="/petugas/riwayat" variant="ghost">Lihat Riwayat</Button>
              </div>
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
