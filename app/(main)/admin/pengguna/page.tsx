import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormPenggunaBaru, KelolaWilayahPengguna } from "@/components/admin/KelolaWilayahPengguna";
import { ApiClient } from "@/lib/api";

export default async function HalamanPengguna() {
  const token = (await cookies()).get("sigap_token")?.value;
  const [users, semuaWilayah] = await Promise.all([ApiClient.users.getAll(token), ApiClient.wilayah.getAll(token)]);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Pengguna & Wilayah"
          description="Buat akun, atur role dan status aktif, reset password. Kewenangan verifikator dan petugas = wilayah utama + wilayah tambahan; verifikator tingkat kecamatan cukup satu akun dengan beberapa desa."
        />
      </div>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto flex max-w-[78rem] flex-col gap-6">
          <FormPenggunaBaru semuaWilayah={semuaWilayah} />
          {/* Admin tetap ditampilkan (role, status aktif, reset password), tapi tanpa
              panel wilayah tambahan — admin tidak dibatasi wilayah (wilayah-scope.ts). */}
          <KelolaWilayahPengguna users={users} semuaWilayah={semuaWilayah} />
        </div>
      </section>
    </main>
  );
}
