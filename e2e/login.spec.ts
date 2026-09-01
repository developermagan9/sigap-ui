import { test, expect } from '@playwright/test';

// Admin mendarat di dashboard periode yang sedang AKTIF, yang id-nya bergantung
// pada isi database (pemilih periode, lihat lib/periode.ts) — jadi yang dicek
// polanya, bukan satu UUID yang di-hardcode seperti sebelumnya.
const POLA_DASHBOARD_ADMIN = /^\/admin\/periode\/[0-9a-f-]{36}$/;

const CREDS = {
  admin: { username: 'admin', password: 'password123', redirect: POLA_DASHBOARD_ADMIN },
  verifikator: { username: 'verifikator', password: 'password123', redirect: '/admin/verifikasi' },
  petugas: { username: 'petugas', password: 'password123', redirect: '/petugas/tugas' },
};

async function login(page: import('@playwright/test').Page, username: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('admin / verifikator / petugas').fill(username);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /masuk/i }).click();
}

test.describe('Login', () => {
  for (const [role, cred] of Object.entries(CREDS)) {
    test(`${role} logs in and lands on the correct page`, async ({ page }) => {
      await login(page, cred.username, cred.password);
      const tujuan = cred.redirect;
      if (tujuan instanceof RegExp) {
        await page.waitForURL((url) => tujuan.test(new URL(url).pathname));
        expect(new URL(page.url()).pathname).toMatch(tujuan);
      } else {
        await page.waitForURL(`**${tujuan}`);
        expect(new URL(page.url()).pathname).toBe(tujuan);
      }

      const cookies = await page.context().cookies();
      expect(cookies.find((c) => c.name === 'sigap_role')?.value).toBe(
        role === 'verifikator' ? 'verifikator' : role,
      );
      expect(cookies.find((c) => c.name === 'sigap_token')?.value).toBeTruthy();
    });
  }

  test('rejects invalid credentials with an error, no redirect', async ({ page }) => {
    await login(page, 'admin', 'wrong-password');
    await expect(page.getByText(/gagal masuk|tidak valid/i)).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/login');
  });

  test('protected admin route redirects to /login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/verifikasi');
    await page.waitForURL('**/login**');
    expect(new URL(page.url()).searchParams.get('next')).toBe('/admin/verifikasi');
  });

  test('petugas cannot access admin-only route', async ({ page }) => {
    await login(page, 'petugas', 'password123');
    await page.waitForURL('**/petugas/tugas');
    await page.goto('/admin/ranking');
    await page.waitForURL('**/login**');
  });

  test('logout clears session and re-locks protected routes', async ({ page }) => {
    await login(page, 'admin', 'password123');
    await page.waitForURL((url) => POLA_DASHBOARD_ADMIN.test(new URL(url).pathname));

    await page.goto('/api/auth/logout');
    await page.waitForURL('/');

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === 'sigap_role')?.value ?? '').toBe('');

    await page.goto('/admin/verifikasi');
    await page.waitForURL('**/login**');
  });
});
