import { test, expect, type Page } from '@playwright/test';

/**
 * b1 (15-Checklist): wilayah akses tambahan dikelola dari UI admin, bukan lagi
 * `INSERT INTO user_wilayah` manual. Test mengembalikan keadaan semula di akhir.
 */
async function login(page: Page, username: string) {
  await page.goto('/login');
  await page.getByPlaceholder('admin / verifikator / petugas').fill(username);
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: /masuk/i }).click();
}

test('admin menambah lalu mencabut wilayah tambahan verifikator', async ({ page }) => {
  await login(page, 'admin');
  await page.waitForURL('**/admin/**');
  await page.goto('/admin/pengguna');

  const kartu = page.getByTestId('pengguna-verifikator');
  await expect(kartu).toBeVisible();
  const chipAwal = await kartu.getByRole('button', { name: /cabut akses/i }).count();

  const select = kartu.getByRole('combobox', { name: /tambah wilayah untuk verifikator/i });
  const nilai = await select.locator('option').nth(1).getAttribute('value');
  const label = (await select.locator('option').nth(1).textContent())!.split(',')[0].trim();
  await select.selectOption(nilai!);
  await kartu.getByRole('button', { name: /tambah akses/i }).click();

  const cabut = kartu.getByRole('button', { name: `Cabut akses ${label}` });
  await expect(cabut).toBeVisible();
  await expect(kartu.getByRole('button', { name: /cabut akses/i })).toHaveCount(chipAwal + 1);

  await cabut.click();
  await expect(kartu.getByRole('button', { name: /cabut akses/i })).toHaveCount(chipAwal);
});

test('non-admin tidak bisa membuka halaman pengguna', async ({ page }) => {
  await login(page, 'verifikator');
  await page.waitForURL('**/admin/verifikasi');
  await page.goto('/admin/pengguna');
  await page.waitForURL('**/login**');
});
