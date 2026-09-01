import { CekKlaim } from "@/components/klaim/CekKlaim";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiClient } from "@/lib/api";
import { angka } from "@/lib/format";

export default async function HalamanCekStatus() {
  const programs = await ApiClient.public.getPrograms();
  const terbaru = programs[0];
  const detail = terbaru ? await ApiClient.public.getProgramDetail(terbaru.id) : null;

  const belumKlaim = detail ? detail.jumlah_penerima - detail.jumlah_terklaim : 0;

  return (
    <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="mb-8">
        <PageHeader
          eyebrow={detail ? `Cek Status · ${detail.nama_program}` : "Cek Status"}
          title="Cek Status Bantuan"
          description={
            detail
              ? `${angka(belumKlaim)} dari ${angka(detail.jumlah_penerima)} penerima belum menarik dananya.`
              : "Belum ada periode yang disahkan — pencarian akan mengembalikan data kosong."
          }
        />
      </div>

      <CekKlaim />
    </main>
  );
}
