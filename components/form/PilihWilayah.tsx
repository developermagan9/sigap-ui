"use client";

import { useEffect, useState } from "react";
import { Field, inputCls, inputErrCls } from "./Field";
import { Search } from "@/components/ui/Icons";
import { daftarWilayahReferensi, cariDesaReferensi } from "@/lib/actions";
import type { WilayahReferensi, WilayahHasilCari } from "@/lib/api";

/** Empat tingkat administratif, dari luar ke dalam. */
const TINGKAT = [
  { kunci: "provinsi", label: "Provinsi" },
  { kunci: "kabupaten", label: "Kabupaten / Kota" },
  { kunci: "kecamatan", label: "Kecamatan" },
  { kunci: "desa", label: "Desa / Kelurahan" },
] as const;

type Pilihan = [string, string, string, string];

const KOSONG: Pilihan = ["", "", "", ""];

export type WilayahTerpilih = {
  /** Kode desa Kepmendagri `PP.KK.CC.DDDD`, atau "" kalau belum lengkap. */
  kode: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
};

/**
 * Alamat administratif: empat dropdown bertingkat dari referensi Kepmendagri
 * 300.2.2-2138/2025 (38 provinsi → 514 kabupaten/kota → 7.285 kecamatan →
 * 83.762 desa/kelurahan), plus pencarian desa langsung.
 *
 * Sebelumnya petugas hanya bisa memilih dari daftar "wilayah kerja" yang lebih
 * dulu didaftarkan admin di `/admin/wilayah`; mendata satu KK di desa yang
 * belum terdaftar berarti berhenti dan menunggu admin. Menu itu dihapus —
 * alamatnya dipilih di sini, dan baris wilayahnya dibuat backend dari kode desa
 * saat penyimpanan pertama.
 *
 * Tiap tingkat memuat HANYA anak dari tingkat di atasnya: memilih DI Yogyakarta
 * membuat kolom kabupaten berisi lima kabupaten/kota DIY saja, bukan 514
 * se-Indonesia. Yang keluar dari komponen ini cuma kode desanya — nama keempat
 * tingkat diambil server dari tabel referensi, jadi kombinasi mustahil seperti
 * "Kecamatan Sleman" di bawah "Provinsi Bali" tidak bisa tersimpan.
 */
export function PilihWilayah({
  onPilih,
  tandaiKosong = false,
}: {
  onPilih: (w: WilayahTerpilih) => void;
  /** Merahkan tingkat yang belum dipilih (dipakai setelah percobaan simpan). */
  tandaiKosong?: boolean;
}) {
  // `opsi[i]` = daftar pilihan tingkat ke-i; `pilih[i]` = kode yang dipilih.
  const [opsi, setOpsi] = useState<WilayahReferensi[][]>([[], [], [], []]);
  const [pilih, setPilih] = useState<Pilihan>(KOSONG);
  const [memuat, setMemuat] = useState<number | null>(0);
  const [galat, setGalat] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [hasilCari, setHasilCari] = useState<{ data: WilayahHasilCari[]; dipotong: boolean } | null>(null);
  const [mencari, setMencari] = useState(false);

  const pesan = (e: unknown) => (e instanceof Error ? e.message : "Terjadi kesalahan.");

  /** Laporkan pilihan ke induk — kode hanya dianggap sah kalau keempatnya terisi. */
  const lapor = (p: Pilihan, o: WilayahReferensi[][]) => {
    const nama = (i: number) => o[i].find((x) => x.kode === p[i])?.nama ?? "";
    onPilih({
      kode: p[3],
      provinsi: nama(0),
      kabupaten: nama(1),
      kecamatan: nama(2),
      desa: nama(3),
    });
  };

  /** Muat opsi satu tingkat dan kosongkan tingkat-tingkat di bawahnya. */
  const muatTingkat = async (tingkat: number, induk?: string) => {
    setMemuat(tingkat);
    setGalat(null);
    try {
      const data = await daftarWilayahReferensi(induk);
      setOpsi((o) => o.map((v, i) => (i === tingkat ? data : i > tingkat ? [] : v)));
    } catch (e) {
      setGalat(pesan(e));
      setOpsi((o) => o.map((v, i) => (i >= tingkat ? [] : v)));
    } finally {
      setMemuat(null);
    }
  };

  // Provinsi dimuat sekali saat komponen dipasang.
  useEffect(() => {
    void muatTingkat(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pilihTingkat = (tingkat: number, kode: string) => {
    const baru = pilih.map((v, i) => (i === tingkat ? kode : i > tingkat ? "" : v)) as Pilihan;
    setPilih(baru);
    if (tingkat === 3) {
      lapor(baru, opsi);
    } else {
      // Tingkat di bawahnya ikut kosong, jadi kode desa batal — induk harus tahu.
      lapor(baru, opsi);
      if (kode) void muatTingkat(tingkat + 1, kode);
      else setOpsi((o) => o.map((v, i) => (i > tingkat ? [] : v)));
    }
  };

  const cari = async () => {
    setMencari(true);
    setGalat(null);
    setHasilCari(null);
    try {
      const r = await cariDesaReferensi(q.trim());
      setHasilCari({ data: r.data, dipotong: !!r.dipotong });
    } catch (e) {
      setGalat(pesan(e));
    } finally {
      setMencari(false);
    }
  };

  /** Pakai satu hasil pencarian: isi keempat dropdown dari kodenya. */
  const pakaiHasil = async (h: WilayahHasilCari) => {
    const [p, k, c] = h.kode.split(".");
    const kodeProvinsi = p;
    const kodeKabupaten = `${p}.${k}`;
    const kodeKecamatan = `${p}.${k}.${c}`;
    setMemuat(1);
    setGalat(null);
    try {
      const [kab, kec, desa] = await Promise.all([
        daftarWilayahReferensi(kodeProvinsi),
        daftarWilayahReferensi(kodeKabupaten),
        daftarWilayahReferensi(kodeKecamatan),
      ]);
      const opsiBaru: WilayahReferensi[][] = [opsi[0], kab, kec, desa];
      const pilihBaru: Pilihan = [kodeProvinsi, kodeKabupaten, kodeKecamatan, h.kode];
      setOpsi(opsiBaru);
      setPilih(pilihBaru);
      lapor(pilihBaru, opsiBaru);
      setHasilCari(null);
      setQ("");
    } catch (e) {
      setGalat(pesan(e));
    } finally {
      setMemuat(null);
    }
  };

  return (
    <div>
      {/* Jalan pintas: 4 dropdown menuntut petugas tahu kabupaten & kecamatannya
          lebih dulu. Yang cuma tahu nama desanya bisa mencarinya langsung. */}
      <Field label="Cari desa langsung" hint="opsional, minimal 3 huruf">
        <div className="flex gap-2">
          <input
            className={inputCls}
            value={q}
            placeholder="mis. Balecatur"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (q.trim().length >= 3) void cari();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void cari()}
            disabled={q.trim().length < 3 || mencari}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-ink/[0.05] px-4 text-[12px]
              ring-1 ring-[var(--hairline)] transition-all duration-500
              ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.09] active:scale-[0.97]
              disabled:opacity-40 disabled:pointer-events-none"
          >
            <Search className="h-3.5 w-3.5" />
            {mencari ? "Mencari…" : "Cari"}
          </button>
        </div>
      </Field>

      {hasilCari && (
        <div className="mt-3 rounded-2xl ring-1 ring-[var(--hairline)]">
          {hasilCari.data.length === 0 ? (
            <p className="p-4 text-[12px] text-ink-3">Tidak ada desa/kelurahan yang cocok dengan “{q}”.</p>
          ) : (
            <>
              <ul className="max-h-64 overflow-y-auto">
                {hasilCari.data.map((h) => (
                  <li key={h.kode} className="border-b border-[var(--hairline)] last:border-b-0">
                    <button
                      type="button"
                      onClick={() => void pakaiHasil(h)}
                      className="block w-full px-4 py-3 text-left transition-colors hover:bg-paper-2"
                    >
                      <span className="text-[13px] text-ink">{h.desa}</span>
                      <span className="ml-2 text-[11px] text-ink-3">
                        {h.kecamatan}, {h.kabupaten}, {h.provinsi}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {hasilCari.dipotong && (
                <p className="border-t border-[var(--hairline)] px-4 py-2 text-[11px] text-ink-3">
                  Hanya {hasilCari.data.length} hasil pertama yang ditampilkan — persempit kata kuncinya.
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {TINGKAT.map((t, i) => {
          const terkunci = i > 0 && !pilih[i - 1];
          const kosong = tandaiKosong && !pilih[i];
          return (
            <Field
              key={t.kunci}
              label={t.label}
              wajib
              error={kosong ? "Kolom ini wajib diisi." : undefined}
              hint={
                memuat === i
                  ? "memuat…"
                  : terkunci
                    ? `pilih ${TINGKAT[i - 1].label.toLowerCase()} dulu`
                    : opsi[i].length > 0
                      ? `${opsi[i].length} pilihan`
                      : undefined
              }
            >
              <select
                name={`wilayah-${t.kunci}`}
                className={kosong ? inputErrCls : inputCls}
                value={pilih[i]}
                disabled={terkunci || memuat === i || opsi[i].length === 0}
                onChange={(e) => pilihTingkat(i, e.target.value)}
              >
                <option value="">— pilih {t.label.toLowerCase()} —</option>
                {opsi[i].map((o) => (
                  <option key={o.kode} value={o.kode}>
                    {o.nama}
                  </option>
                ))}
              </select>
            </Field>
          );
        })}
      </div>

      {pilih[3] && (
        <p className="mt-4 text-[11px] text-ink-3">
          Kode wilayah: <span className="font-mono text-ink-2">{pilih[3]}</span>
        </p>
      )}

      {galat && <p className="mt-4 text-[12px] leading-6 text-clay">{galat}</p>}
    </div>
  );
}
