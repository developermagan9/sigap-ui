"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { batalkanApproval, finalizeRanking } from "@/lib/actions";
import { angka, rupiahRingkas } from "@/lib/format";

export function ApprovalPanel({
  periodeId,
  kuotaPenerima,
  totalAlokasi,
  merkleRoot,
  bisaSahkan,
  bisaBatalkan = false,
}: {
  periodeId: string;
  kuotaPenerima: number;
  totalAlokasi: number;
  merkleRoot: string | null;
  bisaSahkan: boolean;
  /** Sudah disahkan tapi root belum dikirim on-chain — pengesahan masih bisa ditarik. */
  bisaBatalkan?: boolean;
}) {
  const router = useRouter();
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [menyahkan, setMenyahkan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [batal, setBatal] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [membatalkan, setMembatalkan] = useState(false);

  const batalkan = async () => {
    if (alasan.trim().length < 5) {
      setGalat("Tulis alasan pembatalan (minimal 5 karakter).");
      return;
    }
    setMembatalkan(true);
    setGalat(null);
    try {
      await batalkanApproval(periodeId, alasan.trim());
      setBatal(false);
      setAlasan("");
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal membatalkan pengesahan.");
    } finally {
      setMembatalkan(false);
    }
  };

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
      <div className="mt-6 flex flex-wrap gap-3">
        {bisaBatalkan ? (
          <Button
            variant="ghost"
            onClick={() => {
              setGalat(null);
              setBatal(true);
            }}
          >
            Batalkan pengesahan
          </Button>
        ) : (
          <Button onClick={() => setKonfirmasi(true)} disabled={!bisaSahkan}>
            {bisaSahkan ? "Sahkan daftar final" : "Jalankan alokasi dulu"}
          </Button>
        )}
      </div>
      {bisaBatalkan && (
        <p className="mt-3 text-[12px] leading-[1.6] text-[var(--color-ink-3)]">
          Daftar sudah disahkan tapi belum dikirim on-chain. Membatalkan mengembalikan periode ke tahap alokasi
          supaya ranking atau alokasi bisa dijalankan ulang.
        </p>
      )}
      {galat && !konfirmasi && !batal && <p className="mt-3 text-[12px] leading-[1.6] text-[var(--color-alert)]">{galat}</p>}

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

      <ConfirmDialog
        open={batal}
        onClose={() => !membatalkan && setBatal(false)}
        onConfirm={batalkan}
        loading={membatalkan}
        tone="danger"
        title="Batalkan pengesahan daftar final?"
        description="Status kembali ke alokasi, ranking kembali draft, dan Merkle root beserta data penyaluran yang belum dikirim dibuang. Alasan dicatat di jejak audit."
        confirmLabel="Ya, batalkan"
      >
        <label className="mt-4 block">
          <span className="text-[11px] text-[var(--color-ink-3)]">Alasan pembatalan</span>
          <textarea
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            rows={3}
            placeholder="mis. Ada sanggahan data yang diterima setelah pengesahan"
            className="mt-1.5 w-full rounded border border-[var(--color-line)] bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-[var(--color-primary)]"
          />
        </label>
        {galat && <p className="mt-3 text-[12px] leading-[1.6] text-[var(--color-alert)]">{galat}</p>}
      </ConfirmDialog>
    </>
  );
}
