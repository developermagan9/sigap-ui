import { test, expect, type Page } from '@playwright/test';

/**
 * Klaim on-chain end-to-end: portal → dompet browser → kontrak → poller backend → portal.
 *
 * Butuh chain lokal yang berjalan dan periode yang sudah disubmit + didanai, jadi
 * hanya jalan kalau E2E_CHAIN_RPC diisi:
 *
 *   E2E_CHAIN_RPC=http://127.0.0.1:8545 \
 *   E2E_KLAIM_MANDIRI=<wallet mandiri penerima, status pending> \
 *   E2E_KLAIM_CUSTODIAL=<wallet/REC custodial penerima, status pending> \
 *   npx playwright test e2e/klaim.spec.ts
 *
 * "Dompet" di browser adalah shim EIP-1193 yang meneruskan semua request ke node
 * Hardhat; `eth_sendTransaction` ditandatangani node memakai akun bawaannya yang
 * ter-unlock. Pengirimnya akun #1 (relayer), BUKAN penerima — sekaligus membuktikan
 * dana tetap masuk ke `recipient` di leaf, dan bahwa encoder ABI di lib/wallet.ts
 * menghasilkan calldata yang diterima kontrak sungguhan.
 */
const RPC = process.env.E2E_CHAIN_RPC;
const MANDIRI = process.env.E2E_KLAIM_MANDIRI;
const CUSTODIAL = process.env.E2E_KLAIM_CUSTODIAL;

test.skip(!RPC, 'E2E_CHAIN_RPC tidak diisi — lewati uji klaim on-chain');

async function pasangDompetShim(page: Page, rpc: string) {
  await page.addInitScript((rpcUrl: string) => {
    let id = 0;
    const kirim = async (method: string, params: unknown[] = []) => {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
      });
      const j = await res.json();
      if (j.error) throw Object.assign(new Error(j.error.message), { code: j.error.code, data: j.error.data });
      return j.result;
    };
    (window as unknown as { ethereum: unknown }).ethereum = {
      request: async ({ method, params }: { method: string; params?: unknown[] }) => {
        if (method === 'eth_requestAccounts') return [(await kirim('eth_accounts'))[1]];
        if (method === 'wallet_switchEthereumChain' || method === 'wallet_addEthereumChain') return null;
        return kirim(method, params);
      },
    };
  }, rpc);
}

async function cari(page: Page, q: string) {
  await page.goto('/cek-status');
  await page.getByPlaceholder('REC-0231 atau 0x…').fill(q);
  await page.getByRole('button', { name: /^cari$/i }).click();
}

test.describe('Klaim on-chain', () => {
  test('tombol klaim aktif walau dompet baru tersuntik setelah halaman dimuat', async ({ page }) => {
    test.skip(!MANDIRI, 'E2E_KLAIM_MANDIRI tidak diisi');
    // Regression 2026-09-22: deteksi dompet hanya sekali saat mount, jadi MetaMask
    // yang menyuntik window.ethereum sedikit terlambat membuat tombol mati permanen.
    await page.addInitScript(() => {
      setTimeout(() => {
        (window as unknown as { ethereum: unknown }).ethereum = { request: async () => [] };
        window.dispatchEvent(new Event('ethereum#initialized'));
      }, 1500);
    });
    await cari(page, MANDIRI!);
    const tombol = page.getByRole('button', { name: /klaim dengan dompet/i });
    await expect(tombol).toBeVisible();
    await expect(tombol).toBeEnabled({ timeout: 5000 });
  });

  test('penerima custodial tidak diberi tombol klaim', async ({ page }) => {
    test.skip(!CUSTODIAL, 'E2E_KLAIM_CUSTODIAL tidak diisi');
    await pasangDompetShim(page, RPC!);
    await cari(page, CUSTODIAL!);
    await expect(page.getByText('Dompet dikelola program (custodial)')).toBeVisible();
    await expect(page.getByRole('button', { name: /klaim dengan dompet/i })).toHaveCount(0);
  });

  test('relayer mengklaim untuk penerima mandiri, status berubah setelah dicatat backend', async ({ page }) => {
    test.skip(!MANDIRI, 'E2E_KLAIM_MANDIRI tidak diisi');
    test.setTimeout(120_000);
    await pasangDompetShim(page, RPC!);
    await cari(page, MANDIRI!);

    await expect(page.getByText('Menunggu klaim')).toBeVisible();
    await page.getByRole('button', { name: /klaim dengan dompet/i }).click();

    // Status "Sudah diterima" hanya muncul setelah poller backend membaca FundDisbursed.
    await expect(page.getByText('Sudah diterima')).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText('belum ada')).toHaveCount(0); // baris "Transaksi" kini berisi tx hash klaim

    // Pencarian ulang membaca status dari backend: tetap claimed, tombol klaim tidak ada lagi.
    await cari(page, MANDIRI!);
    await expect(page.getByText('Sudah diterima')).toBeVisible();
    await expect(page.getByRole('button', { name: /klaim dengan dompet/i })).toHaveCount(0);
  });
});
