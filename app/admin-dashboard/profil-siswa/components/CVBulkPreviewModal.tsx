'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer } from 'lucide-react';
import CVTemplate from '../../../student-dashboard/cv-form/components/CVTemplate';
import { bulkExportCVToPDF } from '../../../student-dashboard/cv-form/exportPdf';
import { type StudentEditData } from './StudentEditModal';
import { mapStudentToCVData } from './mapStudentToCVData';
import CvMensetsuControls, { resolveInterviewNumber } from './CvMensetsuControls';

interface CVBulkPreviewModalProps {
  students: StudentEditData[];
  onClose: () => void;
}

export default function CVBulkPreviewModal({ students, onClose }: CVBulkPreviewModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [useMensetsu, setUseMensetsu] = useState(false);
  const [interviewNumber, setInterviewNumber] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName =
        students.length === 1
          ? `CV_${students[0].nama_lengkap.replace(/\s+/g, '_')}_${students[0].no_peserta}.pdf`
          : `CV_Bulk_${students.length}_siswa_${dateStr}.pdf`;

      await bulkExportCVToPDF(
        students.map((s, i) => ({
          elementId: `cv-bulk-${i}`,
          title: `${s.no_peserta} - ${s.nama_lengkap}`,
        })),
        fileName,
      );
    } finally {
      setIsExporting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl bg-gray-100 border border-gray-300 shadow-2xl flex flex-col max-h-[95vh] rounded-lg overflow-hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex flex-col gap-3 min-w-0">
            <div>
              <h2 className="text-base sm:text-lg font-serif font-semibold text-gray-800">
                Preview CV ({students.length} siswa)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Semua CV digabung dalam satu file PDF saat diexport.
              </p>
            </div>
            <CvMensetsuControls
              useMensetsu={useMensetsu}
              onUseMensetsuChange={setUseMensetsu}
              interviewNumber={interviewNumber}
              onInterviewNumberChange={setInterviewNumber}
              bulkHint={students.length > 1}
            />
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60"
            >
              <Printer size={16} />
              {isExporting ? 'Menyiapkan PDF...' : `Export PDF (${students.length})`}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 sm:p-8 flex-1 flex flex-col items-center gap-10 bg-gray-200">
          {students.map((student, i) => (
            <div key={student.id} className="w-full max-w-[794px]">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                {i + 1}. {student.no_peserta} — {student.nama_lengkap}
                {useMensetsu && resolveInterviewNumber(useMensetsu, interviewNumber, i) && (
                  <span className="ml-2 text-emerald-700 normal-case">
                    (No. {resolveInterviewNumber(useMensetsu, interviewNumber, i)}番)
                  </span>
                )}
              </p>
              <div className="shadow-lg bg-white max-w-full overflow-x-auto">
                <div id={`cv-bulk-${i}`}>
                  <CVTemplate
                    data={mapStudentToCVData(student)}
                    interviewNumber={resolveInterviewNumber(useMensetsu, interviewNumber, i)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
