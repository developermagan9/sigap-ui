import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormWilayah } from "@/components/admin/FormWilayah";
import { ApiClient } from "@/lib/api";
import { angka } from "@/lib/format";

/** Kelola wilayah (item E) — sebelumnya `POST /wilayah` tidak pernah dipanggil UI mana pun. */
export default async function HalamanWilayah() {
  const token = (await cookies()).get("sigap_token")?.value;
  const wilayah = await ApiClient.wilayah.getAll(token);

  // Prefill form dengan provinsi/kabupaten/kecamatan yang paling terakhir dipakai,
  // supaya menambah desa di kecamatan yang sama tidak perlu menelusuri ulang.
  // Dipilih dari baris ber-`kode` terakhir: baris lama tanpa kode tidak bisa
  // dipakai untuk memposisikan dropdown bertingkat.
  const terakhir = [...wilayah].reverse().find((w) => w.kode);
  const awal = terakhir?.kode
    ? {
        provinsi: terakhir.kode.substring(0, 2),
        kabupaten: terakhir.kode.substring(0, 5),
        kecamatan: terakhir.kode.substring(0, 8),
      }
    : undefined;

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Wilayah Kerja"
          description={`${angka(wilayah.length)} desa/kelurahan terdaftar. Wilayah baru langsung bisa dipilih di form pendataan petugas.`}
        />
      </div>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <FormWilayah awal={awal} />
          </div>

          <div className="lg:col-span-7">
            <section className="rule-card overflow-hidden p-0">
              <div className="border-b border-[var(--color-line)] bg-[var(--color-canvas)] p-4">
                <h3 className="font-heading text-base font-semibold">Daftar wilayah</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-line)] text-left">
                      {["Kode", "Desa / Kelurahan", "Kecamatan", "Kabupaten", "Provinsi"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-4)]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {wilayah.map((w) => (
                      <tr key={w.id} className="border-b border-[var(--color-line)] last:border-b-0">
                        <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-ink-3)]">
                          {w.kode ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[var(--color-ink)]">{w.desa}</td>
                        <td className="px-4 py-3 text-[13px] text-[var(--color-ink-2)]">{w.kecamatan}</td>
                        <td className="px-4 py-3 text-[13px] text-[var(--color-ink-2)]">{w.kabupaten}</td>
                        <td className="px-4 py-3 text-[13px] text-[var(--color-ink-2)]">{w.provinsi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
