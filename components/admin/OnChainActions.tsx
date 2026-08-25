"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Check, Cube } from "@/components/ui/Icons";
import { buildMerkle, submitOnchain } from "@/lib/actions";

type Aksi = "merkle" | "submit";

export function OnChainActions({
  periodeId,
  merkleRoot,
  txHash,
}: {
  periodeId: string;
  merkleRoot: string | null;
  txHash: string | null;
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
      {galat && !konfirmasi && <p className="text-[12px] leading-6 text-[var(--color-alert)]">{galat}</p>}

      <ConfirmDialog
        open={!!konfirmasi}
        onClose={() => !memproses && setKonfirmasi(null)}
        onConfirm={jalankan}
        loading={memproses}
        tone="danger"
        title={konfirmasi === "merkle" ? "Bangun Merkle root sekarang?" : "Submit transaksi on-chain sekarang?"}
        description={
          konfirmasi === "merkle"
            ? "Server memeriksa invarian alokasi (jumlah, wallet unik, kuota, amount > 0) sebelum root dikunci. Gagal satu berarti proses berhenti."
            : "Root yang sudah dibangun akan dikirim sebagai transaksi. Daftar penerima tidak bisa diubah lagi setelah ini."
        }
        confirmLabel={konfirmasi === "merkle" ? "Ya, bangun" : "Ya, submit"}
      >
        {galat && <p className="mt-3 text-[12px] leading-[1.6] text-[var(--color-alert)]">{galat}</p>}
      </ConfirmDialog>
    </div>
  );
}
