import { Button } from "@/components/ui/Button";
import { ArrowRight, Search } from "@/components/ui/Icons";

/**
 * Pengganti halaman 404 bawaan Next.js untuk seluruh rute di grup `(main)`.
 *
 * Dipicu `notFound()` dari halaman publik (`metodologi`, `program/[id]`, dst)
 * saat belum ada periode program berstatus `approved`/`disbursed` — bukan
 * cuma "URL salah ketik". Kalau tetap pakai halaman bawaan Next.js, pesannya
 * ("This page could not be found.") menyesatkan: pengguna/developer mengira
 * route-nya salah, padahal penyebabnya data belum ada. Halaman ini juga jadi
 * fallback untuk route yang benar-benar tidak ada (mis. `admin/periode/[id]`
 * dengan UUID yang salah).
 */
export default function NotFoundMain() {
  return (
    <main className="flex min-h-[60dvh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[12px] border border-[var(--color-line)] bg-[var(--color-card)] p-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-paper-2)] text-[var(--color-ink-3)]">
          <Search className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-[1.3rem] tracking-[-0.02em] text-ink">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
          Bisa jadi alamatnya salah, atau untuk halaman program publik: belum ada periode program
          yang disahkan dan tersedia untuk ditampilkan.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button href="/" icon={<ArrowRight className="h-[15px] w-[15px]" />}>
            Ke beranda
          </Button>
          <Button variant="ghost" href="/cek-status">
            Cek status pencairan
          </Button>
        </div>
      </div>
    </main>
  );
}
