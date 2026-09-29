import { test, expect, type Page } from '@playwright/test';

/**
 * Kelola akun (buat user, reset/ganti password, nonaktifkan), lonceng notifikasi,
 * penguncian login, dan hapus periode draft. Setiap test membuat data uji sendiri
 * dengan nama unik, jadi aman diulang dan tidak mengunci akun seed.
 */
const API = process.env.E2E_API_URL || 'http://localhost:3001/v1';

async function login(page: Page, username: string, password = 'password123') {
  await page.goto('/login');
  await page.getByPlaceholder('admin / verifikator / petugas').fill(username);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /masuk/i }).click();
}

async function tokenDari(page: Page) {
  return (await page.context().cookies()).find((c) => c.name === 'sigap_token')!.value;
}

test('admin membuat akun, pengguna mengganti password, admin menonaktifkan', async ({ page }) => {
  const username = `e2e.${Date.now().toString(36)}`;

  await login(page, 'admin');
  await page.waitForURL('**/admin/**');
  await page.goto('/admin/pengguna');

  const form = page.getByRole('form', { name: 'Tambah pengguna' });
  await form.getByLabel('Username').fill(username);
  await form.getByLabel('Nama').fill('Petugas E2E');
  await form.getByLabel('Role').selectOption('petugas');
  await form.getByLabel('Wilayah utama').selectOption({ index: 1 });
  await form.getByLabel('Password awal').fill('awalawal123');
  await form.getByRole('button', { name: 'Buat akun' }).click();
  await expect(form.getByText(`Akun ${username} dibuat.`)).toBeVisible();

  // Pengguna baru login lalu mengganti password sendiri.
  await page.context().clearCookies();
  await login(page, username, 'awalawal123');
  await page.waitForURL('**/petugas/tugas');
  await page.goto('/akun');
  const ganti = page.getByRole('form', { name: 'Ganti password' });
  await ganti.getByLabel('Password lama').fill('awalawal123');
  await ganti.getByLabel('Password baru', { exact: false }).first().fill('barubaru123');
  await ganti.getByLabel('Ulangi password baru').fill('barubaru123');
  await ganti.getByRole('button', { name: 'Ganti password' }).click();
  await page.waitForURL('**/login?pesan=password-diganti');
  await expect(page.getByText(/password diganti/i)).toBeVisible();

  await login(page, username, 'awalawal123');
  await expect(page.getByText(/tidak valid/i)).toBeVisible();
  await login(page, username, 'barubaru123');
  await page.waitForURL('**/petugas/tugas');

  // Admin menonaktifkan akun itu.
  await page.context().clearCookies();
  await login(page, 'admin');
  await page.waitForURL('**/admin/**');
  await page.goto('/admin/pengguna');
  const kartu = page.getByTestId(`pengguna-${username}`);
  await kartu.getByRole('button', { name: 'Atur akun' }).click();
  await kartu.getByRole('button', { name: 'Nonaktifkan' }).click();
  await expect(kartu.getByText(/akun dinonaktifkan/i)).toBeVisible();

  await page.context().clearCookies();
  await login(page, username, 'barubaru123');
  await expect(page.getByText(/tidak valid/i)).toBeVisible();
});

test('login dikunci setelah 5 kali gagal untuk username yang sama', async ({ page }) => {
  const username = `kunci.${Date.now().toString(36)}`;
  for (let i = 0; i < 5; i++) {
    await login(page, username, 'salahsalah');
    await expect(page.getByText(/tidak valid/i)).toBeVisible();
  }
  await login(page, username, 'salahsalah');
  await expect(page.getByText(/terlalu banyak percobaan/i)).toBeVisible();
});

test('lonceng notifikasi membuka halaman notifikasi', async ({ page }) => {
  await login(page, 'admin');
  await page.waitForURL('**/admin/**');
  await page.getByRole('link', { name: /^Notifikasi/ }).first().click();
  await page.waitForURL('**/notifikasi');
  await expect(page.getByRole('heading', { name: 'Notifikasi' })).toBeVisible();
  await page.getByRole('link', { name: /outbox sms/i }).click();
  await expect(page.getByText(/tidak ada yang benar-benar dikirim/i)).toBeVisible();
});

test('halaman akun & notifikasi butuh login', async ({ page }) => {
  await page.goto('/akun');
  await page.waitForURL('**/login**');
  await page.goto('/notifikasi');
  await page.waitForURL('**/login**');
});

test('admin menghapus periode draft kosong dari daftar periode', async ({ page }) => {
  await login(page, 'admin');
  await page.waitForURL('**/admin/**');
  const nama = `E2E Hapus ${Date.now().toString(36)}`;
  const res = await page.request.post(`${API}/periode-program`, {
    headers: { Authorization: `Bearer ${await tokenDari(page)}` },
    data: {
      nama_program: nama,
      anggaran_total: 1000000,
      bobot_kriteria: { pendapatanPerKapita: 0.4, jumlahTanggungan: 0.3, jumlahDisabilitasLansia: 0.2, skorKondisiRumah: 0.1 },
    },
  });
  expect(res.ok()).toBeTruthy();

  await page.goto('/admin/periode');
  const baris = page.getByRole('listitem').filter({ hasText: nama });
  await baris.getByRole('button', { name: 'Hapus' }).click();
  await page.getByRole('button', { name: 'Ya, hapus' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: nama })).toHaveCount(0);
});

test('/klaim lama diarahkan ke Cek Status', async ({ page }) => {
  await page.goto('/klaim');
  await page.waitForURL('**/cek-status');
});
