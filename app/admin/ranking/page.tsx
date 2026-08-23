import { RuangKerja } from "@/components/admin/RuangKerja";
import { AdminAsideSummary, AdminHero, AdminSubnav } from "@/components/admin/AdminShared";

export default function HalamanRanking() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <AdminSubnav />

      <AdminHero
        eyebrow="Portal Admin · Hasil Ranking Draft"
        title={
          <>
            Ranking harus dibaca
            <br />
            sampai ke cutoff.
          </>
        }
        body={
          <>
            Halaman ini fokus pada daftar ranking draft, perubahan urutan akibat simulasi, dan panel
            explainability untuk tiap rumah tangga anonim. Tujuan utamanya bukan hanya melihat siapa
            peringkat atas, tetapi juga siapa yang tepat berada di batas kuota.
          </>
        }
        aside={<AdminAsideSummary />}
      />

      <section className="py-5">
        <RuangKerja />
      </section>
    </main>
  );
}
