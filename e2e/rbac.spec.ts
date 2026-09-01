import { test, expect, type Page } from '@playwright/test';

/**
 * Regression e2e untuk temuan RBAC 2026-08-29:
 *  - "Sanggahan Data" ada di menu verifikator tapi diblokir middleware;
 *  - role `auditor` bisa login tapi tidak punya satu rute pun yang bisa dibuka;
 *  - `/api/auth/switch-role` menerima permintaan tanpa sesi sama sekali.
 */
async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('admin / verifikator / petugas').fill(username);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /masuk/i }).click();
}

test.describe('RBAC rute', () => {
  test('verifikator bisa membuka setiap menu yang tampil di sidebar-nya', async ({ page }) => {
    await login(page, 'verifikator', 'password123');
    await page.waitForURL('**/admin/verifikasi');

    // Menu yang ditampilkan tapi diblokir middleware terasa seperti sesi habis.
    await page.getByRole('link', { name: /sanggahan data/i }).click();
    await page.waitForURL('**/admin/sanggahan');
    expect(new URL(page.url()).pathname).toBe('/admin/sanggahan');
  });

  test('verifikator tetap ditolak di rute khusus admin', async ({ page }) => {
    await login(page, 'verifikator', 'password123');
    await page.waitForURL('**/admin/verifikasi');
    await page.goto('/admin/ranking');
    await page.waitForURL('**/login**');
  });

  test('auditor mendarat di audit log dan bisa membacanya', async ({ page }) => {
    await login(page, 'auditor', 'password123');
    await page.waitForURL('**/admin/audit-log');
    await expect(page.getByRole('heading', { name: /audit log/i })).toBeVisible();
  });

  test('auditor tidak bisa membuka halaman admin lain', async ({ page }) => {
    await login(page, 'auditor', 'password123');
    await page.waitForURL('**/admin/audit-log');
    await page.goto('/admin/verifikasi');
    await page.waitForURL('**/login**');
  });

  test('switch-role menolak permintaan tanpa sesi', async ({ request }) => {
    const res = await request.post('/api/auth/switch-role', { data: { role: 'admin' } });
    expect(res.status()).toBe(401);
  });

  test('switch-role menolak akun non-superuser', async ({ page }) => {
    await login(page, 'admin', 'password123');
    await page.waitForURL(/\/admin\/periode\/[0-9a-f-]{36}/);

    // `page.request` (bukan fixture `request`) memakai konteks browser yang sama,
    // jadi cookie sesi admin ikut terkirim — fixture `request` punya jar sendiri.
    const res = await page.request.post('/api/auth/switch-role', { data: { role: 'petugas' } });
    expect(res.status()).toBe(403);
  });
});
