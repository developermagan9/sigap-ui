"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "@/components/form/Field";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ArrowRight, Search } from "@/components/ui/Icons";
import { createWilayah, daftarWilayahReferensi, cariDesaReferensi } from "@/lib/actions";
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

/**
 * Form tambah wilayah kerja — empat dropdown bertingkat dari referensi
 * Kepmendagri 300.2.2-2138/2025 (38 provinsi → 514 kabupaten/kota → 7.285
 * kecamatan → 83.762 desa).
 *
 * Sebelumnya keempatnya adalah input teks bebas, jadi "Kecamatan Sleman" di
 * bawah "Provinsi Bali" tersimpan tanpa keberatan, dan salah ketik pada nama
 * desa langsung menjadi wilayah kerja baru yang mirip tapi berbeda dengan yang
 * sudah ada. Sekarang yang dikirim ke backend hanya kode desanya; nama diambil
 * server dari tabel referensi.
 *
 * Tiap tingkat memuat HANYA anak dari tingkat di atasnya — memilih DIY membuat
 * kolom kabupaten berisi lima kabupaten/kota DIY saja, bukan 514 se-Indonesia.
 */
export function FormWilayah({ awal }: { awal?: { provinsi: string; kabupaten: string; kecamatan: string } }) {
  const router = useRouter();

  // `opsi[i]` = daftar pilihan tingkat ke-i; `pilih[i]` = kode yang dipilih.
  const [opsi, setOpsi] = useState<WilayahReferensi[][]>([[], [], [], []]);
  const [pilih, setPilih] = useState<Pilihan>(KOSONG);
  const [memuat, setMemuat] = useState<number | null>(0);

  const [q, setQ] = useState("");
  const [hasilCari, setHasilCari] = useState<{ data: WilayahHasilCari[]; dipotong: boolean } | null>(null);
  const [mencari, setMencari] = useState(false);

  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  const pesan = (e: unknown) => (e instanceof Error ? e.message : "Terjadi kesalahan.");

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

  // Provinsi dimuat sekali saat form dipasang.
  useEffect(() => {
    void muatTingkat(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefill: lanjutkan dari kecamatan wilayah yang terakhir ditambahkan, karena
  // mendaftarkan beberapa desa dalam satu kecamatan adalah pola yang paling umum.
  // Dijalankan setelah provinsi ada supaya urutan cascade-nya tetap benar.
  const [sudahPrefill, setSudahPrefill] = useState(false);
  useEffect(() => {
    if (sudahPrefill || !awal || opsi[0].length === 0) return;
    setSudahPrefill(true);
    void (async () => {
      const [p, k, c] = [awal.provinsi, awal.kabupaten, awal.kecamatan];
      try {
        const kab = await daftarWilayahReferensi(p);
        const kec = await daftarWilayahReferensi(k);
        const desa = await daftarWilayahReferensi(c);
        setOpsi((o) => [o[0], kab, kec, desa]);
        setPilih([p, k, c, ""]);
      } catch {
        // Kode prefill bisa saja sudah tidak ada setelah pemekaran daerah —
        // biarkan form kembali ke keadaan kosong, bukan menampilkan galat.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opsi[0].length]);

  const pilihTingkat = (tingkat: number, kode: string) => {
    setSukses(null);
    setPilih((p) => p.map((v, i) => (i === tingkat ? kode : i > tingkat ? "" : v)) as Pilihan);
    if (tingkat < 3) {
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
      setOpsi((o) => [o[0], kab, kec, desa]);
      setPilih([kodeProvinsi, kodeKabupaten, kodeKecamatan, h.kode]);
      setHasilCari(null);
      setQ("");
    } catch (e) {
      setGalat(pesan(e));
    } finally {
      setMemuat(null);
    }
  };

  const kirim = async () => {
    setMengirim(true);
    setGalat(null);
    setSukses(null);
    try {
      const w = await createWilayah({ kode: pilih[3] });
      setSukses(`${w.desa}, ${w.kecamatan}, ${w.kabupaten} berhasil ditambahkan.`);
      // Provinsi/kabupaten/kecamatan sengaja dipertahankan — menambah beberapa
      // desa dalam satu kecamatan adalah pola pemakaian yang paling umum.
      setPilih((p) => [p[0], p[1], p[2], ""] as Pilihan);
      router.refresh();
    } catch (e) {
      setGalat(pesan(e));
    } finally {
      setMengirim(false);
    }
  };

  return (
    <section className="rule-card p-6 sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Tambah wilayah kerja</p>
      <p className="mt-3 text-[12px] leading-[1.65] text-[var(--color-ink-3)]">
        Pilihan mengikuti data wilayah administratif resmi (Kepmendagri 300.2.2-2138/2025). Tiap
        tingkat hanya memuat wilayah yang benar-benar berada di bawah pilihan sebelumnya.
      </p>

      {/* Jalan pintas: 4 dropdown menuntut pengguna tahu kabupaten & kecamatannya
          lebih dulu. Yang cuma tahu nama desanya bisa mencarinya langsung. */}
      <div className="mt-6">
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
            <LoadingButton
              onClick={cari}
              loading={mencari}
              disabled={q.trim().length < 3}
              icon={<Search className="h-4 w-4" />}
            >
              Cari
            </LoadingButton>
          </div>
        </Field>

        {hasilCari && (
          <div className="mt-3 rounded-2xl ring-1 ring-[var(--color-line)]">
            {hasilCari.data.length === 0 ? (
              <p className="p-4 text-[12px] text-[var(--color-ink-3)]">
                Tidak ada desa/kelurahan yang cocok dengan “{q}”.
              </p>
            ) : (
              <>
                <ul className="max-h-64 overflow-y-auto">
                  {hasilCari.data.map((h) => (
                    <li key={h.kode} className="border-b border-[var(--color-line)] last:border-b-0">
                      <button
                        type="button"
                        onClick={() => void pakaiHasil(h)}
                        className="block w-full px-4 py-3 text-left transition-colors hover:bg-[var(--color-canvas)]"
                      >
                        <span className="text-[13px] text-[var(--color-ink)]">{h.desa}</span>
                        <span className="ml-2 text-[11px] text-[var(--color-ink-3)]">
                          {h.kecamatan}, {h.kabupaten}, {h.provinsi}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {hasilCari.dipotong && (
                  <p className="border-t border-[var(--color-line)] px-4 py-2 text-[11px] text-[var(--color-ink-3)]">
                    Hanya {hasilCari.data.length} hasil pertama yang ditampilkan — persempit kata kuncinya.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {TINGKAT.map((t, i) => {
          const terkunci = i > 0 && !pilih[i - 1];
          return (
            <Field
              key={t.kunci}
              label={t.label}
              wajib
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
                className={inputCls}
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
        <p className="mt-5 text-[11px] text-[var(--color-ink-3)]">
          Kode wilayah: <span className="font-mono text-[var(--color-ink-2)]">{pilih[3]}</span>
        </p>
      )}

      {galat && <p className="mt-5 text-[12px] leading-6 text-[var(--color-alert)]">{galat}</p>}
      {sukses && <p className="mt-5 text-[12px] leading-6 text-[var(--color-primary)]">{sukses}</p>}

      <div className="mt-6">
        <LoadingButton
          onClick={kirim}
          loading={mengirim}
          disabled={!pilih[3]}
          icon={<ArrowRight className="h-4 w-4" />}
        >
          Tambah wilayah
        </LoadingButton>
      </div>
    </section>
  );
}
