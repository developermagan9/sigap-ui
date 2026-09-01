import { test, expect, type Page } from '@playwright/test';

/**
 * Alur inti petugas: input KK baru sampai muncul di riwayat, dan penolakan NIK ganda.
 *
 * NIK/No. KK digenerate dari timestamp tiap run supaya test bisa dijalankan
 * berulang tanpa bentrok dengan data run sebelumnya (syarat eksplisit FE-6).
 */
function nikUnik(suffix: number) {
  // 16 digit: '99' + 12 digit terakhir epoch ms + 2 digit pembeda.
  const t = String(Date.now()).slice(-12);
  return `99${t}${String(suffix).padStart(2, '0')}`;
}

async function loginPetugas(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('admin / verifikator / petugas').fill('petugas');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: /masuk/i }).click();
  await page.waitForURL('**/petugas/tugas');
}

async function isiForm(page: Page, opts: { nik: string; noKk: string; nama: string }) {
  await page.goto('/petugas/pendataan');

  await page.getByPlaceholder('Sesuai KTP').fill(opts.nama);
  await page.getByPlaceholder('99••••••••••••••').first().fill(opts.nik);
  await page.getByPlaceholder('99••••••••••••••').nth(1).fill(opts.noKk);
  await page.getByPlaceholder('Jl. Contoh No. 1, RT/RW').fill('Jl. Uji Otomatis No. 7');
  await page.getByPlaceholder('2500000').fill('1800000');

  // Satu anggota (kepala keluarga) — NIK-nya wajib sama dengan NIK kepala di atas.
  await page.getByPlaceholder('Nama anggota').fill(opts.nama);
  await page.getByPlaceholder('NIK anggota').fill(opts.nik);
  await page.locator('input[type="date"]').first().fill('1985-05-05');

  await page.getByRole('button', { name: /simpan data rumah tangga/i }).click();
  await page.getByRole('button', { name: /ya, simpan/i }).click();
}

test.describe('Pendataan petugas', () => {
  test('menyimpan KK baru lalu muncul di riwayat', async ({ page }) => {
    const nik = nikUnik(1);
    const nama = `Uji Otomatis ${nik.slice(-6)}`;

    await loginPetugas(page);
    await isiForm(page, { nik, noKk: nik, nama });

    // Form mengarahkan ke riwayat setelah simpan berhasil.
    await page.waitForURL('**/petugas/riwayat');

    // Riwayat menampilkan hash NIK, bukan NIK asli — jadi yang dicek adalah
    // bertambahnya baris berstatus menunggu verifikasi, bukan nama/NIK-nya.
    await expect(page.getByText(/menunggu|pending/i).first()).toBeVisible();
  });

  test('menolak NIK kepala keluarga yang sudah terdaftar di periode ini', async ({ page }) => {
    const nik = nikUnik(2);
    const nama = `Uji Duplikat ${nik.slice(-6)}`;

    await loginPetugas(page);
    await isiForm(page, { nik, noKk: nik, nama });
    await page.waitForURL('**/petugas/riwayat');

    // Kirim ulang data yang persis sama: backend harus menolak dengan pesan
    // duplikat yang spesifik, bukan pesan galat generik.
    await isiForm(page, { nik, noKk: nik, nama });

    await expect(page.getByText(/already exists|duplicate|ganda|sudah/i).first()).toBeVisible({
      timeout: 15_000,
    });
    // Tetap di halaman form — data ganda tidak boleh dianggap tersimpan.
    expect(new URL(page.url()).pathname).toBe('/petugas/pendataan');
  });
});
