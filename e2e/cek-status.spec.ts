import { test, expect } from '@playwright/test';

/**
 * Regression 2026-09-22: setiap pencarian yang tidak ketemu tampil sebagai
 * "Layanan tidak dapat dihubungi" — CekKlaim mencari teks "404" di pesan error,
 * padahal pesan dari API adalah "Data penerima tidak ditemukan". Private key yang
 * ditempel ke kolom juga ikut terkirim ke server lewat query string.
 */
async function cari(page: import('@playwright/test').Page, q: string) {
  await page.goto('/cek-status');
  await page.getByPlaceholder('REC-0231 atau 0x…').fill(q);
  await page.getByRole('button', { name: /^cari$/i }).click();
}

test('alamat yang bukan penerima tampil sebagai "tidak ditemukan", bukan layanan mati', async ({ page }) => {
  await cari(page, '0x000000000000000000000000000000000000dEaD');
  await expect(page.getByText('Tidak ditemukan pada periode ini')).toBeVisible();
  await expect(page.getByText('Layanan tidak dapat dihubungi')).toHaveCount(0);
});

test('private key ditolak di browser dan tidak pernah dikirim ke API', async ({ page }) => {
  const permintaan: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('claim-status')) permintaan.push(r.url());
  });
  await cari(page, '0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61');
  await expect(page.getByText('Itu private key, bukan alamat dompet')).toBeVisible();
  expect(permintaan).toHaveLength(0);
});
