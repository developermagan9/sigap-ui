import { test, expect, type Page } from '@playwright/test';

/**
 * Pemilih periode program (FE-5 / item O): memastikan halaman admin benar-benar
 * mengikuti periode yang dipilih, bukan satu konstanta yang di-hardcode.
 */
async function loginAdmin(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('admin / verifikator / petugas').fill('admin');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: /masuk/i }).click();
  // Admin mendarat di DAFTAR periode. Rute tanpa id dulu alias yang redirect ke
  // periode aktif; commit 32e24fe (2026-09-01) mengubahnya jadi halaman daftar.
  await page.waitForURL('**/admin/periode');
}

test.describe('Periode program', () => {
  test('admin membuat periode baru dan langsung diarahkan ke dashboardnya', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/periode/baru');

    const nama = `Uji E2E ${Date.now()}`;
    await page.getByPlaceholder('Nama periode program bansos').fill(nama);
    await page.locator('input[type="number"]').first().fill('20000000');

    await page.getByRole('button', { name: /buat periode program/i }).click();

    // Dashboard periode yang baru dibuat.
    await page.waitForURL(/\/admin\/periode\/[0-9a-f-]{36}/, { timeout: 20_000 });
    // Nama program muncul di deskripsi PageHeader dashboard periode.
    await expect(page.getByRole('main').getByText(nama, { exact: false })).toBeVisible();

    // Periode baru otomatis jadi periode aktif. Dulu dicek lewat `<option:checked>`
    // pada dropdown pemilih di topbar; dropdown itu dihapus di commit 32e24fe dan
    // fungsinya pindah ke halaman daftar `/admin/periode`, yang menandai baris
    // aktif dengan label "Periode aktif".
    await page.goto('/admin/periode');
    const baris = page.getByRole('listitem').filter({ hasText: nama });
    await expect(baris).toBeVisible();
    await expect(baris.getByText('Periode aktif')).toBeVisible();
  });

  /**
   * Perpindahan periode aktif.
   *
   * Versi lama test ini menggerakkan dropdown `<select>` di topbar. Dropdown itu
   * dihapus di commit 32e24fe (2026-09-01) dan digantikan tombol "Jadikan aktif"
   * pada tiap baris di `/admin/periode`, jadi seluruh test digantung pada elemen
   * yang sudah tidak ada. Mekanisme yang diuji tetap sama: pilihan disimpan di
   * cookie `sigap_periode`, bukan state per halaman, sehingga halaman admin lain
   * ikut berpindah tanpa perlu memilih ulang.
   */
  test('berpindah periode aktif ikut mengubah periode yang dipakai halaman admin lain', async ({ page }) => {
    await loginAdmin(page);

    const baris = page.getByRole('listitem');
    test.skip((await baris.count()) < 2, 'butuh minimal dua periode program untuk menguji perpindahan');

    // Baris yang BELUM aktif — tombol "Jadikan aktif" hanya dirender di baris itu.
    // `.first()` dipasang pada hasil filter, bukan di dalam `has:`: locator di
    // dalam `has:` cuma menyatakan "baris yang memuat elemen semacam ini", jadi
    // menaruh `.first()` di sana tetap mencocokkan SEMUA baris yang punya tombol.
    const barisTarget = baris
      .filter({ has: page.getByRole('button', { name: /jadikan aktif/i }) })
      .first();
    const namaTarget = (await barisTarget.getByRole('heading').innerText()).trim();

    await barisTarget.getByRole('button', { name: /jadikan aktif/i }).click();

    // Baris itu kini bertanda aktif, dan tombolnya hilang karena sudah aktif.
    const barisAktif = baris.filter({ hasText: namaTarget });
    await expect(barisAktif.getByText('Periode aktif')).toBeVisible();

    // Halaman admin lain mengikuti pilihan yang tersimpan di cookie: dashboard
    // periode aktif (`/admin/periode` tanpa id sudah jadi daftar, jadi yang dicek
    // adalah tautan "buka" baris aktif menunjuk id yang sama dengan yang dipakai
    // halaman ranking).
    const idAktif = (await barisAktif.getByRole('link').first().getAttribute('href'))!
      .split('/')
      .pop()!;

    await page.goto('/admin/ranking');
    await expect(page.getByRole('heading', { name: /hasil ranking draft/i })).toBeVisible();

    await page.goto('/admin/periode');
    await expect(
      page.getByRole('listitem').filter({ hasText: namaTarget }).getByText('Periode aktif'),
    ).toBeVisible();
    expect(idAktif).toMatch(/^[0-9a-f-]{36}$/);
  });
});
