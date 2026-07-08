'use client';

import { useMemo, useState, useEffect, type ChangeEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Download, Pencil, X, User, FileDown, Eye } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';
import StickyHorizontalScroll from '@/components/StickyHorizontalScroll';
import { toast } from 'react-hot-toast';
import { buildFileUrl } from '@/lib/file-storage';
import ApiResume from '@/app/api/resume/api_resume';
import ApiUser from '@/app/api/user/api_user';
import { prepareUploadFile } from '@/lib/convert-to-webp';
import StudentEditModal, { type StudentEditData } from './components/StudentEditModal';
import AdminCVModal from './components/AdminCVModal';
import CVSelectModal from './components/CVSelectModal';
import CVBulkPreviewModal from './components/CVBulkPreviewModal';
import ExportExcelModal, { buildStudentSheet, safeSheetName } from './components/ExportExcelModal';
import * as XLSX from 'xlsx';
import DownloadMenuModal from './components/DownloadMenuModal';
import NafudaSelectModal from './components/NafudaSelectModal';
import NafudaPrintPreviewModal from './components/NafudaPrintPreviewModal';
import ParentDataModal from './components/ParentDataModal';
import CertificateDataModal from './components/CertificateDataModal';
import PersonalDataModal from './components/PersonalDataModal';
import FilePreviewModal from './components/FilePreviewModal';
import TablePagination from '@/components/TablePagination';
import { useTablePagination } from '@/hooks/useTablePagination';
import { isEmojiAvatar } from '@/lib/avatar';
import { getProgramTypeLabel } from '@/lib/job-categories';

interface CvPendidikan {
  nama_sekolah?: string | null;
  tingkat_pendidikan?: string | null;
  jurusan?: string | null;
  bulan_masuk?: string | null;
  tahun_masuk?: string | null;
  bulan_lulus?: string | null;
  tahun_lulus?: string | null;
}

interface CvPekerjaan {
  nama_perusahaan?: string | null;
  posisi_pekerjaan?: string | null;
  status_pekerjaan?: string | null;
  bulan_mulai?: string | null;
  tahun_mulai?: string | null;
  bulan_selesai?: string | null;
  tahun_selesai?: string | null;
}

interface CvSertifikat {
  nama_sertifikat?: string | null;
  status_kelulusan?: number | null;
  score?: string | null;
  bulan_diperoleh?: string | null;
  tahun_diperoleh?: string | null;
  sertifikat?: string | null;
  file?: File;
}

interface CvKeluarga {
  hubungan?: string | null;
  nama?: string | null;
  umur?: number | string | null;
  status_pekerjaan?: string | null;
}

interface CvData {
  foto?: string | null;
  no_peserta?: string | null;
  angkatan?: number | null;
  nik: string;
  nama_peserta: string;
  nama_panggilan?: string | null;
  nama_katakana?: string | null;
  tanggal_lahir: string;
  tgl_masuk_lpk: string;
  umur?: number | null;
  jenis_kelamin: string;
  status_pernikahan?: string | null;
  agama?: string | null;
  negara_asal?: string | null;
  alamat?: string | null;
  nomor_telepon?: string | null;
  email?: string | null;
  kode_pos?: string | null;
  akte_kelahiran?: string | null;
  hasil_mcu?: string | null;
  hasil_mcu_admin?: string | null;
  perkiraan_masuk_jepang?: string | null;
  tgl_keberangkatan?: string | null;
  tanggal_kelulusan?: string | null;
  ijazah?: string | null;
  kk?: string | null;
  ktp?: string | null;
  berkas_sertifikat?: string | null;
  tinggi_badan?: number | null;
  berat_badan?: number | null;
  mata_kiri?: number | null;
  status_mata_kiri?: string | null;
  mata_kanan?: number | null;
  status_mata_kanan?: string | null;
  merokok?: number | null;
  frequensi_merokok?: number | null;
  berkacamata?: number | null;
  butawarna?: number | null;
  golongan_darah?: string | null;
  tato?: number | null;
  riwayat_patah_tulang?: number | null;
  hobi?: string | null;
  nama_perusahaan?: string | null;
  bidang_pekerjaan?: string | null;
  program_type?: string | null;
  tingkatan_pembelajaran?: string | null;
  nama_kelas?: string | null;
  // nested arrays (struktur baru dari API)
  pendidikan: CvPendidikan[];
  pekerjaan: CvPekerjaan[];
  sertifikat: CvSertifikat[];
  keluarga: CvKeluarga[];
  cv_revision?: string;
}

type StudentRow = StudentEditData;

type DocFieldKey =
  | 'mcu_pdf'
  | 'dokumen_ktp'
  | 'dokumen_kk'
  | 'dokumen_akte'
  | 'dokumen_ijazah';

export default function ProfilSiswaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [draftStudent, setDraftStudent] = useState<StudentRow | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [cvPreviewStudent, setCvPreviewStudent] = useState<StudentRow | null>(null);
  const [filterAngkatan, setFilterAngkatan] = useState('Semua');

  useEffect(() => {
    const savedAngkatan = localStorage.getItem('profilSiswa_filterAngkatan');
    if (savedAngkatan) {
      setFilterAngkatan(savedAngkatan);
    }
  }, []);

  const handleAngkatanChange = (val: string) => {
    setFilterAngkatan(val);
    localStorage.setItem('profilSiswa_filterAngkatan', val);
  };
  const [cvSelectModalOpen, setCvSelectModalOpen] = useState(false);
  const [bulkCvStudents, setBulkCvStudents] = useState<StudentRow[]>([]);
  const [cvBulkPreviewOpen, setCvBulkPreviewOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unverifUsers, setUnverifUsers] = useState<{ name: string, user_name: string, nama_kelas: string }[]>([]);
  const [isUnverifModalOpen, setIsUnverifModalOpen] = useState(false);
  const [unverifSearchTerm, setUnverifSearchTerm] = useState('');
  const [unverifFilterKelas, setUnverifFilterKelas] = useState('Semua');
  // Download modals state
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [selectedNafudaStudents, setSelectedNafudaStudents] = useState<StudentRow[]>([]);
  const [nafudaSelectOpen, setNafudaSelectOpen] = useState(false);
  const [nafudaPreviewOpen, setNafudaPreviewOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [parentModalStudent, setParentModalStudent] = useState<StudentRow | null>(null);
  const [certificateModalStudent, setCertificateModalStudent] = useState<StudentRow | null>(null);
  const [photoModalStudent, setPhotoModalStudent] = useState<StudentRow | null>(null);
  const [personalDataModalStudent, setPersonalDataModalStudent] = useState<StudentRow | null>(null);
  const [filePreview, setFilePreview] = useState<{ title: string; filename: string; url: string } | null>(null);

  const uniqueAngkatan = useMemo(() => Array.from(new Set(students.map(s => s.angkatan).filter(Boolean))), [students]);

  const uniqueUnverifKelas = useMemo(() => {
    const kls = unverifUsers.map(u => u.nama_kelas).filter(Boolean) as string[];
    return Array.from(new Set(kls));
  }, [unverifUsers]);

  const filteredUnverifUsers = useMemo(() => {
    let result = unverifUsers;
    if (unverifFilterKelas !== 'Semua') {
      result = result.filter(u => u.nama_kelas === unverifFilterKelas);
    }
    if (unverifSearchTerm.trim()) {
      const q = unverifSearchTerm.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.user_name.toLowerCase().includes(q));
    }
    return result;
  }, [unverifUsers, unverifFilterKelas, unverifSearchTerm]);

  // Fetch CV data from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const [response, usersResponse, unverifResponse] = await Promise.all([
          ApiResume().getAllCvData(),
          ApiUser().getAllActiveUser().catch(() => null),
          ApiUser().getUnverifUser().catch(() => null)
        ]);

        if (unverifResponse?.status === 200 && Array.isArray(unverifResponse.data)) {
          setUnverifUsers(unverifResponse.data);
        }

        let userClassMap: Record<string, string> = {};
        if (usersResponse?.status === 200 && Array.isArray(usersResponse.data)) {
          usersResponse.data.forEach((u: any) => {
            if (u.user_name && u.kelas) {
              userClassMap[u.user_name] = u.kelas;
            }
          });
        }

        const reverseAgamaMap: Record<string, string> = {
          'イスラム教': 'Islam',
          'キリスト教': 'Kristen',
          'カトリック': 'Katolik',
          'ヒンドゥー教': 'Hindu',
          '仏教': 'Buddha',
          '儒教': 'Konghucu',
        };

        if (response?.status === 200 && response?.data) {
          const mappedData: StudentRow[] = response.data.map((cv: CvData, index: number) => {
            const pendidikanPertama = cv.pendidikan?.[0];
            const pekerjaanPertama = cv.pekerjaan?.[0];
            const sertifikatList = cv.sertifikat ?? [];

            return {
              id: index + 1,
              no_peserta: cv.no_peserta || 'N/A',
              nik: cv.nik || '',
              foto: cv.foto
                ? isEmojiAvatar(cv.foto as string)
                  ? (cv.foto as string)
                  : `${process.env.NEXT_PUBLIC_BASE_URL}/static/foto/${cv.foto}`
                : '👤',
              nama_lengkap: cv.nama_peserta,
              peminatan: getProgramTypeLabel(cv.program_type),
              jenis_bidang_pekerjaan: cv.bidang_pekerjaan || '-',
              nama_katakana: cv.nama_katakana || '-',
              nama_panggilan: cv.nama_panggilan || '-',
              angkatan: cv.angkatan ? `Angkatan ${cv.angkatan}` : '-',
              kewarganegaraan: cv.negara_asal || '-',
              tanggal_lahir: cv.tanggal_lahir ? new Date(cv.tanggal_lahir).toISOString().split('T')[0] : '-',
              umur: cv.umur?.toString() || '-',
              jenis_kelamin: cv.jenis_kelamin || '-',
              golongan_darah: cv.golongan_darah || '-',
              status_pernikahan: cv.status_pernikahan || '-',
              agama: reverseAgamaMap[cv.agama || ''] || cv.agama || '-',
              asal: cv.negara_asal || '-',
              alamat: cv.alamat || '-',
              kode_pos: cv.kode_pos || '-',
              telepon: cv.nomor_telepon || '-',
              email: cv.email || '-',
              tempat_belajar: userClassMap[cv.no_peserta || ''] || cv.nama_kelas || '-',
              mcu: cv.hasil_mcu_admin || '-',
              mcu_pdf: cv.hasil_mcu || '-',
              tinggi_badan: cv.tinggi_badan?.toString() || '-',
              berat_badan: cv.berat_badan?.toString() || '-',
              mata_kiri: cv.mata_kiri?.toString() || '-',
              mata_kanan: cv.mata_kanan?.toString() || '-',
              berkacamata: cv.berkacamata != null ? (cv.berkacamata === 1 ? 'Ya' : 'Tidak') : '-',
              tato: cv.tato != null ? (cv.tato === 1 ? 'Ya' : 'Tidak') : '-',
              merokok: cv.merokok != null ? (cv.merokok === 1 ? 'Ya' : 'Tidak') : '-',
              buta_warna: cv.butawarna != null ? (cv.butawarna === 1 ? 'Buta Warna Total' : cv.butawarna === 2 ? 'Buta Warna Parsial' : 'Tidak Buta Warna') : '-',
              patah_tulang: cv.riwayat_patah_tulang != null ? (cv.riwayat_patah_tulang === 1 ? 'Ya' : 'Tidak') : '-',
              hobi: cv.hobi || '-',
              asal_lpk: '-',
              nama_so: '-',
              nama_kumiai: '-',
              // Pekerjaan — ambil dari root-level nama_perusahaan di tbl_biodata
              nama_perusahaan: cv.nama_perusahaan || '-',
              jenis_pekerjaan: cv.bidang_pekerjaan || '-',
              tanggal_masuk_pelatihan: cv.tgl_masuk_lpk ? new Date(cv.tgl_masuk_lpk).toISOString().split('T')[0] : '-',
              perkiraan_masuk_jepang: (cv.perkiraan_masuk_jepang && !cv.perkiraan_masuk_jepang.startsWith('0001-01-01'))
                ? new Date(cv.perkiraan_masuk_jepang).toISOString().split('T')[0]
                : '-',
              tanggal_keberangkatan: (cv.tgl_keberangkatan && !cv.tgl_keberangkatan.startsWith('0001-01-01'))
                ? new Date(cv.tgl_keberangkatan).toISOString().split('T')[0]
                : '-',
              tanggal_kelulusan: (cv.tanggal_kelulusan && !cv.tanggal_kelulusan.startsWith('0001-01-01'))
                ? new Date(cv.tanggal_kelulusan).toISOString().split('T')[0]
                : '-',
              dokumen_jft: '-',
              dokumen_ktp: cv.ktp || '-',
              dokumen_kk: cv.kk || '-',
              dokumen_akte: cv.akte_kelahiran || '-',
              dokumen_ijazah: cv.ijazah || '-',
              // Sertifikat — kumpulkan semua nama sertifikat
              sertifikat_dimiliki: sertifikatList
                .map((s) => s.nama_sertifikat)
                .filter((n): n is string => !!n),
              nama_sekolah: pendidikanPertama?.nama_sekolah || '-',
              tingkat_pendidikan: pendidikanPertama?.tingkat_pendidikan || '-',
              jurusan: pendidikanPertama?.jurusan || '-',
              keluarga: cv.keluarga ?? [],
              pendidikan: cv.pendidikan ?? [],
              pekerjaan: cv.pekerjaan ?? [],
              sertifikat: cv.sertifikat ?? [],
              cv_revision: cv.cv_revision || '',
            };
          });
          setStudents(mappedData);
        } else {
          toast.error(response?.message || 'Gagal memuat data profil siswa');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Gagal memuat data dari server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let result = students;

    if (filterAngkatan !== 'Semua') {
      result = result.filter(s => s.angkatan === filterAngkatan);
    }

    if (q) {
      result = result.filter((student) =>
        student.nama_lengkap.toLowerCase().includes(q) || student.no_peserta.toLowerCase().includes(q),
      );
    }

    return result;
  }, [searchTerm, students, filterAngkatan]);

  const {
    paginatedItems: paginatedStudents,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
    minPageSize,
    presetPageSizes,
    isCustomPageSize,
    setCurrentPage,
    setPageSize,
    setIsCustomPageSize,
  } = useTablePagination(filteredStudents, {
    storageKey: 'profilSiswa_pageSize',
  });

  const openEditModal = (student: StudentRow) => {
    setEditingStudent(student);
    setDraftStudent({
      ...student,
      sertifikat_dimiliki: [...student.sertifikat_dimiliki],
    });
  };

  const closeEditModal = (force: boolean = false) => {
    if (isDirty && !force) {
      setShowCloseConfirm(true);
      return;
    }
    setEditingStudent(null);
    setDraftStudent(null);
    setUploadedFiles({});
    setIsDirty(false);
    setShowCloseConfirm(false);
  };

  const setDraftField = <K extends keyof StudentRow>(key: K, value: StudentRow[K]) => {
    setIsDirty(true);
    setDraftStudent((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const setDraftFields = (patch: Partial<StudentRow>) => {
    setIsDirty(true);
    setDraftStudent((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleFotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraftField('foto', String(reader.result));
    };
    reader.readAsDataURL(file);
    setUploadedFiles((prev) => ({ ...prev, foto: file }));
    setIsDirty(true);
  };

  const handleDocUpload = (key: DocFieldKey, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Jangan timpa draftField dengan file.name — server yang akan assign nama final setelah upload
    // Cukup simpan file object saja untuk dikirim ke FormData
    setUploadedFiles((prev) => ({ ...prev, [key]: file }));
    setIsDirty(true);
  };

  const handleSertifikatFileUpload = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draftStudent) return;
    const newSertifikat = [...(draftStudent.sertifikat || [])];
    newSertifikat[index] = { ...newSertifikat[index], sertifikat: file.name, file };
    setDraftStudent({ ...draftStudent, sertifikat: newSertifikat });
    setIsDirty(true);
  };

  const openMcuPreview = (student: StudentRow) => {
    if (!student.mcu_pdf || student.mcu_pdf === '-') {
      toast.error('File MCU belum diunggah');
      return;
    }
    setFilePreview({
      title: `Hasil MCU — ${student.nama_lengkap}`,
      filename: student.mcu_pdf,
      url: buildFileUrl('hasil_mcu', student.mcu_pdf),
    });
  };

  const saveEdit = async () => {
    if (!draftStudent) return;
    setIsSaving(true);

    const toNullableInt = (v: string | number | null | undefined) => {
      if (v == null) return null;
      const num = Number(v);
      return Number.isNaN(num) ? null : num;
    };
    const toNullableFloat = (v: string | number | null | undefined) => {
      if (v == null) return null;
      const f = parseFloat(String(v));
      return Number.isNaN(f) ? null : f;
    };
    const yesNoToSmallInt = (v: string | null | undefined) => {
      if (!v) return null;
      const n = String(v).toLowerCase();
      return n.includes('tidak') ? 0 : 1;
    };
    const butaWarnaToCode = (v: string | null | undefined) => {
      if (!v) return null;
      const n = String(v).toLowerCase();
      if (n.includes('total')) return 1;
      if (n.includes('parsial')) return 2;
      if (n.includes('tidak')) return 3;
      return null;
    };
    const toIsoDate = (v: string) => (v && v !== '-' ? `${v}T00:00:00Z` : '');

    // Extract angkatan number from "Angkatan X" string
    const extractAngkatanNum = (s: string) => {
      const match = s.match(/\d+/);
      return match ? Number(match[0]) : null;
    };

    // Build the payload matching CvDataRequestModel
    const payload = {
      foto: draftStudent.foto && draftStudent.foto.startsWith('data:image') ? null : (draftStudent.foto ? draftStudent.foto.replace(`${process.env.NEXT_PUBLIC_BASE_URL}/static/foto/`, '') : null),
      no_peserta: draftStudent.no_peserta,
      angkatan: extractAngkatanNum(draftStudent.angkatan),
      nik: draftStudent.nik || '',
      nama_peserta: draftStudent.nama_lengkap || '',
      nama_panggilan: draftStudent.nama_panggilan || null,
      nama_katakana: draftStudent.nama_katakana || null,
      tanggal_lahir: toIsoDate(draftStudent.tanggal_lahir),
      tgl_masuk_lpk: toIsoDate(draftStudent.tanggal_masuk_pelatihan),
      umur: toNullableInt(draftStudent.umur),
      jenis_kelamin: draftStudent.jenis_kelamin || 'L',
      status_pernikahan: draftStudent.status_pernikahan || null,
      agama: draftStudent.agama || null,
      negara_asal: draftStudent.kewarganegaraan || null,
      alamat: draftStudent.alamat || null,
      nomor_telepon: draftStudent.telepon || null,
      email: draftStudent.email || null,
      kode_pos: draftStudent.kode_pos || null,
      tinggi_badan: toNullableInt(draftStudent.tinggi_badan),
      berat_badan: toNullableInt(draftStudent.berat_badan),
      mata_kiri: toNullableFloat(draftStudent.mata_kiri),
      status_mata_kiri: 'Normal', // fallback
      mata_kanan: toNullableFloat(draftStudent.mata_kanan),
      status_mata_kanan: 'Normal', // fallback
      merokok: yesNoToSmallInt(draftStudent.merokok),
      frequensi_merokok: toNullableInt(draftStudent.frequensi_merokok) || 0,
      berkacamata: yesNoToSmallInt(draftStudent.berkacamata),
      butawarna: butaWarnaToCode(draftStudent.buta_warna),
      golongan_darah: draftStudent.golongan_darah || null,
      tato: yesNoToSmallInt(draftStudent.tato),
      riwayat_patah_tulang: yesNoToSmallInt(draftStudent.patah_tulang),
      hobi: draftStudent.hobi || null,
      nama_perusahaan: draftStudent.nama_perusahaan || null,
      bidang_pekerjaan: draftStudent.jenis_pekerjaan || null,
      hasil_mcu_admin: draftStudent.mcu || null,
      perkiraan_masuk_jepang: toIsoDate(draftStudent.perkiraan_masuk_jepang) || null,
      tgl_keberangkatan: toIsoDate(draftStudent.tanggal_keberangkatan) || null,
      tanggal_kelulusan: toIsoDate(draftStudent.tanggal_kelulusan) || null,
      tingkatan_pembelajaran: draftStudent.tingkatan_pembelajaran || null,
      pendidikan: (draftStudent.pendidikan || []).map((item) => ({
        nama_sekolah: item.nama_sekolah || null,
        tingkat_pendidikan: item.tingkat_pendidikan || null,
        jurusan: item.jurusan || null,
        bulan_masuk: item.bulan_masuk || null,
        tahun_masuk: item.tahun_masuk || null,
        bulan_lulus: item.bulan_lulus || null,
        tahun_lulus: item.tahun_lulus || null,
      })),
      pekerjaan: (draftStudent.pekerjaan || []).map((item) => ({
        nama_perusahaan: item.nama_perusahaan || null,
        posisi_pekerjaan: item.posisi_pekerjaan || null,
        status_pekerjaan: item.status_pekerjaan || null,
        bulan_mulai: item.bulan_mulai || null,
        tahun_mulai: item.tahun_mulai || null,
        bulan_selesai: item.bulan_selesai || null,
        tahun_selesai: item.tahun_selesai || null,
      })),
      sertifikat: (draftStudent.sertifikat || []).map((item) => ({
        nama_sertifikat: item.nama_sertifikat || null,
        status_kelulusan: item.status_kelulusan != null ? item.status_kelulusan : 1,
        score: item.score || null,
        bulan_diperoleh: item.bulan_diperoleh || null,
        tahun_diperoleh: item.tahun_diperoleh || null,
        sertifikat: item.sertifikat || null,
      })),
      keluarga: (draftStudent.keluarga || []).map((item) => ({
        hubungan: item.hubungan || null,
        nama: item.nama || null,
        umur: item.umur ? Number(item.umur) : null,
        status_pekerjaan: item.status_pekerjaan || null,
      })),
      // Preserve existing doc filenames from DB (server hanya timpa jika ada file baru yang diupload)
      ktp: draftStudent.dokumen_ktp && draftStudent.dokumen_ktp !== '-' ? draftStudent.dokumen_ktp : null,
      kk: draftStudent.dokumen_kk && draftStudent.dokumen_kk !== '-' ? draftStudent.dokumen_kk : null,
      akte_kelahiran: draftStudent.dokumen_akte && draftStudent.dokumen_akte !== '-' ? draftStudent.dokumen_akte : null,
      ijazah: draftStudent.dokumen_ijazah && draftStudent.dokumen_ijazah !== '-' ? draftStudent.dokumen_ijazah : null,
      hasil_mcu: draftStudent.mcu_pdf && draftStudent.mcu_pdf !== '-' ? draftStudent.mcu_pdf : null,
      expected_cv_revision: draftStudent.cv_revision || null,
    };

    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));

      // Append files if they were uploaded (gambar dikonversi ke WebP di browser)
      if (uploadedFiles.foto) {
        formData.append('foto_file', await prepareUploadFile(uploadedFiles.foto));
      } else if (draftStudent.foto && draftStudent.foto.startsWith('data:image')) {
        const res = await fetch(draftStudent.foto);
        const blob = await res.blob();
        const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
        formData.append('foto_file', await prepareUploadFile(file));
      }
      if (uploadedFiles.dokumen_ktp) {
        formData.append('ktp_file', await prepareUploadFile(uploadedFiles.dokumen_ktp));
      }
      if (uploadedFiles.dokumen_kk) {
        formData.append('kk_file', await prepareUploadFile(uploadedFiles.dokumen_kk));
      }
      if (uploadedFiles.dokumen_akte) {
        formData.append('akte_kelahiran_file', await prepareUploadFile(uploadedFiles.dokumen_akte));
      }
      if (uploadedFiles.dokumen_ijazah) {
        formData.append('ijazah_terakhir_file', await prepareUploadFile(uploadedFiles.dokumen_ijazah));
      }
      if (uploadedFiles.mcu_pdf) {
        formData.append('hasil_mcu_file', await prepareUploadFile(uploadedFiles.mcu_pdf));
      }
      // Append per-sertifikat files (indexed)
      for (const [idx, item] of (draftStudent.sertifikat || []).entries()) {
        if (item.file) {
          formData.append(`sertifikat_file_${idx}`, await prepareUploadFile(item.file));
        }
      }

      const response = await ApiResume().postEditCvData(formData);

      if (response?.status === 409 && response?.conflict) {
        toast.error(response?.message || 'Profil sudah diubah admin lain. Memuat ulang...');
        const refreshed = await ApiResume().getAllCvData();
        if (refreshed?.status === 200 && Array.isArray(refreshed.data)) {
          const cv = refreshed.data.find((item: { no_peserta?: string }) => item.no_peserta === draftStudent.no_peserta);
          if (cv) {
            const reverseAgamaMap: Record<string, string> = {
              'イスラム教': 'Islam',
              'キリスト教': 'Kristen',
              'カトリック': 'Katolik',
              'ヒンドゥー教': 'Hindu',
              '仏教': 'Buddha',
              '儒教': 'Konghucu',
            };
            setDraftStudent({
              ...draftStudent,
              cv_revision: cv.cv_revision || '',
              nama_lengkap: cv.nama_peserta || draftStudent.nama_lengkap,
            });
          }
        }
        return;
      }

      if (response?.status === 200) {
        toast.success('Profil siswa berhasil diperbarui');

        setStudents((prev) =>
          prev.map((s) =>
            s.no_peserta === draftStudent.no_peserta ? { ...draftStudent } : s
          )
        );
        setIsDirty(false);
        closeEditModal(true);
      } else {
        toast.error(response?.message || 'Gagal menyimpan perubahan');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportExcelClick = () => {
    setExcelModalOpen(true);
  };

  const handleCvExport = (selected: StudentRow[]) => {
    if (selected.length === 0) return;
    setCvSelectModalOpen(false);
    if (selected.length === 1) {
      setCvPreviewStudent(selected[0]);
      return;
    }
    setBulkCvStudents(selected);
    setCvBulkPreviewOpen(true);
  };

  const handleExportIndividual = (student: StudentRow) => {
    try {
      const wb = XLSX.utils.book_new();
      const sheetName = safeSheetName(`${student.no_peserta}`);
      const ws = buildStudentSheet(student);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `Siswa_${student.no_peserta}_${student.nama_lengkap.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error('Excel export error:', err);
      toast.error('Terjadi kesalahan saat mengekspor file Excel.');
    }
  };

  const handlePrintUnverifPdf = async () => {
    const [{ jsPDF }, html2canvas] = await Promise.all([
      import('jspdf'),
      import('html2canvas').then(m => m.default),
    ]);
    const rows = filteredUnverifUsers;
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const fileName = `Daftar_User_Belum_Submit_CV${unverifFilterKelas !== 'Semua' ? `_${unverifFilterKelas}` : ''}_${now.toISOString().slice(0, 10)}.pdf`;

    // Build an off-screen HTML table that renders Japanese characters correctly
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;background:#fff;padding:32px;font-family:"Noto Sans JP",sans-serif;';
    container.innerHTML = `
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet">
      <h2 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 4px">Daftar User Belum Submit CV</h2>
      <p style="font-size:11px;color:#6b7280;margin:0 0 12px">Sistem Informasi Hana</p>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:11px;color:#374151">
        <span>Total: <strong>${rows.length} user</strong>${unverifFilterKelas !== 'Semua' ? ` &nbsp;|&nbsp; Kelas: <strong>${unverifFilterKelas}</strong>` : ''}</span>
        <span>Dicetak: ${dateStr}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;border:1px solid #d1d5db">
        <thead>
          <tr style="background:#f3f4f6;color:#111827">
            <th style="padding:8px 10px;text-align:left;width:36px;border:1px solid #d1d5db;font-weight:600">No</th>
            <th style="padding:8px 10px;text-align:left;width:110px;border:1px solid #d1d5db;font-weight:600">No. Peserta</th>
            <th style="padding:8px 10px;text-align:left;border:1px solid #d1d5db;font-weight:600">Nama</th>
            <th style="padding:8px 10px;text-align:left;width:160px;border:1px solid #d1d5db;font-weight:600">Kelas</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length > 0 ? rows.map((u, i) => `
            <tr>
              <td style="padding:7px 10px;border:1px solid #d1d5db;color:#374151">${i + 1}</td>
              <td style="padding:7px 10px;border:1px solid #d1d5db;color:#374151">${u.user_name}</td>
              <td style="padding:7px 10px;border:1px solid #d1d5db;color:#374151">${u.name}</td>
              <td style="padding:7px 10px;border:1px solid #d1d5db;color:#374151">${u.nama_kelas || '-'}</td>
            </tr>
          `).join('') : `<tr><td colspan="4" style="padding:20px;text-align:center;color:#9ca3af;border:1px solid #d1d5db">Tidak ada data.</td></tr>`}
        </tbody>
      </table>
    `;
    document.body.appendChild(container);

    // Wait for fonts to load
    await document.fonts.ready;

    const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 10;
    const imgW = pageW - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;

    let yPos = margin;
    let remainH = imgH;
    let srcY = 0;
    const pageImgH = pageH - margin * 2;

    while (remainH > 0) {
      const sliceH = Math.min(remainH, pageImgH);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = (sliceH / imgW) * canvas.width;
      const ctx = sliceCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, srcY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
      doc.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, yPos, imgW, sliceH);
      srcY += sliceCanvas.height;
      remainH -= sliceH;
      if (remainH > 0) { doc.addPage(); yPos = margin; }
    }

    doc.save(fileName);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 p-4 md:p-8 relative">
      {isLoading && <LoadingOverlay text="MEMUAT DATA..." fixed={true} />}
      {/* Header Area */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin-dashboard/dashboard"
            className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-normal text-gray-900 tracking-wide mb-1">Profil Siswa <span className="text-lg text-gray-400 font-sans ml-2 tracking-normal font-normal">(実習生プロフィール)</span></h1>
            <p className="text-xs font-medium text-gray-500 tracking-widest uppercase">Kelola dan pantau data diri seluruh peserta magang.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-800 transition-colors" size={18} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Cari nama atau no. peserta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-emerald-800 w-full md:w-64 transition-colors"
            />
          </div>
          <select
            value={filterAngkatan}
            onChange={(e) => handleAngkatanChange(e.target.value)}
            className="px-4 py-2.5 bg-transparent border border-gray-300 text-xs tracking-widest uppercase text-gray-600 focus:outline-none focus:border-emerald-800 transition-colors"
          >
            <option value="Semua">Semua Angkatan</option>
            {uniqueAngkatan.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <button
            onClick={() => setIsUnverifModalOpen(true)}
            className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-xs tracking-widest uppercase text-gray-700 hover:bg-gray-50 hover:text-emerald-600 focus:outline-none focus:border-emerald-800 transition-colors duration-300"
            title="User Belum Submit CV"
          >
            <User size={18} strokeWidth={1.5} />
            {unverifUsers.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-white shadow-sm flex items-center justify-center">
                {unverifUsers.length > 99 ? '99+' : unverifUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setDownloadMenuOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-xs tracking-widest uppercase text-gray-700 hover:bg-gray-50 hover:text-emerald-600 focus:outline-none focus:border-emerald-800 transition-colors duration-300"
            title="Opsi Unduh"
          >
            <Download size={18} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Table Container */}
      <div className="bg-white border border-gray-300 relative z-10 shadow-sm">
        <StickyHorizontalScroll>
          <table className="admin-data-table w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-0 z-20 min-w-[60px]">NO</th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-[60px] z-20 min-w-[130px]">実習生番号<br /><span className="text-[10px] text-gray-500 normal-case">No. Peserta</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-[190px] z-20 min-w-[80px]">写真<br /><span className="text-[10px] text-gray-500 normal-case">Foto</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-[270px] z-20 min-w-[200px] admin-sticky-split-right">実習生本名<br /><span className="text-[10px] text-gray-500 normal-case">Nama Peserta Magang</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50 min-w-[140px]">分野<br /><span className="text-[10px] text-gray-500 normal-case">Peminatan</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50 min-w-[220px]">職種<br /><span className="text-[10px] text-gray-500 normal-case">Jenis Bidang Pekerjaan</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">カタカナ<br /><span className="text-[10px] text-gray-500 normal-case">Katakana</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">親のデータ<br /><span className="text-[10px] text-gray-500 normal-case">Data Orang Tua</span></th>
                {/* CV Extra Fields */}
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">呼称<br /><span className="text-[10px] text-gray-500 normal-case">Nama Panggilan</span></th>

                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">何期生<br /><span className="text-[10px] text-gray-500 normal-case">Angkatan</span></th>

                {/* CV Extra Fields */}
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">国籍<br /><span className="text-[10px] text-gray-500 normal-case">Kewarganegaraan</span></th>

                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">生年月日<br /><span className="text-[10px] text-gray-500 normal-case">Tgl Lahir</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">年齢<br /><span className="text-[10px] text-gray-500 normal-case">Usia</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">性別<br /><span className="text-[10px] text-gray-500 normal-case">Jenis Kelamin</span></th>

                {/* CV Extra Fields */}
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">血液型<br /><span className="text-[10px] text-gray-500 normal-case">Gol. Darah</span></th>

                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">婚姻<br /><span className="text-[10px] text-gray-500 normal-case">Status Pernikahan</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">宗教<br /><span className="text-[10px] text-gray-500 normal-case">Agama</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">出生地<br /><span className="text-[10px] text-gray-500 normal-case">Asal (Tempat Lahir)</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">住所<br /><span className="text-[10px] text-gray-500 normal-case">Alamat</span></th>

                {/* CV Extra Fields */}
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">郵便番号<br /><span className="text-[10px] text-gray-500 normal-case">Kode Pos</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">電話番号<br /><span className="text-[10px] text-gray-500 normal-case">No. Telepon</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">メール<br /><span className="text-[10px] text-gray-500 normal-case">Email</span></th>

                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">健康診断<br /><span className="text-[10px] text-gray-500 normal-case">File MCU (PDF)</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">Admin MCU<br /><span className="text-[10px] text-gray-500 normal-case">Hasil Medical Checkup</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">体重<br /><span className="text-[10px] text-gray-500 normal-case">Berat Badan</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">身長<br /><span className="text-[10px] text-gray-500 normal-case">Tinggi Badan</span></th>

                {/* CV Extra Fields - Medical */}
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">視力<br /><span className="text-[10px] text-gray-500 normal-case">Mata (Kiri/Kanan)</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">眼鏡<br /><span className="text-[10px] text-gray-500 normal-case">Kacamata</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">刺青<br /><span className="text-[10px] text-gray-500 normal-case">Tato</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">喫煙<br /><span className="text-[10px] text-gray-500 normal-case">Merokok</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">色盲<br /><span className="text-[10px] text-gray-500 normal-case">Buta Warna</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">骨折歴<br /><span className="text-[10px] text-gray-500 normal-case">Patah Tulang</span></th>

                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">趣味<br /><span className="text-[10px] text-gray-500 normal-case">Hobi</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">学習レベル<br /><span className="text-[10px] text-gray-500 normal-case">Tingkatan Pembelajaran</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">元LPK名<br /><span className="text-[10px] text-gray-500 normal-case">Asal LPK</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">送り出し機関名<br /><span className="text-[10px] text-gray-500 normal-case">Nama SO</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">組合名<br /><span className="text-[10px] text-gray-500 normal-case">Nama Kumiai</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">企業名<br /><span className="text-[10px] text-gray-500 normal-case">Nama Perusahaan</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">職種・作業<br /><span className="text-[10px] text-gray-500 normal-case">Jenis Pekerjaan</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">保有資格<br /><span className="text-[10px] text-gray-500 normal-case">Sertifikat Dimiliki</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">入学日<br /><span className="text-[10px] text-gray-500 normal-case">Tanggal Masuk Pelatihan</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">卒業日<br /><span className="text-[10px] text-gray-500 normal-case">Tanggal Kelulusan</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">入国予定日<br /><span className="text-[10px] text-gray-500 normal-case">Perkiraan Masuk (Jepang)</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">出国日<br /><span className="text-[10px] text-gray-500 normal-case">Tanggal Keberangkatan</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50">個人データファイル<br /><span className="text-[10px] text-gray-500 normal-case">File Data Diri</span></th>
                <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 sticky right-0 bg-gray-100 admin-sticky-split-left text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student, index) => (
                <tr key={student.id} className="bg-white hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-4 font-medium text-gray-900 border-r bg-white group-hover:bg-slate-50 sticky left-0 z-10 transition-colors">{rangeStart + index}</td>
                  <td className="px-4 py-4 font-semibold text-emerald-600 border-r bg-white group-hover:bg-slate-50 sticky left-[60px] z-10 transition-colors">{student.no_peserta}</td>
                  <td className="px-4 py-4 border-r bg-white group-hover:bg-slate-50 sticky left-[190px] z-10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200 shadow-sm flex items-center justify-center group/foto">
                      {student.foto ? (
                        isEmojiAvatar(student.foto) ? (
                          <button
                            type="button"
                            onClick={() => setPhotoModalStudent(student)}
                            className="w-full h-full flex items-center justify-center text-2xl hover:bg-gray-50 transition-colors"
                            title="Lihat Avatar"
                          >
                            {student.foto}
                          </button>
                        ) : (
                        <>
                          <img
                            src={student.foto}
                            alt="Foto"
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
                          <button
                            type="button"
                            onClick={() => setPhotoModalStudent(student)}
                            className="absolute inset-0 bg-black/60 hidden group-hover/foto:flex items-center justify-center transition-colors focus:outline-none"
                            title="Lihat Foto"
                          >
                            <span className="text-[9px] font-bold text-white tracking-widest uppercase">View</span>
                          </button>
                        </>
                        )
                      ) : (
                        <span className="text-xl">👤</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-800 border-r bg-white group-hover:bg-slate-50 sticky left-[270px] z-10 admin-sticky-split-right transition-colors">{student.nama_lengkap}</td>
                  <td className="px-4 py-4 text-gray-700 bg-emerald-50/30 whitespace-normal max-w-[160px]">{student.peminatan || '-'}</td>
                  <td className="px-4 py-4 text-gray-700 bg-emerald-50/30 whitespace-normal max-w-[240px]">{student.jenis_bidang_pekerjaan || '-'}</td>
                  <td className="px-4 py-4 text-gray-600">{student.nama_katakana}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">
                    <button
                      onClick={() => setParentModalStudent(student)}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors border border-emerald-200 rounded-sm"
                    >
                      Lihat Data
                    </button>
                  </td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.nama_panggilan}</td>
                  <td className="px-4 py-4 text-gray-600">
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">{student.angkatan}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.kewarganegaraan}</td>
                  <td className="px-4 py-4 text-gray-600">{student.tanggal_lahir}</td>
                  <td className="px-4 py-4 text-gray-600">{student.umur} thn</td>
                  <td className="px-4 py-4 text-gray-600">
                    {student.jenis_kelamin === 'L' ? 'Laki-laki (男)' : student.jenis_kelamin === 'P' ? 'Perempuan (女)' : student.jenis_kelamin}
                  </td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50 font-semibold">{student.golongan_darah}</td>
                  <td className="px-4 py-4 text-gray-600">{student.status_pernikahan}</td>
                  <td className="px-4 py-4 text-gray-600">{student.agama}</td>
                  <td className="px-4 py-4 text-gray-600">{student.asal}</td>
                  <td className="px-4 py-4 text-gray-600 max-w-[200px] truncate" title={student.alamat}>{student.alamat}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.kode_pos}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.telepon}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.email}</td>
                  <td className="px-4 py-4 text-gray-600">
                    {!student.mcu_pdf || student.mcu_pdf === '-' ? (
                      <span className="text-[11px] font-medium text-red-500 italic bg-red-50 px-2 py-1 rounded-sm border border-red-100">
                        Admin Perlu Upload Hasil MCU
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openMcuPreview(student)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      >
                        <Eye size={12} />
                        {student.mcu_pdf}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">
                    {student.mcu}
                  </td>
                  <td className="px-4 py-4 text-gray-600">{student.berat_badan} kg</td>
                  <td className="px-4 py-4 text-gray-600">{student.tinggi_badan} cm</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.mata_kiri} / {student.mata_kanan}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.berkacamata}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.tato}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.merokok}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.buta_warna}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">{student.patah_tulang}</td>
                  <td className="px-4 py-4 text-gray-600">{student.hobi}</td>
                  <td className="px-4 py-4 text-gray-600">{student.tingkatan_pembelajaran}</td>
                  <td className="px-4 py-4 text-gray-600">{student.asal_lpk}</td>
                  <td className="px-4 py-4 text-gray-600">{student.nama_so}</td>
                  <td className="px-4 py-4 text-gray-600">{student.nama_kumiai}</td>
                  <td className="px-4 py-4 font-medium text-gray-800">{student.nama_perusahaan}</td>
                  <td className="px-4 py-4 text-gray-600">{student.jenis_pekerjaan}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">
                    <button
                      onClick={() => setCertificateModalStudent(student)}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors border border-emerald-200 rounded-sm"
                    >
                      Lihat Sertifikat
                    </button>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{student.tanggal_masuk_pelatihan}</td>
                  <td className="px-4 py-4 text-gray-600">{student.tanggal_kelulusan}</td>
                  <td className="px-4 py-4 text-gray-600">{student.perkiraan_masuk_jepang}</td>
                  <td className="px-4 py-4 text-gray-600">{student.tanggal_keberangkatan}</td>
                  <td className="px-4 py-4 text-gray-600 bg-slate-50">
                    <button
                      onClick={() => setPersonalDataModalStudent(student)}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors border border-emerald-200 rounded-sm"
                    >
                      Lihat Data Diri
                    </button>
                  </td>
                  <td className="px-4 py-4 sticky right-0 bg-white admin-sticky-split-left group-hover:bg-slate-50 transition-colors">
                    <button
                      onClick={() => openEditModal(student)}
                      className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 rounded-lg transition-colors border border-emerald-100"
                      title="Edit Data"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </StickyHorizontalScroll>
        {filteredStudents.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            pageSize={pageSize}
            minPageSize={minPageSize}
            presetPageSizes={presetPageSizes}
            isCustomPageSize={isCustomPageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onCustomModeChange={setIsCustomPageSize}
          />
        )}
      </div >

      {/* CSS for custom scrollbar to make it look premium */}
      < style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />

      < StudentEditModal
        draftStudent={draftStudent}
        onClose={() => closeEditModal()}
        onSave={saveEdit}
        onFieldChange={setDraftField}
        onFieldsChange={setDraftFields}
        onFotoUpload={handleFotoUpload}
        onDocUpload={handleDocUpload}
        onSertifikatFileUpload={handleSertifikatFileUpload}
        isSaving={isSaving}
      />

      {showCloseConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/45 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowCloseConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white shadow-2xl p-6 border-t-4 border-red-500 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Perubahan Belum Disimpan</h3>
            <p className="text-sm text-gray-600 mb-6">Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar dari form ini? Perubahan Anda akan hilang.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCloseConfirm(false)} className="px-4 py-2 text-xs font-semibold tracking-wider text-gray-600 uppercase border border-gray-300 hover:bg-gray-100 transition-colors">
                Batal Keluar
              </button>
              <button onClick={() => closeEditModal(true)} className="px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase bg-red-600 hover:bg-red-700 transition-colors">
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminCVModal
        student={cvPreviewStudent}
        onClose={() => setCvPreviewStudent(null)}
      />

      {
        excelModalOpen && (
          <ExportExcelModal
            rows={filteredStudents}
            onClose={() => setExcelModalOpen(false)}
          />
        )
      }

      {cvSelectModalOpen && (
        <CVSelectModal
          students={filteredStudents}
          onClose={() => setCvSelectModalOpen(false)}
          onExport={handleCvExport}
        />
      )}

      {cvBulkPreviewOpen && bulkCvStudents.length > 0 && (
        <CVBulkPreviewModal
          students={bulkCvStudents}
          onClose={() => {
            setCvBulkPreviewOpen(false);
            setBulkCvStudents([]);
          }}
        />
      )}

      {downloadMenuOpen && (
        <DownloadMenuModal
          onClose={() => setDownloadMenuOpen(false)}
          onSelectCV={() => setCvSelectModalOpen(true)}
          onSelectNafuda={() => setNafudaSelectOpen(true)}
          onSelectExcel={handleExportExcelClick}
        />
      )}

      {nafudaSelectOpen && (
        <NafudaSelectModal
          students={filteredStudents}
          onClose={() => setNafudaSelectOpen(false)}
          onPrint={(selected) => {
            setSelectedNafudaStudents(selected);
            setNafudaSelectOpen(false);
            setNafudaPreviewOpen(true);
          }}
        />
      )}

      {nafudaPreviewOpen && (
        <NafudaPrintPreviewModal
          students={selectedNafudaStudents}
          onClose={() => setNafudaPreviewOpen(false)}
        />
      )}

      {parentModalStudent && (
        <ParentDataModal
          studentName={parentModalStudent.nama_lengkap}
          keluarga={parentModalStudent.keluarga}
          onClose={() => setParentModalStudent(null)}
        />
      )}

      {certificateModalStudent && (
        <CertificateDataModal
          studentName={certificateModalStudent.nama_lengkap}
          sertifikat={certificateModalStudent.sertifikat || []}
          onClose={() => setCertificateModalStudent(null)}
        />
      )}

      {personalDataModalStudent && (
        <PersonalDataModal
          studentName={personalDataModalStudent.nama_lengkap}
          dokumen_ktp={personalDataModalStudent.dokumen_ktp}
          dokumen_kk={personalDataModalStudent.dokumen_kk}
          dokumen_akte={personalDataModalStudent.dokumen_akte}
          dokumen_ijazah={personalDataModalStudent.dokumen_ijazah}
          onClose={() => setPersonalDataModalStudent(null)}
        />
      )}

      {filePreview && (
        <FilePreviewModal
          title={filePreview.title}
          filename={filePreview.filename}
          url={filePreview.url}
          onClose={() => setFilePreview(null)}
        />
      )}

      {/* Photo Preview Modal */}
      {photoModalStudent && photoModalStudent.foto && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setPhotoModalStudent(null)} />
          <div className="relative z-10 max-w-sm w-full bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-serif text-gray-800 text-lg">Foto Profil</h3>
              <button onClick={() => setPhotoModalStudent(null)} className="p-1 text-gray-500 hover:text-gray-800 transition-colors rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center bg-gray-100/50">
              <div className="w-48 h-64 border border-gray-200 bg-white overflow-hidden flex items-center justify-center shadow-sm">
                {isEmojiAvatar(photoModalStudent.foto) ? (
                  <span className="text-8xl">{photoModalStudent.foto}</span>
                ) : (
                  <img src={photoModalStudent.foto} alt="Foto" className="w-full h-full object-cover" />
                )}
              </div>
              <p className="mt-4 font-medium text-gray-900">{photoModalStudent.nama_lengkap}</p>
              <p className="text-xs text-gray-500">{photoModalStudent.no_peserta}</p>
            </div>
            {!isEmojiAvatar(photoModalStudent.foto) && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(photoModalStudent.foto);
                    const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = `FOTO_${photoModalStudent.no_peserta}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                  } catch (err) {
                    console.error('Error downloading image:', err);
                    window.open(photoModalStudent.foto, '_blank');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white text-xs tracking-widest uppercase font-medium rounded hover:bg-emerald-800 transition-colors shadow-sm"
              >
                <Download size={14} /> Download Foto
              </button>
            </div>
            )}
          </div>
        </div>
      )}
      {isUnverifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-serif text-gray-900 tracking-wide">
                    User Belum Submit CV
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                    Daftar user yang belum melengkapi biodata diri
                  </p>
                </div>
                <button
                  onClick={() => setIsUnverifModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Cari nama atau no. peserta..."
                    value={unverifSearchTerm}
                    onChange={(e) => setUnverifSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 h-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="relative">
                  <select
                    value={unverifFilterKelas}
                    onChange={(e) => setUnverifFilterKelas(e.target.value)}
                    className="appearance-none pl-4 pr-10 h-10 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer min-w-[140px]"
                  >
                    <option value="Semua">Semua Kelas</option>
                    {uniqueUnverifKelas.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={handlePrintUnverifPdf}
                  disabled={filteredUnverifUsers.length === 0}
                  className="flex items-center justify-center w-10 h-10 shrink-0 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  title="Download PDF"
                >
                  <FileDown size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-auto flex-1 custom-scrollbar bg-slate-50/80">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-600 w-16">No</th>
                      <th className="px-6 py-4 font-semibold text-gray-600">No. Peserta</th>
                      <th className="px-6 py-4 font-semibold text-gray-600">Nama</th>
                      <th className="px-6 py-4 font-semibold text-gray-600">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUnverifUsers.length > 0 ? (
                      filteredUnverifUsers.map((u, i) => (
                        <tr key={i} className="bg-white hover:bg-emerald-50/30 transition-colors group">
                          <td className="px-6 py-4 font-medium text-gray-500 group-hover:text-gray-900 transition-colors">{i + 1}</td>
                          <td className="px-6 py-4 text-emerald-600 font-semibold">{u.user_name}</td>
                          <td className="px-6 py-4 text-gray-800 font-medium">{u.name}</td>
                          <td className="px-6 py-4">
                            {u.nama_kelas ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {u.nama_kelas}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200 italic">
                                Belum Ada Kelas
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            {unverifUsers.length > 0 ? (
                              <>
                                <Search className="w-10 h-10 text-gray-300 mb-3" />
                                <h4 className="text-gray-900 font-medium text-base mb-1">Tidak Ditemukan</h4>
                                <p className="text-gray-500 text-sm">Tidak ada user yang cocok dengan pencarian Anda.</p>
                              </>
                            ) : (
                              <>
                                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3 border border-green-100">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <h4 className="text-gray-900 font-medium text-base mb-1">Semua Selesai!</h4>
                                <p className="text-gray-500 text-sm">Semua user telah mensubmit data CV mereka.</p>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
              <p className="text-xs text-gray-400">
                Menampilkan <span className="font-semibold text-gray-600">{filteredUnverifUsers.length}</span> dari <span className="font-semibold text-gray-600">{unverifUsers.length}</span> user
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsUnverifModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main >
  );
}
