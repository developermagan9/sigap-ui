"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { finalizeRanking } from "@/lib/actions";
import { angka, rupiahRingkas } from "@/lib/format";

export function ApprovalPanel({
  periodeId,
  kuotaPenerima,
  totalAlokasi,
  merkleRoot,
  bisaSahkan,
}: {
  periodeId: string;
  kuotaPenerima: number;
  totalAlokasi: number;
  merkleRoot: string | null;
  bisaSahkan: boolean;
}) {
  const router = useRouter();
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [menyahkan, setMenyahkan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const sahkan = async () => {
    setMenyahkan(true);
    setGalat(null);
    try {
      await finalizeRanking(periodeId, "Disahkan lewat halaman Review & Approval.");
      setKonfirmasi(false);
      router.push("/admin/on-chain");
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal menyahkan daftar final.");
    } finally {
      setMenyahkan(false);
    }
  };

  return (
    <>
      <dl className="mt-4 space-y-4 text-[13px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--color-ink-3)]">Jumlah penerima</dt>
          <dd className="font-mono">{angka(kuotaPenerima)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--color-ink-3)]">Total alokasi</dt>
          <dd className="font-mono">{rupiahRingkas(totalAlokasi)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--color-ink-3)]">Merkle root</dt>
          <dd className="font-mono">{merkleRoot ? `${merkleRoot.slice(0, 10)}...${merkleRoot.slice(-6)}` : "belum dibangun"}</dd>
        </div>
      </dl>
      <div className="mt-6">
        <Button onClick={() => setKonfirmasi(true)} disabled={!bisaSahkan}>
          {bisaSahkan ? "Sahkan daftar final" : "Jalankan alokasi dulu"}
        </Button>
      </div>
      {galat && !konfirmasi && <p className="mt-3 text-[12px] leading-[1.6] text-[var(--color-alert)]">{galat}</p>}

      <ConfirmDialog
        open={konfirmasi}
        onClose={() => !menyahkan && setKonfirmasi(false)}
        onConfirm={sahkan}
        loading={menyahkan}
        tone="danger"
        title="Sahkan daftar final ini?"
        description={`${angka(kuotaPenerima)} penerima dengan total ${rupiahRingkas(totalAlokasi)} akan disahkan dan siap dikirim ke kontrak pencairan. Keputusan ini tercatat di jejak audit.`}
        confirmLabel="Ya, sahkan"
      >
        {galat && <p className="mt-3 text-[12px] leading-[1.6] text-[var(--color-alert)]">{galat}</p>}
      </ConfirmDialog>
    </>
  );
}
