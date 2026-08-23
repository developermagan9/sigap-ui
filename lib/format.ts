export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const rupiahRingkas = (n: number) => {
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)} M`;
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} jt`;
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)} rb`;
  return `Rp${n}`;
};

export const angka = (n: number) => new Intl.NumberFormat("id-ID").format(n);

export const persen = (n: number, digit = 0) =>
  `${(n * 100).toLocaleString("id-ID", { minimumFractionDigits: digit, maximumFractionDigits: digit })}%`;

export const pendek = (h: string, kepala = 6, ekor = 4) =>
  h.length <= kepala + ekor + 2 ? h : `${h.slice(0, kepala)}···${h.slice(-ekor)}`;

export const waktu = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
};

export const WARNA_CLUSTER = ["var(--color-c0)", "var(--color-c1)", "var(--color-c2)", "var(--color-c3)"];
