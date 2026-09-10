import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteAdminModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export default function DeleteAdminModal({ onClose, onConfirm, isSubmitting = false }: DeleteAdminModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={isSubmitting ? undefined : onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex justify-end pt-4 pr-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hapus Akun Admin</h3>
          <p className="text-sm text-gray-500 mb-6">
            Apakah Anda yakin ingin menghapus akun admin ini secara permanen? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSubmitting ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
