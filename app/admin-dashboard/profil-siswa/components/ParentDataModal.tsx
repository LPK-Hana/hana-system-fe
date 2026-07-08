'use client';

import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { type StudentEditData } from './StudentEditModal';
import { hubunganToJapanese } from '@/lib/cv-hubungan';

interface ParentDataModalProps {
  studentName: string;
  keluarga?: StudentEditData['keluarga'];
  onClose: () => void;
}

export default function ParentDataModal({ studentName, keluarga, onClose }: ParentDataModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-[150] bg-black/45 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white border border-gray-200 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-serif text-gray-900">Data Orang Tua / Keluarga</h2>
            <p className="text-xs text-gray-500 mt-1">Siswa: {studentName}</p>
          </div>
          <button onClick={onClose} className="p-2 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {keluarga && keluarga.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 border-b border-gray-200">Hubungan</th>
                    <th className="px-4 py-3 border-b border-gray-200">Nama</th>
                    <th className="px-4 py-3 border-b border-gray-200">Status / Pekerjaan</th>
                  </tr>
                </thead>
                <tbody>
                  {keluarga.map((k, i) => (
                    <tr key={i} className="border-b last:border-b-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-gray-800">{hubunganToJapanese(k.hubungan || '')}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{k.nama || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{k.status_pekerjaan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Belum ada data orang tua/keluarga untuk siswa ini.
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-xs tracking-widest uppercase bg-emerald-700 text-white hover:bg-emerald-800 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
