import { CekKlaim } from "@/components/klaim/CekKlaim";
import { PageHeader } from "@/components/ui/PageHeader";
import { PROGRAM, ringkasanPublik as R } from "@/lib/mock/data";
import { angka } from "@/lib/format";

export default function HalamanCekStatus() {
  return (
    <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="mb-8">
        <PageHeader
          eyebrow={`Cek Status · ${PROGRAM.periode}`}
          title="Cek Status Bantuan"
          description={`${angka(R.jumlahPenerima - R.jumlahTerklaim)} dari ${angka(R.jumlahPenerima)} penerima belum menarik dananya.`}
        />
      </div>

      <CekKlaim />
    </main>
  );
}
