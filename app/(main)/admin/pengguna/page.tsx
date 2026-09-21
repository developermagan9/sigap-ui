import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui/PageHeader";
import { KelolaWilayahPengguna } from "@/components/admin/KelolaWilayahPengguna";
import { ApiClient } from "@/lib/api";

export default async function HalamanPengguna() {
  const token = (await cookies()).get("sigap_token")?.value;
  const [users, semuaWilayah] = await Promise.all([ApiClient.users.getAll(token), ApiClient.wilayah.getAll(token)]);
  // Admin tidak dibatasi wilayah (wilayah-scope.ts), jadi tidak ada yang bisa diatur untuknya.
  const dibatasi = users.filter((u) => u.role !== "admin");

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Pengguna & Wilayah"
          description="Kewenangan verifikator dan petugas = wilayah utama + wilayah tambahan di bawah. Verifikator tingkat kecamatan cukup satu akun dengan beberapa desa."
        />
      </div>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <KelolaWilayahPengguna users={dibatasi} semuaWilayah={semuaWilayah} />
        </div>
      </section>
    </main>
  );
}
