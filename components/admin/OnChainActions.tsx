"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Check, Coins, Cube, Link as IconLink } from "@/components/ui/Icons";
import { buildMerkle, danaiKontrak, setBatasKlaim, submitOnchain, syncKlaim, tarikSisaDana } from "@/lib/actions";
import { rupiah, waktu } from "@/lib/format";

type Aksi = "merkle" | "submit" | "dana" | "sync" | "batas" | "tarik";

const inputCls =
  "mt-1.5 w-full rounded border border-[var(--color-line)] bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-[var(--color-primary)]";

/** `datetime-local` butuh "YYYY-MM-DDTHH:mm" waktu lokal, bukan ISO UTC. */
function keInputLokal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function OnChainActions({
  periodeId,
  merkleRoot,
  txHash,
  onchain,
  danaOnchain,
  batasKlaim,
  klaimDitutup,
  totalPending,
}: {
  periodeId: string;
  merkleRoot: string | null;
  txHash: string | null;
  /** Periode benar-benar diregistrasi di kontrak (bukan simulasi). */
  onchain: boolean;
  /** Dari `disbursement-status`; `null` = periode belum on-chain sungguhan (atau RPC tak terjangkau). */
  danaOnchain: { saldo_kontrak: number; kebutuhan: number; cukup: boolean } | null;
  batasKlaim: string | null;
  klaimDitutup: boolean;
  totalPending: number;
}) {
  const router = useRouter();
  const [konfirmasi, setKonfirmasi] = useState<Aksi | null>(null);
  const [memproses, setMemproses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [batasInput, setBatasInput] = useState("");
  const [tujuan, setTujuan] = useState("");

  const batasLewat = !!batasKlaim && new Date(batasKlaim).getTime() < Date.now();

  const buka = (aksi: Aksi) => {
    setGalat(null);
    setInfo(null);
    if (aksi === "batas") {
      const awal = batasKlaim ? new Date(batasKlaim) : new Date(Date.now() + 30 * 24 * 3600_000);
      setBatasInput(keInputLokal(new Date(Math.max(awal.getTime(), Date.now() + 3600_000))));
    }
    setKonfirmasi(aksi);
  };

  const jalankan = async () => {
    if (!konfirmasi) return;
    setMemproses(true);
    setGalat(null);
    try {
      if (konfirmasi === "merkle") await buildMerkle(periodeId);
      else if (konfirmasi === "dana") await danaiKontrak(periodeId);
      else if (konfirmasi === "sync") {
        const r = await syncKlaim(periodeId);
        setInfo(`${r.klaim_baru} klaim baru tercatat · total ${r.total_claimed} (blok ${r.dipindai_sampai_blok}).`);
      } else if (konfirmasi === "batas") {
        const d = new Date(batasInput);
        if (!batasInput || Number.isNaN(d.getTime())) throw new Error("Isi tanggal & jam batas klaim.");
        await setBatasKlaim(periodeId, d.toISOString());
      } else if (konfirmasi === "tarik") {
        const t = tujuan.trim();
        if (t && !/^0x[0-9a-fA-F]{40}$/.test(t)) throw new Error("Alamat tujuan harus 0x + 40 karakter hex.");
        const r = await tarikSisaDana(periodeId, t || undefined);
        setInfo(`${rupiah(r.jumlah_ditarik)} ditarik ke ${r.tujuan.slice(0, 10)}…; ${r.record_tidak_diklaim} penerima ditandai tidak diklaim.`);
      } else await submitOnchain(periodeId);
      setKonfirmasi(null);
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Aksi gagal dijalankan.");
    } finally {
      setMemproses(false);
    }
  };

  const judul: Record<Aksi, string> = {
    merkle: "Bangun Merkle root sekarang?",
    submit: "Submit transaksi on-chain sekarang?",
    dana: "Danai kontrak penyaluran?",
    sync: "Sinkronkan klaim dari chain?",
    batas: batasKlaim ? "Perpanjang batas klaim?" : "Tetapkan batas klaim?",
    tarik: "Tutup klaim dan tarik sisa dana?",
  };
  const deskripsi: Record<Aksi, string> = {
    merkle:
      "Server memeriksa invarian alokasi (jumlah, wallet unik, kuota, amount > 0) sebelum root dikunci. Gagal satu berarti proses berhenti.",
    submit: "Root yang sudah dibangun akan dikirim sebagai transaksi. Daftar penerima tidak bisa diubah lagi setelah ini.",
    dana: danaOnchain
      ? `Wallet admin akan men-deposit ${rupiah(danaOnchain.kebutuhan - danaOnchain.saldo_kontrak)} token ke kontrak, supaya seluruh penerima yang belum klaim bisa menarik dananya.`
      : "",
    sync: "Membaca event FundDisbursed dari kontrak sekarang juga, tanpa menunggu poller berikutnya.",
    batas:
      "Batas dicatat di kontrak. Setelah lewat, klaim ditolak kontrak dan sisa dana bisa ditarik. Batas hanya bisa diperpanjang, tidak bisa dimajukan.",
    tarik: `Klaim yang belum tercatat disinkronkan dulu. Sisa saldo periode ditarik dari kontrak, dan ${totalPending} penerima yang belum klaim ditandai "tidak diklaim".`,
  };
  const labelKonfirmasi: Record<Aksi, string> = {
    merkle: "Ya, bangun",
    submit: "Ya, submit",
    dana: "Ya, danai",
    sync: "Ya, sinkronkan",
    batas: "Ya, simpan batas",
    tarik: "Ya, tarik sisa",
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {!merkleRoot && (
          <LoadingButton onClick={() => buka("merkle")} icon={<Cube className="h-[15px] w-[15px]" />}>
            Bangun Merkle Root
          </LoadingButton>
        )}
        {merkleRoot && !txHash && (
          <LoadingButton onClick={() => buka("submit")} icon={<Check className="h-[15px] w-[15px]" />}>
            Submit ke Chain
          </LoadingButton>
        )}
        {danaOnchain && !danaOnchain.cukup && !klaimDitutup && !batasLewat && (
          <LoadingButton onClick={() => buka("dana")} icon={<Coins className="h-[15px] w-[15px]" />}>
            Danai Kontrak
          </LoadingButton>
        )}
        {onchain && (
          <LoadingButton variant="ghost" onClick={() => buka("sync")} icon={<IconLink className="h-[15px] w-[15px]" />}>
            Sinkron Klaim
          </LoadingButton>
        )}
        {onchain && !klaimDitutup && !batasLewat && (
          <LoadingButton variant="ghost" onClick={() => buka("batas")}>
            {batasKlaim ? "Perpanjang Batas Klaim" : "Atur Batas Klaim"}
          </LoadingButton>
        )}
        {onchain && !klaimDitutup && batasLewat && (
          <LoadingButton onClick={() => buka("tarik")} icon={<Coins className="h-[15px] w-[15px]" />}>
            Tarik Sisa Dana
          </LoadingButton>
        )}
      </div>
      {batasKlaim && (
        <p className="text-[12px] text-[var(--color-ink-3)]">
          {klaimDitutup ? "Klaim ditutup" : batasLewat ? "Masa klaim berakhir" : "Batas klaim"}: {waktu(batasKlaim)}
        </p>
      )}
      {info && !konfirmasi && <p className="text-[12px] leading-6 text-[var(--color-primary)]">{info}</p>}
      {galat && !konfirmasi && <p className="text-[12px] leading-6 text-[var(--color-alert)]">{galat}</p>}

      <ConfirmDialog
        open={!!konfirmasi}
        onClose={() => !memproses && setKonfirmasi(null)}
        onConfirm={jalankan}
        loading={memproses}
        tone={konfirmasi === "sync" ? "primary" : "danger"}
        title={konfirmasi ? judul[konfirmasi] : ""}
        description={konfirmasi ? deskripsi[konfirmasi] : undefined}
        confirmLabel={konfirmasi ? labelKonfirmasi[konfirmasi] : undefined}
      >
        {konfirmasi === "batas" && (
          <label className="mt-4 block">
            <span className="text-[11px] text-[var(--color-ink-3)]">Batas klaim (waktu lokal)</span>
            <input type="datetime-local" value={batasInput} onChange={(e) => setBatasInput(e.target.value)} className={inputCls} />
          </label>
        )}
        {konfirmasi === "tarik" && (
          <label className="mt-4 block">
            <span className="text-[11px] text-[var(--color-ink-3)]">Alamat tujuan (kosongkan = wallet admin)</span>
            <input value={tujuan} onChange={(e) => setTujuan(e.target.value)} placeholder="0x…" className={`${inputCls} font-mono`} />
          </label>
        )}
        {galat && <p className="mt-3 text-[12px] leading-[1.6] text-[var(--color-alert)]">{galat}</p>}
      </ConfirmDialog>
    </div>
  );
}
