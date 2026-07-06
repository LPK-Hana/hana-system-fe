import { FileText, CreditCard, FileSpreadsheet, X } from 'lucide-react';

interface DownloadMenuModalProps {
  onClose: () => void;
  onSelectCV: () => void;
  onSelectNafuda: () => void;
  onSelectExcel: () => void;
}

export default function DownloadMenuModal({
  onClose,
  onSelectCV,
  onSelectNafuda,
  onSelectExcel,
}: DownloadMenuModalProps) {
  return (
    <div className="fixed inset-0 z-[150] bg-black/45 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-serif text-gray-900">Opsi Unduh</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              onSelectCV();
            }}
            className="flex items-center gap-3 p-3 hover:bg-emerald-50 text-left transition-colors border border-transparent hover:border-emerald-100 rounded-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Download CV</h3>
              <p className="text-xs text-gray-500">Pilih satu atau lebih siswa dan unduh CV dalam format PDF.</p>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectNafuda();
            }}
            className="flex items-center gap-3 p-3 hover:bg-purple-50 text-left transition-colors border border-transparent hover:border-purple-100 rounded-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Download Nafuda</h3>
              <p className="text-xs text-gray-500">Cetak name tag (Nafuda) siswa seukuran kartu Flazz.</p>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectExcel();
            }}
            className="flex items-center gap-3 p-3 hover:bg-emerald-50 text-left transition-colors border border-transparent hover:border-emerald-100 rounded-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Rekap Data Excel</h3>
              <p className="text-xs text-gray-500">Unduh seluruh data siswa dalam format Excel.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
