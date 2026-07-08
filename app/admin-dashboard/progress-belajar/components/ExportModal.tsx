'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileSpreadsheet, Printer, ArrowLeft, CheckSquare, Square, Info } from 'lucide-react';
import { ProgressRow, AspectScores, aspectsConfig, AspectKey } from '../data';

export default function ExportModal({
  rows,
  onClose,
}: {
  rows: ProgressRow[];
  onClose: () => void;
}) {
  const [exportTarget, setExportTarget] = useState('Semua');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [n5Only, setN5Only] = useState(false);

  const uniqueClasses = Array.from(new Set(rows.map(r => r.kelas).filter(Boolean)));

  const studentsInTarget = useMemo(() => {
    if (exportTarget === 'Semua') return rows;
    return rows.filter(r => r.kelas === exportTarget);
  }, [rows, exportTarget]);

  useEffect(() => {
    setSelectedStudentIds(new Set(studentsInTarget.map(s => s.no_peserta)));
  }, [studentsInTarget]);

  const targetRows = useMemo(() => {
    return studentsInTarget.filter(r => selectedStudentIds.has(r.no_peserta));
  }, [studentsInTarget, selectedStudentIds]);

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedStudentIds(next);
  };

  const toggleAll = () => {
    if (selectedStudentIds.size === studentsInTarget.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(studentsInTarget.map(s => s.no_peserta)));
    }
  };

  const translateStatus = (s: string) => s === 'Lulus' ? 'Passed' : s === 'Remedial' ? 'Failed' : 'Pending';

  const handlePreview = () => {
    if (targetRows.length === 0) {
      alert("Tidak ada data siswa untuk kriteria ini.");
      return;
    }
    setStep('preview');
  };

  const handlePrint = () => {
    const el = document.getElementById('laporan-print-container');
    if (!el) return;

    // 1. Buat hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // 2. Clone konten
    const clone = el.cloneNode(true) as HTMLElement;

    // 3. Ekstrak stylesheet dari dokumen induk untuk dikirim ke iframe
    const headContent = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => {
        if (node.tagName === 'LINK') {
          return `<link rel="stylesheet" href="${(node as HTMLLinkElement).href}">`;
        }
        return node.outerHTML;
      })
      .join('\n');

    // 4. Susun HTML
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Print Laporan Progress</title>
  ${headContent}
  <style>
    @page {
      size: A4 portrait;
      margin: 0mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 210mm;
      margin: 0;
      padding: 0;
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    #laporan-print-container {
      width: 100%;
      background: white !important;
      display: flex;
      flex-direction: column;
      gap: 0 !important;
      padding: 0;
    }

    .print-hide { display: none !important; }
    .py-8 { padding-top: 0 !important; padding-bottom: 0 !important; }
    .bg-gray-100, .bg-gray-50 { background-color: transparent !important; }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      // Tunggu render stylesheet di iframe, lalu print
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
        // Cleanup setelah dialog print ditutup
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }, 500);
    }
  };

  const getAspectAvgLevel = (aspectKey: AspectKey, student: ProgressRow, level: 5 | 4) => {
    const cols = aspectsConfig[aspectKey].columns.filter(c => c.nLevel === level).map(c => c.key);
    const scores = student[aspectKey] as AspectScores;
    let total = 0;
    let count = 0;
    cols.forEach(k => {
      const score = scores[k];
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

  const getOverallAvgLevel = (student: ProgressRow, level: 5 | 4) => {
    const aspectKeys: AspectKey[] = ['kotoba', 'bunpou', 'choukai', 'kaiwa', 'kanji'];
    let total = 0;
    let count = 0;

    aspectKeys.forEach(k => {
      const cols = aspectsConfig[k].columns.filter(c => c.nLevel === level).map(c => c.key);
      const scores = student[k] as AspectScores;
      cols.forEach(colKey => {
        const score = scores[colKey];
        if (score !== null && score !== '-') {
          const num = typeof score === 'string' ? parseInt(score) : score;
          if (!isNaN(num)) {
            total += num;
            count++;
          }
        }
      });
    });

    return count === 0 ? '-' : Math.round(total / count);
  };

  const getGlobalAvg = (student: ProgressRow) => {
    let total = 0;
    let count = 0;

    const n5 = getOverallAvgLevel(student, 5);

    if (n5 !== '-') { total += (n5 as number); count++; }

    if (!n5Only) {
      const n4 = getOverallAvgLevel(student, 4);
      if (n4 !== '-') { total += (n4 as number); count++; }
    }

    return count === 0 ? '-' : Math.round(total / count);
  };

  const getGlobalProgress = (student: ProgressRow) => {
    if (!student.progress_percentages) return 0;
    const vals = Object.values(student.progress_percentages);
    if (vals.length === 0) return 0;
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round(sum / vals.length);
  };

  if (step === 'preview') {
    return createPortal(
      <div id="laporan-print-modal" className="fixed inset-0 z-[200] bg-gray-200 overflow-y-auto print:static print:bg-white print:overflow-visible print:block">
        {/* Topbar (Hidden when printing) */}
        <div className="sticky top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center z-50 print-hide">
          <button
            onClick={() => setStep('select')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
          <div className="font-bold text-lg text-gray-800">
            Preview Laporan ({targetRows.length} Siswa)
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              <Printer size={16} />
              Print Sekarang
            </button>
          </div>
        </div>

        {/* Printable Pages Container */}
        <div id="laporan-print-container" className="py-8 print:py-0">
          {targetRows.map((student, idx) => (
            <div
              key={student.id}
              className="bg-white mx-auto border border-gray-300 shadow-md mb-8 text-black print:m-0 print:border-none print:shadow-none relative box-border"
              style={{
                width: '210mm',
                height: '297mm', // Fixed height to ensure 1 page strict
                padding: '12mm 15mm',
                pageBreakAfter: idx < targetRows.length - 1 ? 'always' : 'auto',
                overflow: 'hidden'
              }}
            >
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold tracking-[0.2em] border-b-2 border-black pb-2 inline-block px-10">成績表</h1>
                <p className="text-xs mt-1 font-serif uppercase tracking-[0.3em]">Progress Report</p>
              </div>

              <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-6">
                <div className="space-y-3">
                  <div className="flex items-end text-sm">
                    <span className="w-24 font-bold">学生番号<br /><span className="text-[10px] font-normal">Student ID</span></span>
                    <span className="text-base font-bold border-b border-black border-dashed min-w-[150px] inline-block px-2">{student.no_peserta}</span>
                  </div>
                  <div className="flex items-end text-sm">
                    <span className="w-24 font-bold">氏名<br /><span className="text-[10px] font-normal">Name</span></span>
                    <span className="text-base font-bold border-b border-black border-dashed min-w-[250px] inline-block px-2 uppercase">{student.nama_lengkap}</span>
                  </div>
                </div>
                <div className="flex items-end text-sm">
                  <span className="font-bold mr-3">クラス<br /><span className="text-[10px] font-normal">Class</span></span>
                  <span className="text-base font-bold border-b border-black border-dashed min-w-[120px] inline-block text-center px-2">{student.kelas || '-'}</span>
                </div>
              </div>

              <div className="mb-6 flex gap-6">
                {/* Averages Section */}
                <div className="flex-1">
                  <h2 className="text-sm font-bold mb-2 border-l-4 border-black pl-2 flex items-end gap-2">
                    各科目の平均点 <span className="text-[10px] font-normal">(Average Scores by Subject)</span>
                  </h2>
                  <table className="w-full border-collapse border-2 border-black text-center text-sm">
                    <thead>
                      <tr className="bg-gray-100 print:bg-transparent">
                        <th className={`border border-black p-2 text-left pl-3 ${n5Only ? 'w-[40%]' : 'w-[30%]'}`}>科目 <span className="text-[10px] font-normal">(Subject)</span></th>
                        <th className={`border border-black p-2 ${n5Only ? 'w-[60%]' : 'w-[35%]'}`}>N5<br /><span className="text-[10px] font-normal">Bab 1-25</span></th>
                        {!n5Only && <th className="border border-black p-2 w-[35%]">N4<br /><span className="text-[10px] font-normal">Bab 26-50</span></th>}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 font-bold text-left pl-3">言葉 <span className="text-[10px] font-normal">(Kotoba)</span></td>
                        <td className="border border-black p-2 font-semibold">{getAspectAvgLevel('kotoba', student, 5)}</td>
                        {!n5Only && <td className="border border-black p-2 font-semibold">{getAspectAvgLevel('kotoba', student, 4)}</td>}
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-bold text-left pl-3">文法 <span className="text-[10px] font-normal">(Bunpou)</span></td>
                        <td className="border border-black p-2 font-semibold">{getAspectAvgLevel('bunpou', student, 5)}</td>
                        {!n5Only && <td className="border border-black p-2 font-semibold">{getAspectAvgLevel('bunpou', student, 4)}</td>}
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-bold text-left pl-3">聴解 <span className="text-[10px] font-normal">(Choukai)</span></td>
                        <td className="border border-black p-2 font-semibold">{getAspectAvgLevel('choukai', student, 5)}</td>
                        {!n5Only && <td className="border border-black p-2 font-semibold">{getAspectAvgLevel('choukai', student, 4)}</td>}
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-bold text-left pl-3">会話 <span className="text-[10px] font-normal">(Kaiwa)</span></td>
                        <td className="border border-black p-2 font-semibold">{getAspectAvgLevel('kaiwa', student, 5)}</td>
                        {!n5Only && <td className="border border-black p-2 font-semibold">{getAspectAvgLevel('kaiwa', student, 4)}</td>}
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-bold text-left pl-3">漢字 <span className="text-[10px] font-normal">(Kanji)</span></td>
                        <td className="border border-black p-2 font-semibold">{getAspectAvgLevel('kanji', student, 5)}</td>
                        {!n5Only && <td className="border border-black p-2 font-semibold">{getAspectAvgLevel('kanji', student, 4)}</td>}
                      </tr>
                      <tr className="bg-gray-50 print:bg-transparent">
                        <td className="border border-black p-2 font-bold text-left pl-3">平均 <span className="text-[10px] font-normal">(Average)</span></td>
                        <td className="border border-black p-2 font-bold text-lg">{getOverallAvgLevel(student, 5)}</td>
                        {!n5Only && <td className="border border-black p-2 font-bold text-lg">{getOverallAvgLevel(student, 4)}</td>}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Exam & Overall Section */}
                <div className="w-[40%] flex flex-col gap-6">
                  <div className="border-2 border-black p-3 text-center bg-gray-50 print:bg-transparent shadow-sm">
                    <div className="text-xs font-bold mb-1">総合平均点 <span className="text-[10px] font-normal">(Global Average)</span></div>
                    <div className="text-4xl font-bold">{getGlobalAvg(student)}</div>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold mb-2 border-l-4 border-black pl-2 flex items-end gap-2">
                      試験結果 <span className="text-[10px] font-normal">(Exams)</span>
                    </h2>
                    <table className="w-full border-collapse border-2 border-black text-center text-sm">
                      <tbody>
                        <tr>
                          <td className="border border-black p-2 font-bold text-left pl-3 bg-gray-50 print:bg-transparent">N5 模擬 <span className="text-[10px] font-normal">(N5 Mock)</span></td>
                          <td className="border border-black p-2 font-semibold">
                            {student.ujian_n5_score ?? '-'}
                            <div className="text-[10px] font-normal">({translateStatus(student.ujian_n5)})</div>
                          </td>
                        </tr>
                        {!n5Only && (
                          <tr>
                            <td className="border border-black p-2 font-bold text-left pl-3 bg-gray-50 print:bg-transparent">N4 模擬 <span className="text-[10px] font-normal">(N4 Mock)</span></td>
                            <td className="border border-black p-2 font-semibold">
                              {student.ujian_n4_score ?? '-'}
                              <div className="text-[10px] font-normal">({translateStatus(student.ujian_n4)})</div>
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="border border-black p-2 font-bold text-left pl-3 bg-gray-50 print:bg-transparent">進捗 <span className="text-[10px] font-normal">(Progress)</span></td>
                          <td className="border border-black p-2 font-semibold">{getGlobalProgress(student)}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex-1">
                <h2 className="text-sm font-bold mb-2 border-l-4 border-black pl-2 flex items-end gap-2">
                  備考 <span className="text-[10px] font-normal">(Remarks)</span>
                </h2>
                <div className="border-2 border-black p-4 min-h-[100px] text-sm leading-relaxed bg-gray-50 print:bg-transparent">
                  {student.keterangan || '-'}
                </div>
              </div>

              {/* Signature Area */}
              <div className="absolute bottom-[15mm] right-[15mm] w-40 text-center">
                <div className="border-b border-black pb-10 mb-1">
                  <span className="text-xs font-bold">教師</span><br />
                  <span className="text-[10px]">Teacher</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            /* Sembunyikan elemen utama web agar tidak ikut tercetak */
            body > *:not(#laporan-print-modal) {
              display: none !important;
            }
            
            /* Sembunyikan navbar/topbar modal */
            .print-hide {
              display: none !important;
            }
            
            /* Pastikan background dan borders tercetak */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            @page {
              size: A4 portrait;
              margin: 0;
            }
          }
        `}} />
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileSpreadsheet size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Print Laporan Progress A4</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-gray-50/50 overflow-y-auto">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold tracking-wide text-gray-700">Filter Berdasarkan Kelas</span>
              <select
                value={exportTarget}
                onChange={(e) => setExportTarget(e.target.value)}
                className="mt-2 w-full border border-gray-300 rounded-md bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-shadow cursor-pointer"
              >
                <option value="Semua">Semua Kelas ({rows.length} Siswa)</option>
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>Kelas: {c}</option>
                ))}
              </select>
            </label>

            <div className="border border-gray-200 rounded-md bg-white shadow-sm flex flex-col h-[280px]">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
                <span className="text-sm font-semibold text-gray-700">
                  Pilih Siswa ({selectedStudentIds.size}/{studentsInTarget.length})
                </span>
                <button
                  onClick={toggleAll}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 transition-colors bg-emerald-50 px-2 py-1 rounded-md"
                >
                  {selectedStudentIds.size === studentsInTarget.length ? (
                    <><CheckSquare size={14} /> Deselect All</>
                  ) : (
                    <><Square size={14} /> Select All</>
                  )}
                </button>
              </div>
              <div className="overflow-y-auto p-2 space-y-1 flex-1">
                {studentsInTarget.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">Tidak ada siswa ditemukan.</div>
                ) : (
                  studentsInTarget.map(s => (
                    <label
                      key={s.no_peserta}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.has(s.no_peserta)}
                        onChange={() => toggleStudent(s.no_peserta)}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 transition-colors"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">{s.nama_lengkap}</span>
                        <span className="text-xs text-gray-500">{s.no_peserta} • {s.kelas || 'Tanpa Kelas'}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">Print Mode N5 Saja</span>
                <span className="text-xs text-gray-500">Hanya menampilkan nilai dan ujian N5 di laporan cetak.</span>
              </div>
              <button
                type="button"
                onClick={() => setN5Only(!n5Only)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${n5Only ? 'bg-emerald-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${n5Only ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-3 text-sm text-emerald-800 leading-relaxed shadow-sm">
              <Info className="shrink-0 mt-0.5" size={18} />
              <div>
                Laporan akan dicetak padat dalam 1 lembar A4 per siswa yang dipilih. <br />
                {n5Only ? 'Hanya nilai rata-rata N5 (Bab 1-25) yang akan ditampilkan.' : 'Nilai rata-rata dipisahkan berdasarkan N5 (Bab 1-25) dan N4 (Bab 26-50).'}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0 shadow-sm">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button
            onClick={handlePreview}
            disabled={targetRows.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Tampilkan Preview ({targetRows.length})
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
