import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

await page.goto('http://localhost:3000/login');
await page.fill('input[type="text"]', 'petugas');
await page.fill('input[type="password"]', 'password123');
await page.click('button[type="submit"]');
await page.waitForURL('**/petugas/tugas');

await page.goto('http://localhost:3000/petugas/pendataan', { waitUntil: 'networkidle' });
await page.fill('input[placeholder="Sesuai KTP"]', 'Warga Uji Coba Dua');
const niks = page.locator('input[placeholder="99••••••••••••••"]');
await niks.nth(0).fill('3273000000009904');
await niks.nth(1).fill('3273999999009904');
await page.fill('input[placeholder="Jl. Contoh No. 1, RT/RW"]', 'Jl. Uji Coba No. 4');
await page.fill('input[placeholder="2500000"]', '1750000');
await page.fill('input[placeholder="Nama anggota"]', 'Warga Uji Coba Dua');
await page.fill('input[placeholder="NIK anggota"]', '3273000000009904');
await page.fill('input[type="date"]', '1985-05-05');

await page.click('button:has-text("Simpan data rumah tangga")');
await page.waitForSelector('text=Simpan data rumah tangga ini?');
await page.click('button:has-text("Ya, simpan")');
await page.waitForURL('**/petugas/riwayat', { timeout: 10000 });
console.log('form submit -> redirected to riwayat: OK');

// login as verifikator, approve one entry via Antrean
await page.goto('http://localhost:3000/api/auth/logout');
await page.goto('http://localhost:3000/login');
await page.fill('input[type="text"]', 'verifikator');
await page.fill('input[type="password"]', 'password123');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin/verifikasi');
await page.waitForTimeout(500);

const approveBtn = page.locator('button[aria-label="Setujui"]').first();
await approveBtn.click();
await page.waitForSelector('text=Setujui berkas');
await page.click('button:has-text("Ya, setujui")');
await page.waitForTimeout(1500);
const text = await page.evaluate(() => document.body.innerText);
console.log('has Disetujui label:', text.includes('Disetujui'));

await browser.close();
