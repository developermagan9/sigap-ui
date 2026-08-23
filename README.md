# SIGAP-Bansos UI (Frontend)

Antarmuka web untuk **SIGAP-Bansos** — Sistem Distribusi Bantuan Sosial Tepat Sasaran Berbasis Data Mining & Blockchain. Dibangun dengan **Next.js 16 (App Router)** dan **Tailwind CSS**.

Tiga portal dalam satu aplikasi, dipisahkan lewat RBAC berbasis cookie (`proxy.ts`):
- **Publik** (`/`, `/cek-status`, `/metodologi`, `/transaksi`) — transparansi penyaluran dana, cek status klaim
- **Petugas** (`/petugas/*`) — pendataan warga, konfirmasi tugas, riwayat
- **Admin/Verifikator** (`/admin/*`, `/verifikator`) — konfigurasi periode program, clustering, ranking, approval, audit log

Dokumentasi produk & desain teknis lengkap ada di [`../docs`](../docs) (mulai dari [`00-README.md`](../docs/00-README.md)). Status implementasi terkini — termasuk halaman mana yang masih memakai data mock vs API sungguhan — ada di [`../docs/09-Implementation-Checklist.md`](../docs/09-Implementation-Checklist.md).

## Tech Stack
- **Next.js 16** (App Router, Route Handlers untuk proxy auth)
- **React 19**
- **Tailwind CSS 4**
- **Playwright** untuk e2e testing

## Prasyarat
- Node.js v18+
- Backend `sigap-api` harus sudah berjalan (default `http://localhost:3001`) — lihat [`../sigap-api/README.md`](../sigap-api/README.md)

## Cara Menjalankan

### 1. Instalasi Dependensi
Di dalam folder `sigap-ui`:
```bash
npm install
```

### 2. Konfigurasi Lingkungan (Environment)
Buat `.env.local` (opsional — nilai di bawah adalah default bila file ini tidak ada):
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/v1"
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000).

### 4. Build Produksi (opsional)
```bash
npm run build
npm run start
```

## Akun Demo
Login di `/login` (pastikan backend sudah di-seed — lihat [README backend](../sigap-api/README.md#akun-demo) untuk cara membuat akun demo per role). Akun super admin punya widget khusus di sidebar untuk berganti role (Admin/Verifikator/Petugas) tanpa logout-login ulang.

## Testing (Playwright)
Suite e2e ada di `e2e/`. Butuh backend + database berjalan (lihat setup di atas dan di [README backend](../sigap-api/README.md)), plus dev server frontend ini aktif di `:3000`.

Instalasi browser (sekali saja):
```bash
npx playwright install chromium
```

Jalankan test:
```bash
npx playwright test
```

Cakupan saat ini: `e2e/login.spec.ts` — login per role dan redirect-nya, kredensial salah, proteksi rute admin/petugas tanpa sesi, dan logout.
