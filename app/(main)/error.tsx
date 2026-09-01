"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert, ArrowRight } from "@/components/ui/Icons";

/**
 * Jaring pengaman untuk error yang lolos sampai render Server Component —
 * termasuk 401 "Unauthorized" dari backend saat sesi kedaluwarsa (cookie dan
 * umur JWT sekarang disamakan di app/api/auth/login/route.ts, tapi token bisa
 * tetap basi kalau JWT_SECRET backend berganti, atau pengguna menutup laptop
 * lama lalu kembali persis di ambang detik terakhir masa berlaku).
 */
export default function ErrorBoundaryMain({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const sesiHabis = /unauthorized/i.test(error.message);

  useEffect(() => {
    if (sesiHabis) router.push("/login");
  }, [sesiHabis, router]);

  if (sesiHabis) {
    return (
      <main className="flex min-h-[60dvh] items-center justify-center px-4">
        <p className="text-[13px] text-ink-3">Sesi berakhir, mengarahkan ke halaman masuk…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[60dvh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[12px] border border-[var(--color-line)] bg-[var(--color-card)] p-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-clay-soft text-clay">
          <Alert className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-[1.3rem] tracking-[-0.02em] text-ink">Terjadi kesalahan</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
          Halaman gagal dimuat. Coba lagi, atau kembali ke beranda kalau masalahnya berulang.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} icon={<ArrowRight className="h-[15px] w-[15px]" />}>
            Coba lagi
          </Button>
          <Button variant="ghost" href="/">
            Ke beranda
          </Button>
        </div>
      </div>
    </main>
  );
}
