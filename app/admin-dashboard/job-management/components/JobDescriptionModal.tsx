import { X } from 'lucide-react';

interface JobDescriptionModalProps {
  jobTitle: string;
  description: string;
  onClose: () => void;
}

export default function JobDescriptionModal({
  jobTitle,
  description,
  onClose,
}: JobDescriptionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[80vh] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-serif text-gray-900">Deskripsi Job</h2>
            <p className="text-sm text-gray-500 mt-1">
              Job: <span className="font-medium text-gray-900">{jobTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {description || <span className="italic text-gray-400">Tidak ada deskripsi.</span>}
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
