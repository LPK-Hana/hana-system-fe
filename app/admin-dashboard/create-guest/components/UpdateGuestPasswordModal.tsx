import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ApiGuest from '@/app/api/guest/api_guest';

type UpdateGuestPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  guestId: number;
  userName: string;
};

export default function UpdateGuestPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  guestId,
  userName,
}: UpdateGuestPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Password tidak boleh kosong.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Password dan Konfirmasi Password tidak sama.');
      return;
    }

    setIsSaving(true);
    try {
      const api = ApiGuest();
      const res = await api.putUpdateGuestPassword({
        guest_id: guestId,
        password: password.trim(),
      });

      if (res?.status === 200 || res?.status === 201) {
        toast.success(`Berhasil mengupdate password untuk: ${userName}`);
        onSuccess();
        onClose();
      } else {
        toast.error(res?.message || 'Gagal mengupdate password.');
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
            Ubah Password
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
              Username / NIM
            </label>
            <input
              type="text"
              value={userName}
              disabled
              className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed transition-colors text-sm font-mono"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 focus:outline-none focus:ring-0 focus:border-emerald-800 transition-colors text-sm font-mono"
                placeholder="Masukkan password baru..."
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center text-gray-400 hover:text-emerald-800 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-4 pr-12 py-3 border focus:outline-none focus:ring-0 transition-colors text-sm font-mono ${confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-emerald-800'}`}
                placeholder="Ulangi password..."
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center text-gray-400 hover:text-emerald-800 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[10px] text-red-500 mt-1.5 font-medium tracking-wide">
                ⚠️ Password tidak cocok.
              </p>
            )}
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
              disabled={isSaving || !password.trim() || (confirmPassword.length > 0 && password !== confirmPassword)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-900 border border-emerald-900 text-xs tracking-wider uppercase text-white hover:bg-emerald-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} strokeWidth={1.5} />
              {isSaving ? 'Menyimpan…' : 'Simpan Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
