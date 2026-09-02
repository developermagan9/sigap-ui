import Image from "next/image";

/**
 * Logo SIGAP-Bansos. Sudah termasuk wordmark + tagline di dalam gambar, jadi
 * tidak perlu menulis ulang teks "SIGAP Bansos" di sebelahnya.
 *
 * - `variant="lockup"` (default): emblem + wordmark "SIGAP", horizontal. Ukuran
 *   diatur lewat `height` (lebar ikut rasio ~2.25:1). Untuk latar terang.
 * - `variant="mark"`: emblem saja, bujur sangkar. Ukuran lewat `height`.
 */
export function BrandMark({
  variant = "lockup",
  height = 40,
  className = "",
  priority = false,
}: {
  variant?: "lockup" | "mark";
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const isLockup = variant === "lockup";
  const width = isLockup ? Math.round(height * 2.247) : height;

  return (
    <Image
      src={isLockup ? "/logo-sigap.png" : "/logo-mark.png"}
      alt="SIGAP-Bansos"
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ width, height, objectFit: "contain" }}
    />
  );
}
