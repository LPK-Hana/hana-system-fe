'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye } from 'lucide-react';
import { buildFileUrl } from '@/lib/file-storage';
import FilePreviewModal from './FilePreviewModal';

interface PersonalDataModalProps {
  studentName: string;
  dokumen_ktp?: string | null;
  dokumen_kk?: string | null;
  dokumen_akte?: string | null;
  dokumen_ijazah?: string | null;
  onClose: () => void;
}

export default function PersonalDataModal({
  studentName,
  dokumen_ktp,
  dokumen_kk,
  dokumen_akte,
  dokumen_ijazah,
  onClose
}: PersonalDataModalProps) {
  const [filePreview, setFilePreview] = useState<{ title: string; filename: string; url: string } | null>(null);

  const files = [
    { name: 'KTP', file: dokumen_ktp, path: 'ktp' },
    { name: 'Kartu Keluarga (KK)', file: dokumen_kk, path: 'kk' },
    { name: 'Akte Kelahiran', file: dokumen_akte, path: 'akte_kelahiran' },
    { name: 'Ijazah', file: dokumen_ijazah, path: 'ijazah' },
  ];

  return createPortal(
    <>
      <div className="fixed inset-0 z-[150] bg-black/45 flex items-center justify-center p-4">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative z-10 w-full max-w-lg bg-white border border-gray-200 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-xl font-serif text-gray-900">File Data Diri</h2>
              <p className="text-xs text-gray-500 mt-1">Siswa: {studentName}</p>
            </div>
            <button onClick={onClose} className="p-2 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col gap-2">
              {files.map((item, index) => {
                const hasFile = item.file && item.file !== '-';
                return (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border border-gray-200 bg-slate-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-800 font-medium">
                        {item.name}
                      </span>
                    </div>
                    {hasFile ? (
                      <button
                        type="button"
                        onClick={() => setFilePreview({
                          title: item.name,
                          filename: item.file as string,
                          url: buildFileUrl(item.path, item.file as string),
                        })}
                        className="mt-2 sm:mt-0 ml-9 sm:ml-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-sm shrink-0"
                      >
                        <Eye size={14} /> Lihat File
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500 italic mt-2 sm:mt-0 ml-9 sm:ml-0">
                        Belum diunggah
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
            <button onClick={onClose} className="px-5 py-2.5 text-xs tracking-widest uppercase bg-emerald-700 text-white hover:bg-emerald-800 transition-colors">
              Tutup
            </button>
          </div>
        </div>
      </div>

      {filePreview && (
        <FilePreviewModal
          title={filePreview.title}
          filename={filePreview.filename}
          url={filePreview.url}
          onClose={() => setFilePreview(null)}
        />
      )}
    </>,
    document.body
  );
}
