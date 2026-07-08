'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Save, Users, Ban, CheckSquare, Search, Trash2, Eye, EyeOff, Edit, Key, Plus, List, LogOut, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ApiSuperAdmin from '@/app/api/super_admin/api_super_admin';
import DeleteAdminModal from '../components/DeleteAdminModal';
import EditAdminModal from '../components/EditAdminModal';
import UpdateAdminPasswordModal from '../components/UpdateAdminPasswordModal';

type ListUserRow = {
  user_id: number;
  name: string;
  user_name: string;
  is_admin: number;
  is_active: number;
  createdt?: string;
  updatedt?: string;
};

export default function KelolaAdminPage() {
  const [mobileTab, setMobileTab] = useState<'form' | 'list'>('list');
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [admins, setAdmins] = useState<ListUserRow[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdminToDelete, setSelectedAdminToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEditAdmin, setSelectedEditAdmin] = useState<ListUserRow | null>(null);
  const [selectedPasswordAdmin, setSelectedPasswordAdmin] = useState<ListUserRow | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      const res = await ApiSuperAdmin().getListAdmin({ is_active: showInactive ? 0 : 1 });
      const list = Array.isArray(res?.data) ? res.data : [];
      if (res?.status === 200) setAdmins(list);
      else setAdmins([]);
    } catch {
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  }, [showInactive]);

  useEffect(() => { void fetchAdmins(); }, [fetchAdmins]);

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((r) =>
      r.name.toLowerCase().includes(q) || String(r.user_name || '').toLowerCase().includes(q),
    );
  }, [admins, search]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminUsername.trim() || !adminPassword.trim() || !adminConfirmPassword.trim()) {
      toast.error('Mohon lengkapi semua field terlebih dahulu.');
      return;
    }
    if (adminPassword !== adminConfirmPassword) {
      toast.error('Password dan Confirm Password tidak cocok.');
      return;
    }
    const api = ApiSuperAdmin();
    setIsSaving(true);
    try {
      const res = await api.postCreateAdmin({
        name: adminName.trim().toUpperCase(),
        user_name: adminUsername.trim().toUpperCase(),
        password: adminPassword.trim(),
      });
      if (res?.status === 200) {
        toast.success(`Berhasil membuat akun Admin: ${adminName.toUpperCase()}`);
        setAdminName('');
        setAdminUsername('');
        setAdminPassword('');
        setAdminConfirmPassword('');
        await fetchAdmins();
        setMobileTab('list');
      } else {
        toast.error(res?.message || 'Gagal menyimpan akun Admin.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (user_id: number, current_status: number) => {
    const targetStatus = current_status === 1 ? 0 : 1;
    try {
      const res = await ApiSuperAdmin().putToggleActiveAdmin({ user_id });
      if (res?.status === 200) {
        toast.success(`Akun Admin berhasil di${targetStatus === 1 ? 'aktifkan' : 'nonaktifkan'}.`);
        await fetchAdmins();
      } else {
        toast.error('Gagal mengubah status akun Admin.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghubungi server.');
    }
  };

  const handleDeletePermanent = async () => {
    if (selectedAdminToDelete === null) return;
    setIsDeleting(true);
    try {
      const res = await ApiSuperAdmin().putDeleteAdmin({ user_id: selectedAdminToDelete });
      if (res?.status === 200) {
        toast.success('Berhasil menghapus akun admin secara permanen.');
        await fetchAdmins();
        setShowDeleteModal(false);
        setSelectedAdminToDelete(null);
      } else {
        toast.error(res?.message || 'Gagal menghapus akun admin.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghubungi server.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (user_id: number) => {
    setSelectedAdminToDelete(user_id);
    setShowDeleteModal(true);
  };

  const isFormValid =
    adminName.trim() !== '' &&
    adminUsername.trim() !== '' &&
    adminPassword.trim() !== '' &&
    adminConfirmPassword.trim() !== '' &&
    adminPassword === adminConfirmPassword;

  const FormPanel = (
    <div className="bg-white border border-red-200/60 shadow-sm relative overflow-hidden rounded-lg lg:rounded-none">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-700" />
      <div className="p-4 md:p-6">
        <h2 className="text-base md:text-lg font-serif text-gray-900 mb-5 flex items-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 bg-red-800 rounded-full" />
          Form Buat Admin Baru
        </h2>
        <form onSubmit={handleSaveAccount} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Nama Lengkap Admin</label>
            <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value.toUpperCase())} className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:border-red-800 transition-colors text-sm uppercase rounded" placeholder="Contoh: ADMIN UTAMA" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Username</label>
            <input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value.toUpperCase())} className="w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:border-red-800 transition-colors text-sm font-mono uppercase rounded" placeholder="ADM001" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full pl-3 pr-11 py-2.5 border border-gray-300 focus:outline-none focus:border-red-800 transition-colors text-sm font-mono rounded" placeholder="Masukkan password kuat..." required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-gray-400 hover:text-red-800 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Confirm Password</label>
            <div className="relative">
              <input type={showConfirmPassword ? 'text' : 'password'} value={adminConfirmPassword} onChange={(e) => setAdminConfirmPassword(e.target.value)} className={`w-full pl-3 pr-11 py-2.5 border focus:outline-none transition-colors text-sm font-mono rounded ${adminConfirmPassword && adminPassword !== adminConfirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-800'}`} placeholder="Ketik ulang password..." required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-gray-400 hover:text-red-800 transition-colors">
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <button type="submit" disabled={isSaving || !isFormValid} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-800 text-xs tracking-widest uppercase text-white hover:bg-red-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded">
              <Save size={15} strokeWidth={1.5} />
              {isSaving ? 'Menyimpan…' : 'Buat Akun Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ListPanel = (
    <div className="bg-white border border-gray-200/60 shadow-sm flex flex-col min-h-0 rounded-lg lg:rounded-none lg:h-full">
      <div className="p-3 md:p-5 border-b border-gray-100 flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} strokeWidth={1.5} />
            <input type="search" placeholder="Cari admin…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 w-full bg-transparent border border-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm rounded" />
          </div>
          <div className="relative shrink-0">
            <select value={showInactive ? '1' : '0'} onChange={(e) => setShowInactive(e.target.value === '1')} className="appearance-none border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer rounded">
              <option value="0">Aktif</option>
              <option value="1">Nonaktif</option>
            </select>
            <Users className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className={`w-1.5 h-1.5 rounded-full ${showInactive ? 'bg-gray-400' : 'bg-emerald-500'}`} />
          <span>{filteredAdmins.length} admin {showInactive ? 'nonaktif' : 'aktif'}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loadingAdmins ? (
          <div className="p-10 text-center text-gray-400 text-sm">Memuat daftar admin…</div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-gray-400 text-center">
            <ShieldCheck size={40} strokeWidth={1} className="mb-3 opacity-30 text-red-500" />
            <p className="text-sm font-medium">Tidak ada data admin</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-5 py-3.5 font-semibold w-10 text-center">No</th>
                <th className="px-5 py-3.5 font-semibold">Username</th>
                <th className="px-5 py-3.5 font-semibold">Nama Admin</th>
                <th className="px-5 py-3.5 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((u, i) => (
                <tr key={u.user_id} className="bg-white border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                  <td className="px-5 py-3.5 text-center text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-red-800">{u.user_name}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{u.name}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {!showInactive ? (
                        <>
                          <button onClick={() => setSelectedEditAdmin(u)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded"><Edit size={12} /> Edit</button>
                          <button onClick={() => setSelectedPasswordAdmin(u)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors rounded"><Key size={12} /> Password</button>
                          <button onClick={() => handleToggleActive(u.user_id, 1)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 bg-gray-50 hover:bg-red-100 hover:text-red-700 transition-colors rounded"><Ban size={12} /> Nonaktifkan</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleToggleActive(u.user_id, 0)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded"><CheckSquare size={12} /> Aktifkan</button>
                          <button onClick={() => openDeleteModal(u.user_id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors rounded"><Trash2 size={12} /> Hapus</button>
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
  );

  return (
    <main className="min-h-screen bg-[#F4F7F4] font-sans text-gray-800 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between gap-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/super-admin" className="shrink-0 p-1.5 text-gray-500 hover:text-red-800 border border-gray-200 rounded transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <ShieldCheck className="text-red-800 shrink-0" size={22} strokeWidth={1.5} />
          <div className="min-w-0">
            <h1 className="text-base font-serif text-gray-900 leading-tight truncate">Buat Admin Baru</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest hidden sm:block">Kelola akun administrator</p>
          </div>
        </div>
        <button onClick={() => import('@/lib/auth').then((m) => m.exitToHome())} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-800 border border-gray-200 hover:border-red-200 px-3 py-2 rounded transition-colors shrink-0">
          <LogOut size={14} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </header>

      <div className="lg:hidden flex border-b border-gray-200 bg-white sticky top-[53px] z-10">
        <button onClick={() => setMobileTab('list')} className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border-b-2 ${mobileTab === 'list' ? 'text-red-800 border-red-800' : 'text-gray-500 border-transparent'}`}>
          <List size={14} /> Daftar ({admins.length})
        </button>
        <button onClick={() => setMobileTab('form')} className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border-b-2 ${mobileTab === 'form' ? 'text-red-800 border-red-800' : 'text-gray-500 border-transparent'}`}>
          <Plus size={14} /> Buat Admin
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className={`lg:hidden flex-1 overflow-y-auto p-3 ${mobileTab === 'form' ? 'block' : 'hidden'}`}>{FormPanel}</div>
        <div className={`lg:hidden flex-1 overflow-hidden flex flex-col ${mobileTab === 'list' ? 'flex' : 'hidden'}`}>{ListPanel}</div>
        <div className="hidden lg:flex flex-col w-[360px] xl:w-[400px] shrink-0 border-r border-gray-200 p-6">{FormPanel}</div>
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden p-6">{ListPanel}</div>
      </div>

      {showDeleteModal && (
        <DeleteAdminModal onClose={() => { setShowDeleteModal(false); setSelectedAdminToDelete(null); }} onConfirm={handleDeletePermanent} isSubmitting={isDeleting} />
      )}
      <EditAdminModal isOpen={!!selectedEditAdmin} onClose={() => setSelectedEditAdmin(null)} onSuccess={fetchAdmins} userId={selectedEditAdmin?.user_id || 0} initialName={selectedEditAdmin?.name || ''} userName={selectedEditAdmin?.user_name || ''} />
      <UpdateAdminPasswordModal isOpen={!!selectedPasswordAdmin} onClose={() => setSelectedPasswordAdmin(null)} onSuccess={fetchAdmins} userId={selectedPasswordAdmin?.user_id || 0} />
    </main>
  );
}
