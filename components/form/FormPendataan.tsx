"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bezel } from "@/components/ui/Bezel";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Field, inputCls, inputErrCls } from "./Field";
import { PilihWilayah, type WilayahTerpilih } from "./PilihWilayah";
import { Alert, Check, Cross, Users } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { createRumahTangga } from "@/lib/actions";
import { rupiah } from "@/lib/format";

type Anggota = {
  id: number;
  nama: string;
  nik: string;
  hubungan: "kepala" | "istri_suami" | "anak" | "orang_tua" | "famili_lain";
  lahir: string;
  disabilitas: boolean;
  tanggungan: boolean;
};

const HUBUNGAN: { v: Anggota["hubungan"]; l: string }[] = [
  { v: "kepala", l: "Kepala keluarga" },
  { v: "istri_suami", l: "Istri / suami" },
  { v: "anak", l: "Anak" },
  { v: "orang_tua", l: "Orang tua" },
  { v: "famili_lain", l: "Famili lain" },
];

/** Kelas input di dalam kartu anggota keluarga — dipisah supaya baris yang
 *  belum lengkap bisa ditandai merah persis seperti kolom utama di atas. */
const anggotaCls =
  "rounded-xl bg-card px-3 py-2.5 text-[12px] ring-1 ring-[var(--hairline)] outline-none " +
  "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus:ring-sage/40";

const anggotaErrCls =
  "rounded-xl bg-clay-soft px-3 py-2.5 text-[12px] ring-1 ring-clay/40 outline-none " +
  "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]";

const umur = (lahir: string) => {
  if (!lahir) return null;
  const d = new Date(lahir);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 31_557_600_000);
};

const WILAYAH_KOSONG: WilayahTerpilih = { kode: "", provinsi: "", kabupaten: "", kecamatan: "", desa: "" };

export function FormPendataan({
  periodeId,
}: {
  /** Periode program yang sedang aktif — datang dari server component pemanggil
   *  (lihat lib/periode.ts), bukan lagi konstanta hardcode. */
  periodeId: string;
}) {
  const router = useRouter();
  const [namaKepala, setNamaKepala] = useState("");
  const [nik, setNik] = useState("");
  const [noKk, setNoKk] = useState("");
  const [alamat, setAlamat] = useState("");
  /** Provinsi → kabupaten/kota → kecamatan → desa, dipilih dari referensi
   *  Kepmendagri di <PilihWilayah>. Yang dikirim ke backend cuma `kode`-nya. */
  const [wil, setWil] = useState<WilayahTerpilih>(WILAYAH_KOSONG);
  const [pendapatan, setPendapatan] = useState("");
  const [rumah, setRumah] = useState(3);
  const [didik, setDidik] = useState(3);
  const [riwayat, setRiwayat] = useState(false);
  const [jenisWallet, setJenisWallet] = useState<"belum" | "mandiri" | "custodial">("belum");
  const [walletAddress, setWalletAddress] = useState("");
  const [anggota, setAnggota] = useState<Anggota[]>([
    { id: 1, nama: "", nik: "", hubungan: "kepala", lahir: "", disabilitas: false, tanggungan: false },
  ]);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  /** Petugas sudah menekan "Simpan" minimal sekali — sebelum itu form tidak
   *  memerahkan kolom yang masih kosong supaya tidak menghakimi isian yang
   *  memang belum sempat diketik. */
  const [dicoba, setDicoba] = useState(false);
  const toast = useToast();

  const galat = useMemo(() => {
    const g: Record<string, string> = {};

    if (nik && nik.length !== 16) g.nik = "NIK harus 16 digit.";
    if (noKk && noKk.length !== 16) g.noKk = "No. KK harus 16 digit.";

    const kepala = anggota.filter((a) => a.hubungan === "kepala");
    if (kepala.length !== 1) g.anggota = "Harus ada tepat satu anggota berstatus kepala keluarga.";
    else if (nik && kepala[0].nik && kepala[0].nik !== nik)
      g.anggota = "NIK anggota berstatus kepala keluarga harus sama dengan NIK kepala keluarga di atas.";
    else if (anggota.some((a) => !a.nama.trim()))
      g.anggota = "Setiap anggota keluarga harus punya nama.";

    const nikAnggota = anggota.map((a) => a.nik).filter(Boolean);
    if (new Set(nikAnggota).size !== nikAnggota.length)
      g.anggota = "Ada NIK anggota yang tercatat dua kali di kartu keluarga ini.";

    if (pendapatan && +pendapatan < 0) g.pendapatan = "Pendapatan tidak boleh negatif.";

    if (jenisWallet === "mandiri" && walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress))
      g.wallet = "Alamat wallet harus format 0x + 40 karakter heksadesimal.";

    return g;
  }, [nik, noKk, anggota, pendapatan, jenisWallet, walletAddress]);

  // Kolom turunan: dihitung sistem, tidak boleh diketik petugas
  const turunan = useMemo(() => {
    const tanggungan = anggota.filter((a) => a.tanggungan).length;
    const disabilitasLansia = anggota.filter((a) => {
      const u = umur(a.lahir);
      return a.disabilitas || (u !== null && u >= 60);
    }).length;
    const jiwa = anggota.length;
    const perKapita = pendapatan && jiwa > 0 ? Math.round(+pendapatan / jiwa) : 0;
    return { tanggungan, disabilitasLansia, jiwa, perKapita };
  }, [anggota, pendapatan]);

  /** Kolom wajib yang masih kosong, dalam bahasa yang sama dengan label di
   *  layar — dulu ini cuma boolean `lengkap`, jadi tombol mati tanpa memberi
   *  tahu kolom mana yang kurang (kolom anggota keluarga paling sering
   *  terlewat karena tidak bertanda wajib sama sekali). */
  const kurang = useMemo(() => {
    const k: string[] = [];
    if (!namaKepala.trim()) k.push("Nama kepala keluarga");
    if (nik.length !== 16) k.push("NIK kepala keluarga — 16 digit");
    if (noKk.length !== 16) k.push("Nomor kartu keluarga — 16 digit");
    if (!wil.kode) k.push("Alamat administratif — provinsi sampai desa/kelurahan");
    if (!alamat.trim()) k.push("Alamat detail (RT/RW, nama jalan)");
    if (!pendapatan) k.push("Pendapatan rumah tangga");
    if (jenisWallet === "mandiri" && !walletAddress.trim()) k.push("Alamat wallet penerima");

    anggota.forEach((a, i) => {
      const kosong: string[] = [];
      if (!a.nama.trim()) kosong.push("nama");
      if (a.nik.length !== 16) kosong.push("NIK 16 digit");
      if (!a.lahir) kosong.push("tanggal lahir");
      if (kosong.length) k.push(`Anggota ${String(i + 1).padStart(2, "0")}: ${kosong.join(", ")}`);
    });

    return k;
  }, [namaKepala, nik, noKk, wil.kode, alamat, pendapatan, jenisWallet, walletAddress, anggota]);

  const bisaKirim = kurang.length === 0 && Object.keys(galat).length === 0;

  /** Tandai kolom wajib yang kosong — hanya setelah percobaan kirim pertama. */
  const wajibKosong = (kosong: boolean) => (dicoba && kosong ? "Kolom ini wajib diisi." : undefined);

  const ubahAnggota = (id: number, patch: Partial<Anggota>) =>
    setAnggota((s) => s.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  /** Tombol simpan sengaja tidak pernah disabled: petugas boleh menekannya
   *  kapan saja dan mendapat alasan yang jelas, alih-alih menghadapi tombol
   *  mati tanpa penjelasan.
   *
   *  Toast-nya sengaja satu baris saja, tanpa daftar kolom dan tanpa hitungan:
   *  daftar sepanjang itu tidak terbaca di pojok layar, dan kolom yang kurang
   *  sudah ditandai merah di tempatnya masing-masing — tepat di sebelah isian
   *  yang perlu diperbaiki. */
  const cobaKirim = () => {
    setDicoba(true);
    if (!bisaKirim) {
      toast.galat("lengkapi seluruh kolom wajib untuk menyimpan.");
      return;
    }
    setKonfirmasi(true);
  };

  const kirim = async () => {
    setMengirim(true);
    try {
      await createRumahTangga({
        nik_kepala_keluarga: nik,
        no_kk: noKk,
        nama_kepala_keluarga: namaKepala,
        alamat_detail: alamat.trim(),
        kode_wilayah: wil.kode,
        pendapatan_per_kapita: turunan.perKapita,
        skor_kondisi_rumah: rumah,
        skor_akses_pendidikan: didik,
        riwayat_bansos_sebelumnya: riwayat,
        periode_id: periodeId,
        ...(jenisWallet === "mandiri" ? { wallet_address: walletAddress, jenis_wallet: "mandiri" } : {}),
        ...(jenisWallet === "custodial" ? { jenis_wallet: "custodial" } : {}),
        anggota: anggota.map((a) => ({
          nik: a.nik,
          nama: a.nama,
          hubungan: a.hubungan,
          tanggal_lahir: a.lahir,
          status_disabilitas: a.disabilitas,
          is_tanggungan: a.tanggungan,
        })),
      });
      setKonfirmasi(false);
      // ToastProvider dipasang di root layout, jadi pesan ini ikut terbawa ke
      // halaman riwayat yang dituju — bukan hilang bersama form yang ditinggal.
      toast.sukses("data rumah tangga tersimpan.", `${namaKepala.trim()} — menunggu verifikasi.`);
      router.push("/petugas/riwayat");
    } catch (err) {
      // Dialog ditutup supaya pesannya tidak tertimbun di belakang modal;
      // isian form tetap utuh untuk diperbaiki lalu dikirim ulang.
      setKonfirmasi(false);
      toast.galat("data gagal disimpan.", err instanceof Error ? err.message : "terjadi kesalahan.");
    } finally {
      setMengirim(false);
    }
  };

  return (
    <section className="px-4 sm:px-8">
      <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-5 lg:grid-cols-12">
        {/* ---------- Formulir ---------- */}
        <div className="lg:col-span-7">
          <Bezel>
            <div className="p-7 sm:p-9">
              <Eyebrow>Data rumah tangga</Eyebrow>

              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Nama kepala keluarga" wajib error={wajibKosong(!namaKepala.trim())}>
                  <input
                    value={namaKepala}
                    onChange={(e) => setNamaKepala(e.target.value)}
                    placeholder="Sesuai KTP"
                    className={wajibKosong(!namaKepala.trim()) ? inputErrCls : inputCls}
                  />
                </Field>

                <Field
                  label="NIK kepala keluarga"
                  hint="16 digit"
                  wajib
                  error={galat.nik ?? wajibKosong(nik.length !== 16)}
                >
                  <input
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    placeholder="99••••••••••••••"
                    inputMode="numeric"
                    className={galat.nik ?? wajibKosong(nik.length !== 16) ? inputErrCls : inputCls}
                  />
                </Field>

                <Field
                  label="Nomor kartu keluarga"
                  hint="16 digit"
                  wajib
                  error={galat.noKk ?? wajibKosong(noKk.length !== 16)}
                >
                  <input
                    value={noKk}
                    onChange={(e) => setNoKk(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    placeholder="99••••••••••••••"
                    inputMode="numeric"
                    className={galat.noKk ?? wajibKosong(noKk.length !== 16) ? inputErrCls : inputCls}
                  />
                </Field>

                <Field
                  label="Pendapatan rumah tangga"
                  hint="per bulan"
                  wajib
                  error={galat.pendapatan ?? wajibKosong(!pendapatan)}
                >
                  <input
                    value={pendapatan}
                    onChange={(e) => setPendapatan(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="2500000"
                    inputMode="numeric"
                    className={galat.pendapatan ?? wajibKosong(!pendapatan) ? inputErrCls : inputCls}
                  />
                </Field>
              </div>

              {/* ---------- Alamat ---------- */}
              <div className="mt-8 border-t border-[var(--hairline)] pt-7">
                <Eyebrow>Alamat rumah tangga</Eyebrow>
                <p className="mt-3 max-w-md text-[12px] leading-relaxed text-ink-3">
                  Pilihan mengikuti data wilayah administratif resmi (Kepmendagri 300.2.2-2138/2025).
                  Tiap tingkat hanya memuat wilayah yang benar-benar berada di bawah pilihan
                  sebelumnya, jadi desa yang belum pernah didata pun bisa langsung dipilih di sini.
                </p>

                <div className="mt-5">
                  <PilihWilayah onPilih={setWil} tandaiKosong={dicoba && !wil.kode} />
                </div>

                <div className="mt-5">
                  <Field
                    label="Alamat detail"
                    hint="RT/RW, nama jalan, no. rumah"
                    wajib
                    error={wajibKosong(!alamat.trim())}
                  >
                    <input
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      placeholder="RT 01 / RW 05, Jl. Contoh No. 1"
                      className={wajibKosong(!alamat.trim()) ? inputErrCls : inputCls}
                    />
                  </Field>
                </div>

                {alamat.trim() && (
                  <p className="mt-4 text-[12px] leading-[1.65] text-ink-3">
                    Tersimpan sebagai:{" "}
                    <span className="text-ink-2">
                      {[alamat.trim(), wil.desa, wil.kecamatan, wil.kabupaten, wil.provinsi]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </p>
                )}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Geser label="Kondisi rumah" nilai={rumah} set={setRumah} kiri="Tidak layak" kanan="Sangat layak" />
                <Geser label="Akses pendidikan anak" nilai={didik} set={setDidik} kiri="Terputus" kanan="Lancar" />
              </div>

              <label className="mt-6 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={riwayat}
                  onChange={(e) => setRiwayat(e.target.checked)}
                  className="h-4 w-4 rounded accent-[var(--color-sage)]"
                />
                <span className="text-[13px] text-ink-2">Pernah menerima bansos pada periode sebelumnya</span>
              </label>

              {/* ---------- Wallet penerima ---------- */}
              <div className="mt-8 border-t border-[var(--hairline)] pt-7">
                <Eyebrow>Wallet penerima</Eyebrow>
                <p className="mt-3 max-w-md text-[12px] leading-relaxed text-ink-3">
                  Dana disalurkan langsung ke alamat ini saat pencairan on-chain. Kalau keluarga belum
                  punya wallet sendiri, pilih &ldquo;custodial&rdquo; — sistem akan menyediakan wallet
                  yang dikelola pendamping desa atas nama mereka.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Jenis wallet">
                    <select
                      value={jenisWallet}
                      onChange={(e) => setJenisWallet(e.target.value as typeof jenisWallet)}
                      className={inputCls}
                    >
                      <option value="belum">Belum ditentukan</option>
                      <option value="mandiri">Mandiri — punya wallet sendiri</option>
                      <option value="custodial">Custodial — dikelola pendamping desa</option>
                    </select>
                  </Field>
                  {jenisWallet === "mandiri" && (
                    <Field
                      label="Alamat wallet"
                      hint="0x + 40 karakter"
                      wajib
                      error={galat.wallet ?? wajibKosong(!walletAddress.trim())}
                    >
                      <input
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value.trim())}
                        placeholder="0x1234...5678"
                        className={
                          galat.wallet ?? wajibKosong(!walletAddress.trim())
                            ? `${inputErrCls} font-mono`
                            : `${inputCls} font-mono`
                        }
                      />
                    </Field>
                  )}
                </div>
              </div>

              {/* ---------- Anggota keluarga ---------- */}
              <div className="mt-10 border-t border-[var(--hairline)] pt-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <Eyebrow>Anggota keluarga</Eyebrow>
                    <p className="mt-3 max-w-md text-[12px] leading-relaxed text-ink-3">
                      Jumlah tanggungan dan jumlah lansia/disabilitas dihitung dari daftar ini —
                      tidak bisa diketik manual, supaya angka yang masuk perhitungan selalu punya
                      identitas yang dapat diverifikasi. Nama, NIK 16 digit, dan tanggal lahir
                      <span className="text-clay"> wajib</span> diisi untuk setiap anggota.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setAnggota((s) => [
                        ...s,
                        { id: Math.max(0, ...s.map((a) => a.id)) + 1, nama: "", nik: "", hubungan: "anak", lahir: "", disabilitas: false, tanggungan: true },
                      ])
                    }
                    className="group flex items-center gap-2 rounded-full bg-ink/[0.05] px-4 py-2 text-[12px]
                      ring-1 ring-[var(--hairline)] transition-all duration-500
                      ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.09] active:scale-[0.97]"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Tambah anggota
                  </button>
                </div>

                {galat.anggota && (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl bg-clay-soft p-4 ring-1 ring-clay/20">
                    <span className="mt-px text-clay"><Alert className="h-4 w-4" /></span>
                    <p className="text-[12px] leading-[1.6] text-ink-2">{galat.anggota}</p>
                  </div>
                )}

                <ul className="mt-6 flex flex-col gap-3">
                  {anggota.map((a, i) => {
                    const u = umur(a.lahir);
                    const kosongNama = dicoba && !a.nama.trim();
                    const kosongNik = dicoba && a.nik.length !== 16;
                    const kosongLahir = dicoba && !a.lahir;
                    return (
                      <li
                        key={a.id}
                        className={`rounded-2xl p-4 ring-1 ${
                          kosongNama || kosongNik || kosongLahir
                            ? "bg-clay-soft/40 ring-clay/30"
                            : "bg-paper-2 ring-[var(--hairline)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-[11px] text-ink-4">
                            {String(i + 1).padStart(2, "0")}
                            {u !== null && <span className="ml-3 text-ink-3">{u} th{u >= 60 ? " · lansia" : ""}</span>}
                          </span>
                          {anggota.length > 1 && (
                            <button
                              onClick={() => setAnggota((s) => s.filter((x) => x.id !== a.id))}
                              aria-label="Hapus anggota"
                              className="flex h-6 w-6 items-center justify-center rounded-full text-ink-4
                                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                                hover:bg-clay-soft hover:text-clay active:scale-90"
                            >
                              <Cross className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <input
                            value={a.nama}
                            onChange={(e) => ubahAnggota(a.id, { nama: e.target.value })}
                            placeholder="Nama anggota *"
                            className={kosongNama ? anggotaErrCls : anggotaCls}
                          />
                          <input
                            value={a.nik}
                            onChange={(e) => ubahAnggota(a.id, { nik: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                            placeholder="NIK anggota — 16 digit *"
                            inputMode="numeric"
                            className={`${kosongNik ? anggotaErrCls : anggotaCls} font-mono`}
                          />
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <select
                            value={a.hubungan}
                            onChange={(e) => ubahAnggota(a.id, { hubungan: e.target.value as Anggota["hubungan"] })}
                            className={anggotaCls}
                          >
                            {HUBUNGAN.map((h) => <option key={h.v} value={h.v}>{h.l}</option>)}
                          </select>
                          <input
                            type="date"
                            value={a.lahir}
                            onChange={(e) => ubahAnggota(a.id, { lahir: e.target.value })}
                            aria-label="Tanggal lahir anggota"
                            className={kosongLahir ? anggotaErrCls : anggotaCls}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-5">
                          {[
                            { k: "tanggungan" as const, l: "Tanggungan" },
                            { k: "disabilitas" as const, l: "Penyandang disabilitas" },
                          ].map((c) => (
                            <label key={c.k} className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={a[c.k]}
                                onChange={(e) => ubahAnggota(a.id, { [c.k]: e.target.checked })}
                                className="h-3.5 w-3.5 rounded accent-[var(--color-sage)]"
                              />
                              <span className="text-[12px] text-ink-2">{c.l}</span>
                            </label>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-9 border-t border-[var(--hairline)] pt-7">
                <div className="flex flex-wrap items-center gap-4">
                  <Button onClick={cobaKirim} icon={<Check className="h-[15px] w-[15px]" />}>
                    Simpan data rumah tangga
                  </Button>
                  <p className="text-[12px] text-ink-4">
                    Kolom bertanda <span className="text-clay">*</span> wajib diisi.
                  </p>
                </div>
              </div>
            </div>
          </Bezel>
        </div>

        {/* ---------- Panel samping ---------- */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          <Bezel tone="sunken">
            <div className="p-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
                Dihitung sistem
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  { l: "Jiwa dalam KK", v: turunan.jiwa },
                  { l: "Jumlah tanggungan", v: turunan.tanggungan },
                  { l: "Lansia / disabilitas", v: turunan.disabilitasLansia },
                  { l: "Pendapatan per kapita", v: turunan.perKapita ? rupiah(turunan.perKapita) : "—" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-card p-4 ring-1 ring-[var(--hairline)]">
                    <p className="text-[10px] uppercase leading-tight tracking-[0.12em] text-ink-4">{s.l}</p>
                    <p className="mt-2 font-display text-[1.35rem] leading-none tnum tracking-[-0.03em]">
                      {s.v}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[12px] leading-[1.65] text-ink-3">
                Pendapatan per kapita inilah yang masuk ke K-Means dan TOPSIS, bukan pendapatan
                total — supaya keluarga besar berpenghasilan sama tidak dinilai sama sejahteranya
                dengan keluarga kecil.
              </p>
            </div>
          </Bezel>
        </div>
      </div>

      <ConfirmDialog
        open={konfirmasi}
        onClose={() => !mengirim && setKonfirmasi(false)}
        onConfirm={kirim}
        loading={mengirim}
        title="Simpan data rumah tangga ini?"
        description="Sistem akan mengecek duplikasi NIK kepala keluarga, No. KK, dan tiap anggota sebelum data disimpan."
        confirmLabel="Ya, simpan"
      />
    </section>
  );
}

function Geser({
  label, nilai, set, kiri, kanan,
}: {
  label: string;
  nilai: number;
  set: (n: number) => void;
  kiri: string;
  kanan: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium">{label}</span>
        <span className="tnum text-[12px] text-ink-3">{nilai} / 5</span>
      </div>
      <input
        type="range" min={1} max={5} step={1} value={nilai}
        onChange={(e) => set(+e.target.value)}
        className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-paper-3 accent-[var(--color-sage)]"
      />
      <div className="mt-2 flex justify-between text-[10px] text-ink-4">
        <span>{kiri}</span>
        <span>{kanan}</span>
      </div>
    </div>
  );
}
