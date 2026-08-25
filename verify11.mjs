import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

await page.goto('http://localhost:3000/login');
await page.fill('input[type="text"]', 'verifikator');
await page.fill('input[type="password"]', 'password123');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin/verifikasi');
await page.waitForTimeout(500);

let text = await page.evaluate(() => document.body.innerText);
const before = text.match(/(\d+) berkas menunggu/)[1];
console.log('before:', before);

const approveBtn = page.locator('button[aria-label="Setujui"]').first();
await approveBtn.waitFor({ timeout: 10000 });
await approveBtn.click();
await page.waitForSelector('text=Setujui berkas');
await page.click('button:has-text("Ya, setujui")');
await page.waitForTimeout(1500);

text = await page.evaluate(() => document.body.innerText);
const after = text.match(/(\d+) berkas menunggu/)[1];
console.log('after:', after);
console.log('count decreased correctly:', Number(after) === Number(before) - 1);
await page.screenshot({ path: '/tmp/claude-1000/-mnt-df174eef-b9a8-4943-a9da-e37eadcd9314-devprojects-bansos-system/015c7caa-10ae-4791-ab14-bc419c325636/scratchpad/shots2/verifikasi-approved2.png', fullPage: true });

await browser.close();
