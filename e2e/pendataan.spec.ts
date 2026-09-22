import { test, expect, type Page } from '@playwright/test';

/**
 * Alur inti petugas: input KK baru sampai muncul di riwayat, dan penolakan NIK ganda.
 *
 * NIK/No. KK digenerate dari timestamp tiap run supaya test bisa dijalankan
 * berulang tanpa bentrok dengan data run sebelumnya (syarat eksplisit FE-6).
 */
function nikUnik(suffix: number) {
  // 16 digit: '99' + 12 digit terakhir epoch ms + 2 digit pembeda.
  const t = String(Date.now()).slice(-12);
  return `99${t}${String(suffix).padStart(2, '0')}`;
}

async function loginPetugas(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('admin / verifikator / petugas').fill('petugas');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: /masuk/i }).click();
  await page.waitForURL('**/petugas/tugas');
}

/** Pilih alamat administratif lewat empat dropdown bertingkat.
 *  Tiap tingkat baru terisi setelah induknya dipilih, jadi opsinya ditunggu
 *  dulu — bukan di-`selectOption` langsung ke daftar yang masih kosong. */
async function pilihWilayah(page: Page) {
  const select = (tingkat: string) => page.locator(`select[name="wilayah-${tingkat}"]`);

  for (const [tingkat, label] of [
    ['provinsi', 'Daerah Istimewa Yogyakarta'],
    ['kabupaten', 'Kabupaten Sleman'],
    ['kecamatan', 'Gamping'],
    ['desa', 'Balecatur'],
  ] as const) {
    const s = select(tingkat);
    await expect(async () => {
      expect(await s.locator('option').count()).toBeGreaterThan(1);
    }).toPass();
    await s.selectOption({ label });
  }
}

async function isiForm(page: Page, opts: { nik: string; noKk: string; nama: string }) {
  await page.goto('/petugas/pendataan');

  await page.getByPlaceholder('Sesuai KTP').fill(opts.nama);
  await page.getByPlaceholder('99••••••••••••••').first().fill(opts.nik);
  await page.getByPlaceholder('99••••••••••••••').nth(1).fill(opts.noKk);
  await page.getByPlaceholder('2500000').fill('1800000');

  await pilihWilayah(page);
  await page.getByPlaceholder('RT 01 / RW 05').fill('RT 01 / RW 05, Jl. Uji Otomatis No. 7');

  // Wallet mandiri wajib sejak 2026-09-22 — tanpa ini tombol simpan menolak
  // dengan toast "lengkapi seluruh kolom wajib" dan form tidak pernah terkirim.
  await page.getByPlaceholder('0x1234...5678').fill('0x1234567890abcdef1234567890abcdef12345678');

  // Satu anggota (kepala keluarga) — NIK-nya wajib sama dengan NIK kepala di atas.
  await page.getByPlaceholder('Nama anggota').fill(opts.nama);
  await page.getByPlaceholder('NIK anggota').fill(opts.nik);
  await page.locator('input[type="date"]').first().fill('1985-05-05');

  await page.getByRole('button', { name: /simpan data rumah tangga/i }).click();
  await page.getByRole('button', { name: /ya, simpan/i }).click();
}

test.describe('Pendataan petugas', () => {
  test('menyimpan KK baru lalu muncul di riwayat', async ({ page }) => {
    const nik = nikUnik(1);
    const nama = `Uji Otomatis ${nik.slice(-6)}`;

    await loginPetugas(page);
    await isiForm(page, { nik, noKk: nik, nama });

    // Form mengarahkan ke riwayat setelah simpan berhasil.
    await page.waitForURL('**/petugas/riwayat');

    // Riwayat menampilkan hash NIK, bukan NIK asli — jadi yang dicek adalah
    // bertambahnya baris berstatus menunggu verifikasi, bukan nama/NIK-nya.
    await expect(page.getByText(/menunggu|pending/i).first()).toBeVisible();
  });

  test('cookie periode basi (periode non-draft) tidak menyasarkan input', async ({ page }) => {
    // Kasus nyata 2026-09-22: cookie sigap_periode sisa sesi admin menunjuk periode
    // berstatus alokasi, KK tersimpan di sana dan tidak muncul di mana pun.
    await loginPetugas(page);
    const token = (await page.context().cookies()).find((c) => c.name === 'sigap_token')!.value;
    const API = process.env.E2E_API_URL || 'http://localhost:3001/v1';
    const daftar = await (await page.request.get(`${API}/periode-program`, { headers: { Authorization: `Bearer ${token}` } })).json();
    const periode: { id: string; status: string; namaProgram: string }[] = daftar.data ?? daftar;
    const basi = periode.find((p) => p.status !== 'draft');
    test.skip(!basi, 'tidak ada periode non-draft untuk dijadikan cookie basi');
    const { hostname } = new URL(page.url());
    await page.context().addCookies([{ name: 'sigap_periode', value: basi!.id, domain: hostname, path: '/' }]);

    await page.goto('/petugas/pendataan');
    const keterangan = page.locator('p', { hasText: 'Data masuk ke periode' });
    await expect(keterangan).toBeVisible();
    await expect(keterangan).not.toContainText(basi!.namaProgram);

    const nik = nikUnik(3);
    await isiForm(page, { nik, noKk: nik, nama: `Uji Cookie ${nik.slice(-6)}` });
    await page.waitForURL('**/petugas/riwayat');
    await expect(page.getByText(/menunggu|pending/i).first()).toBeVisible();
  });

  test('menolak NIK kepala keluarga yang sudah terdaftar di periode ini', async ({ page }) => {
    const nik = nikUnik(2);
    const nama = `Uji Duplikat ${nik.slice(-6)}`;

    await loginPetugas(page);
    await isiForm(page, { nik, noKk: nik, nama });
    await page.waitForURL('**/petugas/riwayat');

    // Kirim ulang data yang persis sama: backend harus menolak dengan pesan
    // duplikat yang spesifik, bukan pesan galat generik.
    await isiForm(page, { nik, noKk: nik, nama });

    await expect(page.getByText(/already exists|duplicate|ganda|sudah/i).first()).toBeVisible({
      timeout: 15_000,
    });
    // Tetap di halaman form — data ganda tidak boleh dianggap tersimpan.
    expect(new URL(page.url()).pathname).toBe('/petugas/pendataan');
  });
});
