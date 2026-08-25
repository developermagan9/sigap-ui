/** Placeholder pulsing untuk konten yang sedang dimuat — atur ukuran lewat `className` (mis. `h-4 w-32`). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-[var(--color-paper-2)] ${className}`} />;
}
