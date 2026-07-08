'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Download, BookOpen, Pencil, Calculator, ChevronDown, Award } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';
import StickyHorizontalScroll from '@/components/StickyHorizontalScroll';
import ProgressEditModal from './components/ProgressEditModal';
import PrintTableModal from './components/PrintTableModal';
import { aspectsConfig, AspectKey, ProgressRow, ScoreValue, mapApiUserToProgressRow } from './data';
import ApiNilaiPembelajaran from '@/app/api/nilai_pembelajaran/api_nilai_pembelajaran';
import { toast } from 'react-hot-toast';
import { ASPECT_TO_ID, MateriAspect, MATERI_ASPECTS, NilaiSaveScope } from '@/lib/nilai-revision';
import TablePagination from '@/components/TablePagination';
import { useTablePagination } from '@/hooks/useTablePagination';

// Helper component for scores
const ScoreCell = ({ score }: { score: ScoreValue }) => {
  if (score === null || score === '-') return <span className="text-gray-400">-</span>;

  const numScore = typeof score === 'string' ? parseInt(score) : score;

  if (isNaN(numScore)) return <span className="text-gray-700">{score}</span>;

  if (numScore >= 85) return <span className="font-semibold text-green-600">{score}</span>;
  if (numScore >= 75) return <span className="font-semibold text-yellow-600">{score}</span>;
  return <span className="font-semibold text-red-600">{score}</span>;
};

const renderRatingBadge = (rating: ScoreValue) => {
  if (!rating || rating === '-') return <span className="text-gray-400 font-medium">-</span>;

  let val = String(rating);
  if (val === 'sangat_baik' || val.toLowerCase() === 'sangat baik') val = 'Sangat Baik';
  else if (val === 'baik' || val.toLowerCase() === 'baik') val = 'Baik';
  else if (val === 'cukup' || val.toLowerCase() === 'cukup') val = 'Cukup';
  else if (val === 'kurang' || val.toLowerCase() === 'kurang') val = 'Kurang';
  else if (val === 'sangat_kurang' || val.toLowerCase() === 'sangat kurang') val = 'Sangat Kurang';
  const ratingMap: Record<string, { jp: string; id: string }> = {
    'Sangat Baik': { jp: '非常に良い', id: 'Sangat Baik' },
    'Baik': { jp: '良い', id: 'Baik' },
    'Cukup': { jp: '普通', id: 'Cukup' },
    'Kurang': { jp: '悪い', id: 'Kurang' },
    'Sangat Kurang': { jp: '非常に悪い', id: 'Sangat Kurang' },
  };

  const info = ratingMap[val];
  if (!info) return <span className="text-gray-700 font-semibold">{val}</span>;

  return (
    <div className="flex flex-col items-center text-gray-800">
      <span className="text-[12px] leading-tight font-bold">{info.jp}</span>
      <span className="text-[10px] leading-none uppercase mt-0.5 tracking-wider font-semibold text-gray-500">{info.id}</span>
    </div>
  );
};

// Helper component for Progress Bar
const ProgressBar = ({ percentage }: { percentage: number }) => {
  return (
    <div className="flex items-center gap-2 w-40">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 40 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-xs font-medium text-gray-600">{percentage}%</span>
    </div>
  );
};

// Helper to calculate average
const calculateAverage = (scores: Record<string, ScoreValue>) => {
  let total = 0;
  let count = 0;
  Object.values(scores).forEach(score => {
    if (score !== null && score !== '-') {
      const num = typeof score === 'string' ? parseInt(score) : score;
      if (!isNaN(num)) {
        total += num;
        count++;
      }
    }
  });
  return count === 0 ? '-' : Math.round(total / count);
};

export default function ProgressBelajarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [draftRow, setDraftRow] = useState<ProgressRow | null>(null);
  const [activeAspect, setActiveAspect] = useState<AspectKey>('kotoba');
  const [selectedClass, setSelectedClass] = useState<string>('Semua Kelas');

  useEffect(() => {
    const savedClass = localStorage.getItem('progressBelajar_selectedClass');
    if (savedClass) {
      setSelectedClass(savedClass);
    }
  }, []);

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    localStorage.setItem('progressBelajar_selectedClass', val);
  };
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const reloadProgressRows = async (): Promise<ProgressRow[] | null> => {
    const response = await ApiNilaiPembelajaran().getAllNilaiPembelajaran();
    if (response?.status === 200 && response.data) {
      const formattedRows = response.data.map((userModel: any, index: number) =>
        mapApiUserToProgressRow(userModel, index),
      );
      setProgressRows(formattedRows);
      return formattedRows;
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await reloadProgressRows();
      } catch (err) {
        console.error("Failed to fetch progress", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    progressRows.forEach(r => {
      if (r.kelas && r.kelas !== '-') {
        classes.add(r.kelas);
      }
    });
    return Array.from(classes).sort();
  }, [progressRows]);

  const filteredRows = useMemo(() => {
    let result = progressRows;

    if (selectedClass !== 'Semua Kelas') {
      result = result.filter((r) => r.kelas === selectedClass);
    }

    if (statusFilter === 'Lulus N5') {
      result = result.filter((r) => r.ujian_n5 === 'Lulus');
    } else if (statusFilter === 'Lulus N4') {
      result = result.filter((r) => r.ujian_n4 === 'Lulus');
    } else if (statusFilter === 'Belum N5') {
      result = result.filter((r) => r.ujian_n5 === 'Belum');
    } else if (statusFilter === 'Belum N4') {
      result = result.filter((r) => r.ujian_n4 === 'Belum');
    } else if (statusFilter === 'Remedial N5') {
      result = result.filter((r) => r.ujian_n5 === 'Remedial');
    } else if (statusFilter === 'Remedial N4') {
      result = result.filter((r) => r.ujian_n4 === 'Remedial');
    } else if (statusFilter === 'Kritis') {
      result = result.filter((r) => (r.progress_percentages?.[activeAspect] || 0) < 50);
    } else if (statusFilter === 'Sangat Baik') {
      result = result.filter((r) => (r.progress_percentages?.[activeAspect] || 0) >= 80);
    }

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) => s.nama_lengkap.toLowerCase().includes(q) || s.no_peserta.toLowerCase().includes(q),
      );
    }

    return result;
  }, [progressRows, searchTerm, selectedClass, statusFilter, activeAspect]);

  const {
    paginatedItems: paginatedRows,
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
  } = useTablePagination(filteredRows, {
    storageKey: 'progressBelajar_pageSize',
  });

  const openEdit = (row: ProgressRow) => {
    setEditingRowId(row.id);
    setDraftRow(JSON.parse(JSON.stringify(row))); // deep copy
  };

  const closeEdit = () => {
    setEditingRowId(null);
    setDraftRow(null);
  };

  const saveEdit = async (dirtyScopes: NilaiSaveScope[]) => {
    if (!draftRow || editingRowId === null || dirtyScopes.length === 0) return;

    const parseScore = (val: any) => {
      if (val === undefined || val === null || val === '-' || val === '') return null;
      const parsed = parseInt(val, 10);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const getKepVal = (val: any) => (val && val !== '-') ? val : null;
    const api = ApiNilaiPembelajaran();
    const baseline = draftRow.revisions;
    const updatedRevisions = { ...baseline, aspects: { ...baseline.aspects } };

    try {
      for (const scope of dirtyScopes) {
        let payload: Record<string, unknown> = {
          user_name: draftRow.no_peserta,
          save_scope: scope,
        };

        if (scope === 'exams') {
          payload = {
            ...payload,
            expected_revision: baseline.sub_nilai,
            nilai_ujian_masuk: parseScore(draftRow.ujian_masuk),
            nilai_n4: parseScore(draftRow.ujian_n4_score),
            nilai_n5: parseScore(draftRow.ujian_n5_score),
            catatan_sikap_siswa:
              draftRow.keterangan && draftRow.keterangan !== '-' ? draftRow.keterangan : null,
          };
        } else if (scope === 'kepribadian') {
          const kepribadian = draftRow.kepribadian || {};
          payload = {
            ...payload,
            expected_revision: baseline.kepribadian,
            nilai_kedisiplinan: getKepVal(kepribadian.kedisiplinan),
            nilai_kepribadian: getKepVal(kepribadian.kepribadian_diri),
            nilai_komunikasi: getKepVal(kepribadian.cara_komunikasi),
            nilai_kesopanan: getKepVal(kepribadian.kesopanan),
            kontrol_emosi: getKepVal(kepribadian.kontrol_emosi),
            nilai_inisiatif: getKepVal(kepribadian.inisiatif),
            nilai_percaya_diri: getKepVal(kepribadian.percaya_diri),
          };
        } else if (MATERI_ASPECTS.includes(scope as MateriAspect)) {
          const aspect = scope as MateriAspect;
          const scores = draftRow[aspect] || {};
          payload = {
            ...payload,
            expected_revision: baseline.aspects[aspect],
            id_aspek_nilai: ASPECT_TO_ID[aspect],
            keterangan:
              draftRow.keterangans && draftRow.keterangans[aspect] !== '-'
                ? draftRow.keterangans[aspect]
                : null,
          };
          for (let i = 1; i <= 50; i++) {
            payload[`bab_${i}`] = parseScore(scores[`${aspect}_${i}`]);
          }
        }

        const response = await api.postCreateNilaiPembelajaran(payload);
        if (response?.status === 409 && response?.conflict) {
          toast.error(response.message || 'Data sudah diubah admin lain. Memuat ulang...');
          const rows = await reloadProgressRows();
          const fresh = rows?.find((r) => r.no_peserta === draftRow.no_peserta);
          if (fresh) setDraftRow(JSON.parse(JSON.stringify(fresh)));
          return;
        }
        if (response?.status !== 200) {
          toast.error(response?.message || 'Terjadi kesalahan saat menyimpan data nilai.');
          return;
        }

        const rev = response.revisions;
        if (rev?.sub_nilai) updatedRevisions.sub_nilai = rev.sub_nilai;
        if (rev?.kepribadian) updatedRevisions.kepribadian = rev.kepribadian;
        if (rev?.aspects) {
          Object.assign(updatedRevisions.aspects, rev.aspects);
        }
      }

      const n5Score = parseScore(draftRow.ujian_n5_score);
      if (n5Score === null) draftRow.ujian_n5 = 'Belum';
      else if (n5Score >= 85) draftRow.ujian_n5 = 'Lulus';
      else draftRow.ujian_n5 = 'Remedial';

      const n4Score = parseScore(draftRow.ujian_n4_score);
      if (n4Score === null) draftRow.ujian_n4 = 'Belum';
      else if (n4Score >= 90) draftRow.ujian_n4 = 'Lulus';
      else draftRow.ujian_n4 = 'Remedial';

      const savedRow = { ...draftRow, revisions: updatedRevisions };
      setProgressRows((prev) => prev.map((r) => (r.id === editingRowId ? savedRow : r)));
      closeEdit();
      toast.success('Penilaian siswa berhasil diperbarui');
    } catch (e) {
      console.error(e);
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  const setDraftField = (field: string, value: any, aspect?: AspectKey) => {
    setDraftRow((prev) => {
      if (!prev) return prev;
      let newDraft;
      if (aspect) {
        newDraft = {
          ...prev,
          [aspect]: {
            ...prev[aspect],
            [field]: value
          }
        };
      } else {
        newDraft = { ...prev, [field]: value };
      }

      // Recalculate progress dynamically
      newDraft.progress_percentages = newDraft.progress_percentages || {};
      (Object.keys(aspectsConfig) as AspectKey[]).forEach(a => {
        let passed = 0;
        let total = 0;
        const scores = newDraft[a];
        if (scores) {
          aspectsConfig[a].columns.forEach(col => {
            total++;
            const val = scores[col.key];
            if (a === 'kepribadian') {
              if (val !== null && val !== undefined && val !== '-' && val !== '') {
                passed++;
              }
            } else {
              if (val !== null && val !== undefined && val !== '-' && val !== '') {
                const num = typeof val === 'string' ? parseInt(val) : val;
                if (!isNaN(num) && num >= 75) {
                  passed++;
                }
              }
            }
          });
        }
        newDraft.progress_percentages[a] = total === 0 ? 0 : Math.ceil((passed / total) * 100);
      });

      return newDraft;
    });
  };

  const currentConfig = aspectsConfig[activeAspect];
  const n5Columns = currentConfig.columns.filter(c => c.nLevel === 5);
  const n4Columns = currentConfig.columns.filter(c => c.nLevel === 4);

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 p-4 md:p-8 relative">
      {isLoading && <LoadingOverlay text="MEMUAT DATA..." fixed={true} />}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin-dashboard/dashboard"
            className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <BookOpen className="text-emerald-900" size={28} strokeWidth={1.5} />
              <h1 className="text-3xl font-serif font-normal text-gray-900 tracking-wide mb-1">Progress Belajar <span className="text-lg text-gray-400 font-sans ml-2 tracking-normal font-normal">(学習進捗)</span></h1>
            </div>
            <p className="text-xs font-medium text-gray-500 tracking-widest uppercase mt-1">Pantau nilai ujian, bab materi, dan perkembangan belajar siswa.</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-800 transition-colors" size={18} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-emerald-800 w-full md:w-64 transition-colors"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-2 px-5 py-2.5 bg-transparent border text-xs tracking-widest uppercase transition-colors duration-300 ${statusFilter !== 'Semua' ? 'border-emerald-800 text-emerald-800 bg-emerald-50' : 'border-gray-300 text-gray-600 hover:border-emerald-800 hover:text-emerald-800'}`}
              >
                <Filter size={16} strokeWidth={1.5} />
                Filter {statusFilter !== 'Semua' && `(${statusFilter})`}
              </button>

              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl z-50 py-1">
                    <button onClick={() => { setStatusFilter('Semua'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Semua' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Semua Status</button>
                    <button onClick={() => { setStatusFilter('Lulus N5'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Lulus N5' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Lulus N5</button>
                    <button onClick={() => { setStatusFilter('Lulus N4'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Lulus N4' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Lulus N4</button>
                    <button onClick={() => { setStatusFilter('Belum N5'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Belum N5' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Belum N5</button>
                    <button onClick={() => { setStatusFilter('Belum N4'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Belum N4' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Belum N4</button>
                    <button onClick={() => { setStatusFilter('Remedial N5'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Remedial N5' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Remedial N5</button>
                    <button onClick={() => { setStatusFilter('Remedial N4'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Remedial N4' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Remedial N4</button>
                    <button onClick={() => { setStatusFilter('Kritis'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Kritis' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Progress Kritis (&lt; 50%)</button>
                    <button onClick={() => { setStatusFilter('Sangat Baik'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Sangat Baik' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Progress Baik (&ge; 80%)</button>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setShowPrintModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-emerald-700 text-xs tracking-widest uppercase text-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors duration-300">
              <Download size={16} strokeWidth={1.5} />
              Print Laporan
            </button>
            <Link
              href="/admin-dashboard/progress-belajar/certificate-form"
              className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-amber-600 text-xs tracking-widest uppercase text-amber-600 hover:bg-amber-600 hover:text-white transition-colors duration-300"
            >
              <Award size={16} strokeWidth={1.5} />
              Print Sertifikat
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <label htmlFor="class-select" className="text-xs font-semibold tracking-widest uppercase text-gray-500">
                Pilih Kelas:
              </label>
              <div className="relative">
                <select
                  id="class-select"
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 text-sm font-medium focus:outline-none focus:border-emerald-700 hover:border-gray-400 transition-colors cursor-pointer w-40"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {uniqueClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 border-l border-gray-200">
                  <ChevronDown size={16} strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="aspect-select" className="text-xs font-semibold tracking-widest uppercase text-gray-500">
                Pilih Aspek:
              </label>
              <div className="relative">
                <select
                  id="aspect-select"
                  value={activeAspect}
                  onChange={(e) => setActiveAspect(e.target.value as AspectKey)}
                  className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 text-sm font-medium focus:outline-none focus:border-emerald-700 hover:border-gray-400 transition-colors cursor-pointer w-56"
                >
                  {(Object.entries(aspectsConfig) as [AspectKey, { label: string }][]).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 border-l border-gray-200">
                  <ChevronDown size={16} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border border-gray-300 relative z-10 shadow-sm">
        <StickyHorizontalScroll>
          <table className="admin-data-table w-full text-sm text-center whitespace-nowrap">
            {activeAspect === 'kepribadian' ? (
              <>
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-0 z-20 min-w-[140px]">
                      実習生番号<br /><span className="text-[10px] text-gray-500 normal-case">No. Peserta</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-[140px] z-20 min-w-[180px] admin-sticky-split-right">
                      実習生本名<br /><span className="text-[10px] text-gray-500 normal-case">Nama Peserta</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[130px] border-r">
                      規律性<br /><span className="text-[10px] text-gray-500 normal-case">Kedisiplinan</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[130px] border-r">
                      性格<br /><span className="text-[10px] text-gray-500 normal-case">Kepribadian</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[140px] border-r">
                      意思疎通<br /><span className="text-[10px] text-gray-500 normal-case">Cara Komunikasi</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[130px] border-r">
                      礼儀正しさ<br /><span className="text-[10px] text-gray-500 normal-case">Kesopanan</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[130px] border-r">
                      感情管理<br /><span className="text-[10px] text-gray-500 normal-case">Kontrol Emosi</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[130px] border-r">
                      積極性<br /><span className="text-[10px] text-gray-500 normal-case">Inisiatif</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r min-w-[130px]">
                      自信<br /><span className="text-[10px] text-gray-500 normal-case">Percaya Diri</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r min-w-[200px]">
                      備考<br /><span className="text-[10px] text-gray-500 normal-case">Keterangan</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 sticky right-0 bg-gray-100 admin-sticky-split-left">Aksi</th>
                  </tr>
                </thead>
                {paginatedRows.length > 0 && (
                  <tbody>
                    {paginatedRows.map((student) => {
                      const aspectScores = student.kepribadian || {};
                      return (
                        <tr key={student.id} className="bg-white hover:bg-gray-50 transition-colors group">
                          <td className="px-4 py-3 font-semibold text-indigo-600 border-r bg-white group-hover:bg-gray-50 sticky left-0 z-10 text-left">{student.no_peserta}</td>
                          <td className="px-4 py-3 font-medium text-gray-800 border-r bg-white group-hover:bg-gray-50 sticky left-[140px] z-10 admin-sticky-split-right text-left animate-fade-in">
                            <div>{student.nama_lengkap}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-bold">KELAS: {student.kelas || '-'}</div>
                          </td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.kedisiplinan)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.kepribadian_diri)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.cara_komunikasi)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.kesopanan)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.kontrol_emosi)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.inisiatif)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.percaya_diri)}</td>
                          <td className="px-4 py-3 text-gray-600 text-left max-w-[200px] truncate border-r" title={student.keterangans?.kepribadian || '-'}>
                            {student.keterangans?.kepribadian || '-'}
                          </td>
                          <td className="px-4 py-3 sticky right-0 bg-white admin-sticky-split-left group-hover:bg-gray-50 transition-colors">
                            <button
                              onClick={() => openEdit(student)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 rounded-lg transition-colors border border-emerald-100"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </>
            ) : (
              <>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th colSpan={7} className="px-4 py-2 border-r border-gray-200 text-gray-600 font-semibold bg-gray-100 sticky left-0 z-20 admin-sticky-split-right">Informasi Umum & Ringkasan</th>
                    {n5Columns.length > 0 && (
                      <th colSpan={n5Columns.length} className="px-4 py-2 border-r border-gray-200 text-emerald-700 font-semibold bg-emerald-50/50">
                        Materi N5
                      </th>
                    )}
                    {n4Columns.length > 0 && (
                      <th colSpan={n4Columns.length} className="px-4 py-2 border-r border-gray-200 text-purple-700 font-semibold bg-purple-50/50">Materi N4</th>
                    )}
                    <th colSpan={3} className="px-4 py-2 text-rose-700 font-semibold bg-rose-50/50">Ujian Utama</th>
                  </tr>
                </thead>

                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-0 z-20 min-w-[140px]">
                      実習生番号<br /><span className="text-[10px] text-gray-500 normal-case">No. Peserta</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-[140px] z-20 min-w-[180px] admin-sticky-split-right">
                      実習生本名<br /><span className="text-[10px] text-gray-500 normal-case">Nama Peserta</span>
                    </th>

                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">
                      日本語検定 N5<br /><span className="text-[10px] text-gray-500 normal-case">Status N5</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200">
                      日本語検定 N4<br /><span className="text-[10px] text-gray-500 normal-case">Status N4</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r">
                      PROGRESS<br /><span className="text-[10px] text-gray-500 normal-case">Persentase</span>
                    </th>

                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-amber-50">
                      <div className="flex flex-col items-center gap-1">
                        <Calculator size={14} className="text-amber-700" />
                        <span>Rata-rata</span>
                        <span className="text-[10px] text-amber-600 normal-case">{currentConfig.label}</span>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r">
                      備考<br /><span className="text-[10px] text-gray-500 normal-case">Keterangan</span>
                    </th>

                    {/* N5 columns */}
                    {n5Columns.map(col => (
                      <th key={col.key} scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-emerald-50/30">
                        <span className="text-[10px] text-emerald-600/80 normal-case">{col.label}</span>
                      </th>
                    ))}

                    {/* N4 Progress */}
                    {n4Columns.map(col => (
                      <th key={col.key} scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-purple-50/30">
                        <span className="text-[10px] text-purple-600/80 normal-case">{col.label}</span>
                      </th>
                    ))}

                    {/* Ujian Utama */}
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-rose-200 bg-rose-50/50">
                      Ujian Masuk
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-rose-200 bg-rose-50/50">
                      Ujian N5
                    </th>
                    <th scope="col" className="px-4 py-4 font-bold border-b border-rose-200 bg-rose-100/60 text-rose-900">
                      Ujian N4
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 sticky right-0 bg-gray-100 admin-sticky-split-left">Aksi</th>
                  </tr>
                </thead>
                {paginatedRows.length > 0 && (
                  <tbody>
                    {paginatedRows.map((student) => {
                      const aspectScores = student[activeAspect];
                      const avgScore = calculateAverage(aspectScores);

                      return (
                        <tr key={student.id} className="bg-white hover:bg-gray-50 transition-colors group">
                          <td className="px-4 py-3 font-semibold text-indigo-600 border-r bg-white group-hover:bg-gray-50 sticky left-0 z-10 text-left">{student.no_peserta}</td>
                          <td className="px-4 py-3 font-medium text-gray-800 border-r bg-white group-hover:bg-gray-50 sticky left-[140px] z-10 admin-sticky-split-right text-left">
                            <div>{student.nama_lengkap}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-bold">KELAS: {student.kelas || '-'}</div>
                          </td>

                          <td className="px-4 py-3 border-r">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${student.ujian_n5 === 'Lulus' ? 'bg-green-100 text-green-800' : student.ujian_n5 === 'Remedial' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                              {student.ujian_n5}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-r">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${student.ujian_n4 === 'Lulus' ? 'bg-green-100 text-green-800' : student.ujian_n4 === 'Remedial' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                              {student.ujian_n4}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-r min-w-40">
                            <ProgressBar percentage={student.progress_percentages?.[activeAspect] || 0} />
                          </td>

                          <td className="px-4 py-3 bg-amber-50/30 font-bold border-r">
                            <ScoreCell score={avgScore} />
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-left max-w-[200px] truncate border-r" title={student.keterangans?.[activeAspect] || '-'}>{student.keterangans?.[activeAspect] || '-'}</td>

                          {/* N5 Progress */}
                          {n5Columns.map(col => (
                            <td key={col.key} className="px-4 py-3 border-r">
                              <ScoreCell score={aspectScores[col.key]} />
                            </td>
                          ))}

                          {/* N4 Progress */}
                          {n4Columns.map(col => (
                            <td key={col.key} className="px-4 py-3 border-r">
                              <ScoreCell score={aspectScores[col.key]} />
                            </td>
                          ))}

                          {/* Exams */}
                          <td className="px-4 py-3 bg-rose-50/30 border-r"><ScoreCell score={student.ujian_masuk} /></td>
                          <td className="px-4 py-3 bg-rose-50/30 border-r"><ScoreCell score={student.ujian_n5_score} /></td>
                          <td className="px-4 py-3 bg-rose-100/30 text-lg border-r"><ScoreCell score={student.ujian_n4_score} /></td>

                          <td className="px-4 py-3 sticky right-0 bg-white admin-sticky-split-left group-hover:bg-gray-50 transition-colors">
                            <button
                              onClick={() => openEdit(student)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 rounded-lg transition-colors border border-emerald-100"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </>
            )}
          </table>
        </StickyHorizontalScroll>
        {filteredRows.length > 0 && (
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
        {filteredRows.length === 0 && (
          <div className="w-full py-12 flex items-center justify-center bg-gray-50/30">
            <p className="text-gray-700 font-semibold text-base tracking-wide">Tidak ada data siswa ditemukan</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 10px;
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
          margin-left: 320px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}} />

      <ProgressEditModal
        draft={draftRow}
        activeAspect={activeAspect}
        onClose={closeEdit}
        onSave={saveEdit}
        onFieldChange={setDraftField}
      />

      {showPrintModal && (
        <PrintTableModal
          rows={progressRows}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </main>
  );
}
