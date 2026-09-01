import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Fallback Suspense untuk seluruh rute di grup `(main)`.
 *
 * Sejak portal publik dan halaman admin membaca data dari API (bukan lagi
 * pipeline mock yang dihitung saat build), render server benar-benar menunggu
 * jaringan — tanpa fallback, navigasi terasa menggantung tanpa umpan balik.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[78rem] px-4 py-8 sm:px-8">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-9 w-2/3 max-w-xl" />
      <Skeleton className="mt-3 h-4 w-1/2 max-w-md" />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rule-card p-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-5 h-8 w-28" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-3/4" />
          </div>
        ))}
      </div>

      <div className="rule-card mt-6 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="mt-4 h-4 w-full first:mt-0" />
        ))}
      </div>
    </div>
  );
}
