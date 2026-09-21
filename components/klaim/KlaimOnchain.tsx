"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Hash } from "@/components/ui/Hash";
import { Alert, Check, Coins } from "@/components/ui/Icons";
import { EXPLORER_BASE } from "@/lib/constants";
import { rupiah } from "@/lib/format";
import { ApiClient, type ClaimProof, type ClaimStatus } from "@/lib/api";
import {
  dompetTersedia,
  encodeClaim,
  hubungkanDompet,
  kirimKlaim,
  pastikanJaringan,
  pesanGalatDompet,
  tungguReceipt,
} from "@/lib/wallet";

function Kotak({ judul, children, tone = "netral" }: { judul: string; children: ReactNode; tone?: "netral" | "sukses" }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl p-4 ring-1 ${tone === "sukses" ? "bg-sage-soft ring-sage/20" : "bg-paper-2 ring-[var(--hairline)]"}`}>
      <span className={`mt-px ${tone === "sukses" ? "text-sage" : "text-ink-3"}`}>
        {tone === "sukses" ? <Check className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-ink-2">{judul}</p>
        <div className="mt-2 text-[12px] leading-[1.65] text-ink-3">{children}</div>
      </div>
    </div>
  );
}

type Tahap = "memuat" | "siap" | "mengirim" | "menunggu" | "sinkron";

/**
 * Tombol klaim sungguhan: dompet browser menandatangani `BansosDisbursement.claim()`
 * dengan bukti Merkle dari backend. Pengirim transaksi boleh warga sendiri atau
 * pendamping desa (relayer) — kontrak selalu mentransfer ke `recipient` di leaf,
 * jadi relayer tidak bisa membelokkan dana.
 *
 * Status "sudah diterima" TIDAK ditampilkan dari hasil transaksi di sini, melainkan
 * setelah backend membaca event `FundDisbursed` (poller sync-klaim), supaya portal
 * tidak pernah mengklaim sesuatu yang belum tercatat.
 */
export function KlaimOnchain({ status, onTercatat }: { status: ClaimStatus; onTercatat: (s: ClaimStatus) => void }) {
  const [tahap, setTahap] = useState<Tahap>("memuat");
  const [proof, setProof] = useState<ClaimProof | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [adaDompet, setAdaDompet] = useState(false);

  useEffect(() => {
    setAdaDompet(dompetTersedia());
    ApiClient.public
      .getClaimProof(status.periode_id, status.wallet)
      .then((p) => {
        setProof(p);
        setTahap("siap");
      })
      .catch((e) => {
        setGalat(e instanceof Error ? e.message : String(e));
        setTahap("siap");
      });
  }, [status.periode_id, status.wallet]);

  // Setelah transaksi sukses, tunggu backend mencatatnya (poller tiap ±30 dtk).
  useEffect(() => {
    if (tahap !== "sinkron") return;
    let aktif = true;
    const mulai = Date.now();
    const cek = async () => {
      while (aktif && Date.now() - mulai < 180_000) {
        try {
          const s = await ApiClient.public.checkClaimStatus(status.reference);
          // Induk mengganti kartu jadi "Sudah diterima" dan melepas panel ini.
          if (s.status === "claimed") {
            if (aktif) onTercatat(s);
            return;
          }
        } catch {
          /* coba lagi */
        }
        await new Promise((ok) => setTimeout(ok, 4000));
      }
    };
    void cek();
    return () => {
      aktif = false;
    };
  }, [tahap, status.reference, onTercatat]);

  const klaim = async () => {
    if (!proof?.contract_address) return;
    setGalat(null);
    setTahap("mengirim");
    try {
      const pengirim = await hubungkanDompet();
      await pastikanJaringan(proof.chain_id);
      const data = encodeClaim({
        periodeId: proof.periode_id_onchain,
        recipient: proof.recipient,
        amount: proof.amount,
        nikHash: proof.nik_hash,
        proof: proof.proof,
      });
      const hash = await kirimKlaim(pengirim, proof.contract_address, data);
      setTxHash(hash);
      setTahap("menunggu");
      const sukses = await tungguReceipt(hash);
      if (!sukses) throw new Error("Transaksi ditolak kontrak (revert).");
      setTahap("sinkron");
    } catch (err) {
      setGalat(pesanGalatDompet(err));
      setTahap("siap");
    }
  };

  if (tahap === "memuat") {
    return <Kotak judul="Memeriksa bukti klaim…">Mengambil bukti Merkle untuk dompet ini.</Kotak>;
  }

  if (!proof) {
    return (
      <Kotak judul="Bukti klaim belum tersedia">
        {galat ?? "Merkle tree periode ini belum dibangun."}
      </Kotak>
    );
  }

  if (!proof.contract_address) {
    return (
      <Kotak judul="Dana belum ditarik">
        Anda terdaftar sebagai penerima dan bukti Merkle Anda sudah terkunci pada root periode ini, tetapi kontrak
        penyaluran belum dideploy ke jaringan — klaim belum bisa dilakukan.
      </Kotak>
    );
  }

  if (proof.jenis_wallet === "custodial") {
    // deriveCustodialWallet() di backend hanya menghasilkan alamat placeholder tanpa
    // private key. Mengklaim ke sana memindahkan dana ke alamat yang tidak bisa
    // dibuka siapa pun, jadi tombolnya sengaja tidak disediakan.
    return (
      <Kotak judul="Dompet dikelola program (custodial)">
        Dana Anda sudah terkunci di kontrak dan akan dicairkan lewat pendamping desa setelah dompet custodial
        program aktif. Untuk menerima langsung, daftarkan dompet milik sendiri lewat pendamping desa.
      </Kotak>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Kotak judul={`Tarik ${rupiah(proof.amount)} ke dompet Anda`}>
        Transaksi ditandatangani dari dompet browser di jaringan <span className="text-ink-2">{proof.network}</span>. Boleh
        dikirim oleh Anda sendiri atau pendamping desa — dana selalu masuk ke dompet tujuan di atas.
        {!adaDompet && (
          <span className="mt-2 block text-ink-2">Dompet browser tidak terdeteksi. Pasang MetaMask atau buka halaman ini dari dompet in-app.</span>
        )}
      </Kotak>

      {txHash && (
        <div className="flex items-center justify-between gap-4 text-[13px]">
          <span className="text-ink-3">Transaksi</span>
          <Hash value={txHash} kepala={10} ekor={6} href={proof.network === "hardhat-local" ? undefined : `${EXPLORER_BASE}/tx/${txHash}`} />
        </div>
      )}

      {tahap === "sinkron" && (
        <Kotak judul="Transaksi berhasil — menunggu dicatat">
          Dana sudah terkirim on-chain. Portal memperbarui status setelah sistem membaca event klaim (biasanya kurang
          dari satu menit).
        </Kotak>
      )}

      {galat && (
        <div className="flex items-start gap-3 rounded-2xl bg-paper-2 p-4 ring-1 ring-[var(--hairline)]" role="alert">
          <span className="mt-px text-[var(--color-alert)]"><Alert className="h-4 w-4" /></span>
          <p className="text-[12px] leading-[1.65] text-ink-2">{galat}</p>
        </div>
      )}

      {(tahap === "siap" || tahap === "mengirim" || tahap === "menunggu") && (
        <div>
          <Button onClick={klaim} disabled={!adaDompet || tahap !== "siap"} icon={<Coins className="h-[15px] w-[15px]" />}>
            {tahap === "mengirim" ? "Konfirmasi di dompet…" : tahap === "menunggu" ? "Menunggu blok…" : "Klaim dengan dompet"}
          </Button>
        </div>
      )}
    </div>
  );
}
