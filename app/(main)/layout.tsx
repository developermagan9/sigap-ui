import { cookies } from "next/headers";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileNav } from "@/components/nav/MobileNav";
import { Topbar } from "@/components/nav/Topbar";
import { ApiClient } from "@/lib/api";
import { isSuperuser } from "@/lib/constants";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("sigap_role")?.value || "";
  const usernameCookie = cookieStore.get("sigap_username")?.value || "";
  const isSuper = isSuperuser(usernameCookie);
  const token = cookieStore.get("sigap_token")?.value;

  // Hitungan lonceng notifikasi. Gagal (API mati, token dicabut) tidak boleh
  // menjatuhkan seluruh layout — cukup tampil tanpa angka.
  let belumDibaca = 0;
  if (token && roleCookie) {
    try {
      belumDibaca = (await ApiClient.notifikasi.milikSaya({ belumDibaca: true, limit: 1 }, token)).belum_dibaca;
    } catch {
      belumDibaca = 0;
    }
  }

  return (
    <>
      <Sidebar initialRole={roleCookie} isSuper={isSuper} />

      <div className="lg:pl-72 xl:pl-80 flex flex-col min-h-dvh">
        <Topbar
          role={roleCookie}
          isSuper={isSuper}
          username={usernameCookie || "Guest"}
          belumDibaca={belumDibaca}
        />

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pt-5 pb-24 sm:px-6 lg:pb-10">
          {children}
        </main>

        <Footer />
      </div>

      <MobileNav initialRole={roleCookie} />
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] mt-auto px-4 py-8 sm:px-6">
      <div className="mx-auto flex flex-col gap-4 text-center text-xs text-[var(--color-ink-3)] sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>SIGAP-Bansos © 2026. Purwarupa Sistem Transparansi.</p>
        <p className="font-mono text-[10px] uppercase tracking-wider">K-Means · TOPSIS · Merkle</p>
      </div>
    </footer>
  );
}
