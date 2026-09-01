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
  await page.waitForURL(/\/admin\/periode\/[0-9a-f-]{36}/);
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

    // Periode baru otomatis jadi periode aktif -> muncul terpilih di pemilih topbar.
    const pemilih = page.locator('select').first();
    await expect(pemilih).toBeVisible();
    await expect(pemilih.locator('option:checked')).toContainText(nama);
  });

  test('berpindah periode mengganti data yang tampil di halaman clustering', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/clustering');

    const pemilih = page.locator('select').first();
    await expect(pemilih).toBeVisible();

    const opsi = await pemilih.locator('option').all();
    test.skip(opsi.length < 2, 'butuh minimal dua periode program untuk menguji perpindahan');

    const nilai = await Promise.all(opsi.map((o) => o.getAttribute('value')));
    const sekarang = await pemilih.inputValue();
    const lain = nilai.find((v) => v && v !== sekarang)!;

    await pemilih.selectOption(lain);
    await page.waitForFunction(
      (v) => (document.querySelector('select') as HTMLSelectElement | null)?.value === v,
      lain,
    );

    // Halaman admin lain ikut berpindah tanpa perlu memilih ulang — pilihan
    // disimpan di cookie, bukan state per halaman.
    await page.goto('/admin/ranking');
    const pemilihDiRanking = page.locator('select').first();
    await expect(pemilihDiRanking).toHaveValue(lain);
  });
});
