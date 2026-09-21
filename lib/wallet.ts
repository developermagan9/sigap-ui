/**
 * Klaim on-chain lewat dompet browser (EIP-1193: MetaMask, Rabby, dompet in-app).
 *
 * Sengaja tanpa ethers/viem: yang dibutuhkan portal hanya satu panggilan kontrak
 * (`BansosDisbursement.claim`), dan encoder ABI-nya cukup beberapa baris. Paritas
 * encoding diuji terhadap ethers di `e2e/klaim.spec.ts` lewat transaksi sungguhan
 * ke chain lokal.
 */

type Eip1193 = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: Eip1193;
  }
}

export function dompetTersedia(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

function dompet(): Eip1193 {
  if (!window.ethereum) throw new Error("Dompet browser tidak ditemukan. Pasang MetaMask atau buka lewat dompet in-app.");
  return window.ethereum;
}

/** Parameter `wallet_addEthereumChain` untuk jaringan yang dipakai sistem. */
const JARINGAN: Record<number, { chainName: string; rpcUrls: string[]; blockExplorerUrls?: string[]; nativeCurrency: { name: string; symbol: string; decimals: number } }> = {
  80002: {
    chainName: "Polygon Amoy",
    rpcUrls: ["https://polygon-amoy-bor-rpc.publicnode.com"],
    blockExplorerUrls: ["https://amoy.polygonscan.com"],
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  },
  31337: {
    chainName: "Hardhat Lokal",
    rpcUrls: ["http://127.0.0.1:8545"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
};

export async function hubungkanDompet(): Promise<string> {
  const akun = (await dompet().request({ method: "eth_requestAccounts" })) as string[];
  if (!akun?.[0]) throw new Error("Tidak ada akun yang dipilih di dompet.");
  return akun[0];
}

export async function pastikanJaringan(chainId: number): Promise<void> {
  const hex = "0x" + chainId.toString(16);
  const aktif = (await dompet().request({ method: "eth_chainId" })) as string;
  if (parseInt(aktif, 16) === chainId) return;
  try {
    await dompet().request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex }] });
  } catch (err) {
    // 4902 = jaringan belum dikenal dompet → tambahkan dulu.
    const kode = (err as { code?: number })?.code;
    const params = JARINGAN[chainId];
    if (kode !== 4902 || !params) throw err;
    await dompet().request({ method: "wallet_addEthereumChain", params: [{ chainId: hex, ...params }] });
  }
}

const SELECTOR_CLAIM = "2035a4dd"; // claim(uint256,address,uint256,bytes32,bytes32[])

function kata(hex: string): string {
  const bersih = hex.replace(/^0x/, "").toLowerCase();
  if (!/^[0-9a-f]*$/.test(bersih) || bersih.length > 64) throw new Error(`Nilai ABI tidak valid: ${hex}`);
  return bersih.padStart(64, "0");
}
const angkaKeKata = (n: number | bigint) => kata(BigInt(n).toString(16));

/** calldata `claim(periodeId, recipient, amount, nikHash, proof)` sesuai ABI Solidity. */
export function encodeClaim(a: { periodeId: number; recipient: string; amount: number | bigint; nikHash: string; proof: string[] }): string {
  const head = [
    angkaKeKata(a.periodeId),
    kata(a.recipient),
    angkaKeKata(a.amount),
    kata(a.nikHash),
    angkaKeKata(5 * 32), // offset array dinamis = setelah 5 slot head
  ];
  const tail = [angkaKeKata(a.proof.length), ...a.proof.map(kata)];
  return "0x" + SELECTOR_CLAIM + head.join("") + tail.join("");
}

export async function kirimKlaim(dari: string, kontrak: string, data: string): Promise<string> {
  return (await dompet().request({ method: "eth_sendTransaction", params: [{ from: dari, to: kontrak, data }] })) as string;
}

/** Tunggu receipt; `true` = sukses, `false` = revert. */
export async function tungguReceipt(txHash: string, batasMs = 120_000): Promise<boolean> {
  const mulai = Date.now();
  while (Date.now() - mulai < batasMs) {
    const r = (await dompet().request({ method: "eth_getTransactionReceipt", params: [txHash] })) as { status?: string } | null;
    if (r?.status) return parseInt(r.status, 16) === 1;
    await new Promise((ok) => setTimeout(ok, 1500));
  }
  throw new Error("Transaksi belum masuk blok setelah 2 menit. Cek riwayat di dompet Anda.");
}

/** Pesan galat dompet yang bisa dibaca warga (tolak tanda tangan, revert kontrak, dll). */
export function pesanGalatDompet(err: unknown): string {
  const e = err as { code?: number; message?: string; data?: { message?: string } };
  if (e?.code === 4001) return "Transaksi dibatalkan di dompet.";
  const pesan = e?.data?.message || e?.message || String(err);
  if (pesan.includes("Dana sudah pernah diklaim")) return "Dana ini sudah pernah diklaim.";
  if (pesan.includes("Bukti Merkle tidak valid")) return "Bukti klaim tidak cocok dengan data yang terkunci on-chain.";
  if (pesan.includes("Periode belum disahkan")) return "Periode ini belum disahkan di kontrak.";
  if (/underflow|overflow|0x11/.test(pesan)) return "Dana di kontrak belum mencukupi — hubungi admin program.";
  return pesan;
}
