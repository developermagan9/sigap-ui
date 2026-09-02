import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Poppins } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

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
  title: "SIGAP | Sistem Integrasi Gerakan Akuntabilitas Penyaluran",
  description:
    "Penentuan prioritas penerima bansos secara objektif dengan K-Means + TOPSIS, dan penyaluran dana yang diaudit publik lewat smart contract.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${jakarta.variable} ${mono.variable} ${poppins.variable} ${inter.variable}`}
    >
      <body className="grain min-h-dvh antialiased">
        {/* Di root, bukan di (main)/layout: notifikasi hasil aksi harus tetap
            tampil setelah halaman berpindah, mis. "data tersimpan" yang dibaca
            di halaman riwayat setelah form pendataan ditinggalkan. */}
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
