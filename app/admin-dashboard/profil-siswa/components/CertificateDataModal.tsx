'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye } from 'lucide-react';
import { buildFileUrl } from '@/lib/file-storage';
import FilePreviewModal from './FilePreviewModal';

interface CvSertifikat {
  nama_sertifikat?: string | null;
  status_kelulusan?: number | null;
  score?: string | null;
  bulan_diperoleh?: string | null;
  tahun_diperoleh?: string | null;
  sertifikat?: string | null;
}

interface CertificateDataModalProps {
  studentName: string;
  sertifikat: CvSertifikat[];
  onClose: () => void;
}

export default function CertificateDataModal({ studentName, sertifikat, onClose }: CertificateDataModalProps) {
  const [filePreview, setFilePreview] = useState<{ title: string; filename: string; url: string } | null>(null);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[150] bg-black/45 flex items-center justify-center p-4">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative z-10 w-full max-w-lg bg-white border border-gray-200 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-xl font-serif text-gray-900">Sertifikat Dimiliki</h2>
              <p className="text-xs text-gray-500 mt-1">Siswa: {studentName}</p>
            </div>
            <button onClick={onClose} className="p-2 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {sertifikat && sertifikat.length > 0 ? (
              <div className="flex flex-col gap-2">
                {sertifikat.map((cert, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border border-gray-200 bg-slate-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-800 font-medium">
                        {cert.nama_sertifikat || 'Tanpa Nama'} {cert.score ? `(Score: ${cert.score})` : ''}
                      </span>
                    </div>
                    {cert.sertifikat && (
                      <button
                        type="button"
                        onClick={() => setFilePreview({
                          title: cert.nama_sertifikat || 'Sertifikat',
                          filename: cert.sertifikat!,
                          url: buildFileUrl('sertifikat', cert.sertifikat!),
                        })}
                        className="mt-2 sm:mt-0 ml-9 sm:ml-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-sm shrink-0"
                      >
                        <Eye size={14} /> Lihat File
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Belum ada sertifikat yang dimiliki oleh siswa ini.
              </div>
            )}
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
