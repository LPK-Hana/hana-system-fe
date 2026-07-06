'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Save, Users, Ban, CheckSquare, Search, Trash2, Eye, EyeOff, Edit, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EditGuestModal from './components/EditGuestModal';
import UpdateGuestPasswordModal from './components/UpdateGuestPasswordModal';
import ApiUser from '@/app/api/user/api_user';
import ApiGuest from '@/app/api/guest/api_guest';

type GuestRow = {
  guest_id: number;
  name: string;
  user_name: string;
  is_active: number;
  createdt: string;
  updatedt: string;
  created_by: string;
  updated_by: string;
};

export default function CreateGuestPage() {
  // Form State
  const [guestName, setGuestName] = useState('');
  const [guestUsername, setGuestUsername] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [guestConfirmPassword, setGuestConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Table State
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');

  // Edit State
  const [selectedEditGuest, setSelectedEditGuest] = useState<GuestRow | null>(null);
  const [selectedPasswordGuest, setSelectedPasswordGuest] = useState<GuestRow | null>(null);

  const fetchGuests = useCallback(async () => {
    setLoadingGuests(true);
    try {
      const res = await ApiGuest().getListGuest({ is_active: showInactive ? 0 : 1 });

      const list = Array.isArray(res?.data) ? res.data : [];
      if (res?.status === 200) {
        setGuests(list);
      } else {
        setGuests([]);
      }
    } catch (e) {
      setGuests([]);
    } finally {
      setLoadingGuests(false);
    }
  }, [showInactive]);

  useEffect(() => {
    void fetchGuests();
  }, [fetchGuests]);

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((r) =>
      r.name.toLowerCase().includes(q) || String(r.user_name || '').toLowerCase().includes(q)
    );
  }, [guests, search]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestUsername.trim() || !guestPassword.trim() || !guestConfirmPassword.trim()) {
      toast.error('Mohon lengkapi semua field terlebih dahulu.');
      return;
    }

    if (guestPassword !== guestConfirmPassword) {
      toast.error('Password dan Confirm Password tidak cocok.');
      return;
    }

    const api = ApiGuest();
    setIsSaving(true);
    try {
      const payload = {
        name: guestName.trim().toUpperCase(),
        user_name: guestUsername.trim().toUpperCase(),
        password: guestPassword.trim(),
      };

      const res = await api.postCreateGuest(payload);

      if (res?.status === 200 || res?.status === 201) {
        toast.success(`Berhasil membuat akun guest: ${guestName.toUpperCase()}`);
        setGuestName('');
        setGuestUsername('');
        setGuestPassword('');
        setGuestConfirmPassword('');
        await fetchGuests();
      } else {
        toast.error(res?.message || 'Gagal menyimpan akun guest.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (guest_id: number, current_status: number) => {
    const targetStatus = current_status === 1 ? 0 : 1;
    try {
      const res = await ApiGuest().putToggleActiveGuest({
        guest_id: guest_id,
        is_active: targetStatus,
      });
      if (res?.status === 200) {
        toast.success(`Akun guest berhasil di${targetStatus === 1 ? 'aktifkan' : 'nonaktifkan'}.`);
        await fetchGuests();
      } else {
        toast.error('Gagal mengubah status akun guest.');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan saat menghubungi server.');
    }
  };

  const handleDeletePermanent = async (guest_id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun guest ini secara permanen?')) return;

    try {
      const res = await ApiGuest().putDeleteGuest({ guest_id });
      if (res?.status === 200) {
        toast.success('Akun guest berhasil dihapus permanen.');
        await fetchGuests();
      } else {
        toast.error('Gagal menghapus akun guest.');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan saat menghubungi server.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7F4] font-sans text-gray-800 p-4 md:p-8 relative">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin-dashboard/dashboard"
            className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <UserPlus className="text-emerald-900" size={28} strokeWidth={1.5} />
              <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">
                Manajemen Guest User
              </h1>
            </div>
            <p className="text-xs font-medium text-gray-500 tracking-widest uppercase mt-1">
              Buat dan kelola akun khusus untuk Guest.
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 relative z-10">
        {/* Kolom Kiri: Formulir */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 border border-gray-200/60 shadow-sm">
            <h2 className="text-lg font-serif text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full"></span>
              Form Buat Guest
            </h2>

            <form onSubmit={handleSaveAccount} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Nama Lengkap Guest
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-0 focus:border-emerald-800 transition-colors text-sm"
                  placeholder="Nama Organisasi"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Username / NIM
                </label>
                <input
                  type="text"
                  value={guestUsername}
                  onChange={(e) => setGuestUsername(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-0 focus:border-emerald-800 transition-colors text-sm font-mono uppercase"
                  placeholder="GUEST001"
                  required
                />
                {/* <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                  Harap masukkan kata "GUEST" agar sistem dapat mengenalinya sebagai Guest.
                </p> */}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={guestPassword}
                    onChange={(e) => setGuestPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 focus:outline-none focus:ring-0 focus:border-emerald-800 transition-colors text-sm font-mono"
                    placeholder="guest123"
                    required
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

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={guestConfirmPassword}
                    onChange={(e) => setGuestConfirmPassword(e.target.value)}
                    className={`w-full pl-4 pr-12 py-3 border focus:outline-none focus:ring-0 transition-colors text-sm font-mono ${guestConfirmPassword && guestPassword !== guestConfirmPassword ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-emerald-800'}`}
                    placeholder="guest123"
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
                {guestConfirmPassword && guestPassword !== guestConfirmPassword && (
                  <p className="text-[10px] text-red-500 mt-1.5 font-medium tracking-wide">
                    ⚠️ Password tidak cocok.
                  </p>
                )}
              </div>



              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || (guestConfirmPassword.length > 0 && guestPassword !== guestConfirmPassword)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-900 border border-emerald-900 text-xs tracking-widest uppercase text-white hover:bg-emerald-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} strokeWidth={1.5} />
                  {isSaving ? 'Menyimpan…' : 'Simpan Akun Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Tabel */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-200/60 shadow-sm h-full flex flex-col min-h-[500px]">
            <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-4 w-full">

                <div className="relative group w-full sm:max-w-xs">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-800 transition-colors"
                    size={18}
                    strokeWidth={1.5}
                  />
                  <input
                    type="search"
                    placeholder="Cari nama guest user…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-transparent border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="relative w-full sm:max-w-[200px]">
                  <select
                    value={showInactive ? '1' : '0'}
                    onChange={(e) => setShowInactive(e.target.value === '1')}
                    className="appearance-none w-full border border-gray-200 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="0">Guest Aktif</option>
                    <option value="1">Guest Nonaktif</option>
                  </select>
                  <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

              </div>
              <div className="flex items-center gap-2 shrink-0 hidden lg:flex text-xs font-medium text-gray-600">
                <span className={`w-2 h-2 rounded-full ${showInactive ? 'bg-red-500' : 'bg-green-500'}`} />
                {showInactive ? 'Nonaktif' : 'Aktif'}
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loadingGuests ? (
                <div className="p-16 text-center text-gray-500 text-sm">Memuat daftar guest…</div>
              ) : filteredGuests.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <Users size={48} strokeWidth={1} className="mb-4 opacity-30" />
                  <p className="text-sm font-medium">Tidak ada data guest</p>
                  <p className="text-xs mt-2 max-w-sm leading-relaxed">
                    {showInactive ? 'Belum ada guest yang dinonaktifkan.' : 'Buat akun guest baru di formulir sebelah kiri.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th scope="col" className="px-6 py-4 font-semibold w-12 text-center">No</th>
                      <th scope="col" className="px-6 py-4 font-semibold">Username (NIM)</th>
                      <th scope="col" className="px-6 py-4 font-semibold">Nama Guest</th>
                      <th scope="col" className="px-6 py-4 font-semibold">Created Date</th>
                      <th scope="col" className="px-6 py-4 font-semibold">Updated Date</th>
                      <th scope="col" className="px-6 py-4 font-semibold">Created By</th>
                      <th scope="col" className="px-6 py-4 font-semibold">Updated By</th>
                      <th scope="col" className="px-6 py-4 font-semibold text-center sticky right-0 bg-gray-50 border-l border-gray-200 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuests.map((u, i) => (
                      <tr key={u.guest_id} className="group bg-white border-b border-gray-50 hover:bg-emerald-50/40 transition-colors">
                        <td className="px-6 py-4 text-center text-gray-500">{i + 1}</td>
                        <td className="px-6 py-4 font-mono font-medium text-emerald-800">{u.user_name}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">{u.createdt || '-'}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">{u.updatedt || '-'}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{u.created_by || '-'}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{u.updated_by || '-'}</td>
                        <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-emerald-50/40 border-l border-gray-100 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {!showInactive ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setSelectedEditGuest(u)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                >
                                  <Edit size={13} />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedPasswordGuest(u)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
                                >
                                  <Key size={13} />
                                  Ubah Password
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(u.guest_id, 1)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                  <Ban size={13} />
                                  Nonaktifkan
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(u.guest_id, 0)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                >
                                  <CheckSquare size={13} />
                                  Aktifkan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePermanent(u.guest_id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 size={13} />
                                  Hapus
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedEditGuest && (
        <EditGuestModal
          isOpen={!!selectedEditGuest}
          onClose={() => setSelectedEditGuest(null)}
          onSuccess={fetchGuests}
          guestId={selectedEditGuest.guest_id}
          initialName={selectedEditGuest.name}
          userName={selectedEditGuest.user_name}
        />
      )}

      {selectedPasswordGuest && (
        <UpdateGuestPasswordModal
          isOpen={!!selectedPasswordGuest}
          onClose={() => setSelectedPasswordGuest(null)}
          onSuccess={() => { }} // No need to fetch list again since password isn't displayed
          guestId={selectedPasswordGuest.guest_id}
          userName={selectedPasswordGuest.user_name}
        />
      )}
    </main>
  );
}
