'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Wand2, Loader2 } from 'lucide-react';

import { FormField, FormSelect } from './FormControls';
import type { DokumenPendukung, MetaData, InformasiDasar } from '../types';
import { getAuthUserName } from '@/lib/auth';
import {
  DOC_ACCEPT_INPUT,
  PHOTO_ACCEPT_INPUT,
  TOOLTIP_DOC_UPLOAD,
  TOOLTIP_PHOTO_UPLOAD,
  isAllowedDocUpload,
  isAllowedPhotoUpload,
} from '../file-upload-rules';
import { FOTO_PREFERENSI } from '../foto-preferensi';
import { FileRuleTooltip } from './FileRuleTooltip';
import { angkatanDigitsFromNoPeserta, NIM_PREFIX } from '../angkatan-from-nim';
import { toKatakana } from '@/lib/katakana-master';

interface Props {
  meta: MetaData;
  dokumen: DokumenPendukung;
  info: InformasiDasar;
  onMetaChange: (d: MetaData) => void;
  onDokumenChange: (d: DokumenPendukung) => void;
  onInfoChange: (d: InformasiDasar) => void;
  onFotoFileChange?: (file: File | null) => void;
  onDokumenFileChange?: (key: keyof DokumenPendukung, file: File | null) => void;
  errors?: Record<string, string>;
}

const JK_OPTIONS = [
  { value: 'Laki-laki', label: '男 / Laki-laki' },
  { value: 'Perempuan', label: '女 / Perempuan' },
];
const GOLDAR_OPTIONS = ['A', 'B', 'AB', 'O'].map((v) => ({ value: v, label: v }));
const AGAMA_OPTIONS = [
  { value: 'イスラム教', label: 'イスラム教 / Islam' },
  { value: 'キリスト教', label: 'キリスト教 / Kristen' },
  { value: 'カトリック', label: 'カトリック / Katolik' },
  { value: 'ヒンドゥー教', label: 'ヒンドゥー教 / Hindu' },
  { value: '仏教', label: '仏教 / Buddha' },
  { value: '儒教', label: '儒教 / Konghucu' },
];
const STATUS_OPTIONS = [
  { value: 'Lajang', label: '独身 / Lajang' },
  { value: 'Menikah', label: '既婚 / Menikah' },
  { value: 'Cerai', label: '離婚 / Cerai' },
];

const KODE_NEGARA = [
  { value: '+62', label: '🇮🇩 +62' },
  { value: '+81', label: '🇯🇵 +81' },
];

/** Pisahkan prefix (+62/+81) dari nomor tersimpan */
function parsePhone(full: string): { prefix: string; number: string } {
  for (const k of KODE_NEGARA) {
    if (full.startsWith(k.value)) {
      return { prefix: k.value, number: full.slice(k.value.length) };
    }
  }
  return { prefix: '+62', number: full };
}

const DOKUMEN_FIELDS: Array<{ key: keyof DokumenPendukung; label: string }> = [
  { key: 'ktp', label: 'KTP' },
  { key: 'kk', label: 'Kartu Keluarga (KK)' },
  { key: 'akte_kelahiran', label: 'Akte Kelahiran' },
  { key: 'ijazah_terakhir', label: 'Ijazah Terakhir' },
];

export default function StepMetaInfo({
  meta, dokumen, info, onMetaChange, onDokumenChange, onInfoChange, onFotoFileChange, onDokumenFileChange, errors = {},
}: Props) {
  const setMeta = (key: keyof MetaData, val: string) => onMetaChange({ ...meta, [key]: val });
  const setDokumen = (key: keyof DokumenPendukung, val: string) => onDokumenChange({ ...dokumen, [key]: val });
  const setInfo = (key: keyof InformasiDasar, val: string) => onInfoChange({ ...info, [key]: val });
  const [fotoPreviewSrc, setFotoPreviewSrc] = useState<string | null>(null);
  /** Hanya true setelah mount agar HTML sama dengan SSR (localStorage tidak ada di server). */
  const [noPesertaLocked, setNoPesertaLocked] = useState(false);
  const [isGeneratingKatakana, setIsGeneratingKatakana] = useState(false);
  useEffect(() => {
    setNoPesertaLocked(Boolean(getAuthUserName().trim()));
  }, []);

  const handleGenerateKatakana = () => {
    const source = info.nama_lengkap.trim();
    if (!source) {
      toast.error('Isi Nama Lengkap terlebih dahulu.');
      return;
    }
    setIsGeneratingKatakana(true);
    // Simulasi micro-delay agar ada feedback visual
    setTimeout(() => {
      try {
        const result = toKatakana(source);
        if (!result) {
          toast.error('Gagal menghasilkan Katakana. Periksa nama lengkap.');
          return;
        }
        setInfo('nama_katakana', result);
        toast.success('Katakana berhasil di-generate! Periksa & koreksi jika perlu.', { duration: 4000 });
      } catch {
        toast.error('Terjadi kesalahan saat generate Katakana.');
      } finally {
        setIsGeneratingKatakana(false);
      }
    }, 400);
  };

  const { prefix: phonePrefix, number: phoneNumber } = parsePhone(info.nomor_telepon);

  const handlePhonePrefix = (newPrefix: string) => {
    setInfo('nomor_telepon', newPrefix + phoneNumber);
  };
  const handlePhoneNumber = (raw: string) => {
    // Hapus angka 0 di awal jika user mengetik
    const cleaned = raw.replace(/^0+/, '');
    setInfo('nomor_telepon', phonePrefix + cleaned);
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">📋 Meta Dokumen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="field-tanggal_pembuatan_cv" label="作成日 / Tanggal Pembuatan CV" value={meta.tanggal_pembuatan_cv} onChange={(v) => setMeta('tanggal_pembuatan_cv', v)} type="date" required error={errors['tanggal_pembuatan_cv']} />

          {/* Foto 3x4 */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <div className="text-sm font-medium text-slate-700 inline-flex items-center gap-1.5">
              <span>写真 / Foto 3×4</span>
              <FileRuleTooltip text={TOOLTIP_PHOTO_UPLOAD} />
            </div>
            <div className="flex flex-col xs:flex-row items-start gap-3">
              <div className="w-20 h-28 border-2 border-dashed border-slate-300 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50 shrink-0">
                {meta.foto ? (
                  <img src={meta.foto} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-400 text-center px-1">Belum ada foto</span>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <input
                  type="file"
                  accept={PHOTO_ACCEPT_INPUT}
                  className="hidden"
                  id="foto-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!isAllowedPhotoUpload(file)) {
                      toast.error('Foto hanya boleh JPG, JPEG, atau PNG.');
                      e.target.value = '';
                      setMeta('foto', '');
                      onFotoFileChange?.(null);
                      return;
                    }
                    onFotoFileChange?.(file);
                    const reader = new FileReader();
                    reader.onload = () => setMeta('foto', reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
                <label
                  htmlFor="foto-upload"
                  title={TOOLTIP_PHOTO_UPLOAD}
                  className="cursor-pointer px-4 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium text-center w-full"
                >
                  Upload Foto
                </label>
                <p className="text-xs text-slate-400">Format: JPG/PNG, ukuran 3×4.</p>
                {meta.foto && (
                  <button
                    onClick={() => {
                      setMeta('foto', '');
                      onFotoFileChange?.(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 transition text-left"
                  >
                    Hapus foto
                  </button>
                )}
                {/* Gambar contoh hanya untuk preview, tidak mengubah data form */}
                <details className="text-xs">
                  <summary className="cursor-pointer text-slate-500 font-medium select-none">Gambar contoh</summary>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {FOTO_PREFERENSI.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        title={p.label}
                        onClick={() => setFotoPreviewSrc(p.src)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/80 transition"
                      >
                        <span className="relative w-6 h-8 overflow-hidden rounded border border-slate-200 bg-slate-100 shrink-0">
                          <Image src={p.src} alt="" width={24} height={32} className="object-cover object-top" unoptimized />
                        </span>
                        <span className="font-medium">{p.shortLabel}</span>
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">📎 Dokumen Pendukung</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DOKUMEN_FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <div className="text-sm font-medium text-slate-700 inline-flex items-center gap-1.5">
                <span>{field.label}</span>
                <FileRuleTooltip text={TOOLTIP_DOC_UPLOAD} />
              </div>
              <input
                type="file"
                accept={DOC_ACCEPT_INPUT}
                title={TOOLTIP_DOC_UPLOAD}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file && !isAllowedDocUpload(file)) {
                    toast.error('Hanya file PDF, JPG, JPEG, atau PNG yang diperbolehkan.');
                    e.target.value = '';
                    setDokumen(field.key, '');
                    onDokumenFileChange?.(field.key, null);
                    return;
                  }
                  setDokumen(field.key, file?.name || '');
                  onDokumenFileChange?.(field.key, file);
                }}
                className="w-full border rounded-xl px-4 py-3 text-sm text-slate-900 bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition file:mr-3 file:border-0 file:bg-emerald-50 file:text-emerald-700 file:px-3 file:py-1.5 file:rounded-lg file:cursor-pointer"
              />
              <p className="text-xs text-slate-500">
                {dokumen[field.key] ? `Terpilih: ${dokumen[field.key]}` : 'Belum ada file dipilih'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b border-slate-100 gap-4">
          <h3 className="text-base font-semibold text-slate-800">👤 基本情報 / Informasi Dasar</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:justify-end">
            <div className="w-full sm:w-44" id="field-no_peserta">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">NIM / No. Peserta <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={info.no_peserta}
                onChange={(e) => setInfo('no_peserta', e.target.value.toUpperCase())}
                readOnly={noPesertaLocked}
                title={noPesertaLocked ? 'Terisi otomatis dari username akun yang login (read-only)' : undefined}
                placeholder={`${NIM_PREFIX}...`}
                className={`w-full border rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition ${noPesertaLocked ? 'bg-slate-50 cursor-default text-slate-700' : 'bg-white'} ${errors['no_peserta'] ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'}`}
              />
            </div>
            <div className="w-fit shrink-0 text-center mx-auto sm:mx-0">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Angkatan</label>
              <input
                type="text"
                readOnly
                value={angkatanDigitsFromNoPeserta(info.no_peserta) || '—'}
                title={`2 digit setelah ${NIM_PREFIX} pada NIM (read-only). Nilai numerik dikirim saat upload data diri.`}
                className="w-14 sm:w-16 box-border border rounded-xl px-2 py-2 text-sm text-slate-700 bg-slate-50 cursor-default border-slate-200 text-center tabular-nums"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="field-nik"
            label="NIK"
            value={info.nik}
            onChange={(v) => setInfo('nik', v.replace(/\D/g, '').slice(0, 16))}
            placeholder="Masukkan 16 digit NIK"
            hint="NIK harus 16 digit angka"
            required
            autoUppercase={false}
            error={errors['nik']}
          />
          <FormField
            id="field-nama_lengkap"
            label="氏名 / Nama Lengkap"
            value={info.nama_lengkap}
            onChange={(v) => setInfo('nama_lengkap', v)}
            placeholder="Sesuai KTP"
            required
            error={errors['nama_lengkap']}
            readOnly
            inputTitle="Diambil dari nama akun yang login. Ubah lewat pengaturan akun / admin."
          />
          <FormField id="field-yobisho" label="呼称 / Nama Panggilan" value={info.yobisho} onChange={(v) => setInfo('yobisho', v)} placeholder="Contoh: ジダン" hint="Nama yang ingin dipanggil dalam bahasa Jepang" autoUppercase={false} />

          {/* ── Nama Katakana + tombol Katakana Master ─────────────── */}
          <div id="field-nama_katakana" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 inline-flex items-center gap-1.5">
              カタカナ / Nama Katakana
            </label>
            <div className="flex gap-2 items-stretch">
              <input
                type="text"
                value={info.nama_katakana}
                onChange={(e) => setInfo('nama_katakana', e.target.value)}
                placeholder="Contoh: ジダン・プラタマ"
                className="flex-1 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white border-slate-200"
              />
              <button
                type="button"
                onClick={handleGenerateKatakana}
                disabled={isGeneratingKatakana || !info.nama_lengkap.trim()}
                title="Generate otomatis Katakana dari Nama Lengkap menggunakan Katakana Master"
                className="
                  inline-flex items-center gap-1.5 shrink-0
                  px-3 py-2 rounded-xl border border-violet-300
                  bg-gradient-to-b from-violet-50 to-violet-100
                  text-violet-700 text-xs font-semibold
                  hover:from-violet-100 hover:to-violet-200 hover:border-violet-400
                  active:scale-95 transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                  shadow-sm
                "
              >
                {isGeneratingKatakana ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isGeneratingKatakana ? 'Generating...' : 'Auto'}
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Cara baca nama dalam Katakana. Klik <span className="text-violet-600 font-medium">✨ Auto</span> untuk generate otomatis dari Nama Lengkap, lalu koreksi jika perlu.
            </p>
          </div>
          <FormField id="field-umur" label="年齢 / Umur" value={info.umur} onChange={(v) => setInfo('umur', v)} type="number" placeholder="25" required error={errors['umur']} />
          <FormSelect id="field-jenis_kelamin" label="性別 / Jenis Kelamin" value={info.jenis_kelamin} onChange={(v) => setInfo('jenis_kelamin', v)} options={JK_OPTIONS} required error={errors['jenis_kelamin']} />
          <FormField id="field-kewarganegaraan" label="国籍 / Kewarganegaraan" value={info.kewarganegaraan} onChange={(v) => setInfo('kewarganegaraan', v)} placeholder="インドネシア" required error={errors['kewarganegaraan']} autoUppercase={false} />
          <FormField id="field-tanggal_lahir" label="生年月日 / Tanggal Lahir" value={info.tanggal_lahir} onChange={(v) => setInfo('tanggal_lahir', v)} type="date" required error={errors['tanggal_lahir']} />
          <FormSelect id="field-golongan_darah" label="血液型 / Golongan Darah" value={info.golongan_darah} onChange={(v) => setInfo('golongan_darah', v)} options={GOLDAR_OPTIONS} error={errors['golongan_darah']} />
          <FormSelect id="field-agama" label="宗教 / Agama" value={info.agama} onChange={(v) => setInfo('agama', v)} options={AGAMA_OPTIONS} required error={errors['agama']} />
          <FormSelect id="field-status_pernikahan" label="配偶者 / Status Pernikahan" value={info.status_pernikahan} onChange={(v) => setInfo('status_pernikahan', v)} options={STATUS_OPTIONS} required error={errors['status_pernikahan']} />
          <FormField id="field-kode_pos" label="郵便番号 / Kode Pos" value={info.kode_pos} onChange={(v) => setInfo('kode_pos', v.replace(/\D/g, '').slice(0, 5))} placeholder="12345" autoUppercase={false} />
          {/* Nomor Telepon dengan pilihan kode negara */}
          <div id="field-nomor_telepon" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              電話番号 / Nomor Telepon
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={phonePrefix}
                onChange={(e) => handlePhonePrefix(e.target.value)}
                className={
                  'border rounded-xl px-3 py-3 text-sm text-slate-900 bg-white ' +
                  'focus:outline-none focus:ring-2 focus:border-transparent transition ' +
                  (errors['nomor_telepon']
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 focus:ring-emerald-500')
                }
              >
                {KODE_NEGARA.map((k) => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => handlePhoneNumber(e.target.value)}
                placeholder="812 3456 7890"
                className={
                  'flex-1 border rounded-xl px-4 py-3 text-sm text-slate-900 ' +
                  'placeholder:text-slate-400 focus:outline-none focus:ring-2 ' +
                  'focus:border-transparent transition bg-white ' +
                  (errors['nomor_telepon']
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 focus:ring-emerald-500')
                }
              />
            </div>
            <p className="text-xs text-slate-400">Tulis angka tanpa awalan 0. Contoh: 812 3456 7890</p>
            {errors['nomor_telepon'] && (
              <p className="text-xs text-red-500 font-medium">{errors['nomor_telepon']}</p>
            )}
          </div>
          <FormField id="field-email" label="メール / Email" value={info.email} onChange={(v) => setInfo('email', v)} type="email" placeholder="nama@email.com" required error={errors['email']} />
          <FormField id="field-alamat_lengkap" label="住所 / Alamat Lengkap" value={info.alamat_lengkap} onChange={(v) => setInfo('alamat_lengkap', v)} type="textarea" placeholder="RT/RW, Desa, Kecamatan, Kabupaten, Provinsi" required className="sm:col-span-2" error={errors['alamat_lengkap']} />
        </div>
      </section>

      {fotoPreviewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setFotoPreviewSrc(null)}
        >
          <div
            className="max-w-sm w-full rounded-xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-slate-800 mb-3">Preview gambar contoh</p>
            <div className="flex justify-center">
              <Image
                src={fotoPreviewSrc}
                alt="Preview gambar contoh"
                width={320}
                height={426}
                className="h-auto w-full max-w-[220px] rounded-md border border-slate-200"
                unoptimized
              />
            </div>
            <button
              type="button"
              onClick={() => setFotoPreviewSrc(null)}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
