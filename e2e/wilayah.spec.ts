import { test, expect } from '@playwright/test';

/**
 * Dropdown alamat bertingkat di form input KK (`/petugas/pendataan`).
 *
 * Sebelumnya ini diuji di `/admin/wilayah`; halaman itu dihapus — wilayah kerja
 * tidak lagi didaftarkan admin lebih dulu, alamatnya dipilih petugas langsung
 * saat pendataan dan barisnya dibuat backend dari kode desa.
 *
 * Yang dijaga: memilih satu tingkat harus MEMPERSEMPIT tingkat berikutnya ke
 * anak-anaknya saja — memilih DI Yogyakarta menghasilkan lima kabupaten/kota
 * DIY, bukan 514 se-Indonesia. Itu inti dari memakai referensi Kepmendagri;
 * kalau cascade-nya putus, form kembali jadi daftar datar yang tidak berguna.
 */

async function loginPetugas(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('admin / verifikator / petugas').fill('petugas');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: /masuk/i }).click();
  await page.waitForURL('**/petugas/tugas');
}

/** `<select>` satu tingkat, dikenali lewat atribut `name`-nya.
 *  Bukan lewat teks label: hint tingkat berikutnya berbunyi "pilih kabupaten /
 *  kota dulu", jadi filter teks "Kabupaten / Kota" ikut menangkap select
 *  Kecamatan dan locator-nya jadi ambigu. */
function pilihan(page: import('@playwright/test').Page, tingkat: string) {
  return page.locator(`select[name="wilayah-${tingkat}"]`);
}

test.describe('Wilayah bertingkat di form pendataan', () => {
  test.beforeEach(async ({ page }) => {
    await loginPetugas(page);
    await page.goto('/petugas/pendataan');
  });

  test('provinsi terisi dari referensi nasional', async ({ page }) => {
    const provinsi = pilihan(page, 'provinsi');
    // 38 provinsi + satu opsi placeholder.
    await expect(async () => {
      expect(await provinsi.locator('option').count()).toBe(39);
    }).toPass();
    await expect(provinsi.locator('option', { hasText: 'Daerah Istimewa Yogyakarta' })).toHaveCount(1);
  });

  test('memilih DIY mempersempit kabupaten ke lima wilayah DIY saja', async ({ page }) => {
    const provinsi = pilihan(page, 'provinsi');
    await expect(async () => {
      expect(await provinsi.locator('option').count()).toBe(39);
    }).toPass();

    await provinsi.selectOption({ label: 'Daerah Istimewa Yogyakarta' });

    const kabupaten = pilihan(page, 'kabupaten');
    await expect(async () => {
      expect(await kabupaten.locator('option').count()).toBe(6); // 5 + placeholder
    }).toPass();

    const nama = await kabupaten.locator('option').allTextContents();
    expect(nama).toContain('Kabupaten Sleman');
    expect(nama).toContain('Kota Yogyakarta');
    // Yang paling penting: TIDAK ada kabupaten dari provinsi lain.
    expect(nama).not.toContain('Kabupaten Bandung');
  });

  test('cascade sampai desa dan menampilkan kode wilayahnya', async ({ page }) => {
    const provinsi = pilihan(page, 'provinsi');
    await expect(async () => {
      expect(await provinsi.locator('option').count()).toBe(39);
    }).toPass();

    await provinsi.selectOption({ label: 'Daerah Istimewa Yogyakarta' });
    const kabupaten = pilihan(page, 'kabupaten');
    await expect(async () => {
      expect(await kabupaten.locator('option').count()).toBeGreaterThan(1);
    }).toPass();

    await kabupaten.selectOption({ label: 'Kabupaten Sleman' });
    const kecamatan = pilihan(page, 'kecamatan');
    await expect(async () => {
      expect(await kecamatan.locator('option').count()).toBe(18); // 17 kecamatan + placeholder
    }).toPass();

    await kecamatan.selectOption({ label: 'Gamping' });
    const desa = pilihan(page, 'desa');
    await expect(async () => {
      expect(await desa.locator('option').count()).toBe(6); // 5 desa + placeholder
    }).toPass();

    await desa.selectOption({ label: 'Balecatur' });
    await expect(page.getByText('34.04.01.2001')).toBeVisible();
  });

  test('pencarian desa menampilkan jalur lengkap tiap hasil', async ({ page }) => {
    await page.getByPlaceholder('mis. Balecatur').fill('balecatur');
    await page.getByRole('button', { name: /^cari$/i }).click();

    const hasil = page.getByRole('button', { name: /Balecatur/ }).first();
    await expect(hasil).toBeVisible();
    // Nama desa saja tidak cukup untuk memilih dengan yakin — jalurnya wajib ikut.
    await expect(hasil).toContainText('Gamping');
    await expect(hasil).toContainText('Kabupaten Sleman');

    await hasil.click();
    await expect(page.getByText('34.04.01.2001')).toBeVisible();
  });
});
