export type Role = "admin" | "verifikator" | "petugas" | "auditor" | "public";

export type MenuItem = {
  href: string;
  label: string;
  icon: string;
  /** Label ringkas untuk bottom-bar mobile yang lebarnya cuma ~90px per tab. */
  short?: string;
  /** Ikut tampil di bottom-bar mobile. Maksimal 4 per role supaya tetap terbaca. */
  primary?: boolean;
};

/**
 * Sumber tunggal menu navigasi: dipakai Sidebar (desktop), MobileDrawer
 * (hamburger di bawah lg), dan MobileNav (bottom-bar). Sebelumnya daftar ini
 * ditulis dua kali dan sempat menyimpang — menu mobile untuk admin cuma
 * memuat 3 dari 12 tujuan, jadi sebagian halaman tidak bisa dicapai sama
 * sekali dari ponsel.
 */
export const MENU_ITEMS: Record<Role, MenuItem[]> = {
  public: [
    { href: "/", label: "Beranda", icon: "ph:house-line-duotone", primary: true },
    { href: "/pencairan", label: "Pencairan", icon: "ph:currency-circle-dollar-duotone" },
    { href: "/transaksi", label: "Transaksi Publik", icon: "ph:link-duotone", short: "Transaksi", primary: true },
    { href: "/metodologi", label: "Metodologi", icon: "ph:math-operations-duotone" },
    { href: "/cek-status", label: "Cek Status Bansos", icon: "ph:magnifying-glass-duotone", short: "Cek", primary: true },
    { href: "/login", label: "Masuk", icon: "ph:sign-in-duotone", primary: true },
  ],
  admin: [
    { href: "/admin/periode", label: "Dashboard Program", icon: "ph:chart-bar-duotone", short: "Dashboard", primary: true },
    { href: "/admin/periode/baru", label: "Periode Baru", icon: "ph:plus-circle-duotone" },
    { href: "/admin/verifikasi", label: "Verifikasi Data", icon: "ph:check-circle-duotone", short: "Verifikasi", primary: true },
    { href: "/admin/sanggahan", label: "Sanggahan Data", icon: "ph:chat-centered-text-duotone" },
    { href: "/admin/clustering", label: "Analisis Clustering", icon: "ph:intersect-duotone" },
    { href: "/admin/clustering/hasil", label: "Hasil Clustering", icon: "ph:chart-scatter-duotone" },
    { href: "/admin/bobot", label: "Konfigurasi Bobot", icon: "ph:sliders-duotone" },
    { href: "/admin/ranking", label: "Hasil Ranking", icon: "ph:list-numbers-duotone", short: "Ranking", primary: true },
    { href: "/admin/approval", label: "Review & Approval", icon: "ph:seal-check-duotone" },
    { href: "/admin/on-chain", label: "Penyaluran On-chain", icon: "ph:currency-circle-dollar-duotone" },
    { href: "/admin/audit-log", label: "Audit Log", icon: "ph:clock-counter-clockwise-duotone" },
    { href: "/", label: "Portal Publik", icon: "ph:globe-hemisphere-west-duotone" },
  ],
  verifikator: [
    { href: "/admin/verifikasi", label: "Verifikasi Data", icon: "ph:check-circle-duotone", short: "Verifikasi", primary: true },
    { href: "/admin/sanggahan", label: "Sanggahan Data", icon: "ph:chat-centered-text-duotone", short: "Sanggahan", primary: true },
    { href: "/", label: "Portal Publik", icon: "ph:globe-hemisphere-west-duotone", short: "Publik", primary: true },
  ],
  // Role `auditor` ada di enum & seed sejak awal tapi tidak pernah punya menu —
  // praktis akun ini bisa login lalu terdampar. Sejak `GET /audit-log` mengizinkan
  // `auditor`, role ini akhirnya punya satu halaman yang benar-benar bisa dibuka.
  auditor: [
    { href: "/admin/audit-log", label: "Audit Log", icon: "ph:clock-counter-clockwise-duotone", short: "Audit", primary: true },
    { href: "/", label: "Portal Publik", icon: "ph:globe-hemisphere-west-duotone", short: "Publik", primary: true },
  ],
  petugas: [
    { href: "/petugas/tugas", label: "Tugas Pendataan", icon: "ph:clipboard-text-duotone", short: "Tugas", primary: true },
    { href: "/petugas/pendataan", label: "Form Input", icon: "ph:note-pencil-duotone", short: "Input", primary: true },
    { href: "/petugas/konfirmasi", label: "Konfirmasi", icon: "ph:paper-plane-tilt-duotone" },
    { href: "/petugas/riwayat", label: "Riwayat", icon: "ph:clock-counter-clockwise-duotone", primary: true },
    { href: "/", label: "Portal Publik", icon: "ph:globe-hemisphere-west-duotone", short: "Publik", primary: true },
  ],
};

export function menuFor(role: string): MenuItem[] {
  return MENU_ITEMS[(role as Role) || "public"] || MENU_ITEMS.public;
}

/** Subset untuk bottom-bar mobile. */
export function primaryMenuFor(role: string): MenuItem[] {
  return menuFor(role).filter((i) => i.primary);
}

/**
 * Longest-prefix-wins: dengan rute sibling seperti /admin/clustering dan
 * /admin/clustering/hasil, cocokkan hanya item yang paling spesifik supaya
 * tidak dua-duanya menyala sekaligus.
 */
export function activeHref(items: MenuItem[], pathname: string): string | undefined {
  return items
    .map((item) => item.href)
    .filter((href) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];
}
