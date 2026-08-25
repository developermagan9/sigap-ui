import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Poppins } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileNav } from "@/components/nav/MobileNav";
import { Topbar } from "@/components/nav/Topbar";

const fraunces = localFont({
  src: "./fonts/Fraunces.woff2",
  variable: "--font-fraunces",
  weight: "300 900",
  display: "swap",
});

const jakarta = localFont({
  src: "./fonts/PlusJakartaSans.woff2",
  variable: "--font-jakarta",
  weight: "300 800",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/JetBrainsMono.woff2",
  variable: "--font-mono-jb",
  weight: "300 700",
  display: "swap",
});

// Dipakai khusus di dalam .font-system (halaman admin/petugas) — lihat globals.css.
// Portal publik tetap pakai Fraunces/Jakarta di atas.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIGAP-Bansos — Distribusi Bantuan Sosial Tepat Sasaran",
  description:
    "Penentuan prioritas penerima bansos secara objektif dengan K-Means + TOPSIS, dan penyaluran dana yang diaudit publik lewat smart contract.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("sigap_role")?.value || "";
  const usernameCookie = cookieStore.get("sigap_username")?.value || "";
  const isSuper = usernameCookie === "ITSUP";

  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${jakarta.variable} ${mono.variable} ${poppins.variable} ${inter.variable}`}
    >
      <body className="grain min-h-dvh antialiased">
        <Sidebar initialRole={roleCookie} isSuper={isSuper} />
        
        <div className="lg:pl-72 xl:pl-80 flex flex-col min-h-dvh">
          <Topbar role={isSuper ? "Super Administrator" : roleCookie} username={usernameCookie || "Guest"} />
          
          <main className="container-app mx-auto w-full max-w-[1600px] px-4 sm:px-6 pt-5 pb-24 lg:pb-10 flex-1">
            {children}
          </main>
          
          <Footer />
        </div>

        <MobileNav initialRole={roleCookie} />
      </body>
    </html>
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
