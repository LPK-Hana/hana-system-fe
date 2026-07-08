'use client';

import { type ChangeEvent, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Upload, X, Download, BookUser, Plus, Check, Wand2, Loader2 } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';
import { FileRuleTooltip } from '../../../student-dashboard/cv-form/components/FileRuleTooltip';
import { TOOLTIP_DOC_UPLOAD, TOOLTIP_PHOTO_UPLOAD, DOC_ACCEPT_INPUT, PHOTO_ACCEPT_INPUT } from '../../../student-dashboard/cv-form/file-upload-rules';
import ApiGuest from '@/app/api/guest/api_guest';
import { buildDocFileUrl } from '@/lib/file-storage';
import FilePreviewModal from './FilePreviewModal';
import { toast } from 'react-hot-toast';
import { HUBUNGAN_OPTIONS } from '@/lib/cv-hubungan';
import { toKatakana } from '@/lib/katakana-master';

const TINGKAT_OPTIONS = [
  { value: 'SD', label: 'SD（小学校）' },
  { value: 'SMP', label: 'SMP（中学校）' },
  { value: 'SMA', label: 'SMA（高校）' },
  { value: 'SMK', label: 'SMK（専門学校）' },
  { value: 'D3', label: 'D3（3年制大学）' },
  { value: 'S1', label: 'S1（4年制大学）' },
];

const TINGKATAN_PEMBELAJARAN_OPTIONS = [
  { value: 'Pemula', label: 'Pemula' },
  { value: 'Pernah Belajar Sebelumnya Hingga Level Tertentu', label: 'Pernah Belajar Sebelumnya Hingga Level Tertentu' },
  { value: 'Fasih', label: 'Fasih' },
];

const BULAN_OPTIONS = [
  { value: '1', label: '1月 / Januari' },
  { value: '2', label: '2月 / Februari' },
  { value: '3', label: '3月 / Maret' },
  { value: '4', label: '4月 / April' },
  { value: '5', label: '5月 / Mei' },
  { value: '6', label: '6月 / Juni' },
  { value: '7', label: '7月 / Juli' },
  { value: '8', label: '8月 / Agustus' },
  { value: '9', label: '9月 / September' },
  { value: '10', label: '10月 / Oktober' },
  { value: '11', label: '11月 / November' },
  { value: '12', label: '12月 / Desember' },
];

const HOBI_OPTIONS = [
  { value: 'ゲーム', label: 'ゲーム / Bermain game' },
  { value: '映画・ドラマ鑑賞', label: '映画・ドラマ鑑賞 / Menonton film / series' },
  { value: '音楽鑑賞', label: '音楽鑑賞 / Mendengarkan musik' },
  { value: 'スポーツ', label: 'スポーツ / Olahraga' },
  { value: '料理', label: '料理 / Memasak' },
  { value: '旅行', label: '旅行 / Traveling' },
  { value: '写真撮影', label: '写真撮影 / Fotografi' },
  { value: '釣り', label: '釣り / Memancing' },
  { value: '園芸', label: '園芸 / Berkebun' },
  { value: '読書', label: '読書 / Membaca buku' },
  { value: '絵を描くこと', label: '絵を描くこと / Menggambar' },
  { value: 'SNS', label: 'SNS / Bermain media sosial' },
  { value: 'アイテム収集', label: 'アイテム収集 / Koleksi barang' },
  { value: 'プログラミング', label: 'プログラミング / Programming' },
  { value: '株式投資・トレーディング', label: '株式投資・トレーディング / Trading & investasi saham' },
  { value: 'カラオケ・歌うこと', label: 'カラオケ・歌うこと / Bernyanyi' },
  { value: '執筆', label: '執筆 / Menulis' },
  { value: 'サイクリング', label: 'サイクリング / Bersepeda' },
  { value: 'グルメ巡り', label: 'グルメ巡り / Kulineran' },
  { value: '外国語学習', label: '外国語学習 / Belajar bahasa asing' },
  { value: 'Other', label: 'Lainnya (Isi Manual)' },
];

const KONDISI_MATA_OPTIONS = [
  { value: 'Normal', label: '異常なし / Normal' },
  { value: 'Minus', label: 'マイナス / Minus' },
  { value: 'Silinder', label: '乱視 / Silinder' },
];

const ADA_TIDAK_OPTIONS = [
  { value: 'Ada', label: 'あり / Ada' },
  { value: 'Tidak Ada', label: '無し / Tidak Ada' },
];

const PEKERJAAN_KELUARGA_OPTIONS = [
  { value: '学生', label: '学生 / Pelajar/Mahasiswa' },
  { value: '会社員', label: '会社員 / Karyawan' },
  { value: '主婦', label: '主婦 / Ibu Rumah Tangga' },
  { value: '商人', label: '商人 / Pemilik Toko' },
  { value: '農家', label: '農家 / Petani' },
  { value: '家畜', label: '家畜 / Ternak' },
  { value: '政府職員', label: '政府職員 / Pegawai Negeri Sipil' },
  { value: '事業主', label: '事業主 / Pemilik Usaha Keluarga' },
  { value: '会社のマネージャー', label: '会社のマネージャー / Manajer di Perusahaan' },
  { value: '無職', label: '無職 / Tidak Bekerja' },
  { value: 'Other', label: 'Lainnya (Isi Manual)' },
];

const HASIL_MCU_ADMIN_OPTIONS = [
  { value: 'Fit to Work (Sehat/Bugar)', label: 'Fit to Work (Sehat/Bugar)' },
  { value: 'Fit with Restriction (Fit dengan Catatan)', label: 'Fit with Restriction (Fit dengan Catatan)' },
  { value: 'Temporary Unfit (Tidak Fit Sementara)', label: 'Temporary Unfit (Tidak Fit Sementara)' },
  { value: 'Unfit (Tidak Layak)', label: 'Unfit (Tidak Layak)' },
  { value: 'Lain-lain', label: 'Lain-lain (Input Manual)' },
];

const docFields: Array<{ key: DocFieldKey; label: string }> = [
  { key: 'dokumen_ktp', label: 'KTP' },
  { key: 'dokumen_kk', label: 'KK' },
  { key: 'dokumen_akte', label: 'Akte' },
  { key: 'dokumen_ijazah', label: 'Ijazah' },
];

const TAHUN_OPTIONS = Array.from({ length: 50 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

const STATUS_KELULUSAN_OPTIONS = [
  { value: '1', label: '合格 / Lulus' },
  { value: '0', label: '不合格 / Tidak Lulus' },
];

const GENDER_OPTIONS = [
  { value: 'L', label: 'Laki-laki (男)' },
  { value: 'P', label: 'Perempuan (女)' },
];

const GOLDAR_OPTIONS = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'AB', label: 'AB' },
  { value: 'O', label: 'O' },
];

const AGAMA_OPTIONS = [
  { value: 'Islam', label: 'Islam (イスラム教)' },
  { value: 'Kristen', label: 'Kristen (キリスト教)' },
  { value: 'Katolik', label: 'Katolik (カトリック)' },
  { value: 'Hindu', label: 'Hindu (ヒンドゥー教)' },
  { value: 'Buddha', label: 'Buddha (仏教)' },
  { value: 'Konghucu', label: 'Konghucu (儒教)' },
];

const STATUS_OPTIONS = [
  { value: 'Lajang', label: 'Lajang (独身)' },
  { value: 'Menikah', label: 'Menikah (既婚)' },
  { value: 'Cerai', label: 'Cerai (離婚)' },
];

const YA_TIDAK_OPTIONS = [
  { value: 'Ya', label: 'はい / Ya' },
  { value: 'Tidak', label: 'いいえ / Tidak' },
];

const BUTA_WARNA_OPTIONS = [
  { value: 'Tidak Buta Warna', label: 'いいえ / Tidak Buta Warna' },
  { value: 'Buta Warna Parsial', label: 'はい（部分的）/ Parsial' },
  { value: 'Buta Warna Total', label: 'はい（全色）/ Total' },
];

const SMA_JURUSAN_OPTIONS = [
  { value: '科学', label: '科学 / IPA' },
  { value: '社会', label: '社会 / IPS' },
];

const SMK_JURUSAN_OPTIONS = [
  { value: '機械工学', label: '機械工学 / Teknik Mesin' },
  { value: '電気工学', label: '電気工学 / Teknik Elektro' },
  { value: '航海学', label: '航海学 / Pelayaran' },
  { value: 'コンピュータネットワーク工学', label: 'コンピュータネットワーク工学 / Teknik Jaringan Komputer' },
  { value: 'バイク整備', label: 'バイク整備 / Teknik Sepeda Motor' },
  { value: '自動車整備', label: '自動車整備 / Teknik Kendaraan Ringan' },
  { value: '宗教学', label: '宗教学 / Agama' },
  { value: '事務学', label: '事務学 / Administrasi Perkantoran' },
  { value: '会計学', label: '会計学 / Akuntansi' },
  { value: '縫製学', label: '縫製学 / Tata Busana' },
  { value: '建築学', label: '建築学 / Teknik Bangunan' },
  { value: '薬剤学', label: '薬剤学 / Farmasi' },
  { value: '看護師', label: '看護師 / Keperawatan' },
  { value: '宿泊学', label: '宿泊学 / Perhotelan' },
  { value: '農業学', label: '農業学 / Pertanian' },
  { value: 'マルチメディア', label: 'マルチメディア / Multimedia' },
  { value: '調理学', label: '調理学 / Tata Boga' },
];

const KULIAH_JURUSAN_OPTIONS = [
  { value: '情報工学', label: '情報工学 / Teknik Informatika' },
  { value: '情報システム学', label: '情報システム学 / Sistem Informasi' },
  { value: '日本文学', label: '日本文学 / Sastra Jepang' },
  { value: '経営学', label: '経営学 / Manajemen' },
  { value: '会計学', label: '会計学 / Akuntansi' },
  { value: '産業工学', label: '産業工学 / Teknik Industri' },
  { value: '土木工学', label: '土木工学 / Teknik Sipil' },
  { value: '心理学', label: '心理学 / Psikologi' },
  { value: 'コミュニケーション学', label: 'コミュニケーション学 / Ilmu Komunikasi' },
  { value: '法学', label: '法学 / Hukum' },
  { value: '看護学', label: '看護学 / Keperawatan' },
  { value: 'ビジュアルコミュニケーションデザイン', label: 'ビジュアルコミュニケーションデザイン / Desain Komunikasi Visual (DKV)' },
  { value: '電気工学', label: '電気工学 / Teknik Elektro' },
  { value: '薬学', label: '薬学 / Farmasi' },
  { value: '国際関係学', label: '国際関係学 / Hubungan Internasional' },
  { value: '経営管理学', label: '経営管理学 / Administrasi Bisnis' },
  { value: '英語教育学', label: '英語教育学 / Pendidikan Bahasa Inggris' },
  { value: '建築学', label: '建築学 / Arsitektur' },
  { value: '機械工学', label: '機械工学 / Teknik Mesin' },
  { value: 'データサイエンス', label: 'データサイエンス / Data Science' },
];

const STATUS_PEKERJAAN_OPTIONS = [
  { value: 'Magang', label: '実習 / Magang' },
  { value: 'Karyawan Kontrak', label: '契約社員 / Karyawan Kontrak' },
  { value: 'Karyawan Tetap', label: '正社員 / Karyawan Tetap' },
];

const MCU_CRITERIA_DESCRIPTIONS: Record<string, string> = {

  'Fit to Work (Sehat/Bugar)': 'Kondisi fisik dan mental kandidat dalam keadaan sehat sempurna dan aman untuk melakukan segala jenis pekerjaan.',
  'Fit with Restriction (Fit dengan Catatan)': 'Kondisi tubuh secara umum sehat, namun memerlukan penyesuaian atau pembatasan tertentu dalam bekerja (misal: harus memakai kacamata atau menghindari aktivitas angkat beban berat).',
  'Temporary Unfit (Tidak Fit Sementara)': 'Pekerja sementara waktu tidak layak bekerja akibat masalah kesehatan yang dapat disembuhkan atau diobati.',
  'Unfit (Tidak Layak)': 'Kondisi kesehatan secara permanen atau dalam jangka panjang tidak memungkinkan seseorang untuk melakukan pekerjaan tertentu karena risiko tinggi bagi diri sendiri maupun lingkungan.',
};

export type StudentEditData = {
  id: number;
  cv_revision?: string;
  no_peserta: string;
  nik: string;
  foto: string;
  nama_lengkap: string;
  peminatan?: string;
  jenis_bidang_pekerjaan?: string;
  nama_katakana: string;
  nama_panggilan: string;
  angkatan: string;
  kewarganegaraan: string;
  tanggal_lahir: string;
  umur: string;
  jenis_kelamin: string;
  golongan_darah: string;
  status_pernikahan: string;
  agama: string;
  asal: string;
  alamat: string;
  kode_pos: string;
  telepon: string;
  email: string;
  tingkatan_pembelajaran: string;
  tempat_belajar?: string;
  mcu: string;
  mcu_pdf: string;
  tinggi_badan: string;
  berat_badan: string;
  mata_kiri: string;
  kondisi_mata_kiri: string;
  mata_kanan: string;
  kondisi_mata_kanan: string;
  berkacamata: string;
  tato: string;
  merokok: string;
  frequensi_merokok: string;
  buta_warna: string;
  patah_tulang: string;
  hobi: string;
  asal_lpk: string;
  nama_so: string;
  nama_kumiai: string;
  nama_perusahaan: string;
  jenis_pekerjaan: string;
  tanggal_masuk_pelatihan: string;
  perkiraan_masuk_jepang: string;
  tanggal_keberangkatan: string;
  tanggal_kelulusan: string;
  dokumen_jft: string;
  dokumen_ktp: string;
  dokumen_kk: string;
  dokumen_akte: string;
  dokumen_ijazah: string;
  sertifikat_dimiliki: string[];
  // Field ringkas dari pendidikan[0]
  nama_sekolah?: string;
  tingkat_pendidikan?: string;
  jurusan?: string;
  // Data nested lengkap dari API
  pendidikan?: Array<{
    nama_sekolah?: string | null;
    tingkat_pendidikan?: string | null;
    jurusan?: string | null;
    bulan_masuk?: string | null;
    tahun_masuk?: string | null;
    bulan_lulus?: string | null;
    tahun_lulus?: string | null;
  }>;
  pekerjaan?: Array<{
    nama_perusahaan?: string | null;
    posisi_pekerjaan?: string | null;
    status_pekerjaan?: string | null;
    bulan_mulai?: string | null;
    tahun_mulai?: string | null;
    bulan_selesai?: string | null;
    tahun_selesai?: string | null;
  }>;
  sertifikat?: Array<{
    nama_sertifikat?: string | null;
    status_kelulusan?: number | null;
    score?: string | null;
    bulan_diperoleh?: string | null;
    tahun_diperoleh?: string | null;
    sertifikat?: string | null;
    file?: File;
  }>;
  keluarga?: Array<{
    hubungan?: string | null;
    nama?: string | null;
    umur?: string | number | null;
    status_pekerjaan?: string | null;
  }>;
};

type DocFieldKey =
  | 'mcu_pdf'
  | 'dokumen_ktp'
  | 'dokumen_kk'
  | 'dokumen_akte'
  | 'dokumen_ijazah';

export default function StudentEditModal({
  draftStudent,
  onClose,
  onSave,
  onFieldChange,
  onFieldsChange,
  onFotoUpload,
  onDocUpload,
  onSertifikatFileUpload,
  isSaving,
}: {
  draftStudent: StudentEditData | null;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: <K extends keyof StudentEditData>(key: K, value: StudentEditData[K]) => void;
  onFieldsChange?: (patch: Partial<StudentEditData>) => void;
  onFotoUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onDocUpload: (key: DocFieldKey, e: ChangeEvent<HTMLInputElement>) => void;
  onSertifikatFileUpload: (index: number, e: ChangeEvent<HTMLInputElement>) => void;
  isSaving?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'biodata' | 'pendidikan' | 'pekerjaan' | 'sertifikat' | 'keluarga' | 'dokumen' | 'qualification'>('biodata');
  const [isLainLainSelected, setIsLainLainSelected] = useState(() => {
    if (!draftStudent) return false;
    const isStandard = draftStudent.mcu === '' || draftStudent.mcu === '-' || HASIL_MCU_ADMIN_OPTIONS.filter(opt => opt.value !== 'Lain-lain').some(opt => opt.value === draftStudent.mcu);
    return !isStandard && draftStudent.mcu !== '' && draftStudent.mcu !== '-';
  });

  const [qualLinkVideo, setQualLinkVideo] = useState('');
  const [qualSkillInput, setQualSkillInput] = useState('');
  const [qualSkills, setQualSkills] = useState<string[]>([]);
  const [filePreview, setFilePreview] = useState<{ title: string; filename: string; url: string } | null>(null);

  const openFilePreview = (title: string, docKey: string, filename: string) => {
    setFilePreview({
      title,
      filename,
      url: buildDocFileUrl(docKey, filename),
    });
  };
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isGeneratingKatakana, setIsGeneratingKatakana] = useState(false);

  const [prevNoPeserta, setPrevNoPeserta] = useState(draftStudent?.no_peserta);
  if (draftStudent?.no_peserta !== prevNoPeserta) {
    setPrevNoPeserta(draftStudent?.no_peserta);
    setQualLinkVideo('');
    setQualSkills([]);
    setQualSkillInput('');
    setActiveTab('biodata');
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchQualification = async () => {
      if (draftStudent && draftStudent.no_peserta) {
        try {
          const res = await ApiGuest().getListQualification({ no_peserta: draftStudent.no_peserta });
          if (res?.status === 200 && res.data) {
            setQualLinkVideo(res.data.link_video || '');
            setQualSkills(res.data.skill || []);
          } else {
            setQualLinkVideo('');
            setQualSkills([]);
          }
        } catch (err) {
          console.error("Failed to fetch qualification", err);
          setQualLinkVideo('');
          setQualSkills([]);
        }
      }
    };
    fetchQualification();
  }, [draftStudent?.no_peserta]);

  const handleDownloadImage = async (url: string, defaultFilename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      window.open(url, '_blank');
    }
  };

  const applyKatakanaFromName = (namaLengkap: string, showToast = true) => {
    const source = namaLengkap.trim();
    if (!source) {
      if (showToast) toast.error('Isi Nama Lengkap terlebih dahulu.');
      return false;
    }
    const result = toKatakana(source);
    if (!result) {
      if (showToast) toast.error('Gagal menghasilkan Katakana. Periksa nama lengkap.');
      return false;
    }
    onFieldChange('nama_katakana', result);
    if (showToast) {
      toast.success('Katakana berhasil di-generate. Periksa & koreksi jika perlu.', { duration: 4000 });
    }
    return true;
  };

  const handleGenerateKatakana = () => {
    if (!draftStudent) return;
    setIsGeneratingKatakana(true);
    setTimeout(() => {
      try {
        applyKatakanaFromName(draftStudent.nama_lengkap);
      } finally {
        setIsGeneratingKatakana(false);
      }
    }, 300);
  };

  const handleNamaLengkapChange = (value: string) => {
    if (!draftStudent?.nama_katakana?.trim()) {
      const result = toKatakana(value.trim());
      if (result && onFieldsChange) {
        onFieldsChange({ nama_lengkap: value, nama_katakana: result });
        return;
      }
    }
    onFieldChange('nama_lengkap', value);
  };

  const handleSaveWithQualification = async () => {
    if (!draftStudent) return;

    // Simpan data kualifikasi terlebih dahulu jika ada perubahan/input
    if (qualLinkVideo || qualSkills.length > 0) {
      setIsSavingLocal(true);
      try {
        const payload = {
          no_peserta: draftStudent.no_peserta,
          link_video: qualLinkVideo.trim() || null,
          skill: qualSkills.length > 0 ? qualSkills : null,
        };
        await ApiGuest().postCreateQualification(payload);
      } catch (err) {
        console.error("Gagal menyimpan kualifikasi:", err);
        toast.error("Gagal menyimpan data kualifikasi, tetapi melanjutkan penyimpanan profil.");
      } finally {
        setIsSavingLocal(false);
      }
    }

    // Panggil onSave utama untuk data profil
    onSave();
  };

  if (!mounted || !draftStudent) return null;

  return (
    <>
      {createPortal(
    <div className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white border border-gray-200 shadow-2xl flex flex-col">
        {isSaving && <LoadingOverlay text="MENYIMPAN DATA..." />}

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-serif text-gray-900">Edit Profil Siswa</h2>
            <p className="text-xs text-gray-500 mt-1">
              {draftStudent.nama_lengkap} ({draftStudent.no_peserta})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin-dashboard/kartu-keluarga/${encodeURIComponent(draftStudent.no_peserta)}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-colors rounded"
              title="Lihat & Edit Kartu Keluarga siswa ini"
            >
              <BookUser size={15} />
              Data KK
            </Link>
            <button onClick={onClose} className="p-2 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto flex-shrink-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {[
            { id: 'biodata', label: 'Profil & Kontak', icon: '👤' },
            { id: 'pendidikan', label: 'Riwayat Pendidikan', icon: '🎓' },
            { id: 'pekerjaan', label: 'Riwayat Pekerjaan', icon: '💼' },
            { id: 'sertifikat', label: 'Sertifikat & Lisensi', icon: '🏆' },
            { id: 'keluarga', label: 'Keluarga', icon: '👨‍👩‍👧‍👦' },
            { id: 'dokumen', label: 'Dokumen & MCU', icon: '📎' },
            { id: 'qualification', label: 'Qualification', icon: '🌟' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600 bg-white font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-grow p-6 space-y-6 bg-gray-50/30">
          {activeTab === 'biodata' && (
            <>
              <SectionPanel title="Foto & Identitas Inti">
                <div className="grid md:grid-cols-[200px_1fr] gap-6">
                  <div>
                    <div className="relative w-max">
                      <div className="w-40 h-52 border border-gray-200 bg-gray-50 overflow-hidden relative flex items-center justify-center">
                        {draftStudent.foto ? (
                          <img
                            src={draftStudent.foto}
                            alt={draftStudent.nama_lengkap}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (!img.dataset.fallbackTried) {
                                img.dataset.fallbackTried = '1';
                                const src = img.src;
                                if (src.endsWith('.jpg')) img.src = src.replace(/\.jpg$/, '.jpeg');
                                else if (src.endsWith('.jpeg')) img.src = src.replace(/\.jpeg$/, '.jpg');
                                else img.style.display = 'none';
                              } else {
                                img.style.display = 'none';
                              }
                            }}
                          />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                          </svg>
                        )}
                      </div>
                      <div className="absolute top-0 -right-8">
                        <FileRuleTooltip text={TOOLTIP_PHOTO_UPLOAD} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 w-40">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer whitespace-nowrap bg-white rounded-sm">
                        <Upload size={14} />
                        Ubah Foto
                        <input type="file" accept={PHOTO_ACCEPT_INPUT} className="hidden" onChange={onFotoUpload} />
                      </label>
                      {draftStudent.foto && !draftStudent.foto.startsWith('data:') && (
                        <button
                          type="button"
                          onClick={() => handleDownloadImage(draftStudent.foto, `FOTO_${draftStudent.no_peserta}.jpg`)}
                          className="p-2 text-gray-500 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 transition-colors bg-white rounded-sm flex-shrink-0"
                          title="Download Foto"
                        >
                          <Download size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="No Peserta" value={draftStudent.no_peserta} onChange={(v) => onFieldChange('no_peserta', v)} />
                    <Input label="NIK" value={draftStudent.nik || ''} onChange={(v) => onFieldChange('nik', v)} />
                    <Input label="Angkatan" value={draftStudent.angkatan} onChange={(v) => onFieldChange('angkatan', v)} />
                    <Input label="Nama Lengkap" value={draftStudent.nama_lengkap} onChange={handleNamaLengkapChange} />
                    <KatakanaInput
                      label="Nama Katakana"
                      value={draftStudent.nama_katakana}
                      onChange={(v) => onFieldChange('nama_katakana', v)}
                      onGenerate={handleGenerateKatakana}
                      isGenerating={isGeneratingKatakana}
                      canGenerate={Boolean(draftStudent.nama_lengkap.trim())}
                    />
                    <Input label="Nama Panggilan" value={draftStudent.nama_panggilan} onChange={(v) => onFieldChange('nama_panggilan', v)} />
                    <Input label="Kewarganegaraan" value={draftStudent.kewarganegaraan} onChange={(v) => onFieldChange('kewarganegaraan', v)} />
                    <Input label="Tanggal Lahir" value={draftStudent.tanggal_lahir} onChange={(v) => onFieldChange('tanggal_lahir', v)} type="date" />
                    <Input label="Umur" value={draftStudent.umur} onChange={(v) => onFieldChange('umur', v)} type="number" min={0} />
                    <Select label="Jenis Kelamin" value={draftStudent.jenis_kelamin} placeholder="Pilih jenis kelamin..." options={GENDER_OPTIONS} onChange={(v) => onFieldChange('jenis_kelamin', v)} />
                    <Select label="Golongan Darah" value={draftStudent.golongan_darah} placeholder="Pilih golongan darah..." options={GOLDAR_OPTIONS} onChange={(v) => onFieldChange('golongan_darah', v)} />
                    <Select label="Status Pernikahan" value={draftStudent.status_pernikahan} placeholder="Pilih status..." options={STATUS_OPTIONS} onChange={(v) => onFieldChange('status_pernikahan', v)} />
                    <Select label="Agama" value={draftStudent.agama} placeholder="Pilih agama..." options={AGAMA_OPTIONS} onChange={(v) => onFieldChange('agama', v)} />
                  </div>
                </div>
              </SectionPanel>

              <SectionPanel title="Kontak & Alamat">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Asal (Tempat Lahir)" value={draftStudent.asal} onChange={(v) => onFieldChange('asal', v)} />
                  <Input label="Kode Pos" value={draftStudent.kode_pos} onChange={(v) => onFieldChange('kode_pos', v)} />
                  <Input label="Telepon" value={draftStudent.telepon} onChange={(v) => onFieldChange('telepon', v)} />
                  <Input label="Email" value={draftStudent.email} onChange={(v) => onFieldChange('email', v)} type="email" />
                  <TextArea label="Alamat" value={draftStudent.alamat} onChange={(v) => onFieldChange('alamat', v)} className="md:col-span-2" />
                </div>
              </SectionPanel>

              <SectionPanel title="身体・健康 / Medis & Fisik">
                <div className="grid md:grid-cols-3 gap-4">
                  <Input label="体重 / Berat Badan (kg)" value={draftStudent.berat_badan} onChange={(v) => onFieldChange('berat_badan', v)} type="number" min={0} step="1" />
                  <Input label="身長 / Tinggi Badan (cm)" value={draftStudent.tinggi_badan} onChange={(v) => onFieldChange('tinggi_badan', v)} type="number" min={0} step="1" />
                  <div />
                  <Input label="左目 OS / Visus Mata Kiri" value={draftStudent.mata_kiri} onChange={(v) => onFieldChange('mata_kiri', v)} placeholder="Contoh: 1.5" />
                  <Select label="左目状態 / Kondisi Mata Kiri" value={draftStudent.kondisi_mata_kiri || 'Normal'} options={KONDISI_MATA_OPTIONS} onChange={(v) => onFieldChange('kondisi_mata_kiri', v)} />
                  <div />
                  <Input label="右目 OD / Visus Mata Kanan" value={draftStudent.mata_kanan} onChange={(v) => onFieldChange('mata_kanan', v)} placeholder="Contoh: 1.5" />
                  <Select label="右目状態 / Kondisi Mata Kanan" value={draftStudent.kondisi_mata_kanan || 'Normal'} options={KONDISI_MATA_OPTIONS} onChange={(v) => onFieldChange('kondisi_mata_kanan', v)} />
                  <div />
                  <Select label="メガネ / Berkacamata" value={draftStudent.berkacamata} placeholder="Pilih..." options={YA_TIDAK_OPTIONS} onChange={(v) => onFieldChange('berkacamata', v)} />
                  <Select label="色盲 / Buta Warna" value={draftStudent.buta_warna} placeholder="Pilih..." options={BUTA_WARNA_OPTIONS} onChange={(v) => onFieldChange('buta_warna', v)} />
                  <div />
                  <Select label="タトゥ / Tato" value={draftStudent.tato} placeholder="Pilih..." options={ADA_TIDAK_OPTIONS} onChange={(v) => onFieldChange('tato', v)} />
                  <Select label="骨折歴 / Riwayat Patah Tulang" value={draftStudent.patah_tulang} placeholder="Pilih..." options={ADA_TIDAK_OPTIONS} onChange={(v) => onFieldChange('patah_tulang', v)} />
                  <Select label="タバコ / Merokok" value={draftStudent.merokok} placeholder="Pilih..." options={YA_TIDAK_OPTIONS} onChange={(v) => onFieldChange('merokok', v)} />
                  {draftStudent.merokok === 'Ya' && (
                    <Input label="1日の本数 / Frekuensi Merokok (Batang/Hari)" value={draftStudent.frequensi_merokok || '0'} onChange={(v) => onFieldChange('frequensi_merokok', v)} type="number" min={0} step="1" />
                  )}
                </div>
                <div className="mt-4">
                  <Select
                    label="趣味 / Hobi"
                    value={HOBI_OPTIONS.find(o => o.value === draftStudent.hobi && o.value !== 'Other') ? draftStudent.hobi : (draftStudent.hobi ? 'Other' : '')}
                    placeholder="Pilih hobi..."
                    options={HOBI_OPTIONS}
                    onChange={(v) => {
                      if (v !== 'Other') onFieldChange('hobi', v);
                      else onFieldChange('hobi', '');
                    }}
                  />
                  {(draftStudent.hobi && !HOBI_OPTIONS.filter(o => o.value !== 'Other').find(o => o.value === draftStudent.hobi)) && (
                    <div className="mt-2">
                      <Input label="Hobi (Manual)" value={draftStudent.hobi} onChange={(v) => onFieldChange('hobi', v)} placeholder="Ketik hobi..." />
                    </div>
                  )}
                </div>
              </SectionPanel>

              <SectionPanel title="Penempatan & Jadwal">
                <div className="grid md:grid-cols-2 gap-4">
                  <Select label="Tingkatan Pembelajaran" value={draftStudent.tingkatan_pembelajaran} placeholder="Pilih Tingkatan..." options={TINGKATAN_PEMBELAJARAN_OPTIONS} onChange={(v) => onFieldChange('tingkatan_pembelajaran', v)} />
                  <Input label="Asal LPK" value={draftStudent.asal_lpk} onChange={(v) => onFieldChange('asal_lpk', v)} />
                  <Input label="Nama SO" value={draftStudent.nama_so} onChange={(v) => onFieldChange('nama_so', v)} />
                  <Input label="Nama Kumiai" value={draftStudent.nama_kumiai} onChange={(v) => onFieldChange('nama_kumiai', v)} />
                  <Input label="Nama Perusahaan (Di Jepang)" value={draftStudent.nama_perusahaan} onChange={(v) => onFieldChange('nama_perusahaan', v)} />
                  <Input label="Jenis Pekerjaan" value={draftStudent.jenis_pekerjaan} onChange={(v) => onFieldChange('jenis_pekerjaan', v)} />
                  <Input label="Tanggal Masuk Pelatihan" value={draftStudent.tanggal_masuk_pelatihan} onChange={(v) => onFieldChange('tanggal_masuk_pelatihan', v)} type="date" />
                  <Input label="Perkiraan Masuk Jepang" value={draftStudent.perkiraan_masuk_jepang} onChange={(v) => onFieldChange('perkiraan_masuk_jepang', v)} type="date" />
                  <Input label="Tanggal Keberangkatan" value={draftStudent.tanggal_keberangkatan} onChange={(v) => onFieldChange('tanggal_keberangkatan', v)} type="date" />
                  <Input label="Tanggal Kelulusan" value={draftStudent.tanggal_kelulusan} onChange={(v) => onFieldChange('tanggal_kelulusan', v)} type="date" />
                </div>
              </SectionPanel>
            </>
          )}

          {activeTab === 'pendidikan' && (
            <SectionPanel
              title="Riwayat Pendidikan"
              extraHeader={
                <button
                  type="button"
                  onClick={() => {
                    const newPendidikan = [{ nama_sekolah: '', tingkat_pendidikan: '', jurusan: '', bulan_masuk: '', tahun_masuk: '', bulan_lulus: '', tahun_lulus: '' }, ...(draftStudent.pendidikan || [])];
                    onFieldChange('pendidikan', newPendidikan);
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  + Tambah Pendidikan
                </button>
              }
            >
              <div className="space-y-4">
                {(draftStudent.pendidikan || []).map((p, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 bg-gray-50 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const newPendidikan = [...(draftStudent.pendidikan || [])];
                        newPendidikan.splice(idx, 1);
                        onFieldChange('pendidikan', newPendidikan);
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                    <div className="grid md:grid-cols-2 gap-4 pr-6">
                      <Input
                        label="Nama Sekolah / Universitas"
                        value={p.nama_sekolah || ''}
                        onChange={(v) => {
                          const newPendidikan = [...(draftStudent.pendidikan || [])];
                          newPendidikan[idx] = { ...newPendidikan[idx], nama_sekolah: v };
                          onFieldChange('pendidikan', newPendidikan);
                        }}
                      />
                      <Select
                        label="Tingkat Pendidikan"
                        value={p.tingkat_pendidikan || ''}
                        placeholder="Pilih tingkat..."
                        options={TINGKAT_OPTIONS}
                        onChange={(v) => {
                          const newPendidikan = [...(draftStudent.pendidikan || [])];
                          newPendidikan[idx] = { ...newPendidikan[idx], tingkat_pendidikan: v, jurusan: '' };
                          onFieldChange('pendidikan', newPendidikan);
                        }}
                      />
                      {['SMA', 'SMK', 'D3', 'S1'].includes(p.tingkat_pendidikan || '') ? (
                        <div className="space-y-2">
                          <Select
                            label="Jurusan"
                            value={(p.tingkat_pendidikan === 'SMA' ? SMA_JURUSAN_OPTIONS : p.tingkat_pendidikan === 'SMK' ? SMK_JURUSAN_OPTIONS : KULIAH_JURUSAN_OPTIONS).find(o => o.value === p.jurusan && o.value !== 'Other') ? (p.jurusan || '') : (p.jurusan ? 'Other' : '')}
                            placeholder="Pilih jurusan..."
                            options={[
                              ...(p.tingkat_pendidikan === 'SMA' ? SMA_JURUSAN_OPTIONS : p.tingkat_pendidikan === 'SMK' ? SMK_JURUSAN_OPTIONS : KULIAH_JURUSAN_OPTIONS),
                              { value: 'Other', label: 'Lainnya (Isi Manual)' }
                            ]}
                            onChange={(v) => {
                              const newPendidikan = [...(draftStudent.pendidikan || [])];
                              newPendidikan[idx] = { ...newPendidikan[idx], jurusan: v !== 'Other' ? v : '' };
                              onFieldChange('pendidikan', newPendidikan);
                            }}
                          />
                          {(p.jurusan && !(p.tingkat_pendidikan === 'SMA' ? SMA_JURUSAN_OPTIONS : p.tingkat_pendidikan === 'SMK' ? SMK_JURUSAN_OPTIONS : KULIAH_JURUSAN_OPTIONS).find(o => o.value === p.jurusan)) && (
                            <Input
                              label="Jurusan (Manual)"
                              value={p.jurusan || ''}
                              onChange={(v) => {
                                const newPendidikan = [...(draftStudent.pendidikan || [])];
                                newPendidikan[idx] = { ...newPendidikan[idx], jurusan: v };
                                onFieldChange('pendidikan', newPendidikan);
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <Input
                          label="Jurusan"
                          value={p.jurusan || ''}
                          onChange={(v) => {
                            const newPendidikan = [...(draftStudent.pendidikan || [])];
                            newPendidikan[idx] = { ...newPendidikan[idx], jurusan: v };
                            onFieldChange('pendidikan', newPendidikan);
                          }}
                        />
                      )}
                      <div className="grid grid-cols-4 gap-2">
                        <Select
                          label="Bulan Masuk"
                          value={p.bulan_masuk || ''}
                          placeholder="Bulan"
                          options={BULAN_OPTIONS}
                          onChange={(v) => {
                            const newPendidikan = [...(draftStudent.pendidikan || [])];
                            newPendidikan[idx] = { ...newPendidikan[idx], bulan_masuk: v };
                            onFieldChange('pendidikan', newPendidikan);
                          }}
                        />
                        <Select
                          label="Tahun Masuk"
                          value={p.tahun_masuk || ''}
                          placeholder="Tahun"
                          options={TAHUN_OPTIONS}
                          onChange={(v) => {
                            const newPendidikan = [...(draftStudent.pendidikan || [])];
                            newPendidikan[idx] = { ...newPendidikan[idx], tahun_masuk: v };
                            onFieldChange('pendidikan', newPendidikan);
                          }}
                        />
                        <Select
                          label="Bulan Lulus"
                          value={p.bulan_lulus || ''}
                          placeholder="Bulan"
                          options={BULAN_OPTIONS}
                          onChange={(v) => {
                            const newPendidikan = [...(draftStudent.pendidikan || [])];
                            newPendidikan[idx] = { ...newPendidikan[idx], bulan_lulus: v };
                            onFieldChange('pendidikan', newPendidikan);
                          }}
                        />
                        <Select
                          label="Tahun Lulus"
                          value={p.tahun_lulus || ''}
                          placeholder="Tahun"
                          options={TAHUN_OPTIONS}
                          onChange={(v) => {
                            const newPendidikan = [...(draftStudent.pendidikan || [])];
                            newPendidikan[idx] = { ...newPendidikan[idx], tahun_lulus: v };
                            onFieldChange('pendidikan', newPendidikan);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!draftStudent.pendidikan || draftStudent.pendidikan.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300">Belum ada data pendidikan.</p>
                )}
              </div>
            </SectionPanel>
          )}

          {activeTab === 'pekerjaan' && (
            <SectionPanel
              title="Riwayat Pekerjaan"
              extraHeader={
                <button
                  type="button"
                  onClick={() => {
                    const newPekerjaan = [{ nama_perusahaan: '', posisi_pekerjaan: '', status_pekerjaan: '', bulan_mulai: '', tahun_mulai: '', bulan_selesai: '', tahun_selesai: '' }, ...(draftStudent.pekerjaan || [])];
                    onFieldChange('pekerjaan', newPekerjaan);
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  + Tambah Pekerjaan
                </button>
              }
            >
              <div className="space-y-4">
                {(draftStudent.pekerjaan || []).map((pj, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 bg-gray-50 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const newPekerjaan = [...(draftStudent.pekerjaan || [])];
                        newPekerjaan.splice(idx, 1);
                        onFieldChange('pekerjaan', newPekerjaan);
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                    <div className="grid md:grid-cols-2 gap-4 pr-6">
                      <Input
                        label="Nama Perusahaan"
                        value={pj.nama_perusahaan || ''}
                        onChange={(v) => {
                          const newPekerjaan = [...(draftStudent.pekerjaan || [])];
                          newPekerjaan[idx] = { ...newPekerjaan[idx], nama_perusahaan: v };
                          onFieldChange('pekerjaan', newPekerjaan);
                        }}
                      />
                      <Input
                        label="Posisi / Pekerjaan"
                        value={pj.posisi_pekerjaan || ''}
                        onChange={(v) => {
                          const newPekerjaan = [...(draftStudent.pekerjaan || [])];
                          newPekerjaan[idx] = { ...newPekerjaan[idx], posisi_pekerjaan: v };
                          onFieldChange('pekerjaan', newPekerjaan);
                        }}
                      />
                      <Select
                        label="Status Pekerjaan"
                        value={pj.status_pekerjaan || ''}
                        placeholder="Pilih status..."
                        options={STATUS_PEKERJAAN_OPTIONS}
                        onChange={(v) => {
                          const newPekerjaan = [...(draftStudent.pekerjaan || [])];
                          newPekerjaan[idx] = { ...newPekerjaan[idx], status_pekerjaan: v };
                          onFieldChange('pekerjaan', newPekerjaan);
                        }}
                      />
                      <div className="grid grid-cols-4 gap-2">
                        <Select
                          label="Bulan Mulai"
                          value={pj.bulan_mulai || ''}
                          placeholder="Bulan"
                          options={BULAN_OPTIONS}
                          onChange={(v) => {
                            const newPekerjaan = [...(draftStudent.pekerjaan || [])];
                            newPekerjaan[idx] = { ...newPekerjaan[idx], bulan_mulai: v };
                            onFieldChange('pekerjaan', newPekerjaan);
                          }}
                        />
                        <Select
                          label="Tahun Mulai"
                          value={pj.tahun_mulai || ''}
                          placeholder="Tahun"
                          options={TAHUN_OPTIONS}
                          onChange={(v) => {
                            const newPekerjaan = [...(draftStudent.pekerjaan || [])];
                            newPekerjaan[idx] = { ...newPekerjaan[idx], tahun_mulai: v };
                            onFieldChange('pekerjaan', newPekerjaan);
                          }}
                        />
                        <Select
                          label="Bulan Selesai"
                          value={pj.bulan_selesai || ''}
                          placeholder="Bulan"
                          options={BULAN_OPTIONS}
                          onChange={(v) => {
                            const newPekerjaan = [...(draftStudent.pekerjaan || [])];
                            newPekerjaan[idx] = { ...newPekerjaan[idx], bulan_selesai: v };
                            onFieldChange('pekerjaan', newPekerjaan);
                          }}
                        />
                        <Select
                          label="Tahun Selesai"
                          value={pj.tahun_selesai || ''}
                          placeholder="Tahun"
                          options={TAHUN_OPTIONS}
                          onChange={(v) => {
                            const newPekerjaan = [...(draftStudent.pekerjaan || [])];
                            newPekerjaan[idx] = { ...newPekerjaan[idx], tahun_selesai: v };
                            onFieldChange('pekerjaan', newPekerjaan);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!draftStudent.pekerjaan || draftStudent.pekerjaan.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300">Belum ada data pekerjaan.</p>
                )}
              </div>
            </SectionPanel>
          )}

          {activeTab === 'sertifikat' && (
            <SectionPanel
              title="Riwayat Sertifikat / Lisensi"
              extraHeader={
                <button
                  type="button"
                  onClick={() => {
                    const newSertifikat = [{ nama_sertifikat: '', status_kelulusan: 1, score: '', bulan_diperoleh: '', tahun_diperoleh: '' }, ...(draftStudent.sertifikat || [])];
                    onFieldChange('sertifikat', newSertifikat);
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  + Tambah Sertifikat
                </button>
              }
            >
              <div className="space-y-4">
                {(draftStudent.sertifikat || []).map((s, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 bg-gray-50 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const newSertifikat = [...(draftStudent.sertifikat || [])];
                        newSertifikat.splice(idx, 1);
                        onFieldChange('sertifikat', newSertifikat);
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                    <div className="grid md:grid-cols-2 gap-4 pr-6">
                      <Input
                        label="Nama Sertifikat / Lisensi"
                        value={s.nama_sertifikat || ''}
                        onChange={(v) => {
                          const newSertifikat = [...(draftStudent.sertifikat || [])];
                          newSertifikat[idx] = { ...newSertifikat[idx], nama_sertifikat: v };
                          onFieldChange('sertifikat', newSertifikat);
                        }}
                      />
                      <Select
                        label="Status Kelulusan"
                        value={s.status_kelulusan != null ? String(s.status_kelulusan) : '1'}
                        options={STATUS_KELULUSAN_OPTIONS}
                        onChange={(v) => {
                          const newSertifikat = [...(draftStudent.sertifikat || [])];
                          newSertifikat[idx] = { ...newSertifikat[idx], status_kelulusan: Number(v) };
                          onFieldChange('sertifikat', newSertifikat);
                        }}
                      />
                      <Input
                        label="Score / Nilai (Opsional)"
                        value={s.score || ''}
                        onChange={(v) => {
                          const newSertifikat = [...(draftStudent.sertifikat || [])];
                          newSertifikat[idx] = { ...newSertifikat[idx], score: v };
                          onFieldChange('sertifikat', newSertifikat);
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          label="Bulan Diperoleh"
                          value={s.bulan_diperoleh || ''}
                          placeholder="Bulan"
                          options={BULAN_OPTIONS}
                          onChange={(v) => {
                            const newSertifikat = [...(draftStudent.sertifikat || [])];
                            newSertifikat[idx] = { ...newSertifikat[idx], bulan_diperoleh: v };
                            onFieldChange('sertifikat', newSertifikat);
                          }}
                        />
                        <Select
                          label="Tahun Diperoleh"
                          value={s.tahun_diperoleh || ''}
                          placeholder="Tahun"
                          options={TAHUN_OPTIONS}
                          onChange={(v) => {
                            const newSertifikat = [...(draftStudent.sertifikat || [])];
                            newSertifikat[idx] = { ...newSertifikat[idx], tahun_diperoleh: v };
                            onFieldChange('sertifikat', newSertifikat);
                          }}
                        />
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-1.5 mt-1">
                        <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase flex items-center gap-1.5">
                          File Sertifikat (Foto/PDF) — Opsional
                          <FileRuleTooltip text={TOOLTIP_DOC_UPLOAD} />
                        </span>
                        <input
                          type="file"
                          accept={DOC_ACCEPT_INPUT}
                          onChange={(e) => onSertifikatFileUpload(idx, e)}
                          className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition file:mr-3 file:border-0 file:bg-emerald-50 file:text-emerald-700 file:px-3 file:py-1.5 file:rounded-lg file:cursor-pointer"
                        />
                        <p className="text-xs text-gray-500">
                          {s.sertifikat && s.sertifikat !== '' ? (
                            <>
                              File Tersimpan:{' '}
                              <button
                                type="button"
                                onClick={() => openFilePreview('Sertifikat', 'sertifikat', s.sertifikat!)}
                                className="text-emerald-600 hover:underline"
                              >
                                {s.sertifikat}
                              </button>
                            </>
                          ) : 'Belum ada file dipilih'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!draftStudent.sertifikat || draftStudent.sertifikat.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300">Belum ada data sertifikat.</p>
                )}
              </div>
            </SectionPanel>
          )}

          {activeTab === 'keluarga' && (
            <SectionPanel
              title="Data Orang Tua / Keluarga"
              extraHeader={
                <button
                  type="button"
                  onClick={() => {
                    const newKeluarga = [{ hubungan: '', nama: '', umur: '', status_pekerjaan: '' }, ...(draftStudent.keluarga || [])];
                    onFieldChange('keluarga', newKeluarga);
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  + Tambah Data
                </button>
              }
            >
              <div className="space-y-4">
                {(draftStudent.keluarga || []).map((k, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 bg-gray-50 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const newKeluarga = [...(draftStudent.keluarga || [])];
                        newKeluarga.splice(idx, 1);
                        onFieldChange('keluarga', newKeluarga);
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                    <div className="grid md:grid-cols-4 gap-4 pr-6">
                      <Select
                        label="続柄 / Hubungan"
                        value={k.hubungan || ''}
                        placeholder="Pilih..."
                        options={HUBUNGAN_OPTIONS}
                        onChange={(v) => {
                          const newKeluarga = [...(draftStudent.keluarga || [])];
                          newKeluarga[idx] = { ...newKeluarga[idx], hubungan: v };
                          onFieldChange('keluarga', newKeluarga);
                        }}
                      />
                      <Input
                        label="氏名 / Nama"
                        value={k.nama || ''}
                        onChange={(v) => {
                          const newKeluarga = [...(draftStudent.keluarga || [])];
                          newKeluarga[idx] = { ...newKeluarga[idx], nama: v };
                          onFieldChange('keluarga', newKeluarga);
                        }}
                      />
                      <Input
                        label="年齢 / Umur (Tahun)"
                        value={k.umur != null ? String(k.umur) : ''}
                        onChange={(v) => {
                          const newKeluarga = [...(draftStudent.keluarga || [])];
                          newKeluarga[idx] = { ...newKeluarga[idx], umur: v };
                          onFieldChange('keluarga', newKeluarga);
                        }}
                        type="number"
                        min={0}
                        step="1"
                      />
                      <Select
                        label="職業 / Pekerjaan"
                        value={PEKERJAAN_KELUARGA_OPTIONS.find(o => o.value === k.status_pekerjaan && o.value !== 'Other') ? (k.status_pekerjaan || '') : (k.status_pekerjaan ? 'Other' : '')}
                        placeholder="Pilih..."
                        options={PEKERJAAN_KELUARGA_OPTIONS}
                        onChange={(v) => {
                          const newKeluarga = [...(draftStudent.keluarga || [])];
                          newKeluarga[idx] = { ...newKeluarga[idx], status_pekerjaan: v !== 'Other' ? v : '' };
                          onFieldChange('keluarga', newKeluarga);
                        }}
                      />
                      {(k.status_pekerjaan && !PEKERJAAN_KELUARGA_OPTIONS.filter(o => o.value !== 'Other').find(o => o.value === k.status_pekerjaan)) && (
                        <Input
                          label="Pekerjaan (Manual)"
                          value={k.status_pekerjaan || ''}
                          onChange={(v) => {
                            const newKeluarga = [...(draftStudent.keluarga || [])];
                            newKeluarga[idx] = { ...newKeluarga[idx], status_pekerjaan: v };
                            onFieldChange('keluarga', newKeluarga);
                          }}
                          placeholder="Contoh: Pedagang"
                        />
                      )}
                    </div>
                  </div>
                ))}
                {(!draftStudent.keluarga || draftStudent.keluarga.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300">Belum ada data orang tua/keluarga.</p>
                )}
              </div>
            </SectionPanel>
          )}

          {activeTab === 'dokumen' && (
            <div className="space-y-6">
              <SectionPanel title="Dokumen Pendukung">
                <div className="grid md:grid-cols-2 gap-4">
                  {docFields
                    .filter((f) => f.key !== 'mcu_pdf')
                    .map((f) => (
                      <div key={f.key} className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase flex items-center gap-1.5">
                          {f.label}
                          <FileRuleTooltip text={TOOLTIP_DOC_UPLOAD} />
                        </span>
                        <input
                          type="file"
                          accept={DOC_ACCEPT_INPUT}
                          onChange={(e) => onDocUpload(f.key, e)}
                          className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition file:mr-3 file:border-0 file:bg-emerald-50 file:text-emerald-700 file:px-3 file:py-1.5 file:rounded-lg file:cursor-pointer"
                        />
                        <p className="text-xs text-gray-500">
                          {draftStudent[f.key] && draftStudent[f.key] !== '-' ? (
                            <>
                              File Tersimpan:{' '}
                              <button
                                type="button"
                                onClick={() => openFilePreview(f.label, f.key, draftStudent[f.key] as string)}
                                className="text-emerald-600 hover:underline"
                              >
                                {draftStudent[f.key] as string}
                              </button>
                            </>
                          ) : 'Belum ada file'}
                        </p>
                      </div>
                    ))}
                </div>
              </SectionPanel>

              <SectionPanel title="Hasil Medical Check Up (MCU)">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5 justify-between">
                    <div>
                      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase flex items-center gap-1.5">
                        Upload File Hasil MCU (PDF)
                        <FileRuleTooltip text={TOOLTIP_DOC_UPLOAD} />
                      </span>
                      <input
                        type="file"
                        accept={DOC_ACCEPT_INPUT}
                        onChange={(e) => onDocUpload('mcu_pdf', e)}
                        className="mt-2 w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition file:mr-3 file:border-0 file:bg-emerald-50 file:text-emerald-700 file:px-3 file:py-1.5 file:rounded-lg file:cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {draftStudent.mcu_pdf && draftStudent.mcu_pdf !== '-' ? (
                          <>
                            File Tersimpan:{' '}
                            <button
                              type="button"
                              onClick={() => openFilePreview('Hasil MCU', 'mcu_pdf', draftStudent.mcu_pdf)}
                              className="text-emerald-600 hover:underline"
                            >
                              {draftStudent.mcu_pdf}
                            </button>
                          </>
                        ) : 'Belum ada file'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Select
                      label="Hasil MCU (Evaluasi Admin)"
                      value={isLainLainSelected ? 'Lain-lain' : (draftStudent.mcu || '')}
                      placeholder="Pilih hasil evaluasi MCU..."
                      options={HASIL_MCU_ADMIN_OPTIONS}
                      onChange={(v) => {
                        if (v === 'Lain-lain') {
                          setIsLainLainSelected(true);
                          onFieldChange('mcu', '');
                        } else {
                          setIsLainLainSelected(false);
                          onFieldChange('mcu', v);
                        }
                      }}
                    />
                    {isLainLainSelected && (
                      <div className="mt-1 transition-all duration-200 animate-fadeIn">
                        <Input
                          label="Tulis Hasil MCU Kustom"
                          value={draftStudent.mcu || ''}
                          placeholder="Masukkan hasil evaluasi MCU kustom..."
                          onChange={(v) => onFieldChange('mcu', v)}
                        />
                      </div>
                    )}
                    {!isLainLainSelected && draftStudent.mcu && MCU_CRITERIA_DESCRIPTIONS[draftStudent.mcu] && (
                      <div className="mt-2 bg-emerald-50/70 border border-emerald-100 p-3.5 rounded text-xs text-emerald-900 leading-relaxed shadow-sm">
                        <div className="font-semibold text-emerald-950 mb-1 flex items-center gap-1.5">
                          <span>📋</span> Kriteria Evaluasi:
                        </div>
                        {MCU_CRITERIA_DESCRIPTIONS[draftStudent.mcu]}
                      </div>
                    )}
                  </div>
                </div>
              </SectionPanel>
            </div>
          )}
          {activeTab === 'qualification' && (
            <QualificationTab
              key={draftStudent.no_peserta}
              linkVideo={qualLinkVideo}
              setLinkVideo={setQualLinkVideo}
              skillInput={qualSkillInput}
              setSkillInput={setQualSkillInput}
              skills={qualSkills}
              setSkills={setQualSkills}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={isSaving || isSavingLocal} className="px-5 py-2.5 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50">
            Batal
          </button>
          <button
            onClick={handleSaveWithQualification}
            disabled={isSaving || isSavingLocal || (qualLinkVideo.trim() !== '' && !qualLinkVideo.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/))}
            className="px-5 py-2.5 text-xs tracking-widest uppercase bg-emerald-700 text-white hover:bg-emerald-800 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSaving || isSavingLocal ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
      )}
      {filePreview && (
        <FilePreviewModal
          title={filePreview.title}
          filename={filePreview.filename}
          url={filePreview.url}
          onClose={() => setFilePreview(null)}
        />
      )}
    </>
  );
}

function KatakanaInput({
  label,
  value,
  onChange,
  onGenerate,
  isGenerating,
  canGenerate,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">{label}</span>
      <div className="mt-2 flex gap-2 items-stretch">
        <input
          type="text"
          value={value}
          placeholder="Contoh: ジダン・プラタマ"
          onChange={e => onChange(e.target.value)}
          className="flex-1 min-w-0 border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !canGenerate}
          title="Generate otomatis Katakana dari Nama Lengkap"
          className="inline-flex items-center gap-1.5 shrink-0 px-3 py-2 border border-violet-300 bg-gradient-to-b from-violet-50 to-violet-100 text-violet-700 text-xs font-semibold hover:from-violet-100 hover:to-violet-200 hover:border-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Auto'}</span>
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-gray-500">
        Klik <span className="text-violet-600 font-medium">Auto</span> untuk generate dari Nama Lengkap, atau isi manual.
      </p>
    </label>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder, min, step }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; min?: number; step?: string | number }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">{label}</span>
      <input type={type} min={min} step={step} value={value} placeholder={placeholder} onChange={(e) => {
        const val = e.target.value;
        onChange(type === 'text' ? val.toUpperCase() : val);
      }} className="mt-2 w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
    </label>
  );
}

function TextArea({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} rows={3} className="mt-2 w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
    </label>
  );
}

function Select({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function SectionPanel({ title, children, extraHeader }: { title: string; children: React.ReactNode; extraHeader?: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</h3>
        {extraHeader}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

function QualificationTab({
  linkVideo,
  setLinkVideo,
  skillInput,
  setSkillInput,
  skills,
  setSkills,
}: {
  linkVideo: string;
  setLinkVideo: (v: string) => void;
  skillInput: string;
  setSkillInput: (v: string) => void;
  skills: string[];
  setSkills: (v: string[]) => void;
}) {
  const isDirtyRef = useRef(false);
  const skillInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  useEffect(() => {
    // If user hasn't typed anything yet, it means linkVideo came from props (backend)
    // We want to auto-preview it
    if (!isDirtyRef.current) {
      const url = linkVideo.trim();
      if (!url) {
        setPreviewUrl(null);
      } else {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        if (match && match[1]) {
          setPreviewUrl(`https://www.youtube.com/embed/${match[1]}`);
        } else {
          setPreviewUrl(null);
        }
      }
    }
  }, [linkVideo]);

  const handleVideoEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const url = linkVideo.trim();
      let videoId = '';

      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      if (match && match[1]) {
        videoId = match[1];
      }

      if (videoId) {
        setPreviewUrl(`https://www.youtube.com/embed/${videoId}`);
      } else if (url) {
        toast.error('Format link YouTube tidak dikenali');
        setPreviewUrl(null);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillInput.trim() && !skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
        setSkillInput('');
        setIsAddingSkill(false);
      } else if (!skillInput.trim()) {
        setIsAddingSkill(false);
      }
    } else if (e.key === 'Escape') {
      setIsAddingSkill(false);
      setSkillInput('');
    }
  };

  const handleAddNewClick = () => {
    setIsAddingSkill(true);
    setTimeout(() => skillInputRef.current?.focus(), 50);
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const isVideoInvalid = linkVideo.trim() !== '' && !linkVideo.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);

  return (
    <SectionPanel title="Kualifikasi / Qualification">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link Video jiko shoukai (YouTube)
          </label>
          <input
            type="text"
            value={linkVideo}
            onChange={(e) => {
              isDirtyRef.current = true;
              setLinkVideo(e.target.value);
              setPreviewUrl(null); // Sembunyikan preview jika user mulai mengetik ulang
            }}
            onKeyDown={handleVideoEnter}
            placeholder="Tempel link YouTube di sini lalu tekan Enter untuk melihat preview..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 ${isVideoInvalid
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 bg-white'
              }`}
          />
          {isVideoInvalid && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">
              Tautan tidak valid. Harap masukkan tautan YouTube yang benar.
            </p>
          )}
          {previewUrl && (
            <div className="mt-4 aspect-video w-full max-w-lg mx-auto overflow-hidden rounded-md border border-gray-200 shadow-sm">
              <iframe
                width="100%"
                height="100%"
                src={previewUrl}
                title="YouTube video preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills / Keahlian / Kemampuan Bahasa Jepang
          </label>
          <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-white min-h-[52px] items-center">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-full shadow-sm transition-colors hover:bg-emerald-100"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="text-emerald-500 hover:text-emerald-800 focus:outline-none p-0.5 rounded-full"
                >
                  <X size={14} />
                </button>
              </span>
            ))}

            {isAddingSkill ? (
              <div className="inline-flex items-center bg-white border border-emerald-400 rounded-full shadow-sm pl-2 pr-1 py-0.5 overflow-hidden ring-1 ring-emerald-400">
                <input
                  ref={skillInputRef}
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  onBlur={() => {
                    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                      setSkills([...skills, skillInput.trim()]);
                    }
                    setSkillInput('');
                    setIsAddingSkill(false);
                  }}
                  placeholder="Ketik lalu Enter..."
                  className="w-32 py-1 text-sm bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                      setSkills([...skills, skillInput.trim()]);
                    }
                    setSkillInput('');
                    setIsAddingSkill(false);
                  }}
                  className="p-1 text-white bg-emerald-500 hover:bg-emerald-600 rounded-full transition-colors flex-shrink-0 ml-1"
                >
                  <Check size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddNewClick}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-dashed border-gray-300 text-gray-500 text-sm font-medium rounded-full hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Plus size={14} />
                <span>Add New</span>
              </button>
            )}
          </div>

          {/* Saran Keahlian */}
          {['JFT-Basic A2', 'JLPT N1', 'JLPT N2', 'JLPT N3', 'JLPT N4', 'JLPT N5'].filter(skill => !skills.includes(skill)).length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 mr-1">Saran:</span>
              {['JFT-Basic A2', 'JLPT N1', 'JLPT N2', 'JLPT N3', 'JLPT N4', 'JLPT N5'].filter(skill => !skills.includes(skill)).map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSkills([...skills, skill])}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  <Plus size={12} strokeWidth={2.5} />
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionPanel>
  );
}
