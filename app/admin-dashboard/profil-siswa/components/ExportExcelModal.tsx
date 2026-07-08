'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileSpreadsheet, Download } from 'lucide-react';
import { StudentEditData } from './StudentEditModal';
import * as XLSX from 'xlsx';

// Truncate sheet name to max 31 chars (Excel limit) and remove invalid chars
export function safeSheetName(name: string): string {
  return name.replace(/[\\/*?[\]:]/g, '').slice(0, 31);
}

export function buildStudentSheet(s: StudentEditData): XLSX.WorkSheet {
  const rows: (string | number | null)[][] = [];

  // ─── Section 1: Data Profil ───
  rows.push(['DATA PROFIL SISWA', '']);
  rows.push(['', '']);

  const profileFields: [string, string | number | null | undefined][] = [
    ['No Peserta', s.no_peserta],
    ['Nama Lengkap', s.nama_lengkap],
    ['Nama Katakana', s.nama_katakana],
    ['Nama Panggilan', s.nama_panggilan],
    ['NIK', s.nik],
    ['Angkatan', s.angkatan],
    ['Kewarganegaraan', s.kewarganegaraan],
    ['Tanggal Lahir', s.tanggal_lahir],
    ['Umur', s.umur],
    ['Jenis Kelamin', s.jenis_kelamin],
    ['Golongan Darah', s.golongan_darah],
    ['Status Pernikahan', s.status_pernikahan],
    ['Agama', s.agama],
    ['Asal (Tempat Lahir)', s.asal],
    ['Alamat', s.alamat],
    ['Kode Pos', s.kode_pos],
    ['Telepon', s.telepon],
    ['Email', s.email],
    ['Tingkatan Pembelajaran', s.tingkatan_pembelajaran],
    ['Tempat Belajar (Kelas)', s.tempat_belajar],
    ['MCU (Hasil Admin)', s.mcu],
    ['Berat Badan (kg)', s.berat_badan],
    ['Tinggi Badan (cm)', s.tinggi_badan],
    ['Mata Kiri', s.mata_kiri],
    ['Mata Kanan', s.mata_kanan],
    ['Berkacamata', s.berkacamata],
    ['Tato', s.tato],
    ['Merokok', s.merokok],
    ['Buta Warna', s.buta_warna],
    ['Riwayat Patah Tulang', s.patah_tulang],
    ['Hobi', s.hobi],
    ['Asal LPK', s.asal_lpk],
    ['Nama SO', s.nama_so],
    ['Nama Kumiai', s.nama_kumiai],
    ['Nama Perusahaan', s.nama_perusahaan],
    ['Jenis Pekerjaan', s.jenis_pekerjaan],
    ['Tgl Masuk Pelatihan', s.tanggal_masuk_pelatihan],
    ['Perkiraan Masuk Jepang', s.perkiraan_masuk_jepang],
    ['Tgl Keberangkatan', s.tanggal_keberangkatan],
    ['Tgl Kelulusan', s.tanggal_kelulusan],
    ['Sertifikat Dimiliki', (s.sertifikat_dimiliki || []).join('; ')],
  ];

  for (const [label, value] of profileFields) {
    rows.push([label, value ?? '-']);
  }

  // ─── Section 2: Riwayat Pendidikan ───
  rows.push(['', '']);
  rows.push(['RIWAYAT PENDIDIKAN', '', '', '', '', '', '']);
  rows.push(['Nama Sekolah', 'Tingkat', 'Jurusan', 'Bulan Masuk', 'Tahun Masuk', 'Bulan Lulus', 'Tahun Lulus']);

  if (s.pendidikan && s.pendidikan.length > 0) {
    for (const p of s.pendidikan) {
      rows.push([
        p.nama_sekolah || '-',
        p.tingkat_pendidikan || '-',
        p.jurusan || '-',
        p.bulan_masuk || '-',
        p.tahun_masuk || '-',
        p.bulan_lulus || '-',
        p.tahun_lulus || '-',
      ]);
    }
  } else {
    rows.push(['Belum ada data', '', '', '', '', '', '']);
  }

  // ─── Section 3: Riwayat Pekerjaan ───
  rows.push(['', '']);
  rows.push(['RIWAYAT PEKERJAAN', '', '', '', '', '', '']);
  rows.push(['Nama Perusahaan', 'Posisi', 'Status', 'Bulan Mulai', 'Tahun Mulai', 'Bulan Selesai', 'Tahun Selesai']);

  if (s.pekerjaan && s.pekerjaan.length > 0) {
    for (const p of s.pekerjaan) {
      rows.push([
        p.nama_perusahaan || '-',
        p.posisi_pekerjaan || '-',
        p.status_pekerjaan || '-',
        p.bulan_mulai || '-',
        p.tahun_mulai || '-',
        p.bulan_selesai || '-',
        p.tahun_selesai || '-',
      ]);
    }
  } else {
    rows.push(['Belum ada data', '', '', '', '', '', '']);
  }

  // ─── Section 4: Sertifikat ───
  rows.push(['', '']);
  rows.push(['SERTIFIKAT & LISENSI', '', '', '', '']);
  rows.push(['Nama Sertifikat', 'Status Kelulusan', 'Score', 'Bulan Diperoleh', 'Tahun Diperoleh']);

  if (s.sertifikat && s.sertifikat.length > 0) {
    for (const cert of s.sertifikat) {
      rows.push([
        cert.nama_sertifikat || '-',
        cert.status_kelulusan != null ? (cert.status_kelulusan === 1 ? 'Lulus' : 'Tidak Lulus') : '-',
        cert.score || '-',
        cert.bulan_diperoleh || '-',
        cert.tahun_diperoleh || '-',
      ]);
    }
  } else {
    rows.push(['Belum ada data', '', '', '', '']);
  }

  // ─── Section 5: Data Keluarga ───
  rows.push(['', '']);
  rows.push(['DATA KELUARGA', '', '', '']);
  rows.push(['Hubungan', 'Nama', 'Umur', 'Status Pekerjaan']);

  if (s.keluarga && s.keluarga.length > 0) {
    for (const k of s.keluarga) {
      rows.push([
        k.hubungan || '-',
        k.nama || '-',
        k.umur != null ? k.umur : '-',
        k.status_pekerjaan || '-',
      ]);
    }
  } else {
    rows.push(['Belum ada data', '', '', '']);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 28 },
    { wch: 32 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
  ];

  return ws;
}

export default function ExportExcelModal({
  rows,
  onClose,
}: {
  rows: StudentEditData[];
  onClose: () => void;
}) {
  const [exportTarget, setExportTarget] = useState('Semua');
  const [specificStudent, setSpecificStudent] = useState('');
  const [exportMode, setExportMode] = useState('Gabung');
  const [isExporting, setIsExporting] = useState(false);

  const uniqueAngkatan = Array.from(new Set(rows.map(r => r.angkatan).filter(Boolean)));

  const handleExport = () => {
    let targetRows = rows;
    if (exportTarget !== 'Semua' && exportTarget !== 'Spesifik') {
      targetRows = rows.filter(r => r.angkatan === exportTarget);
    } else if (exportTarget === 'Spesifik') {
      targetRows = rows.filter(r => r.no_peserta === specificStudent);
    }

    if (targetRows.length === 0) {
      alert("Tidak ada data siswa untuk kriteria ini.");
      return;
    }

    setIsExporting(true);

    setTimeout(() => {
      try {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);

        if (exportMode === 'Pisah') {
          targetRows.forEach((student, idx) => {
            setTimeout(() => {
              const wb = XLSX.utils.book_new();
              const sheetName = safeSheetName(`${student.no_peserta}`);
              const ws = buildStudentSheet(student);
              XLSX.utils.book_append_sheet(wb, ws, sheetName);
              const filename = `Siswa_${student.no_peserta}_${student.nama_lengkap.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
              XLSX.writeFile(wb, filename);
            }, idx * 500);
          });
        } else {
          const wb = XLSX.utils.book_new();
          const usedNames = new Set<string>();

          for (const student of targetRows) {
            let name = safeSheetName(`${student.no_peserta} - ${student.nama_lengkap}`);
            if (usedNames.has(name)) {
              let counter = 2;
              while (usedNames.has(`${name.slice(0, 28)}_${counter}`)) counter++;
              name = `${name.slice(0, 28)}_${counter}`;
            }
            usedNames.add(name);
            const ws = buildStudentSheet(student);
            XLSX.utils.book_append_sheet(wb, ws, name);
          }

          const suffix = exportTarget === 'Spesifik'
            ? `_${specificStudent}`
            : exportTarget !== 'Semua'
              ? `_${exportTarget.replace(/\s+/g, '_')}`
              : '';
          const filename = `Rekap_Data_Siswa${suffix}_${dateStr}.xlsx`;
          XLSX.writeFile(wb, filename);
        }
      } catch (err) {
        console.error('Excel export error:', err);
        alert('Terjadi kesalahan saat mengekspor file Excel.');
      } finally {
        setIsExporting(false);
        onClose();
      }
    }, 100);
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] bg-black/45 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white border border-gray-200 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-600" size={20} />
            <h2 className="text-xl font-serif text-gray-900">Export Rekap Excel</h2>
          </div>
          <button onClick={onClose} className="p-2 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-gray-500 leading-relaxed">
            Menghasilkan file <span className="font-semibold text-gray-700">.xlsx</span> dengan <span className="font-semibold text-gray-700">masing-masing siswa di sheet terpisah</span>.
            Setiap sheet berisi data profil, riwayat pendidikan, pekerjaan, sertifikat, dan data keluarga.
          </p>

          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">Target Export</span>
              <select
                value={exportTarget}
                onChange={(e) => {
                  setExportTarget(e.target.value);
                  if (e.target.value === 'Spesifik' && rows.length > 0 && !specificStudent) {
                    setSpecificStudent(rows[0].no_peserta);
                  }
                }}
                className="mt-2 w-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Semua">Semua Siswa ({rows.length} siswa)</option>
                {uniqueAngkatan.map(c => (
                  <option key={c} value={c}>Filter: {c}</option>
                ))}
                <option value="Spesifik">Pilih Siswa Spesifik...</option>
              </select>
            </label>

            {exportTarget === 'Spesifik' && (
              <label className="block animate-in fade-in slide-in-from-top-2">
                <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">Pilih Siswa</span>
                <select
                  value={specificStudent}
                  onChange={(e) => setSpecificStudent(e.target.value)}
                  className="mt-2 w-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {rows.map(r => (
                    <option key={r.no_peserta} value={r.no_peserta}>{r.no_peserta} - {r.nama_lengkap}</option>
                  ))}
                </select>
              </label>
            )}

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm">
              <p className="text-xs text-emerald-700">
                <span className="font-semibold">Format output:</span>{' '}
                {exportMode === 'Gabung'
                  ? 'File Excel (.xlsx) — 1 file dengan masing-masing siswa di sheet terpisah.'
                  : 'Setiap siswa diunduh sebagai file Excel (.xlsx) terpisah. Browser mungkin meminta izin untuk mengunduh beberapa file.'}
              </p>
            </div>

            <label className="block">
              <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">Mode Output File</span>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportMode('Gabung')}
                  className={`py-2 px-3 text-sm border text-center transition-colors ${exportMode === 'Gabung' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  1 File Gabungan
                </button>
                <button
                  type="button"
                  onClick={() => setExportMode('Pisah')}
                  disabled={exportTarget === 'Spesifik'}
                  className={`py-2 px-3 text-sm border text-center transition-colors ${exportMode === 'Pisah' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  1 File per Siswa
                </button>
              </div>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 transition-colors">
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            {isExporting ? 'Memproses...' : 'Download Excel'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
