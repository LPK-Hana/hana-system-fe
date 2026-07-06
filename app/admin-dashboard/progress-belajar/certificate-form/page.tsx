'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  Search,
  Printer,
  CheckSquare,
  Square,
  User,
  ChevronDown,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  CalendarDays,
} from 'lucide-react';
import { ProgressRow } from '../data';
import ApiNilaiPembelajaran from '@/app/api/nilai_pembelajaran/api_nilai_pembelajaran';
import LoadingOverlay from '@/components/LoadingOverlay';

/* ─────────────────────────────────────────────────────────────────
   Helper: format tanggal ke "DD Bulan YYYY" (bahasa Indonesia)
───────────────────────────────────────────────────────────────── */
const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatDateID(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function todayInputValue(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/* ─────────────────────────────────────────────────────────────────
   Certificate Preview Modal — Custom HTML Template
───────────────────────────────────────────────────────────────── */
interface CertModalProps {
  rows: ProgressRow[];
  startIndex: number;
  onClose: () => void;
}

function CertificateModal({ rows, startIndex, onClose }: CertModalProps) {
  const [current, setCurrent] = useState(startIndex);
  const [scale, setScale] = useState(0.6);
  const [printDate, setPrintDate] = useState(todayInputValue);
  const [globalLevel, setGlobalLevel] = useState('Auto');
  const [customLevels, setCustomLevels] = useState<Record<number, string>>({});
  const [applyToAll, setApplyToAll] = useState(false);
  const row = rows[current];

  const handlePrint = () => window.print();
  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(rows.length - 1, c + 1));

  // Determine what the dropdown should show
  const currentSelectValue = customLevels[row.id] !== undefined ? customLevels[row.id] : globalLevel;
  // Compute actual level for certificate display
  const level = currentSelectValue !== 'Auto' ? currentSelectValue : (row.ujian_n4 === 'Lulus' ? 'N4' : 'N5');

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (applyToAll) {
      setGlobalLevel(val);
      setCustomLevels({});
    } else {
      setCustomLevels(prev => ({ ...prev, [row.id]: val }));
    }
  };

  const handleToggleApplyToAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setApplyToAll(checked);
    if (checked) {
      setGlobalLevel(currentSelectValue);
      setCustomLevels({});
    }
  };

  // Format tanggal untuk sertifikat
  const tanggalSertifikat = `Bandung, ${formatDateID(printDate)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative flex flex-col bg-white shadow-2xl overflow-hidden print:w-auto print:h-auto print:shadow-none print:bg-transparent"
        style={{ width: '98vw', maxWidth: 1400, height: '94vh' }}
      >
        {/* ── Header bar (Sembunyi saat print) ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white shrink-0 flex-wrap gap-4 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <Award size={20} className="text-amber-600 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0 flex items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800 truncate">{row.nama_lengkap}</p>
                <p className="text-xs text-gray-500">{row.no_peserta} &bull; Kelas {row.kelas}</p>
              </div>

              {/* Individual / Global Override */}
              <div className="pl-3 border-l border-gray-200 flex items-center gap-3">
                <select
                  value={currentSelectValue}
                  onChange={handleLevelChange}
                  className="text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                  title="Pilih level sertifikat"
                >
                  <option value="Auto">Auto (Sesuai Lulus)</option>
                  <option value="N5">Level N5</option>
                  <option value="N4">Level N4</option>
                  <option value="N3">Level N3</option>
                  <option value="N2">Level N2</option>
                  <option value="N1">Level N1</option>
                </select>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 px-2 py-1 rounded border border-gray-200">
                  <input
                    type="checkbox"
                    checked={applyToAll}
                    onChange={handleToggleApplyToAll}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  Set All
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 flex-wrap">

            {/* Date Picker */}
            <div className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-amber-600" strokeWidth={1.5} />
              <label className="text-xs text-gray-500 font-medium whitespace-nowrap hidden sm:inline">Tanggal Cetak:</label>
              <input
                type="date"
                value={printDate}
                onChange={(e) => setPrintDate(e.target.value)}
                className="text-xs text-gray-900 font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 transition-colors bg-white cursor-pointer"
              />
            </div>

            <div className="w-px h-6 bg-gray-300 hidden md:block"></div>

            {/* Navigation */}
            {rows.length > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={prev} disabled={current === 0} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs font-medium text-gray-600 min-w-[48px] text-center">{current + 1} / {rows.length}</span>
                <button onClick={next} disabled={current === rows.length - 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>

            {/* Zoom */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1 border border-gray-200">
              <button onClick={() => setScale((s) => Math.max(0.25, +(s - 0.05).toFixed(2)))} className="p-1 rounded bg-white hover:bg-gray-50 shadow-sm transition-colors text-gray-600" title="Zoom out">
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-medium text-gray-600 min-w-[44px] text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale((s) => Math.min(1.5, +(s + 0.05).toFixed(2)))} className="p-1 rounded bg-white hover:bg-gray-50 shadow-sm transition-colors text-gray-600" title="Zoom in">
                <ZoomIn size={14} />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors"
            >
              <Printer size={14} strokeWidth={1.5} />
              Print
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-red-100 hover:text-red-600 text-gray-500 transition-colors ml-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Preview Area ── */}
        <div className="flex-1 overflow-auto bg-gray-300 flex items-start justify-center p-6 print:bg-white print:p-0 print:overflow-visible">
          {/* Wrapper A4 */}
          <div
            className="certificate-modal-a4 relative bg-white shadow-2xl"
            style={{
              width: '794px',
              height: '1123px',
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              backgroundImage: "url('/certificate-bg.png')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              fontFamily: "'Montserrat', 'Inter', 'Segoe UI', 'Hiragino Sans', 'Meiryo', 'Noto Sans JP', sans-serif",
              color: '#27374D',
              flexShrink: 0,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {/* 1. Header LPK */}
            <div className="absolute w-full text-center flex justify-center" style={{ top: '200px', fontSize: '18px', fontWeight: '700', letterSpacing: '1px' }}>
              LPK GADA WIRYA KARSA
            </div>

            {/* 2. Judul CERTIFICATE */}
            <div className="absolute w-full text-center flex justify-center items-center gap-4" style={{ top: '250px', fontSize: '50px', fontWeight: '700', letterSpacing: '3px' }}>
              <span></span> CERTIFICATE <span></span>
            </div>

            {/* 3. Sub-judul Jepang */}
            <div className="absolute w-full text-center flex justify-center" style={{ top: '310px', fontSize: '32px', fontWeight: 'bold', letterSpacing: '6px' }}>
              卒業証明書
            </div>

            {/* 4. Diberikan kepada */}
            <div className="absolute w-full text-center flex justify-center" style={{ top: '350px', fontSize: '40px' }}>
              Diberikan kepada :
            </div>

            {/* 5. Nama Peserta */}
            <div className="absolute w-full text-center flex justify-center" style={{ top: '445px', fontSize: '38px', fontWeight: 'bold' }}>
              {row.nama_lengkap}
            </div>

            {/* 6. Teks Keterangan Pengantar */}
            <div className="absolute w-full text-center flex justify-center" style={{ top: '500px', fontSize: '17px' }}>
              Telah melaksanakan pendidikan bahasa dan Kebudayaan Jepang Level :
            </div>

            {/* 7. Label Level (Dalam Medali) */}
            <div className="absolute w-full text-center flex justify-center items-center" style={{ top: '555px', fontSize: '42px', fontWeight: 'bold', color: 'white' }}>
              {level}
            </div>

            {/* 8. Paragraf Bahasa Indonesia */}
            <div className="absolute w-full flex justify-center" style={{ top: '690px' }}>
              <p className="text-center font-semibold" style={{ width: '600px', fontSize: '15px', lineHeight: '1.6' }}>
                di LPK Gada Wirya Karsa. Dengan ini dinyatakan telah menyelesaikan pendidikan dengan baik dan menunjukkan sikap profesional serta kemampuan kerja yang baik.
              </p>
            </div>

            {/* 9. Paragraf Bahasa Jepang */}
            <div className="absolute w-full flex justify-center" style={{ top: '750px' }}>
              <p className="text-center font-bold" style={{ width: '650px', fontSize: '17px', lineHeight: '1.5' }}>
                上記の者は、LPK Gada Wirya Karsa における<br />
                日本文化研修 と {level}レベルの日本語 を 修了し、<br />
                優れた成果を上げ、プロフェッショナルな態度と優れた業務能力 を示したことを<br />
                証明します
              </p>
            </div>

            {/* 10. Pas Foto 3x4 Kiri Bawah */}
            <div
              className="absolute flex items-center justify-center overflow-hidden"
              style={{
                top: '870px',
                left: '145px',
                width: '135px',
                height: '180px',
                border: '4px solid white',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                backgroundColor: '#1d4ed8', // fallback color
              }}
            >
              <img
                src={row.foto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.nama_lengkap)}&backgroundColor=1d4ed8&textColor=ffffff&fontSize=40`}
                alt={row.nama_lengkap}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 11. Tanggal Tanda Tangan */}
            <div
              className="absolute w-full text-center flex justify-center"
              style={{ bottom: '225px', fontSize: '16px', fontWeight: 'bold', color: '#27374D' }}
            >
              {tanggalSertifikat}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .certificate-modal-a4, .certificate-modal-a4 * { visibility: visible; }
          body { margin: 0 !important; padding: 0 !important; background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .certificate-modal-a4 {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 794px !important;
            height: 1123px !important;
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
          @page { size: A4 portrait; margin: 0; }
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────── */
export default function CertificateFormPage() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [statusFilter, setStatusFilter] = useState('Semua');

  /* Modal state */
  const [previewRows, setPreviewRows] = useState<ProgressRow[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewStartIndex, setPreviewStartIndex] = useState(0);

  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiNilaiPembelajaran().getCertificateList();
        if (response && response.status === 200 && response.data) {
          const formattedRows: ProgressRow[] = response.data.map((userModel: any, index: number) => {
            const student: Partial<ProgressRow> = {
              id: index + 1,
              no_peserta: userModel.user_name || '-',
              nama_lengkap: userModel.name || '-',
              kelas: userModel.nama_kelas || '-',
              ujian_n5_score: userModel.nilai_n5 ?? '-',
              ujian_n4_score: userModel.nilai_n4 ?? '-',
              foto: userModel.foto ? `${process.env.NEXT_PUBLIC_BASE_URL}/static/foto/${userModel.foto}` : null,
            };

            // Status N5
            if (student.ujian_n5_score === '-') {
              student.ujian_n5 = 'Belum';
            } else if (Number(student.ujian_n5_score) >= 85) {
              student.ujian_n5 = 'Lulus';
            } else {
              student.ujian_n5 = 'Remedial';
            }

            // Status N4
            if (student.ujian_n4_score === '-') {
              student.ujian_n4 = 'Belum';
            } else if (Number(student.ujian_n4_score) >= 90) {
              student.ujian_n4 = 'Lulus';
            } else {
              student.ujian_n4 = 'Remedial';
            }

            return student as ProgressRow;
          });
          setProgressRows(formattedRows);
        } else {
          console.error("Gagal mengambil data progress", response);
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRows = useMemo(() => {
    let result = progressRows;

    if (selectedClass !== 'Semua Kelas') {
      result = result.filter((r) => r.kelas === selectedClass);
    }

    if (statusFilter === 'Lulus N5') {
      result = result.filter((r) => r.ujian_n5 === 'Lulus');
    } else if (statusFilter === 'Lulus N4') {
      result = result.filter((r) => r.ujian_n4 === 'Lulus');
    }

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.nama_lengkap.toLowerCase().includes(q) ||
          s.no_peserta.toLowerCase().includes(q),
      );
    }

    return result;
  }, [searchTerm, selectedClass, statusFilter, progressRows]);

  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    progressRows.forEach((r) => {
      if (r.kelas && r.kelas !== '-') classes.add(r.kelas);
    });
    return Array.from(classes).sort();
  }, [progressRows]);

  const allSelected =
    filteredRows.length > 0 &&
    filteredRows.every((r) => selectedIds.has(r.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredRows.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredRows.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedRows = progressRows.filter((r) => selectedIds.has(r.id));

  const openPreviewSingle = (row: ProgressRow) => {
    setPreviewRows([row]);
    setPreviewStartIndex(0);
    setPreviewOpen(true);
  };

  const openPreviewSelected = () => {
    if (selectedRows.length === 0) return;
    setPreviewRows(selectedRows);
    setPreviewStartIndex(0);
    setPreviewOpen(true);
  };

  const getStatusBadge = (row: ProgressRow) => {
    if (row.ujian_n4 === 'Lulus')
      return (
        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800">
          Lulus N4
        </span>
      );
    if (row.ujian_n5 === 'Lulus')
      return (
        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">
          Lulus N5
        </span>
      );
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
        {row.ujian_n5}
      </span>
    );
  };

  return (
    <>
      <main className="min-h-screen bg-[#F4F7F4] font-sans text-gray-800 p-4 md:p-8 relative">
        {isLoading && <LoadingOverlay text="MEMUAT DATA..." fixed={true} />}
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin-dashboard/progress-belajar"
              className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <Award className="text-amber-600" size={28} strokeWidth={1.5} />
                <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">
                  Print Sertifikat{' '}
                  <span className="text-lg text-gray-400 font-sans ml-2 tracking-normal font-normal">
                    (証明書印刷)
                  </span>
                </h1>
              </div>
              <p className="text-xs font-medium text-gray-500 tracking-widest uppercase mt-1">
                Pilih siswa yang akan dicetak sertifikatnya.
              </p>
            </div>
          </div>

          {/* Print Button Header */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {selectedIds.size === 0
                ? 'Belum ada siswa dipilih'
                : `${selectedIds.size} siswa dipilih`}
            </span>
            <button
              onClick={openPreviewSelected}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white text-xs tracking-widest uppercase hover:bg-amber-700 transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed rounded"
            >
              <Printer size={16} strokeWidth={1.5} />
              Preview &amp; Print
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative group flex-1 min-w-[200px] max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-600 transition-colors"
              size={16}
              strokeWidth={1.5}
            />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-amber-600 w-full transition-colors text-sm"
            />
          </div>

          {/* Class filter */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 text-sm font-medium focus:outline-none focus:border-amber-600 hover:border-gray-400 transition-colors cursor-pointer"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              {uniqueClasses.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 border-l border-gray-200">
              <ChevronDown size={14} strokeWidth={1.5} />
            </div>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 text-sm font-medium focus:outline-none focus:border-amber-600 hover:border-gray-400 transition-colors cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Lulus N5">Lulus N5</option>
              <option value="Lulus N4">Lulus N4</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 border-l border-gray-200">
              <ChevronDown size={14} strokeWidth={1.5} />
            </div>
          </div>

          {/* Select all toggle */}
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-600 hover:border-amber-600 hover:text-amber-600 transition-colors"
          >
            {allSelected ? (
              <CheckSquare size={16} className="text-amber-600" />
            ) : (
              <Square size={16} />
            )}
            {allSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}
          </button>
        </div>

        {/* Student List (Compact Table Layout) */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {filteredRows.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" strokeWidth={1} />
              <p className="text-sm uppercase tracking-widest">Tidak ada siswa ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">
                      <button onClick={toggleAll} className="text-gray-400 hover:text-amber-600 transition-colors">
                        {allSelected ? <CheckSquare size={18} className="text-amber-600" /> : <Square size={18} />}
                      </button>
                    </th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">No Peserta</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Status Ujian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRows.map((row) => {
                    const isSelected = selectedIds.has(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-amber-50/40' : ''}`}
                      >
                        <td className="py-3 px-4 text-center cursor-pointer" onClick={() => toggleOne(row.id)}>
                          <button className={`transition-colors ${isSelected ? 'text-amber-600' : 'text-gray-300 hover:text-amber-400'}`}>
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-800 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <User size={14} strokeWidth={2} />
                          </div>
                          {row.nama_lengkap}
                        </td>
                        <td className="py-3 px-4 text-indigo-600 font-mono text-xs">{row.no_peserta}</td>
                        <td className="py-3 px-4 text-gray-600">{row.kelas}</td>
                        <td className="py-3 px-4">{getStatusBadge(row)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Certificate Preview Modal */}
      {previewOpen && previewRows.length > 0 && (
        <CertificateModal
          rows={previewRows}
          startIndex={previewStartIndex}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}
