"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Alert, Check, Cross, Info } from "./Icons";

type Nada = "sukses" | "galat" | "info";

type Toast = {
  id: number;
  nada: Nada;
  judul: string;
  /** Baris kedua opsional — keterangan singkat, bukan daftar panjang. */
  pesan?: string;
  durasi: number;
  /** Sedang beranimasi keluar; barisnya dibuang setelah transisinya selesai. */
  keluar: boolean;
};

/** Galat butuh waktu baca lebih lama daripada konfirmasi berhasil. */
const DURASI: Record<Nada, number> = { sukses: 4000, galat: 6500, info: 5000 };

/** Harus sama dengan durasi transisi di ItemToast, supaya baris tidak hilang
 *  sebelum animasi keluarnya kelihatan. */
const DURASI_ANIMASI = 320;

type Isi = {
  sukses: (judul: string, pesan?: string) => void;
  galat: (judul: string, pesan?: string) => void;
  info: (judul: string, pesan?: string) => void;
};

const KonteksToast = createContext<Isi | null>(null);

/**
 * Notifikasi ringkas di kanan atas layar, masuk dan keluar dengan animasi.
 *
 * Dipasang di root layout supaya pesan tetap hidup saat halaman berpindah —
 * "data tersimpan" perlu terbaca di halaman riwayat yang dituju setelah simpan,
 * bukan ikut hilang bersama form yang ditinggalkan.
 *
 * Toast dipakai untuk hasil sebuah aksi (berhasil / gagal). Kesalahan yang
 * menempel pada satu kolom tetap ditampilkan di kolomnya sendiri — pesan yang
 * melayang di pojok tidak bisa menunjukkan kolom mana yang salah.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [daftar, setDaftar] = useState<Toast[]>([]);
  const berikutnya = useRef(0);

  const tutup = useCallback((id: number) => {
    setDaftar((d) => d.map((t) => (t.id === id ? { ...t, keluar: true } : t)));
    setTimeout(() => setDaftar((d) => d.filter((t) => t.id !== id)), DURASI_ANIMASI);
  }, []);

  const tambah = useCallback((nada: Nada, judul: string, pesan?: string) => {
    const id = ++berikutnya.current;
    // Maksimal tiga baris sekaligus: tumpukan yang lebih tinggi menutupi layar
    // dan yang paling bawah tidak sempat terbaca sebelum hilang sendiri.
    setDaftar((d) => [...d.slice(-2), { id, nada, judul, pesan, durasi: DURASI[nada], keluar: false }]);
  }, []);

  const isi = useRef<Isi>({
    sukses: (judul, pesan) => tambah("sukses", judul, pesan),
    galat: (judul, pesan) => tambah("galat", judul, pesan),
    info: (judul, pesan) => tambah("info", judul, pesan),
  }).current;

  return (
    <KonteksToast.Provider value={isi}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(23rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {daftar.map((t) => (
          <ItemToast key={t.id} toast={t} onTutup={tutup} />
        ))}
      </div>
    </KonteksToast.Provider>
  );
}

export function useToast(): Isi {
  const isi = useContext(KonteksToast);
  if (!isi) throw new Error("useToast harus dipakai di dalam <ToastProvider>.");
  return isi;
}

const GAYA: Record<Nada, { ring: string; ikon: string; Ikon: typeof Check }> = {
  sukses: { ring: "ring-sage/25", ikon: "bg-sage-soft text-sage", Ikon: Check },
  galat: { ring: "ring-clay/25", ikon: "bg-clay-soft text-clay", Ikon: Alert },
  info: { ring: "ring-[var(--hairline-strong)]", ikon: "bg-paper-2 text-ink-2", Ikon: Info },
};

function ItemToast({ toast, onTutup }: { toast: Toast; onTutup: (id: number) => void }) {
  // Dirender dulu dalam keadaan geser ke kanan + transparan, baru dinyalakan
  // satu frame setelahnya — tanpa jeda itu browser tidak punya keadaan awal
  // untuk ditransisikan dan toast langsung muncul tanpa animasi masuk.
  const [masuk, setMasuk] = useState(false);
  const [ditahan, setDitahan] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMasuk(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (ditahan || toast.keluar) return;
    const jam = setTimeout(() => onTutup(toast.id), toast.durasi);
    return () => clearTimeout(jam);
  }, [ditahan, toast.keluar, toast.id, toast.durasi, onTutup]);

  const { ring, ikon, Ikon } = GAYA[toast.nada];
  const terlihat = masuk && !toast.keluar;

  return (
    <div
      role={toast.nada === "galat" ? "alert" : "status"}
      // Kursor menahan hitungan mundur: pesan galat sering perlu dibaca ulang,
      // dan menghilang di tengah bacaan lebih menyebalkan daripada menumpuk.
      onMouseEnter={() => setDitahan(true)}
      onMouseLeave={() => setDitahan(false)}
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl bg-card p-4 shadow-lg ring-1 ${ring}
        transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none
        ${terlihat ? "translate-x-0 opacity-100" : "translate-x-[110%] opacity-0"}`}
    >
      <span className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ikon}`}>
        <Ikon className="h-3.5 w-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium leading-[1.5] text-ink">{toast.judul}</p>
        {toast.pesan && <p className="mt-1 text-[12px] leading-[1.55] text-ink-3">{toast.pesan}</p>}
      </div>

      <button
        type="button"
        onClick={() => onTutup(toast.id)}
        aria-label="Tutup notifikasi"
        className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-4
          transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.06]
          hover:text-ink-2 active:scale-90"
      >
        <Cross className="h-3 w-3" />
      </button>
    </div>
  );
}
