"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Check, Coins, Cube } from "@/components/ui/Icons";
import { buildMerkle, danaiKontrak, submitOnchain } from "@/lib/actions";
import { rupiah } from "@/lib/format";

type Aksi = "merkle" | "submit" | "dana";

export function OnChainActions({
  periodeId,
  merkleRoot,
  txHash,
  danaOnchain,
}: {
  periodeId: string;
  merkleRoot: string | null;
  txHash: string | null;
  /** Dari `disbursement-status`; `null` = periode belum on-chain sungguhan (atau RPC tak terjangkau). */
  danaOnchain: { saldo_kontrak: number; kebutuhan: number; cukup: boolean } | null;
}) {
  const router = useRouter();
  const [konfirmasi, setKonfirmasi] = useState<Aksi | null>(null);
  const [memproses, setMemproses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const jalankan = async () => {
    if (!konfirmasi) return;
    setMemproses(true);
    setGalat(null);
    try {
      if (konfirmasi === "merkle") await buildMerkle(periodeId);
      else if (konfirmasi === "dana") await danaiKontrak(periodeId);
      else await submitOnchain(periodeId);
      setKonfirmasi(null);
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Aksi gagal dijalankan.");
    } finally {
      setMemproses(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!merkleRoot && (
        <LoadingButton onClick={() => setKonfirmasi("merkle")} icon={<Cube className="h-[15px] w-[15px]" />}>
          Bangun Merkle Root
        </LoadingButton>
      )}
      {merkleRoot && !txHash && (
        <LoadingButton onClick={() => setKonfirmasi("submit")} icon={<Check className="h-[15px] w-[15px]" />}>
          Submit ke Chain
        </LoadingButton>
      )}
      {danaOnchain && !danaOnchain.cukup && (
        <LoadingButton onClick={() => setKonfirmasi("dana")} icon={<Coins className="h-[15px] w-[15px]" />}>
          Danai Kontrak
        </LoadingButton>
      )}
      {galat && !konfirmasi && <p className="text-[12px] leading-6 text-[var(--color-alert)]">{galat}</p>}

      <ConfirmDialog
        open={!!konfirmasi}
        onClose={() => !memproses && setKonfirmasi(null)}
        onConfirm={jalankan}
        loading={memproses}
        tone="danger"
        title={
          konfirmasi === "merkle"
            ? "Bangun Merkle root sekarang?"
            : konfirmasi === "dana"
              ? "Danai kontrak penyaluran?"
              : "Submit transaksi on-chain sekarang?"
        }
        description={
          konfirmasi === "merkle"
            ? "Server memeriksa invarian alokasi (jumlah, wallet unik, kuota, amount > 0) sebelum root dikunci. Gagal satu berarti proses berhenti."
            : konfirmasi === "dana" && danaOnchain
              ? `Wallet admin akan men-deposit ${rupiah(danaOnchain.kebutuhan - danaOnchain.saldo_kontrak)} token ke kontrak, supaya seluruh penerima yang belum klaim bisa menarik dananya.`
              : "Root yang sudah dibangun akan dikirim sebagai transaksi. Daftar penerima tidak bisa diubah lagi setelah ini."
        }
        confirmLabel={konfirmasi === "merkle" ? "Ya, bangun" : konfirmasi === "dana" ? "Ya, danai" : "Ya, submit"}
      >
        {galat && <p className="mt-3 text-[12px] leading-[1.6] text-[var(--color-alert)]">{galat}</p>}
      </ConfirmDialog>
    </div>
  );
}
