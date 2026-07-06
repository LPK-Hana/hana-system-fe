'use client';

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, ArrowLeft, CheckSquare, Square, Info, Eye } from 'lucide-react';
import { ProgressRow, AspectScores, aspectsConfig, AspectKey } from '../data';

interface PrintTableModalProps {
  rows: ProgressRow[];
  onClose: () => void;
}

// ─── Score helpers ────────────────────────────────────────────────
const getAspectAvgLevel = (aspectKey: AspectKey, student: ProgressRow, level: 5 | 4): string | number => {
  const cols = aspectsConfig[aspectKey].columns.filter(c => c.nLevel === level).map(c => c.key);
  const scores = student[aspectKey] as AspectScores;
  let total = 0, count = 0;
  cols.forEach(k => {
    const score = scores[k];
    if (score !== null && score !== '-') {
      const num = typeof score === 'string' ? parseInt(score) : score;
      if (!isNaN(num)) { total += num; count++; }
    }
  });
  return count === 0 ? '-' : Math.round(total / count);
};

const getOverallAvgLevel = (student: ProgressRow, level: 5 | 4): string | number => {
  const aspectKeys: AspectKey[] = ['kotoba', 'bunpou', 'choukai', 'kaiwa', 'kanji'];
  let total = 0, count = 0;
  aspectKeys.forEach(k => {
    const cols = aspectsConfig[k].columns.filter(c => c.nLevel === level).map(c => c.key);
    const scores = student[k] as AspectScores;
    cols.forEach(colKey => {
      const score = scores[colKey];
      if (score !== null && score !== '-') {
        const num = typeof score === 'string' ? parseInt(score) : score;
        if (!isNaN(num)) { total += num; count++; }
      }
    });
  });
  return count === 0 ? '-' : Math.round(total / count);
};

const getGlobalAvg = (student: ProgressRow, n5Only: boolean): string | number => {
  let total = 0, count = 0;
  const n5 = getOverallAvgLevel(student, 5);
  if (n5 !== '-') { total += n5 as number; count++; }
  if (!n5Only) {
    const n4 = getOverallAvgLevel(student, 4);
    if (n4 !== '-') { total += n4 as number; count++; }
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

// All black/white — no color coding
const scoreColor = (_v: string | number) => '#000';

const translateStatus = (s: string) => s === 'Lulus' ? 'Passed' : s === 'Remedial' ? 'Failed' : 'Pending';

const getCurrentDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`;
};

// ─── Preview Card Component (renders actual JSX so it's WYSIWYG) ─
function StudentPagePreview({ student, n5Only }: { student: ProgressRow; n5Only: boolean }) {
  const aspectKeys: AspectKey[] = ['kotoba', 'bunpou', 'choukai', 'kaiwa', 'kanji'];
  const aspectLabels: Record<AspectKey, { ja: string; en: string }> = {
    kotoba: { ja: '言葉', en: 'Kotoba' },
    bunpou: { ja: '文法', en: 'Bunpou' },
    choukai: { ja: '聴解', en: 'Choukai' },
    kaiwa: { ja: '会話', en: 'Kaiwa' },
    kanji: { ja: '漢字', en: 'Kanji' },
    kepribadian: { ja: '性格', en: 'Personality' },
  };

  const n5Avg = getOverallAvgLevel(student, 5);
  const n4Avg = getOverallAvgLevel(student, 4);
  const globalAvg = getGlobalAvg(student, n5Only);
  const progressColor = '#000';
  const n5StatusColor = '#000';
  const n4StatusColor = '#000';

  const cellStyle = {
    border: '1px solid #000',
    padding: '6px',
    fontWeight: 600,
  } as React.CSSProperties;

  const labelCellStyle = {
    ...cellStyle,
    textAlign: 'left' as const,
    paddingLeft: '8px',
    fontWeight: 700,
    background: '#f3f4f6',
  };

  return (
    <div
      className="report-page"
      style={{
        width: '210mm',
        height: '297mm',
        padding: '12mm 15mm',
        boxSizing: 'border-box',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Noto Sans JP', 'Meiryo', 'MS Gothic', sans-serif",
        color: '#000',
        pageBreakAfter: 'always',
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '0.2em', borderBottom: '2.5px solid #000', paddingBottom: 6, display: 'inline-block', padding: '0 40px 6px' }}>
          成績表
        </div>
        <div style={{ fontSize: 9, marginTop: 4, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'serif' }}>
          Progress Report
        </div>
      </div>

      {/* ── Student Info ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2.5px solid #000', paddingBottom: 10, marginBottom: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: 12 }}>
            <span style={{ width: 90, fontWeight: 700 }}>学生番号<br /><span style={{ fontSize: 9, fontWeight: 400 }}>Student ID</span></span>
            <span style={{ fontSize: 13, fontWeight: 700, borderBottom: '1px dashed #000', minWidth: 150, display: 'inline-block', padding: '0 8px' }}>{student.no_peserta}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: 12 }}>
            <span style={{ width: 90, fontWeight: 700 }}>氏名<br /><span style={{ fontSize: 9, fontWeight: 400 }}>Name</span></span>
            <span style={{ fontSize: 13, fontWeight: 700, borderBottom: '1px dashed #000', minWidth: 250, display: 'inline-block', padding: '0 8px', textTransform: 'uppercase' }}>{student.nama_lengkap}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: 12 }}>
          <span style={{ fontWeight: 700, marginRight: 10 }}>クラス<br /><span style={{ fontSize: 9, fontWeight: 400 }}>Class</span></span>
          <span style={{ fontSize: 13, fontWeight: 700, borderBottom: '1px dashed #000', minWidth: 120, display: 'inline-block', textAlign: 'center', padding: '0 8px' }}>{student.kelas || '-'}</span>
        </div>
      </div>

      {/* ── Scores + Right Column ── */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>

        {/* Aspect table */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, borderLeft: '4px solid #000', paddingLeft: 8 }}>
            各科目の平均点 <span style={{ fontSize: 9, fontWeight: 400 }}>(Average Scores by Subject)</span>
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', fontSize: 12, textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ ...cellStyle, textAlign: 'left', paddingLeft: 8, background: '#f3f4f6', width: n5Only ? '40%' : '30%' }}>
                  科目 <span style={{ fontSize: 9, fontWeight: 400 }}>(Subject)</span>
                </th>
                <th style={{ ...cellStyle, width: n5Only ? '60%' : '35%' }}>N5<br /><span style={{ fontSize: 9, fontWeight: 400 }}>Bab 1-25</span></th>
                {!n5Only && <th style={{ ...cellStyle, width: '35%' }}>N4<br /><span style={{ fontSize: 9, fontWeight: 400 }}>Bab 26-50</span></th>}
              </tr>
            </thead>
            <tbody>
              {aspectKeys.map(k => {
                const n5v = getAspectAvgLevel(k, student, 5);
                const n4v = getAspectAvgLevel(k, student, 4);
                return (
                  <tr key={k}>
                    <td style={labelCellStyle}>
                      {aspectLabels[k].ja} <span style={{ fontSize: 10, fontWeight: 400 }}>({aspectLabels[k].en})</span>
                    </td>
                    <td style={{ ...cellStyle, color: scoreColor(n5v) }}>{n5v}</td>
                    {!n5Only && <td style={{ ...cellStyle, color: scoreColor(n4v) }}>{n4v}</td>}
                  </tr>
                );
              })}
              <tr style={{ background: '#f9fafb' }}>
                <td style={{ ...labelCellStyle, background: '#f9fafb' }}>
                  平均 <span style={{ fontSize: 10, fontWeight: 400 }}>(Average)</span>
                </td>
                <td style={{ ...cellStyle, fontWeight: 800, fontSize: 14, color: scoreColor(n5Avg) }}>{n5Avg}</td>
                {!n5Only && <td style={{ ...cellStyle, fontWeight: 800, fontSize: 14, color: scoreColor(n4Avg) }}>{n4Avg}</td>}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ width: '38%', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Global avg */}
          <div style={{ border: '2px solid #000', padding: 12, textAlign: 'center', background: '#f9fafb' }}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>総合平均点 <span style={{ fontSize: 9, fontWeight: 400 }}>(Global Average)</span></div>
            <div style={{ fontSize: 36, fontWeight: 900, color: scoreColor(globalAvg) }}>{globalAvg}</div>
          </div>

          {/* Progress bar */}
          <div style={{ border: '2px solid #000', padding: 10, background: '#f9fafb' }}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8 }}>進捗 <span style={{ fontSize: 9, fontWeight: 400 }}>(Progress)</span></div>
            <div style={{ background: '#e5e7eb', borderRadius: 999, height: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${getGlobalProgress(student)}%`, background: progressColor, borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: progressColor }}>{getGlobalProgress(student)}%</div>
          </div>

          {/* Exam table */}
          <div>
            <h2 style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, borderLeft: '4px solid #000', paddingLeft: 8 }}>
              試験結果 <span style={{ fontSize: 9, fontWeight: 400 }}>(Exams)</span>
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', fontSize: 12, textAlign: 'center' }}>
              <tbody>
                <tr>
                  <td style={labelCellStyle}>N5 模擬 <span style={{ fontSize: 9, fontWeight: 400 }}>(Mock)</span></td>
                  <td style={cellStyle}>
                    {student.ujian_n5_score ?? '-'}
                    <div style={{ fontSize: 9, fontWeight: 400, color: n5StatusColor }}>({translateStatus(student.ujian_n5)})</div>
                  </td>
                </tr>
                {!n5Only && (
                  <tr>
                    <td style={labelCellStyle}>N4 模擬 <span style={{ fontSize: 9, fontWeight: 400 }}>(Mock)</span></td>
                    <td style={cellStyle}>
                      {student.ujian_n4_score ?? '-'}
                      <div style={{ fontSize: 9, fontWeight: 400, color: n4StatusColor }}>({translateStatus(student.ujian_n4)})</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Remarks ── */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, borderLeft: '4px solid #000', paddingLeft: 8 }}>
          備考 <span style={{ fontSize: 9, fontWeight: 400 }}>(Remarks)</span>
        </h2>
        <div style={{ border: '2px solid #000', padding: 14, minHeight: 90, fontSize: 12, lineHeight: 1.6, background: '#fafafa' }}>
          {student.keterangan || '-'}
        </div>
      </div>

      {/* ── Signature ── */}
      <div style={{ position: 'absolute', bottom: '15mm', right: '15mm', width: 140, textAlign: 'center' }}>
        <div style={{ fontSize: 10, marginBottom: 8, fontWeight: 600 }}>{getCurrentDateStr()}</div>
        <div style={{ borderBottom: '1px solid #000', paddingBottom: 40, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>教師</span><br />
          <span style={{ fontSize: 9 }}>Teacher</span>
        </div>
        <div style={{ fontSize: 9 }}>........................</div>
      </div>

      {/* ── Footer ── */}
      <div style={{ position: 'absolute', bottom: '8mm', left: '15mm', fontSize: 8, color: '#999', letterSpacing: '0.1em' }}>
        LMS Hana — Laporan Progress Belajar
      </div>
    </div>
  );
}

// ─── Build print HTML (blob) ──────────────────────────────────────
// All black/white for print
const scoreColorHex = (_v: string | number) => '#000';

const buildStudentPageHtml = (student: ProgressRow, n5Only: boolean): string => {
  const aspectKeys: AspectKey[] = ['kotoba', 'bunpou', 'choukai', 'kaiwa', 'kanji'];
  const aspectLabels: Record<AspectKey, string> = {
    kotoba: '言葉 <span style="font-size:10px;font-weight:normal">(Kotoba)</span>',
    bunpou: '文法 <span style="font-size:10px;font-weight:normal">(Bunpou)</span>',
    choukai: '聴解 <span style="font-size:10px;font-weight:normal">(Choukai)</span>',
    kaiwa: '会話 <span style="font-size:10px;font-weight:normal">(Kaiwa)</span>',
    kanji: '漢字 <span style="font-size:10px;font-weight:normal">(Kanji)</span>',
    kepribadian: '性格 <span style="font-size:10px;font-weight:normal">(Personality)</span>',
  };
  const n5Avg = getOverallAvgLevel(student, 5);
  const n4Avg = getOverallAvgLevel(student, 4);
  const globalAvg = getGlobalAvg(student, n5Only);
  const progressColor = '#000';
  const n5StatusColor = '#000';
  const n4StatusColor = '#000';

  const aspectRows = aspectKeys.map(k => {
    const n5v = getAspectAvgLevel(k, student, 5);
    const n4v = getAspectAvgLevel(k, student, 4);
    return `
      <tr>
        <td style="border:1px solid #000;padding:6px 8px;font-weight:700;text-align:left;background:#f3f4f6">${aspectLabels[k]}</td>
        <td style="border:1px solid #000;padding:6px;font-weight:600;color:${scoreColorHex(n5v)}">${n5v}</td>
        ${!n5Only ? `<td style="border:1px solid #000;padding:6px;font-weight:600;color:${scoreColorHex(n4v)}">${n4v}</td>` : ''}
      </tr>`;
  }).join('');

  return `
    <div style="width:210mm;height:297mm;padding:12mm 15mm;box-sizing:border-box;background:white;page-break-after:always;position:relative;overflow:hidden;font-family:'Noto Sans JP','Meiryo','MS Gothic',sans-serif;color:#000">
      <div style="text-align:center;margin-bottom:18px">
        <div style="font-size:26px;font-weight:900;letter-spacing:0.2em;border-bottom:2.5px solid #000;padding:0 40px 6px;display:inline-block">成績表</div>
        <div style="font-size:9px;margin-top:4px;letter-spacing:0.3em;text-transform:uppercase;font-family:serif">Progress Report</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2.5px solid #000;padding-bottom:10px;margin-bottom:18px">
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:flex-end;font-size:12px">
            <span style="width:90px;font-weight:700">学生番号<br><span style="font-size:9px;font-weight:400">Student ID</span></span>
            <span style="font-size:13px;font-weight:700;border-bottom:1px dashed #000;min-width:150px;display:inline-block;padding:0 8px">${student.no_peserta}</span>
          </div>
          <div style="display:flex;align-items:flex-end;font-size:12px">
            <span style="width:90px;font-weight:700">氏名<br><span style="font-size:9px;font-weight:400">Name</span></span>
            <span style="font-size:13px;font-weight:700;border-bottom:1px dashed #000;min-width:250px;display:inline-block;padding:0 8px;text-transform:uppercase">${student.nama_lengkap}</span>
          </div>
        </div>
        <div style="display:flex;align-items:flex-end;font-size:12px">
          <span style="font-weight:700;margin-right:10px">クラス<br><span style="font-size:9px;font-weight:400">Class</span></span>
          <span style="font-size:13px;font-weight:700;border-bottom:1px dashed #000;min-width:120px;display:inline-block;text-align:center;padding:0 8px">${student.kelas || '-'}</span>
        </div>
      </div>
      <div style="display:flex;gap:18px;margin-bottom:18px">
        <div style="flex:1">
          <h2 style="font-size:11px;font-weight:700;margin-bottom:8px;border-left:4px solid #000;padding-left:8px">各科目の平均点 <span style="font-size:9px;font-weight:400">(Average Scores by Subject)</span></h2>
          <table style="width:100%;border-collapse:collapse;border:2px solid #000;font-size:12px;text-align:center">
            <thead>
              <tr style="background:#f3f4f6">
                <th style="border:1px solid #000;padding:6px 8px;text-align:left;${n5Only ? 'width:40%' : 'width:30%'}">科目 <span style="font-size:9px;font-weight:400">(Subject)</span></th>
                <th style="border:1px solid #000;padding:6px;${n5Only ? 'width:60%' : 'width:35%'}">N5<br><span style="font-size:9px;font-weight:400">Bab 1-25</span></th>
                ${!n5Only ? `<th style="border:1px solid #000;padding:6px;width:35%">N4<br><span style="font-size:9px;font-weight:400">Bab 26-50</span></th>` : ''}
              </tr>
            </thead>
            <tbody>
              ${aspectRows}
              <tr style="background:#f9fafb">
                <td style="border:1px solid #000;padding:6px 8px;font-weight:700;text-align:left;background:#f9fafb">平均 <span style="font-size:9px;font-weight:400">(Average)</span></td>
                <td style="border:1px solid #000;padding:6px;font-weight:800;font-size:14px;color:${scoreColorHex(n5Avg)}">${n5Avg}</td>
                ${!n5Only ? `<td style="border:1px solid #000;padding:6px;font-weight:800;font-size:14px;color:${scoreColorHex(n4Avg)}">${n4Avg}</td>` : ''}
              </tr>
            </tbody>
          </table>
        </div>
        <div style="width:38%;display:flex;flex-direction:column;gap:16px">
          <div style="border:2px solid #000;padding:12px;text-align:center;background:#f9fafb">
            <div style="font-size:10px;font-weight:700;margin-bottom:4px">総合平均点 <span style="font-size:9px;font-weight:400">(Global Average)</span></div>
            <div style="font-size:36px;font-weight:900;color:${scoreColorHex(globalAvg)}">${globalAvg}</div>
          </div>
          <div style="border:2px solid #000;padding:10px;background:#f9fafb">
            <div style="font-size:10px;font-weight:700;margin-bottom:8px">進捗 <span style="font-size:9px;font-weight:400">(Progress)</span></div>
            <div style="background:#e5e7eb;border-radius:999px;height:12px;overflow:hidden">
              <div style="height:100%;width:${getGlobalProgress(student)}%;background:${progressColor};border-radius:999px"></div>
            </div>
            <div style="font-size:11px;font-weight:700;margin-top:4px;color:${progressColor}">${getGlobalProgress(student)}%</div>
          </div>
          <div>
            <h2 style="font-size:11px;font-weight:700;margin-bottom:8px;border-left:4px solid #000;padding-left:8px">試験結果 <span style="font-size:9px;font-weight:400">(Exams)</span></h2>
            <table style="width:100%;border-collapse:collapse;border:2px solid #000;font-size:12px;text-align:center">
              <tbody>
                <tr>
                  <td style="border:1px solid #000;padding:6px 8px;font-weight:700;text-align:left;background:#f3f4f6">N5 模擬 <span style="font-size:9px;font-weight:400">(Mock)</span></td>
                  <td style="border:1px solid #000;padding:6px;font-weight:600">
                    ${student.ujian_n5_score ?? '-'}
                    <div style="font-size:9px;color:${n5StatusColor}">(${translateStatus(student.ujian_n5)})</div>
                  </td>
                </tr>
                ${!n5Only ? `
                <tr>
                  <td style="border:1px solid #000;padding:6px 8px;font-weight:700;text-align:left;background:#f3f4f6">N4 模擬 <span style="font-size:9px;font-weight:400">(Mock)</span></td>
                  <td style="border:1px solid #000;padding:6px;font-weight:600">
                    ${student.ujian_n4_score ?? '-'}
                    <div style="font-size:9px;color:${n4StatusColor}">(${translateStatus(student.ujian_n4)})</div>
                  </td>
                </tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div style="margin-bottom:18px">
        <h2 style="font-size:11px;font-weight:700;margin-bottom:8px;border-left:4px solid #000;padding-left:8px">備考 <span style="font-size:9px;font-weight:400">(Remarks)</span></h2>
        <div style="border:2px solid #000;padding:14px;min-height:90px;font-size:12px;line-height:1.6;background:#fafafa">${student.keterangan || '-'}</div>
      </div>
      <div style="position:absolute;bottom:15mm;right:15mm;width:140px;text-align:center">
        <div style="font-size:10px;margin-bottom:8px;font-weight:600">${getCurrentDateStr()}</div>
        <div style="border-bottom:1px solid #000;padding-bottom:40px;margin-bottom:6px">
          <span style="font-size:11px;font-weight:700">教師</span><br>
          <span style="font-size:9px">Teacher</span>
        </div>
        <div style="font-size:9px">........................</div>
      </div>
      <div style="position:absolute;bottom:8mm;left:15mm;font-size:8px;color:#999;letter-spacing:0.1em">LMS Hana — Laporan Progress Belajar</div>
    </div>`;
};

// ─── Main Component ───────────────────────────────────────────────
export default function PrintTableModal({ rows, onClose }: PrintTableModalProps) {
  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [exportTarget, setExportTarget] = useState('Semua');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(rows.map(r => r.no_peserta)));
  const [n5Only, setN5Only] = useState(false);

  const uniqueClasses = Array.from(new Set(rows.map(r => r.kelas).filter(Boolean)));

  const studentsInTarget = useMemo(() => {
    if (exportTarget === 'Semua') return rows;
    return rows.filter(r => r.kelas === exportTarget);
  }, [rows, exportTarget]);

  const targetRows = useMemo(() => {
    return studentsInTarget.filter(r => selectedIds.has(r.no_peserta));
  }, [studentsInTarget, selectedIds]);

  const toggleStudent = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === studentsInTarget.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(studentsInTarget.map(s => s.no_peserta)));
    }
  };

  const handleClassChange = (cls: string) => {
    setExportTarget(cls);
    const filtered = cls === 'Semua' ? rows : rows.filter(r => r.kelas === cls);
    setSelectedIds(new Set(filtered.map(s => s.no_peserta)));
  };

  const handlePreview = () => {
    if (targetRows.length === 0) {
      alert('Pilih minimal 1 siswa untuk dicetak.');
      return;
    }
    setStep('preview');
  };

  // Open blob window and auto-print
  const handlePrint = () => {
    const pagesHtml = targetRows.map(s => buildStudentPageHtml(s, n5Only)).join('');
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Laporan Progress Belajar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; margin: 0; padding: 0; background: #fff;
      font-family: 'Noto Sans JP', 'Meiryo', 'MS Gothic', sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media screen {
      body { background: #e5e7eb; padding: 20px 0; display: flex; flex-direction: column; align-items: center; gap: 24px; }
    }
    @media print { html, body { width: 210mm; background: white; padding: 0; } }
  </style>
</head>
<body>${pagesHtml}</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');

    if (!printWindow) {
      alert('Popup diblokir browser. Izinkan popup untuk localhost lalu coba lagi.');
      URL.revokeObjectURL(blobUrl);
      return;
    }

    printWindow.addEventListener('load', () => {
      const doc = printWindow.document;
      const triggerPrint = () => setTimeout(() => { printWindow.focus(); printWindow.print(); }, 400);
      if (doc.fonts && doc.fonts.ready) {
        doc.fonts.ready.then(triggerPrint);
      } else {
        setTimeout(triggerPrint, 1500);
      }
    });

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  };

  // ── PREVIEW STEP ── (fullscreen, like NafudaPrintPreviewModal)
  if (step === 'preview') {
    return createPortal(
      <div className="fixed inset-0 z-[200] bg-white flex flex-col">
        {/* Topbar */}
        <div className="bg-white px-6 py-3 flex items-center justify-between border-b shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('select')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
            <div>
              <h2 className="text-base font-bold text-gray-900">Preview Laporan Progress</h2>
              <p className="text-xs text-gray-500">
                {targetRows.length} Siswa · {targetRows.length} Halaman A4 · {n5Only ? 'Mode N5' : 'Mode N5+N4'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              <Printer size={16} />
              Print Sekarang
            </button>
          </div>
        </div>

        {/* Page indicator strip */}
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-2 flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500 font-mono">
            {targetRows.length} halaman · Kertas A4 Portrait · Skala 70%
          </span>
          <div className="flex gap-1 ml-auto">
            {targetRows.map((s, i) => (
              <button
                key={s.no_peserta}
                onClick={() => {
                  document.getElementById(`preview-page-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="w-6 h-6 text-[10px] rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-800 hover:text-white transition-colors font-mono"
                title={s.nama_lengkap}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable preview area */}
        <div className="flex-1 overflow-auto bg-gray-100 px-8 py-8 flex flex-col items-center gap-8">
          {targetRows.map((student, i) => (
            <div key={student.no_peserta} id={`preview-page-${i}`} className="relative">
              {/* Page label */}
              <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono flex items-center gap-2">
                <span className="border border-gray-300 bg-white text-gray-600 px-2 py-0.5 rounded text-[10px]">
                  Hal. {i + 1} / {targetRows.length}
                </span>
                <span className="text-gray-400">{student.nama_lengkap}</span>
              </div>

              {/* A4 page container — scaled to ~70% for screen viewing */}
              <div
                className="shadow-md ring-1 ring-gray-300"
                style={{
                  transform: 'scale(0.7)',
                  transformOrigin: 'top center',
                  // compensate for scaling so pages don't overlap
                  marginBottom: '-89mm',
                }}
              >
                <StudentPagePreview student={student} n5Only={n5Only} />
              </div>
            </div>
          ))}
          {/* Bottom spacer after last scaled page */}
          <div style={{ height: '40px' }} />
        </div>

      </div>,
      document.body
    );
  }

  // ── SELECT STEP ──
  return createPortal(
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Printer size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Print Laporan Progress A4</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-gray-50/50 overflow-y-auto flex-1">

          {/* Class Filter */}
          <label className="block">
            <span className="text-sm font-semibold tracking-wide text-gray-700">Filter Berdasarkan Kelas</span>
            <select
              value={exportTarget}
              onChange={(e) => handleClassChange(e.target.value)}
              className="mt-2 w-full border border-gray-300 rounded-md bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="Semua">Semua Kelas ({rows.length} Siswa)</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>Kelas: {c}</option>
              ))}
            </select>
          </label>

          {/* Student list */}
          <div className="border border-gray-200 rounded-md bg-white shadow-sm flex flex-col h-[240px]">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
              <span className="text-sm font-semibold text-gray-700">
                Pilih Siswa ({selectedIds.size}/{studentsInTarget.length})
              </span>
              <button
                onClick={toggleAll}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md transition-colors"
              >
                {selectedIds.size === studentsInTarget.length
                  ? <><CheckSquare size={14} /> Deselect All</>
                  : <><Square size={14} /> Select All</>}
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
                      checked={selectedIds.has(s.no_peserta)}
                      onChange={() => toggleStudent(s.no_peserta)}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">{s.nama_lengkap}</span>
                      <span className="text-xs text-gray-500">{s.no_peserta} · {s.kelas || 'Tanpa Kelas'}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* N5 Only toggle */}
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

          {/* Info */}
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-3 text-sm text-emerald-800 leading-relaxed">
            <Info className="shrink-0 mt-0.5" size={18} />
            <div>
              Klik <strong>Preview</strong> untuk melihat tampilan cetak terlebih dahulu, lalu klik <strong>Print Sekarang</strong> setelah memastikan sudah benar.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handlePreview}
            disabled={targetRows.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Eye size={16} />
            Preview ({targetRows.length} Siswa)
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
