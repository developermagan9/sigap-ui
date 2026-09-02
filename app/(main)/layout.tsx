import { cookies } from "next/headers";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileNav } from "@/components/nav/MobileNav";
import { Topbar } from "@/components/nav/Topbar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("sigap_role")?.value || "";
  const usernameCookie = cookieStore.get("sigap_username")?.value || "";
  const isSuper = usernameCookie === "ITSUP";

  return (
    <>
      <Sidebar initialRole={roleCookie} isSuper={isSuper} />

      <div className="lg:pl-72 xl:pl-80 flex flex-col min-h-dvh">
        <Topbar
          role={isSuper ? "Super Administrator" : roleCookie}
          username={usernameCookie || "Guest"}
        />

        <main className="container-app mx-auto w-full max-w-[1600px] px-4 sm:px-6 pt-5 pb-24 lg:pb-10 flex-1">
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
