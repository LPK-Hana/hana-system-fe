'use client';
import { useEffect, useState, useRef } from 'react';
import * as wanakana from 'wanakana';
import { ChevronLeft, ChevronRight, CheckCircle2, FileDown, Pencil, Upload, Loader2, ArrowLeft, Info, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { CVData } from './types';
import { mapApiResponseToCVData } from '@/lib/cv-mapper';
import { defaultCVData } from './defaults';
import StepMetaInfo from './components/StepMetaInfo';
import StepFisik from './components/StepFisik';
import StepPendidikan from './components/StepPendidikan';
import StepPekerjaan from './components/StepPekerjaan';
import StepSertifikat from './components/StepSertifikat';
import StepKeluarga from './components/StepKeluarga';
import CVTemplate from './components/CVTemplate';
import { exportCVToPDF } from './exportPdf';
import ApiResume from '../../api/resume/api_resume';
import { toast } from 'react-hot-toast';
import { loadStudentProfile, mergeCVData, saveStudentProfileCv } from '@/lib/student-profile-storage';
import { buildDummyCVTemplate } from '@/lib/demo/cv-dummy-template';
import { NIM_PREFIX, buildNim } from '@/lib/nim';
import { getAuthDisplayName, getAuthUserName } from '@/lib/auth';
import { isAllowedDocUpload, isAllowedPhotoUpload } from './file-upload-rules';
import { prepareUploadFile } from '@/lib/convert-to-webp';
import { dataUrlToFile, isDataUrlImage } from '@/lib/data-url-to-file';
import { angkatanIntFromNoPeserta } from './angkatan-from-nim';
import { filterFilledPekerjaan } from './pekerjaan-utils';
import type { DokumenPendukung } from './types';

const STEPS = [
  { id: 1, label: 'Identitas', icon: '👤', desc: 'Data diri & meta dokumen' },
  { id: 2, label: 'Fisik & Kesehatan', icon: '💪', desc: 'Kondisi fisik & kesehatan' },
  { id: 3, label: 'Pendidikan', icon: '🎓', desc: 'Riwayat pendidikan' },
  { id: 4, label: 'Pekerjaan', icon: '💼', desc: 'Riwayat kerja & magang' },
  { id: 5, label: 'Sertifikat', icon: '🏆', desc: 'Sertifikat & lisensi' },
  { id: 6, label: 'Keluarga', icon: '👨‍👩‍👧', desc: 'Susunan keluarga' },
];

// ---------- Helpers ----------
type Errors = Record<string, string>;
const MSG = 'Harap pilih / isi field ini';

const FRIENDLY_FIELD_LABELS: Record<string, string> = {
  no_peserta: 'NIM / No. peserta',
  nik: 'NIK',
  nama_peserta: 'Nama peserta',
  nama_panggilan: 'Nama panggilan',
  nama_katakana: 'Nama katakana',
  tanggal_lahir: 'Tanggal lahir',
  tgl_masuk_lpk: 'Tanggal masuk LPK',
  umur: 'Umur',
  jenis_kelamin: 'Jenis kelamin',
  status_pernikahan: 'Status pernikahan',
  agama: 'Agama',
  negara_asal: 'Kewarganegaraan',
  alamat: 'Alamat',
  nomor_telepon: 'Nomor telepon',
  email: 'Email',
  kode_pos: 'Kode pos',
  golongan_darah: 'Golongan darah',
  pendidikan: 'Riwayat pendidikan',
  pekerjaan: 'Riwayat pekerjaan',
  sertifikat: 'Sertifikat',
  keluarga: 'Data keluarga',
  nama_sekolah: 'Nama sekolah',
  tingkat_pendidikan: 'Tingkat pendidikan',
  jurusan: 'Jurusan',
  bulan_masuk: 'Bulan masuk',
  tahun_masuk: 'Tahun masuk',
  bulan_lulus: 'Bulan lulus',
  tahun_lulus: 'Tahun lulus',
  nama_perusahaan: 'Nama perusahaan',
  posisi_pekerjaan: 'Posisi pekerjaan',
  status_pekerjaan: 'Status pekerjaan',
  bulan_mulai: 'Bulan mulai',
  tahun_mulai: 'Tahun mulai',
  bulan_selesai: 'Bulan selesai',
  tahun_selesai: 'Tahun selesai',
  nama_sertifikat: 'Nama sertifikat',
  status_kelulusan: 'Status kelulusan',
  score: 'Skor',
  bulan_diperoleh: 'Bulan diperoleh',
  tahun_diperoleh: 'Tahun diperoleh',
  hubungan: 'Hubungan keluarga',
  nama: 'Nama anggota keluarga',
};

function formatBackendErrorMessage(rawMessage: string): string {
  if (!rawMessage) return 'Upload CV gagal. Mohon coba lagi.';

  if (rawMessage.startsWith('field wajib belum diisi:')) {
    const fieldsRaw = rawMessage.replace('field wajib belum diisi:', '').trim();
    if (!fieldsRaw) return 'Masih ada data wajib yang belum diisi.';

    const prettyFields = fieldsRaw
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
      .map((f) => {
        const normalized = f.replace(/\[\d+\]\./g, '.');
        const lastKey = normalized.split('.').pop() || normalized;
        return FRIENDLY_FIELD_LABELS[lastKey] || FRIENDLY_FIELD_LABELS[normalized] || lastKey;
      });

    const uniqueFields = Array.from(new Set(prettyFields));
    if (uniqueFields.length <= 2) {
      return `Mohon lengkapi: ${uniqueFields.join(' dan ')}.`;
    }
    return `Masih ada beberapa data yang belum lengkap: ${uniqueFields.slice(0, 4).join(', ')}${uniqueFields.length > 4 ? ', dan lainnya' : ''}.`;
  }

  if (rawMessage === 'NIK sudah terdaftar') {
    return 'NIK ini sudah terdaftar. Silakan gunakan NIK lain.';
  }

  if (
    rawMessage.includes('CV untuk nomor peserta') ||
    rawMessage === 'No. peserta sudah terdaftar'
  ) {
    return 'CV untuk nomor peserta Anda sudah pernah diunggah. Satu akun/nomor peserta hanya boleh satu CV.';
  }

  if (rawMessage === 'Pastikan NIK anda sudah sesuai') {
    return 'Format NIK belum sesuai. NIK harus 16 digit angka.';
  }

  if (
    rawMessage === 'angkatan tidak sesuai nomor peserta' ||
    rawMessage === `angkatan tidak sesuai nomor peserta (gunakan format ${NIM_PREFIX} + 2 digit angkatan)` ||
    rawMessage === 'angkatan tidak sesuai nomor peserta (gunakan format GWK + 2 digit angkatan)'
  ) {
    return `Angkatan tidak cocok dengan NIM. Pastikan NIM memakai format ${NIM_PREFIX} + 2 digit angkatan (contoh ${buildNim('05', 1)}).`;
  }

  return rawMessage;
}

function splitModuleRowField(
  key: string,
  module: string,
  fieldNames: string[],
): { rowId: string; field: string } | null {
  const pre = `${module}-`;
  if (!key.startsWith(pre)) return null;
  const ordered = [...fieldNames].sort((a, b) => b.length - a.length);
  for (const f of ordered) {
    const suf = `-${f}`;
    if (key.endsWith(suf)) {
      const rowId = key.slice(pre.length, -suf.length);
      if (rowId.length > 0) return { rowId, field: f };
    }
  }
  return null;
}

/** Maps client-side error keys (from validators / backend mapping) to actual DOM ids used in step components. */
function errorKeyToDomId(key: string): string | null {
  if (key === 'pendidikan-empty') return 'field-pendidikan-empty';
  if (key === 'pekerjaan-empty') return 'field-pekerjaan-empty';
  if (key === 'keluarga-empty') return 'field-keluarga-empty';
  if (key === 'sertifikat-empty') return 'field-sertifikat-empty';

  const pend = splitModuleRowField(key, 'pendidikan', [
    'nama_sekolah',
    'tingkat_pendidikan',
    'jurusan',
    'bulan_masuk',
    'tahun_masuk',
    'bulan_lulus',
    'tahun_lulus',
  ]);
  if (pend) {
    const { rowId, field } = pend;
    const suffix: Record<string, string> = {
      nama_sekolah: `field-pendidikan-nama-${rowId}`,
      tingkat_pendidikan: `field-pendidikan-tingkat-${rowId}`,
      jurusan: `field-pendidikan-jurusan-${rowId}`,
      bulan_masuk: `field-pendidikan-bulan_masuk-${rowId}`,
      tahun_masuk: `field-pendidikan-tahun_masuk-${rowId}`,
      bulan_lulus: `field-pendidikan-bulan_lulus-${rowId}`,
      tahun_lulus: `field-pendidikan-tahun_lulus-${rowId}`,
    };
    return suffix[field] ?? null;
  }

  const pek = splitModuleRowField(key, 'pekerjaan', [
    'nama_perusahaan',
    'status_pekerjaan',
    'posisi_pekerjaan',
    'bulan_mulai',
    'tahun_mulai',
    'bulan_selesai',
    'tahun_selesai',
  ]);
  if (pek) {
    const { rowId, field } = pek;
    const suffix: Record<string, string> = {
      nama_perusahaan: `field-pekerjaan-nama-${rowId}`,
      status_pekerjaan: `field-pekerjaan-status-${rowId}`,
      posisi_pekerjaan: `field-pekerjaan-posisi-${rowId}`,
      bulan_mulai: `field-pekerjaan-bulan_mulai-${rowId}`,
      tahun_mulai: `field-pekerjaan-tahun_mulai-${rowId}`,
      bulan_selesai: `field-pekerjaan-bulan_selesai-${rowId}`,
      tahun_selesai: `field-pekerjaan-tahun_selesai-${rowId}`,
    };
    return suffix[field] ?? null;
  }

  const kel = splitModuleRowField(key, 'keluarga', ['hubungan', 'nama_anggota', 'umur', 'pekerjaan']);
  if (kel) {
    const { rowId, field } = kel;
    const suffix: Record<string, string> = {
      hubungan: `field-keluarga-hubungan-${rowId}`,
      nama_anggota: `field-keluarga-nama-${rowId}`,
      umur: `field-keluarga-umur-${rowId}`,
      pekerjaan: `field-keluarga-pekerjaan-${rowId}`,
    };
    return suffix[field] ?? null;
  }

  const ser = splitModuleRowField(key, 'sertifikat', [
    'nama_sertifikat',
    'status_kelulusan',
    'keterangan_skor',
    'bulan_diperoleh',
    'tahun_diperoleh',
  ]);
  if (ser) {
    const { rowId, field } = ser;
    const suffix: Record<string, string> = {
      nama_sertifikat: `field-sertifikat-nama-${rowId}`,
      status_kelulusan: `field-sertifikat-status-${rowId}`,
      keterangan_skor: `field-sertifikat-skor-${rowId}`,
      bulan_diperoleh: `field-sertifikat-bulan-${rowId}`,
      tahun_diperoleh: `field-sertifikat-tahun-${rowId}`,
    };
    return suffix[field] ?? null;
  }

  return `field-${key}`;
}

function scheduleScrollToDomId(domId: string) {
  const run = () => {
    const el = document.getElementById(domId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusable = el.querySelector<HTMLElement>('input, select, textarea');
      focusable?.focus();
    }
  };
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.setTimeout(run, 80);
    });
  });
}

function scrollToFirstError(errors: Errors) {
  for (const key of Object.keys(errors)) {
    const domId = errorKeyToDomId(key);
    if (!domId) continue;
    if (typeof document !== 'undefined' && document.getElementById(domId)) {
      scheduleScrollToDomId(domId);
      return;
    }
  }
}

function parseFieldWajibTokens(rawMessage: string): string[] {
  const m = /^field wajib belum diisi:(.*)$/i.exec(rawMessage.trim());
  if (!m?.[1]) return [];
  return m[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

type RowLocator = { section: string; index: number; field: string };

function parseBackendPathToken(token: string): RowLocator | { flat: string } | null {
  const t = token.trim();
  if (!t) return null;

  const bracket = /^(\w+)\[(\d+)\]\.(.+)$/.exec(t);
  if (bracket) {
    return { section: bracket[1], index: Number(bracket[2]), field: bracket[3].trim() };
  }
  const dotIdx = /^(\w+)\.(\d+)\.(.+)$/.exec(t);
  if (dotIdx) {
    return { section: dotIdx[1], index: Number(dotIdx[2]), field: dotIdx[3].trim() };
  }
  const twoPart = /^(\w+)\.([^.]+)$/.exec(t);
  if (twoPart && !/^\d+$/.test(twoPart[2])) {
    return { section: twoPart[1], index: 0, field: twoPart[2].trim() };
  }
  return { flat: t };
}

function mapBackendTokenToClientError(
  token: string,
  data: CVData,
): { step: number; errorKey: string } | null {
  const parsed = parseBackendPathToken(token);
  if (!parsed) return null;

  if ('flat' in parsed) {
    const k = parsed.flat.toLowerCase();
    const flatMap: Record<string, { step: number; key: string }> = {
      no_peserta: { step: 1, key: 'no_peserta' },
      nik: { step: 1, key: 'nik' },
      nama_peserta: { step: 1, key: 'nama_lengkap' },
      nama_panggilan: { step: 1, key: 'yobisho' },
      nama_katakana: { step: 1, key: 'nama_katakana' },
      tanggal_lahir: { step: 1, key: 'tanggal_lahir' },
      tgl_masuk_lpk: { step: 1, key: 'tanggal_pembuatan_cv' },
      umur: { step: 1, key: 'umur' },
      jenis_kelamin: { step: 1, key: 'jenis_kelamin' },
      status_pernikahan: { step: 1, key: 'status_pernikahan' },
      agama: { step: 1, key: 'agama' },
      negara_asal: { step: 1, key: 'kewarganegaraan' },
      alamat: { step: 1, key: 'alamat_lengkap' },
      nomor_telepon: { step: 1, key: 'nomor_telepon' },
      email: { step: 1, key: 'email' },
      kode_pos: { step: 1, key: 'kode_pos' },
      golongan_darah: { step: 1, key: 'golongan_darah' },
      tinggi_badan: { step: 2, key: 'tinggi_badan' },
      berat_badan: { step: 2, key: 'berat_badan' },
      mata_kiri: { step: 2, key: 'visus_mata_kiri' },
      status_mata_kiri: { step: 2, key: 'kondisi_mata_kiri' },
      mata_kanan: { step: 2, key: 'visus_mata_kanan' },
      status_mata_kanan: { step: 2, key: 'kondisi_mata_kanan' },
      merokok: { step: 2, key: 'merokok' },
      frequensi_merokok: { step: 2, key: 'jumlah_rokok' },
      berkacamata: { step: 2, key: 'berkacamata' },
      butawarna: { step: 2, key: 'buta_warna' },
      tato: { step: 2, key: 'tato' },
      riwayat_patah_tulang: { step: 2, key: 'riwayat_patah_tulang' },
      hobi: { step: 2, key: 'hobi' },
    };
    const hit = flatMap[k];
    return hit ? { step: hit.step, errorKey: hit.key } : null;
  }

  const { section, index, field } = parsed;
  const f = field.toLowerCase();
  const row = <T extends { id: string }>(arr: T[]) => arr[Math.min(index, Math.max(0, arr.length - 1))]?.id;

  if (section.toLowerCase() === 'pendidikan') {
    const id = row(data.pendidikan);
    if (!id) return { step: 3, errorKey: 'pendidikan-empty' };
    return { step: 3, errorKey: `pendidikan-${id}-${f}` };
  }
  if (section.toLowerCase() === 'pekerjaan') {
    const id = row(data.pekerjaan);
    if (!id) return { step: 4, errorKey: 'pekerjaan-empty' };
    return { step: 4, errorKey: `pekerjaan-${id}-${f}` };
  }
  if (section.toLowerCase() === 'sertifikat') {
    if (data.sertifikat.length === 0) return { step: 5, errorKey: 'sertifikat-empty' };
    const id = row(data.sertifikat);
    if (!id) return { step: 5, errorKey: 'sertifikat-empty' };
    if (f === 'score') return { step: 5, errorKey: `sertifikat-${id}-keterangan_skor` };
    return { step: 5, errorKey: `sertifikat-${id}-${f}` };
  }
  if (section.toLowerCase() === 'keluarga') {
    const id = row(data.keluarga);
    if (!id) return { step: 6, errorKey: 'keluarga-empty' };
    if (f === 'nama') return { step: 6, errorKey: `keluarga-${id}-nama_anggota` };
    if (f === 'status_pekerjaan') return { step: 6, errorKey: `keluarga-${id}-pekerjaan` };
    return { step: 6, errorKey: `keluarga-${id}-${f}` };
  }

  return null;
}

function buildClientErrorsFromBackendMessage(
  rawMessage: string,
  data: CVData,
): { errors: Errors; step: number } | null {
  const tokens = parseFieldWajibTokens(rawMessage);
  if (tokens.length === 0) return null;
  const out: Errors = {};
  let step = 1;
  let firstMapped = false;
  for (const t of tokens) {
    const mapped = mapBackendTokenToClientError(t, data);
    if (!mapped) continue;
    out[mapped.errorKey] = MSG;
    if (!firstMapped) {
      step = mapped.step;
      firstMapped = true;
    }
  }
  return firstMapped ? { errors: out, step } : null;
}

// ---------- Validators per step ----------
function validateStep1(data: CVData): Errors {
  const e: Errors = {};
  const i = data.informasi_dasar;
  if (!data.meta.tanggal_pembuatan_cv) e['tanggal_pembuatan_cv'] = MSG;
  if (!/^\d{16}$/.test(i.nik.trim())) e['nik'] = 'NIK harus tepat 16 digit angka';
  if (!i.no_peserta?.trim()) e['no_peserta'] = MSG;
  if (!i.nama_lengkap.trim()) e['nama_lengkap'] = MSG;
  if (!i.nama_katakana.trim()) e['nama_katakana'] = MSG;
  if (!i.yobisho.trim()) e['yobisho'] = MSG;
  if (!i.umur.trim()) e['umur'] = MSG;
  if (!i.jenis_kelamin) e['jenis_kelamin'] = MSG;
  if (!i.kewarganegaraan.trim()) e['kewarganegaraan'] = MSG;
  if (!i.tanggal_lahir) e['tanggal_lahir'] = MSG;
  if (!i.golongan_darah) e['golongan_darah'] = MSG;
  if (!i.agama) e['agama'] = MSG;
  if (!i.status_pernikahan) e['status_pernikahan'] = MSG;
  if (!i.kode_pos.trim()) e['kode_pos'] = MSG;
  if (!i.nomor_telepon.trim() || i.nomor_telepon === '+62' || i.nomor_telepon === '+81') e['nomor_telepon'] = MSG;
  if (!i.email.trim()) e['email'] = MSG;
  if (!i.alamat_lengkap.trim()) e['alamat_lengkap'] = MSG;
  return e;
}

function validateStep2(data: CVData): Errors {
  const e: Errors = {};
  const f = data.fisik_kesehatan;
  if (!f.tinggi_badan.trim()) e['tinggi_badan'] = MSG;
  if (!f.berat_badan.trim()) e['berat_badan'] = MSG;
  if (f.merokok === 'Ya' && !f.jumlah_rokok.trim()) e['jumlah_rokok'] = MSG;
  return e;
}

function validateStep3(data: CVData): Errors {
  const e: Errors = {};
  const needsJurusan = ['SMA', 'SMK', 'D3', 'S1'];
  if (data.pendidikan.length === 0) e['pendidikan-empty'] = 'Tambahkan minimal 1 data pendidikan';
  data.pendidikan.forEach((item) => {
    if (!item.nama_sekolah.trim()) e[`pendidikan-${item.id}-nama_sekolah`] = MSG;
    if (!item.tingkat_pendidikan) e[`pendidikan-${item.id}-tingkat_pendidikan`] = MSG;
    if (needsJurusan.includes(item.tingkat_pendidikan) && !item.jurusan.trim()) e[`pendidikan-${item.id}-jurusan`] = MSG;
    if (!item.bulan_masuk) e[`pendidikan-${item.id}-bulan_masuk`] = MSG;
    if (!item.tahun_masuk) e[`pendidikan-${item.id}-tahun_masuk`] = MSG;
    if (!item.bulan_lulus) e[`pendidikan-${item.id}-bulan_lulus`] = MSG;
    if (!item.tahun_lulus) e[`pendidikan-${item.id}-tahun_lulus`] = MSG;
  });
  return e;
}

function validateStep4(data: CVData): Errors {
  const e: Errors = {};
  const filled = filterFilledPekerjaan(data.pekerjaan);
  filled.forEach((item) => {
    if (!item.nama_perusahaan.trim()) e[`pekerjaan-${item.id}-nama_perusahaan`] = MSG;
    if (!item.posisi_pekerjaan.trim()) e[`pekerjaan-${item.id}-posisi_pekerjaan`] = MSG;
    if (!item.status_pekerjaan) e[`pekerjaan-${item.id}-status_pekerjaan`] = MSG;
    if (!item.bulan_mulai) e[`pekerjaan-${item.id}-bulan_mulai`] = MSG;
    if (!item.tahun_mulai) e[`pekerjaan-${item.id}-tahun_mulai`] = MSG;
    if (!item.bulan_selesai) e[`pekerjaan-${item.id}-bulan_selesai`] = MSG;
    if (!item.tahun_selesai) e[`pekerjaan-${item.id}-tahun_selesai`] = MSG;
  });
  return e;
}

function validateStep5(data: CVData): Errors {
  void data;
  return {};
}

function validateStep6(data: CVData): Errors {
  const e: Errors = {};
  if (data.keluarga.length === 0) e['keluarga-empty'] = 'Tambahkan minimal 1 data keluarga';
  data.keluarga.forEach((item) => {
    if (!item.hubungan) e[`keluarga-${item.id}-hubungan`] = MSG;
    if (!item.nama_anggota.trim()) e[`keluarga-${item.id}-nama_anggota`] = MSG;
    if (!item.umur?.trim()) e[`keluarga-${item.id}-umur`] = MSG;
    else if (Number.isNaN(Number(item.umur)) || Number(item.umur) < 1 || Number(item.umur) > 120) {
      e[`keluarga-${item.id}-umur`] = 'Isi umur 1–120 (tahun)';
    }
    if (!item.pekerjaan.trim()) e[`keluarga-${item.id}-pekerjaan`] = MSG;
  });
  return e;
}

const VALIDATORS = [
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateStep6,
];

// ---------- Component ----------
export default function CVFormPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState<CVData>(defaultCVData);
  const [profileReady, setProfileReady] = useState(false);
  const [isAlreadyCreated, setIsAlreadyCreated] = useState(false);
  const [isLoadingCV, setIsLoadingCV] = useState(true);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [dokumenFiles, setDokumenFiles] = useState({
    ktp: null,
    kk: null,
    akte_kelahiran: null,
    ijazah_terakhir: null,
  });
  const [sertifikatFiles, setSertifikatFiles] = useState<Record<string, File>>({});
  const fotoFileRef = useRef<File | null>(null);
  const dokumenFilesRef = useRef<Record<keyof DokumenPendukung, File | null>>({
    ktp: null,
    kk: null,
    akte_kelahiran: null,
    ijazah_terakhir: null,
  });
  const sertifikatFilesRef = useRef<Record<string, File>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [isDataValid, setIsDataValid] = useState(false);

  const [viewportWidth, setViewportWidth] = useState<number>(794);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Hitung skala: pada mobile, CV 794px harus muat dalam layar
  // Kurangi padding container (32px kiri+kanan = 64px total)
  const fitScale = Math.min((viewportWidth - 64) / 794, 1);

  const update = <K extends keyof CVData>(key: K, val: CVData[K]) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const buildEmptyCV = (): CVData => {
    const empty = structuredClone(defaultCVData);
    const loginId = getAuthUserName().trim().toUpperCase();
    if (loginId) {
      empty.informasi_dasar.no_peserta = loginId;
    }
    const loginFullName = getAuthDisplayName().trim() || getAuthUserName().trim();
    if (loginFullName) {
      empty.informasi_dasar.nama_lengkap = loginFullName;
    }
    return empty;
  };

  const handleAutoGenerate = () => {
    const noPeserta = data.informasi_dasar.no_peserta || getAuthUserName().trim().toUpperCase();
    const nama = data.informasi_dasar.nama_lengkap || getAuthDisplayName().trim();
    const generated = buildDummyCVTemplate(noPeserta, nama);
    setData(generated);
    setErrors({});
    setSubmitted(false);
    setIsAlreadyCreated(false);
    toast.success('CV dummy berhasil di-generate. Silakan review dan edit sebelum upload.');
  };

  useEffect(() => {
    const applyAuthFields = (base: CVData): CVData => {
      const loginId = getAuthUserName().trim().toUpperCase();
      if (loginId) {
        base.informasi_dasar = { ...base.informasi_dasar, no_peserta: loginId };
      }
      const loginFullName = getAuthDisplayName().trim() || getAuthUserName().trim();
      if (loginFullName) {
        base.informasi_dasar = { ...base.informasi_dasar, nama_lengkap: loginFullName };
      }
      const agamaMap: Record<string, string> = {
        Islam: 'イスラム教',
        Kristen: 'キリスト教',
        Katolik: 'カトリック',
        Hindu: 'ヒンドゥー教',
        Buddha: '仏教',
        Konghucu: '儒教',
      };
      if (base.informasi_dasar.agama && agamaMap[base.informasi_dasar.agama]) {
        base.informasi_dasar.agama = agamaMap[base.informasi_dasar.agama];
      }
      if (base.informasi_dasar.kewarganegaraan) {
        base.informasi_dasar.kewarganegaraan = wanakana.toKatakana(base.informasi_dasar.kewarganegaraan);
      }
      if (base.informasi_dasar.yobisho) {
        base.informasi_dasar.yobisho = wanakana.toKatakana(base.informasi_dasar.yobisho);
      }
      return base;
    };

    setProfileReady(true);

    const checkExistingCV = async () => {
      try {
        const res = await ApiResume().getMyResume();
        if (res?.status === 200 && res.data) {
          const { cv } = mapApiResponseToCVData(res.data);
          setData(applyAuthFields(cv));
          setSubmitted(true);
          setIsAlreadyCreated(true);
        } else {
          const saved = loadStudentProfile();
          const base = saved?.cv ? mergeCVData(saved.cv) : buildEmptyCV();
          setData(applyAuthFields(base));
        }
      } catch {
        setData(applyAuthFields(buildEmptyCV()));
      } finally {
        setIsLoadingCV(false);
      }
    };
    void checkExistingCV();
  }, []);

  useEffect(() => {
    if (!profileReady) return;
    const t = window.setTimeout(() => saveStudentProfileCv(data), 900);
    return () => window.clearTimeout(t);
  }, [data, profileReady]);

  // Clear errors when user changes data
  const updateAndClear = <K extends keyof CVData>(key: K, val: CVData[K]) => {
    setErrors({});
    update(key, val);
  };

  const tryGoNext = () => {
    const validate = VALIDATORS[step - 1];
    const errs = validate(data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.setTimeout(() => scrollToFirstError(errs), 0);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const toNullableInt = (v: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);
  const toNullableFloat = (v: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);
  const yesNoToSmallInt = (v: string) => {
    if (!v) return null;
    const n = v.toLowerCase();
    return n.includes('tidak') ? 0 : 1;
  };
  const butaWarnaToCode = (v: string) => {
    if (!v) return null;
    const n = v.toLowerCase();
    if (n.includes('total')) return 1;
    if (n.includes('parsial')) return 2;
    if (n.includes('tidak')) return 3;
    return null;
  };
  const kelulusanToCode = (v: string) => {
    if (!v) return null;
    const n = v.toLowerCase();
    return n.includes('lulus') || n.includes('合格') ? 1 : 0;
  };
  const toIsoDate = (v: string) => (v ? `${v}T00:00:00Z` : '');
  const mapGender = (v: string) => (v?.toLowerCase().includes('perempuan') ? 'P' : 'L');
  const up = (v: string) => (v.trim() ? v.trim().toUpperCase() : v);

  const buildPayload = () => {
    const angkatan = angkatanIntFromNoPeserta(data.informasi_dasar.no_peserta);
    return {
      foto: null,
      no_peserta: data.informasi_dasar.no_peserta.trim(),
      ...(angkatan != null ? { angkatan } : {}),
      nik: data.informasi_dasar.nik.trim(),
      nama_peserta: data.informasi_dasar.nama_lengkap,
      nama_panggilan: data.informasi_dasar.yobisho || null,
      nama_katakana: data.informasi_dasar.nama_katakana || null,
      tanggal_lahir: toIsoDate(data.informasi_dasar.tanggal_lahir),
      tgl_masuk_lpk: toIsoDate(data.meta.tanggal_pembuatan_cv),
      umur: toNullableInt(data.informasi_dasar.umur),
      jenis_kelamin: mapGender(data.informasi_dasar.jenis_kelamin),
      status_pernikahan: data.informasi_dasar.status_pernikahan || null,
      agama: data.informasi_dasar.agama || null,
      negara_asal: data.informasi_dasar.kewarganegaraan || null,
      alamat: up(data.informasi_dasar.alamat_lengkap) || null,
      nomor_telepon: data.informasi_dasar.nomor_telepon || null,
      email: data.informasi_dasar.email || null,
      kode_pos: data.informasi_dasar.kode_pos || null,
      tinggi_badan: toNullableInt(data.fisik_kesehatan.tinggi_badan),
      berat_badan: toNullableInt(data.fisik_kesehatan.berat_badan),
      mata_kiri: toNullableFloat(data.fisik_kesehatan.visus_mata_kiri),
      status_mata_kiri: data.fisik_kesehatan.kondisi_mata_kiri || null,
      mata_kanan: toNullableFloat(data.fisik_kesehatan.visus_mata_kanan),
      status_mata_kanan: data.fisik_kesehatan.kondisi_mata_kanan || null,
      merokok: yesNoToSmallInt(data.fisik_kesehatan.merokok),
      frequensi_merokok: toNullableInt(data.fisik_kesehatan.jumlah_rokok),
      berkacamata: yesNoToSmallInt(data.fisik_kesehatan.berkacamata),
      butawarna: butaWarnaToCode(data.fisik_kesehatan.buta_warna),
      golongan_darah: data.informasi_dasar.golongan_darah || null,
      tato: yesNoToSmallInt(data.fisik_kesehatan.tato),
      riwayat_patah_tulang: yesNoToSmallInt(data.fisik_kesehatan.riwayat_patah_tulang),
      hobi: up(data.fisik_kesehatan.hobi) || null,
      pendidikan: data.pendidikan.map((item) => ({
        nama_sekolah: up(item.nama_sekolah) || null,
        tingkat_pendidikan: item.tingkat_pendidikan || null,
        jurusan: up(item.jurusan) || null,
        bulan_masuk: item.bulan_masuk || null,
        tahun_masuk: item.tahun_masuk || null,
        bulan_lulus: item.bulan_lulus || null,
        tahun_lulus: item.tahun_lulus || null,
      })),
      pekerjaan: filterFilledPekerjaan(data.pekerjaan).map((item) => ({
        nama_perusahaan: up(item.nama_perusahaan) || null,
        posisi_pekerjaan: up(item.posisi_pekerjaan) || null,
        status_pekerjaan: item.status_pekerjaan || null,
        bulan_mulai: item.bulan_mulai || null,
        tahun_mulai: item.tahun_mulai || null,
        bulan_selesai: item.bulan_selesai || null,
        tahun_selesai: item.tahun_selesai || null,
      })),
      sertifikat: data.sertifikat.map((item) => ({
        nama_sertifikat: up(item.nama_sertifikat) || null,
        status_kelulusan: kelulusanToCode(item.status_kelulusan || ''),
        score: item.keterangan_skor || null,
        sertifikat: null,
        bulan_diperoleh: item.bulan_diperoleh || null,
        tahun_diperoleh: item.tahun_diperoleh || null,
      })),
      keluarga: data.keluarga.map((item) => ({
        hubungan: item.hubungan || null,
        nama: up(item.nama_anggota) || null,
        umur: toNullableInt(item.umur ?? ''),
        status_pekerjaan: up(item.pekerjaan) || null,
      })),
    };
  };

  const uploadCvData = async () => {
    let photoToUpload = fotoFileRef.current ?? fotoFile;
    if (!photoToUpload && isDataUrlImage(data.meta.foto)) {
      try {
        photoToUpload = await dataUrlToFile(data.meta.foto, 'foto-cv.jpg');
      } catch {
        return { status: 400, message: 'Gagal memproses foto. Silakan upload ulang foto 3×4.' };
      }
    }

    if (photoToUpload && !isAllowedPhotoUpload(photoToUpload)) {
      return { status: 400, message: 'Foto harus berformat JPG, JPEG, atau PNG.' };
    }

    const docKeys = Object.keys(dokumenFilesRef.current) as Array<keyof DokumenPendukung>;
    for (const key of docKeys) {
      const f = dokumenFilesRef.current[key] ?? dokumenFiles[key];
      if (f && !isAllowedDocUpload(f)) {
        return {
          status: 400,
          message: 'Dokumen pendukung hanya boleh PDF, JPG, JPEG, atau PNG.',
        };
      }
    }

    const missingDocs: string[] = [];
    for (const key of docKeys) {
      const hasName = Boolean(data.dokumen[key]?.trim());
      const hasFile = Boolean(dokumenFilesRef.current[key] ?? dokumenFiles[key]);
      if (hasName && !hasFile) {
        missingDocs.push(key.replace(/_/g, ' ').toUpperCase());
      }
    }
    if (missingDocs.length > 0) {
      return {
        status: 400,
        message: `File ${missingDocs.join(', ')} perlu di-upload ulang sebelum submit.`,
      };
    }

    for (const item of data.sertifikat) {
      const file = sertifikatFilesRef.current[item.id] ?? sertifikatFiles[item.id];
      if (file && !isAllowedDocUpload(file)) {
        return {
          status: 400,
          message: 'Lampiran sertifikat hanya boleh PDF, JPG, JPEG, atau PNG.',
        };
      }
    }

    const payload = buildPayload();
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    if (photoToUpload) {
      formData.append('foto_file', await prepareUploadFile(photoToUpload));
    }
    for (const key of docKeys) {
      const file = dokumenFilesRef.current[key] ?? dokumenFiles[key];
      if (file) {
        formData.append(`${key}_file`, await prepareUploadFile(file));
      }
    }
    for (let i = 0; i < data.sertifikat.length; i++) {
      const file = sertifikatFilesRef.current[data.sertifikat[i].id] ?? sertifikatFiles[data.sertifikat[i].id];
      if (file) {
        formData.append(`sertifikat_file_${i}`, await prepareUploadFile(file));
      }
    }

    const response = await ApiResume().postCreateCvData(formData);
    return response;
  };

  const handleSubmit = async () => {
    const errs = validateStep6(data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.setTimeout(() => scrollToFirstError(errs), 0);
      return;
    }
    setErrors({});

    setData(prev => {
      const updated = { ...prev };
      
      updated.informasi_dasar = { ...updated.informasi_dasar };
      
      if (updated.informasi_dasar.yobisho) {
        updated.informasi_dasar.yobisho = wanakana.toKatakana(updated.informasi_dasar.yobisho);
      }
      if (updated.informasi_dasar.kewarganegaraan) {
        updated.informasi_dasar.kewarganegaraan = wanakana.toKatakana(updated.informasi_dasar.kewarganegaraan);
      }
      updated.informasi_dasar.alamat_lengkap = up(updated.informasi_dasar.alamat_lengkap);
      updated.fisik_kesehatan = {
        ...updated.fisik_kesehatan,
        hobi: up(updated.fisik_kesehatan.hobi),
      };
      updated.pendidikan = updated.pendidikan.map((item) => ({
        ...item,
        nama_sekolah: up(item.nama_sekolah),
        jurusan: up(item.jurusan),
      }));
      updated.pekerjaan = filterFilledPekerjaan(updated.pekerjaan).map((item) => ({
        ...item,
        nama_perusahaan: up(item.nama_perusahaan),
        posisi_pekerjaan: up(item.posisi_pekerjaan),
      }));
      updated.sertifikat = updated.sertifikat.map((item) => ({
        ...item,
        nama_sertifikat: up(item.nama_sertifikat),
      }));
      updated.keluarga = updated.keluarga.map((item) => ({
        ...item,
        nama_anggota: up(item.nama_anggota),
        pekerjaan: up(item.pekerjaan),
      }));
      
      return updated;
    });

    setSubmitted(true);
  };

  const handleUploadFromPreview = async () => {
    if (isUploading) return;
    setIsUploading(true);
    const response = await uploadCvData();
    setIsUploading(false);

    const backendMessageRaw =
      response?.message ||
      response?.error ||
      response?.errors?.[0]?.message ||
      'Gagal upload CV';
    const backendMessage = formatBackendErrorMessage(backendMessageRaw);

    if (response?.status !== 200) {
      const recovered = buildClientErrorsFromBackendMessage(String(backendMessageRaw), data);
      if (recovered) {
        setSubmitted(false);
        setStep(recovered.step);
        setErrors(recovered.errors);
        window.setTimeout(() => scrollToFirstError(recovered.errors), 150);
      }
      toast.error(backendMessage);
      return;
    }

    toast.success(response?.message || 'Upload CV berhasil');
    setIsAlreadyCreated(true);
  };

  const handleDownloadPDF = () => {
    exportCVToPDF('cv-template', `CV_${data.informasi_dasar.nama_lengkap || 'kandidat'}.pdf`);
  };

  if (submitted) {
    return (
      <>
      <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f3f5' }}>

        {/* ── Sticky Action Bar ── */}
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Link
                  href="/student-dashboard"
                  className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 no-underline hover:bg-slate-100 sm:px-3 sm:py-2 sm:text-sm"
                >
                  <ArrowLeft size={14} /> Kembali
                </Link>
                <div className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                  <span className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                    {data.informasi_dasar.nama_lengkap || 'Kandidat'}
                  </span>
                </div>
              </div>
              <button
                id="btn-download-pdf"
                onClick={handleDownloadPDF}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 sm:px-3 sm:py-2 sm:text-sm"
              >
                <FileDown size={14} /> PDF
              </button>
            </div>

            {!isAlreadyCreated && (
              <div className="mt-3 space-y-3">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-colors sm:gap-4 sm:p-4 ${
                    isDataValid
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-amber-300 bg-amber-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isDataValid}
                    onChange={(e) => setIsDataValid(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 sm:h-6 sm:w-6"
                  />
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800 sm:text-base">
                      Data sudah benar
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-600 sm:text-sm">
                      Centang konfirmasi ini untuk mengaktifkan tombol Upload CV.
                    </span>
                  </div>
                </label>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    id="btn-edit-cv"
                    type="button"
                    onClick={() => { setSubmitted(false); setIsDataValid(false); }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil size={16} /> Edit Data
                  </button>
                  <button
                    id="btn-upload-cv"
                    type="button"
                    onClick={handleUploadFromPreview}
                    disabled={isUploading || !isDataValid}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                      !isDataValid || isUploading
                        ? 'cursor-not-allowed bg-slate-400'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {isUploading ? 'Mengunggah…' : 'Upload CV'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── A4 Paper Preview Area ── */}
        {/* overflow:auto memungkinkan geser dan pinch-to-zoom native */}
        <div 
          ref={previewContainerRef}
          style={{
            flex: 1,
            background: '#d1d5db',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties}
        >
          {/* Notification */}
          {isAlreadyCreated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', padding: '10px 16px', fontSize: '13px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: '1.4' }}>Jika ada update atau kesalahan pada data CV Anda, silakan contact Admin / Sensei.</span>
            </div>
          )}

          {/* Scaled CV wrapper — lebar otomatis menyesuaikan layar */}
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
            {/* Spacer wrapper agar tinggi kontainer mengikuti CV yang sudah di-scale */}
            <div style={{
              width: 794 * fitScale,
              // tinggi proporsional terhadap skala; A4 = 1122px tinggi
              overflow: 'visible',
              position: 'relative',
            }}>
              <div
                id="cv-print-area"
                style={{
                  width: '794px',
                  background: '#ffffff',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
                  borderRadius: '2px',
                  transformOrigin: 'top left',
                  transform: `scale(${fitScale})`,
                }}
              >
                <CVTemplate data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (isLoadingCV) {
    return (
      <main className="min-h-screen bg-[#F4F7F4] flex items-center justify-center text-gray-500 text-sm gap-2">
        <Loader2 size={16} className="animate-spin" />
        Memuat data CV...
      </main>
    );
  }

  // Error banner count
  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex font-sans text-gray-800 relative z-0">
      {/* Decorative Wagara Background */}
      <div 
        className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%230047AB' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 min-h-screen bg-white border-r border-gray-200/60 px-6 py-10 gap-3 fixed top-0 left-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="mb-10">
          <h1 className="text-2xl font-serif text-gray-900 tracking-wide">Form Data Diri</h1>
          <p className="text-[10px] font-semibold text-gray-400 tracking-[0.2em] uppercase mt-2">Formulir Data Diri Lamaran Jepang</p>
          <button
            type="button"
            onClick={handleAutoGenerate}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-amber-800 border border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <Sparkles size={14} />
            Auto Generate (Demo)
          </button>
        </div>
        {STEPS.map((s) => (
          <button
            key={s.id}
            onClick={() => { setErrors({}); setStep(s.id); }}
            className={`flex items-center gap-4 px-4 py-3 text-left transition-colors duration-500 border-l-2 ${step === s.id
                ? 'bg-emerald-50/50 border-emerald-800 text-emerald-900'
                : step > s.id
                  ? 'border-green-600 bg-transparent text-green-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50'
              }`}
          >
            <span className="text-xl opacity-80">{step > s.id ? '✅' : s.icon}</span>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase mb-1">{s.label}</p>
              <p className="text-[10px] text-gray-400 tracking-wide">{s.desc}</p>
            </div>
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-3 md:p-6 lg:p-12 relative z-10">
        {/* Mobile: compact header with step indicator + back link */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between mb-2">
            <Link href="/student-dashboard" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft size={13} /> Kembali
            </Link>
            <button
              type="button"
              onClick={handleAutoGenerate}
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800 border border-amber-300 bg-amber-50 px-2 py-1 rounded"
            >
              <Sparkles size={12} /> Auto Gen
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{STEPS[step - 1].icon}</span>
            <span className="text-sm font-semibold text-gray-800">{STEPS[step - 1].label}</span>
            <span className="text-xs text-gray-400 ml-auto">Step {step}/{STEPS.length}</span>
          </div>
          <div className="h-1 bg-gray-200 w-full rounded-full">
            <div
              className="h-1 bg-emerald-800 transition-all duration-700 ease-in-out rounded-full"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200/60 p-4 md:p-8 lg:p-12 shadow-sm">
            <div className="hidden lg:block mb-10 border-b border-gray-100 pb-6">
              <h2 className="text-3xl font-serif text-gray-900 mb-2">
                {STEPS[step - 1].icon} {STEPS[step - 1].label}
              </h2>
              <p className="text-xs tracking-widest font-medium uppercase text-gray-400">{STEPS[step - 1].desc}</p>
            </div>

            {/* Error Banner */}
            {errorCount > 0 && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                <span className="text-lg leading-none">⚠️</span>
                <div>
                  <p className="font-semibold">Ada {errorCount} field yang belum diisi / dipilih.</p>
                  <p className="text-xs text-red-500 mt-0.5">Harap lengkapi semua field yang ditandai merah sebelum melanjutkan.</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <StepMetaInfo
                meta={data.meta}
                dokumen={data.dokumen}
                info={data.informasi_dasar}
                onMetaChange={(v) => { setErrors({}); update('meta', v); }}
                onDokumenChange={(v) => { setErrors({}); update('dokumen', v); }}
                onInfoChange={(v) => { setErrors({}); update('informasi_dasar', v); }}
                onFotoFileChange={(file) => {
                  fotoFileRef.current = file;
                  setFotoFile(file);
                }}
                onDokumenFileChange={(key, file) => {
                  dokumenFilesRef.current[key] = file;
                  setDokumenFiles((prev) => ({ ...prev, [key]: file }));
                }}
                errors={errors}
              />
            )}
            {step === 2 && (
              <StepFisik
                data={data.fisik_kesehatan}
                onChange={(v) => { setErrors({}); update('fisik_kesehatan', v); }}
                errors={errors}
              />
            )}
            {step === 3 && (
              <StepPendidikan
                items={data.pendidikan}
                onChange={(v) => { setErrors({}); update('pendidikan', v); }}
                errors={errors}
              />
            )}
            {step === 4 && (
              <StepPekerjaan
                items={data.pekerjaan}
                onChange={(v) => { setErrors({}); update('pekerjaan', v); }}
                errors={errors}
              />
            )}
            {step === 5 && (
              <StepSertifikat
                items={data.sertifikat}
                onChange={(v) => {
                  setErrors({});
                  setSertifikatFiles((prev) => {
                    const next: Record<string, File> = {};
                    for (const item of v) {
                      if (prev[item.id]) next[item.id] = prev[item.id];
                    }
                    sertifikatFilesRef.current = next;
                    return next;
                  });
                  update('sertifikat', v);
                }}
                onFileChange={(id, file) => {
                  setSertifikatFiles((prev) => {
                    const next = { ...prev };
                    if (file) next[id] = file;
                    else delete next[id];
                    sertifikatFilesRef.current = next;
                    return next;
                  });
                }}
                errors={errors}
              />
            )}
            {step === 6 && (
              <StepKeluarga
                items={data.keluarga}
                onChange={(v) => { setErrors({}); update('keluarga', v); }}
                errors={errors}
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 md:mt-12 pt-4 md:pt-8 border-t border-gray-200/60">
              <button
                onClick={() => { setErrors({}); setStep((s) => Math.max(1, s - 1)); }}
                disabled={step === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 border border-gray-300 text-gray-600 text-xs tracking-widest uppercase font-semibold hover:border-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
              >
                <ChevronLeft size={15} strokeWidth={1.5} /> Sebelumnya
              </button>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 hidden sm:block">Langkah {step} / {STEPS.length}</span>
              {step < STEPS.length ? (
                <button
                  onClick={tryGoNext}
                  className="flex items-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 border border-emerald-900 bg-emerald-900 text-white text-xs tracking-widest uppercase font-semibold hover:bg-emerald-950 transition-colors duration-300"
                >
                  Selanjutnya <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 border border-green-700 bg-green-700 text-white text-xs tracking-widest uppercase font-semibold hover:bg-green-800 transition-colors duration-300"
                  >
                    <CheckCircle2 size={15} strokeWidth={1.5} /> Upload
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
