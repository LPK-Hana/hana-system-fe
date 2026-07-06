import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ApiSuperAdmin from '@/app/api/super_admin/api_super_admin';

type EditAdminModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  initialName: string;
  userName: string;
};

export default function EditAdminModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  initialName,
  userName,
}: EditAdminModalProps) {
  const [name, setName] = useState('');
  const [editUserName, setEditUserName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setEditUserName(userName);
    }
  }, [isOpen, initialName, userName]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama Admin tidak boleh kosong.');
      return;
    }

    if (!editUserName.trim()) {
      toast.error('Username tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    try {
      const api = ApiSuperAdmin();
      const res = await api.putUpdateAdminName({
        user_id: userId,
        name: name.trim().toUpperCase(),
        user_name: editUserName.trim().toUpperCase(),
      });

      if (res?.status === 200 || res?.status === 201) {
        toast.success(`Berhasil mengupdate nama admin.`);
        onSuccess();
        onClose();
      } else {
        toast.error(res?.message || 'Gagal mengupdate nama admin.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold tracking-wide text-gray-800 uppercase">
            Edit Nama Admin
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6">
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Username Admin
            </label>
            <input
              type="text"
              value={editUserName}
              onChange={(e) => setEditUserName(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-0 focus:border-red-800 transition-colors text-sm font-mono placeholder:text-gray-400 uppercase"
              placeholder="Masukkan Username baru..."
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Nama Lengkap Admin
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-0 focus:border-red-800 transition-colors text-sm font-medium text-gray-900 placeholder:text-gray-400 uppercase"
              placeholder="Masukkan nama baru..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim() || !editUserName.trim() || (name === initialName && editUserName === userName)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-800 border border-red-800 text-xs tracking-wider uppercase text-white hover:bg-red-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} strokeWidth={1.5} />
              {isSaving ? 'Menyimpan…' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
