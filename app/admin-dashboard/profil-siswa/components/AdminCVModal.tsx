'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer } from 'lucide-react';
import CVTemplate from '../../../student-dashboard/cv-form/components/CVTemplate';
import { exportCVToPDF } from '../../../student-dashboard/cv-form/exportPdf';
import { StudentEditData } from './StudentEditModal';
import { mapStudentToCVData } from './mapStudentToCVData';
import CvMensetsuControls, { resolveInterviewNumber } from './CvMensetsuControls';

interface AdminCVModalProps {
  student: StudentEditData | null;
  onClose: () => void;
}

export default function AdminCVModal({ student, onClose }: AdminCVModalProps) {
  const [useMensetsu, setUseMensetsu] = useState(false);
  const [interviewNumber, setInterviewNumber] = useState('');

  if (!student) return null;

  const cvData = mapStudentToCVData(student);
  const mensetsuNo = resolveInterviewNumber(useMensetsu, interviewNumber);

  const handlePrint = () => {
    exportCVToPDF('admin-cv-preview', `CV_${student.nama_lengkap.replace(/\s+/g, '_')}_${student.no_peserta}.pdf`);
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl bg-gray-100 border border-gray-300 shadow-2xl flex flex-col max-h-[95vh] rounded-lg overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 min-w-0">
            <h2 className="text-base sm:text-lg font-serif font-semibold text-gray-800 truncate">
              Preview CV: {student.nama_lengkap}
            </h2>
            <CvMensetsuControls
              useMensetsu={useMensetsu}
              onUseMensetsuChange={setUseMensetsu}
              interviewNumber={interviewNumber}
              onInterviewNumberChange={setInterviewNumber}
            />
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Printer size={16} />
              Export PDF
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 sm:p-8 flex-1 flex justify-center bg-gray-200">
          <div className="shadow-lg bg-white max-w-full overflow-x-auto">
            <div id="admin-cv-preview">
              <CVTemplate data={cvData} interviewNumber={mensetsuNo} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
