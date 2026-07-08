'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ApiAuth from '@/app/api/auth/api_auth';
import ApiUser from '@/app/api/user/api_user';
import {
  getAuthUserId,
  getAuthUserName,
  saveAuthSession,
} from '@/lib/auth';

export default function StudentChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordMismatch = Boolean(
    newPassword && confirmPassword && newPassword !== confirmPassword,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const idUser = getAuthUserId();
    const userName = getAuthUserName().trim();

    if (!idUser || !userName) {
      toast.error('Sesi tidak lengkap. Silakan keluar lalu login kembali.');
      return;
    }

    if (!currentPassword.trim()) {
      toast.error('Masukkan password saat ini.');
      return;
    }
    if (!newPassword) {
      toast.error('Masukkan password baru.');
      return;
    }
    if (passwordMismatch) {
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter.');
      return;
    }
    if (currentPassword === newPassword) {
      toast.error('Password baru harus berbeda dari password saat ini.');
      return;
    }

    setSubmitting(true);
    try {
      const loginRes = await ApiAuth().postLogin({
        user_name: userName,
        user_password: currentPassword,
      });
      if (loginRes?.status !== 200 || !loginRes?.token) {
        toast.error(
          'Password Anda salah. Silakan masukkan password saat ini yang benar, lalu coba lagi.',
        );
        return;
      }

      const cred = loginRes.credentials as {
        user_id?: number;
        user_name?: string;
        name?: string;
        is_admin?: number;
      } | undefined;
      const role = Number(cred?.is_admin ?? 0);
      const nextUserName = (cred?.user_name || userName).trim();
      const nextUserId =
        typeof cred?.user_id === 'number' && cred.user_id > 0 ? cred.user_id : idUser;
      const nextName =
        typeof cred?.name === 'string' && cred.name.trim() ? cred.name.trim() : undefined;
      saveAuthSession(loginRes.token, role, nextUserName, {
        userId: nextUserId,
        name: nextName,
      });

      const updateRes = await ApiUser().putUpdateUserSelfPassword({
        user_password: newPassword,
      });

      if (updateRes?.status === 200) {
        toast.success(updateRes?.message || 'Password berhasil diperbarui.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(updateRes?.message || 'Gagal memperbarui password.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7F4] font-sans text-gray-800 p-6 md:p-12 relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%230047AB' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <Link
          href="/student-dashboard"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-emerald-900/70 hover:text-emerald-900 mb-8"
        >
          <ArrowLeft size={14} />
          Kembali ke dashboard
        </Link>

        <header className="flex items-start gap-4 mb-10 pb-8 border-b border-gray-200/50">
          <div className="w-14 h-14 border border-emerald-900/20 flex items-center justify-center text-emerald-900 bg-white shrink-0">
            <KeyRound size={26} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-serif text-gray-900 tracking-wide">Ganti password</h1>
            <p className="text-sm font-light text-gray-500 mt-2 tracking-wide">
              Perbarui password akun siswa Anda. Password saat ini dicek lewat login sebelum disimpan.
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200/60 p-8 md:p-10 shadow-sm space-y-8"
        >
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
              Password saat ini <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-none pl-4 pr-11 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-900/25 focus:border-emerald-900/40 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-gray-800"
                aria-label={
                  showCurrentPassword ? 'Sembunyikan password saat ini' : 'Tampilkan password saat ini'
                }
              >
                {showCurrentPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password baru <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full border rounded-none pl-4 pr-11 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 transition ${
                    passwordMismatch
                      ? 'border-red-300 focus:ring-red-400/40 focus:border-red-400'
                      : 'border-gray-200 focus:ring-emerald-900/25 focus:border-emerald-900/40'
                  }`}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-gray-800"
                  aria-label={showNewPassword ? 'Sembunyikan password baru' : 'Tampilkan password baru'}
                >
                  {showNewPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Verifikasi password baru <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border rounded-none pl-4 pr-11 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 transition ${
                    passwordMismatch
                      ? 'border-red-300 focus:ring-red-400/40 focus:border-red-400'
                      : 'border-gray-200 focus:ring-emerald-900/25 focus:border-emerald-900/40'
                  }`}
                  placeholder="Ulangi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-gray-800"
                  aria-label={
                    showConfirmPassword ? 'Sembunyikan verifikasi password' : 'Tampilkan verifikasi password'
                  }
                >
                  {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                </button>
              </div>
              {passwordMismatch ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  Password yang anda masukkan tidak sesuai
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting || passwordMismatch}
              className="px-8 py-3 text-xs tracking-[0.2em] uppercase font-semibold text-white bg-emerald-900 hover:bg-emerald-950 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-300"
            >
              {submitting ? 'Memproses…' : 'Simpan password baru'}
            </button>
            <Link
              href="/student-dashboard"
              className="inline-flex items-center justify-center px-8 py-3 text-xs tracking-[0.2em] uppercase font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-400 transition-colors"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
