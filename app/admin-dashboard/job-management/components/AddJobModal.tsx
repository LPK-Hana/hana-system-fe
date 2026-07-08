import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface AddJobModalProps {
  onClose: () => void;
  onSave: (job: { title: string; description: string; deadlineDokumen: string; tanggalMansetsu: string; kuota: number | null }) => void;
  isSubmitting?: boolean;
}

export default function AddJobModal({ onClose, onSave, isSubmitting = false }: AddJobModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadlineDokumen, setDeadlineDokumen] = useState('');
  const [tanggalMansetsu, setTanggalMansetsu] = useState('');
  const [kuota, setKuota] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    onSave({
      title,
      description,
      deadlineDokumen,
      tanggalMansetsu,
      kuota: kuota ? parseInt(kuota, 10) : null,
    });
  };

  const isFormValid = title.trim() && description.trim() && deadlineDokumen && tanggalMansetsu && kuota.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-serif text-gray-900">Add New Job</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:bg-gray-100"
                placeholder="e.g. Pengolahan Makanan"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none disabled:bg-gray-100"
                placeholder="Brief description of the job..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="deadlineDokumen" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline Dokumen
                </label>
                <input
                  id="deadlineDokumen"
                  type="date"
                  value={deadlineDokumen}
                  onChange={(e) => setDeadlineDokumen(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="tanggalMansetsu" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mansetsu
                </label>
                <input
                  id="tanggalMansetsu"
                  type="date"
                  value={tanggalMansetsu}
                  onChange={(e) => setTanggalMansetsu(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="kuota" className="block text-sm font-medium text-gray-700 mb-1">
                Kuota (Berapa Orang)
              </label>
              <input
                id="kuota"
                type="text"
                value={kuota}
                onChange={(e) => setKuota(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:bg-gray-100"
                placeholder="0"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[110px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Create Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
