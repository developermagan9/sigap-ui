import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Bezel } from "@/components/ui/Bezel";
import { DaftarPeriode } from "@/components/admin/DaftarPeriode";
import { ArrowRight } from "@/components/ui/Icons";
import { getPeriodeAktif } from "@/lib/periode";
import { angka } from "@/lib/format";

/**
 * Daftar seluruh periode program.
 *
 * Sebelumnya rute ini hanya alias yang langsung redirect ke dashboard periode
 * aktif — praktis begitu ada lebih dari satu periode, tapi tidak ada tempat
 * lain untuk melihat periode-periode LAIN yang pernah dibuat, apalagi setelah
 * dropdown pemilih periode di topbar dihapus. Sekarang halaman ini yang jadi
 * pusatnya: tabel semua periode (status, pagu, alokasi) dengan tombol untuk
 * berpindah periode aktif dan tautan ke dashboard masing-masing.
 */
export default async function HalamanDaftarPeriode() {
  const token = (await cookies()).get("sigap_token")?.value;
  const { id: aktifId, daftar } = await getPeriodeAktif(token);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Periode Program"
          description={`${angka(daftar.length)} periode tercatat. Halaman admin lain (Bobot, Ranking, Verifikasi, dst) mengikuti periode aktif yang ditandai di bawah.`}
          actions={
            <Button href="/admin/periode/baru" icon={<ArrowRight className="h-[15px] w-[15px]" />}>
              Periode baru
            </Button>
          }
        />
      </div>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          {daftar.length === 0 ? (
            <Bezel>
              <div className="p-9 text-center">
                <p className="text-[13px] text-ink-3">Belum ada periode program.</p>
              </div>
            </Bezel>
          ) : (
            <DaftarPeriode daftar={daftar} aktifId={aktifId} />
          )}
        </div>
      </section>
    </main>
  );
}
