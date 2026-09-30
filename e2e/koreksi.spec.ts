import { test, expect, type Page } from '@playwright/test';

/**
 * b2 + b3 (15-Checklist): petugas bisa melihat identitas dari daftarnya sendiri,
 * dan mengoreksi susunan anggota keluarga lewat sanggahan (backend sudah menerima
 * `data_baru.anggota` sejak 2026-09-07, tapi form belum mengeksposnya).
 */
const API = process.env.E2E_API_URL || 'http://localhost:3001/v1';

/**
 * Login lalu pilih periode yang benar-benar berisi rumah tangga di wilayah petugas.
 * Periode aktif default adalah yang terbaru — sering periode "Uji E2E" kosong buatan
 * periode.spec.ts — dan daftar kosong tidak punya satu pun tombol untuk diuji.
 */
async function loginPetugas(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('admin / verifikator / petugas').fill('petugas');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: /masuk/i }).click();
  await page.waitForURL('**/petugas/tugas');

  const token = (await page.context().cookies()).find((c) => c.name === 'sigap_token')!.value;
  const res = await page.request.get(`${API}/rumah-tangga?limit=1`, { headers: { Authorization: `Bearer ${token}` } });
  const periodeId: string = (await res.json()).data[0].periodeId;
  const { hostname } = new URL(page.url());
  await page.context().addCookies([{ name: 'sigap_periode', value: periodeId, domain: hostname, path: '/' }]);
  await page.reload();
}

test('petugas membuka identitas dari kartu tugas', async ({ page }) => {
  await loginPetugas(page);
  await page.getByRole('button', { name: 'Lihat identitas' }).first().click();
  await expect(page.getByText('Kepala keluarga', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Anggota keluarga \(\d+\)/).first()).toBeVisible();
});

test('petugas mengoreksi susunan keluarga lewat sanggahan', async ({ page }) => {
  await loginPetugas(page);
  await page.goto('/petugas/riwayat');

  await page.getByRole('button', { name: 'Lihat identitas' }).first().click();
  await expect(page.getByText(/Anggota keluarga \(\d+\)/).first()).toBeVisible();

  await page.getByRole('button', { name: 'Ajukan koreksi data' }).first().click();
  await page.getByPlaceholder(/PHK bulan lalu/).fill('Anak kedua lahir bulan lalu, belum tercatat.');
  await page.getByRole('button', { name: 'Koreksi anggota keluarga' }).click();

  const grup = page.getByRole('group', { name: /^Anggota \d+$/ });
  await expect(grup.first()).toBeVisible();
  const jumlahAwal = await grup.count();

  // Validasi klien: kepala keluarga harus tepat satu.
  let idxKepala = -1;
  for (let i = 0; i < jumlahAwal; i++) {
    if ((await grup.nth(i).getByLabel('Hubungan').inputValue()) === 'kepala') idxKepala = i;
  }
  expect(idxKepala).toBeGreaterThanOrEqual(0);
  await grup.nth(idxKepala).getByLabel('Hubungan').selectOption('anak');
  await expect(page.getByText(/Harus tepat satu kepala keluarga/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kirim sanggahan' })).toBeDisabled();
  await grup.nth(idxKepala).getByLabel('Hubungan').selectOption('kepala');

  // Tambah anggota baru dengan NIK unik.
  await page.getByRole('button', { name: '+ Tambah anggota' }).click();
  const baru = page.getByRole('group', { name: `Anggota ${jumlahAwal + 1}` });
  await baru.getByLabel('Nama').fill('Bayi Uji E2E');
  await baru.getByLabel('NIK').fill(String(Date.now()).padStart(16, '9').slice(-16));
  await baru.getByLabel('Tanggal lahir').fill('2026-08-01');

  await expect(page.getByText(/Harus tepat satu kepala keluarga|NIK harus 16 digit|NIK yang sama/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Kirim sanggahan' }).click();
  await expect(page.getByText('Sanggahan terkirim, menunggu verifikator.')).toBeVisible();
});
