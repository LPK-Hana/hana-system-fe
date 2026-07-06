'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Search, UserCog, Ban, UserPen, Eye, EyeOff, BookOpen, Plus, Users, CheckSquare } from 'lucide-react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import ApiUser from '@/app/api/user/api_user';
import ApiKelas from '@/app/api/kelas/api_kelas';
import { angkatanDigitsFromNoPeserta } from '@/lib/nim';

type ListUserRow = {
  user_id: number;
  name: string;
  user_name: string;
  is_admin: number;
  is_active: number;
  id_kelas?: number | null;
  kelas?: string | null;
};

type KelasRow = {
  id_kelas: number;
  nama_kelas: string;
  is_active: number;
  created_at: string;
  created_by: string | null;
  edit_at: string | null;
  edit_by: string | null;
  delete_at: string | null;
  delete_by: string | null;
};

export default function StudentAccountManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ListUserRow[]>([]);
  const [search, setSearch] = useState('');

  const [passwordModalUser, setPasswordModalUser] = useState<ListUserRow | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameModalUser, setNameModalUser] = useState<ListUserRow | null>(null);
  const [editedName, setEditedName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [deactivateUser, setDeactivateUser] = useState<ListUserRow | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const [classModalUser, setClassModalUser] = useState<ListUserRow | null>(null);
  const [editedClass, setEditedClass] = useState('');
  const [savingClass, setSavingClass] = useState(false);

  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [selectedAngkatan, setSelectedAngkatan] = useState<string>('');
  const [manualClasses, setManualClasses] = useState<string[]>([]);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [savingCreateClass, setSavingCreateClass] = useState(false);
  const [kelasList, setKelasList] = useState<KelasRow[]>([]);
  const [loadingKelasList, setLoadingKelasList] = useState(false);
  const [editingKelasId, setEditingKelasId] = useState<number | null>(null);
  const [editKelasName, setEditKelasName] = useState('');
  const [savingEditKelas, setSavingEditKelas] = useState(false);
  const [deactivateKelas, setDeactivateKelas] = useState<KelasRow | null>(null);
  const [deactivatingKelas, setDeactivatingKelas] = useState(false);
  const [activateKelasRow, setActivateKelasRow] = useState<KelasRow | null>(null);
  const [activatingKelasRow, setActivatingKelasRow] = useState(false);
  const [showInactiveKelas, setShowInactiveKelas] = useState(false);
  const [hardDeleteKelasRow, setHardDeleteKelasRow] = useState<KelasRow | null>(null);
  const [hardDeletingKelas, setHardDeletingKelas] = useState(false);

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isBulkClassOpen, setIsBulkClassOpen] = useState(false);
  const [bulkClass, setBulkClass] = useState('');
  const [isBulkDeactivateOpen, setIsBulkDeactivateOpen] = useState(false);
  const [isBulkActivateOpen, setIsBulkActivateOpen] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const [showInactive, setShowInactive] = useState(false);
  const [activateUser, setActivateUser] = useState<ListUserRow | null>(null);
  const [activating, setActivating] = useState(false);

  const [hardDeleteUser, setHardDeleteUser] = useState<ListUserRow | null>(null);
  const [hardDeleting, setHardDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = showInactive ? await ApiUser().getAllInactiveUser() : await ApiUser().getAllActiveUser();
      const list = Array.isArray(res?.data) ? res.data : [];
      if (res?.status === 200) {
        const students = list.filter((u: ListUserRow) => Number(u?.is_admin) === 0);
        setRows(students);
      } else {
        setRows([]);
        if (res?.message && res?.status !== 200) {
          toast.error(String(res.message));
        }
      }
    } catch (e) {
      setRows([]);
      toast.error(e instanceof Error ? e.message : 'Gagal memuat daftar siswa.');
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  // Fetch daftar kelas (dipanggil saat mount dan saat modal buat kelas dibuka)
  const fetchKelas = useCallback(async () => {
    setLoadingKelasList(true);
    try {
      const res = await ApiKelas().getListKelas();
      if (res?.status === 200 && Array.isArray(res.data)) {
        setKelasList(res.data as KelasRow[]);
      }
    } catch {
      // silent
    } finally {
      setLoadingKelasList(false);
    }
  }, []);

  useEffect(() => {
    if (!isCreateClassOpen) return;
    void fetchKelas();
  }, [isCreateClassOpen, fetchKelas]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    void fetchKelas();
  }, [fetchKelas]);

  const angkatanSet = useMemo(() => {
    const angkatan = new Set<string>();
    rows.forEach((r) => {
      const digits = angkatanDigitsFromNoPeserta(r.user_name || '');
      if (digits) {
        angkatan.add(`Angkatan ${parseInt(digits, 10)}`);
      } else {
        angkatan.add('Lainnya');
      }
    });
    return Array.from(angkatan).sort();
  }, [rows]);

  const kelasSet = useMemo(() => {
    const kelas = new Set<string>();
    rows.forEach((r) => {
      if (r.kelas) {
        kelas.add(r.kelas);
      }
    });
    return Array.from(kelas).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchSearch = !q || r.name.toLowerCase().includes(q) || String(r.user_name || '').toLowerCase().includes(q);

      let matchAngkatan = true;
      if (selectedAngkatan) {
        const digits = angkatanDigitsFromNoPeserta(r.user_name || '');
        const angkatanLabel = digits ? `Angkatan ${parseInt(digits, 10)}` : 'Lainnya';
        matchAngkatan = angkatanLabel === selectedAngkatan;
      }

      let matchKelas = true;
      if (selectedKelas) {
        matchKelas = (r.kelas || '') === selectedKelas;
      }

      return matchSearch && matchAngkatan && matchKelas;
    });
  }, [rows, search, selectedAngkatan, selectedKelas]);

  useEffect(() => {
    setSelectedUserIds([]);
  }, [filtered]);

  // Ambil hanya kelas aktif dari kelasList (hasil endpoint GET /kelas/list)
  const activeKelasOptions = useMemo(
    () => kelasList.filter((k) => k.is_active === 1),
    [kelasList],
  );

  const openPasswordModal = (u: ListUserRow) => {
    setPasswordModalUser(u);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const closePasswordModal = () => {
    setPasswordModalUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const openNameModal = (u: ListUserRow) => {
    setNameModalUser(u);
    setEditedName(u.name || '');
  };

  const closeNameModal = () => {
    setNameModalUser(null);
    setEditedName('');
  };

  const openClassModal = (u: ListUserRow) => {
    setClassModalUser(u);
    setEditedClass(u.id_kelas != null ? String(u.id_kelas) : '');
  };

  const closeClassModal = () => {
    setClassModalUser(null);
    setEditedClass('');
  };

  const submitPassword = async () => {
    if (!passwordModalUser) return;
    if (!newPassword) {
      toast.error('Masukkan password baru.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak sama.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password minimal 8 karakter.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await ApiUser().putUpdateUserPassword({
        id_user: passwordModalUser.user_id,
        user_password: newPassword,
      });
      if (res?.status === 200) {
        toast.success(res?.message || 'Password siswa berhasil diperbarui.');
        closePasswordModal();
        await fetchStudents();
      } else {
        toast.error(res?.message || 'Gagal memperbarui password.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setSavingPassword(false);
    }
  };

  const submitName = async () => {
    if (!nameModalUser) return;
    const nextName = editedName.trim();
    if (!nextName) {
      toast.error('Nama wajib diisi.');
      return;
    }

    setSavingName(true);
    try {
      const res = await ApiUser().putUpdateUserName({
        id_user: nameModalUser.user_id,
        name: nextName,
      });
      if (res?.status === 200) {
        toast.success(res?.message || 'Nama siswa berhasil diperbarui.');
        closeNameModal();
        await fetchStudents();
      } else {
        toast.error(res?.message || 'Gagal memperbarui nama.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setSavingName(false);
    }
  };

  const submitKickKelas = async () => {
    if (!classModalUser) return;
    setSavingClass(true);
    try {
      const res = await ApiUser().putKickKelas({ id_user: classModalUser.user_id });
      if (res?.status === 200) {
        toast.success(res?.message || 'Siswa berhasil dikeluarkan dari kelas.');
        closeClassModal();
        await fetchStudents();
      } else {
        toast.error(res?.message || 'Gagal mengeluarkan siswa.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setSavingClass(false);
    }
  };

  const submitClass = async () => {
    if (!classModalUser) return;
    const idKelasVal = editedClass !== '' ? parseInt(editedClass, 10) : null;

    if (!idKelasVal) {
      toast.error('Silakan pilih kelas terlebih dahulu.');
      return;
    }

    setSavingClass(true);
    try {
      const isChanging = Boolean(classModalUser.kelas);
      const res = isChanging 
        ? await ApiUser().putChangeKelas({
            id_user: classModalUser.user_id,
            id_kelas: idKelasVal,
          })
        : await ApiUser().putAssignKelas({
            id_user: classModalUser.user_id,
            id_kelas: idKelasVal,
          });

      if (res?.status === 200) {
        toast.success(res?.message || 'Kelas siswa berhasil diperbarui.');
        closeClassModal();
        await fetchStudents();
      } else {
        toast.error(res?.message || 'Gagal memperbarui kelas.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setSavingClass(false);
    }
  };

  const passwordMismatch = Boolean(newPassword && confirmPassword && newPassword !== confirmPassword);

  const submitDeactivate = async () => {
    if (!deactivateUser) return;
    setDeactivating(true);
    try {
      const res = await ApiUser().putDeleteUser({
        id_user: deactivateUser.user_id,
        is_active: 0,
      });
      if (res?.status === 200) {
        toast.success(res?.message || 'Akun siswa dinonaktifkan.');
        setDeactivateUser(null);
        await fetchStudents();
      } else {
        toast.error(res?.message || 'Gagal menonaktifkan akun.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setDeactivating(false);
    }
  };

  const submitActivate = async () => {
    if (!activateUser) return;
    setActivating(true);
    try {
      const res = await ApiUser().putDeleteUser({
        id_user: activateUser.user_id,
        is_active: 1,
      });
      if (res?.status === 200) {
        toast.success(res?.message || 'Akun siswa diaktifkan.');
        setActivateUser(null);
        await fetchStudents();
      } else {
        toast.error(res?.message || 'Gagal mengaktifkan akun.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setActivating(false);
    }
  };

  const submitHardDelete = async () => {
    if (!hardDeleteUser) return;
    setHardDeleting(true);
    try {
      const res = await ApiUser().putHardDeleteUser({
        id_user: hardDeleteUser.user_id,
      });
      if (res?.status === 200) {
        toast.success(res?.message || 'Akun siswa dihapus permanen.');
        setHardDeleteUser(null);
        await fetchStudents();
      } else {
        toast.error(res?.message || 'Gagal menghapus permanen akun.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setHardDeleting(false);
    }
  };

  const submitBulkKickClass = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkSaving(true);
    try {
      const res = await ApiUser().putBulkAssignKelas({
        user_ids: selectedUserIds,
        id_kelas: null,
      });
      if (res?.status === 200) {
        toast.success(`${selectedUserIds.length} siswa berhasil dikeluarkan dari kelas.`);
      } else {
        toast.error(res?.message || 'Gagal mengeluarkan kelas (bulk).');
      }
      setIsBulkClassOpen(false);
      setSelectedUserIds([]);
      await fetchStudents();
    } catch {
      toast.error('Terjadi kesalahan saat mengeluarkan kelas (bulk).');
    } finally {
      setBulkSaving(false);
    }
  };

  const submitBulkClass = async () => {
    if (selectedUserIds.length === 0) return;
    
    if (bulkClass === '') {
      toast.error('Silakan pilih kelas terlebih dahulu.');
      return;
    }
    const idKelasVal = parseInt(bulkClass, 10);

    setBulkSaving(true);
    try {
      const res = await ApiUser().putBulkAssignKelas({
        user_ids: selectedUserIds,
        id_kelas: idKelasVal,
      });
      if (res?.status === 200) {
        toast.success(`${selectedUserIds.length} siswa berhasil di-assign kelas.`);
      } else {
        toast.error(res?.message || 'Gagal menyimpan kelas (bulk).');
      }
      setIsBulkClassOpen(false);
      setSelectedUserIds([]);
      await fetchStudents();
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan kelas (bulk).');
    } finally {
      setBulkSaving(false);
    }
  };

  const submitBulkDeactivate = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkSaving(true);
    try {
      await Promise.all(
        selectedUserIds.map((id) => ApiUser().putDeleteUser({ id_user: id, is_active: 0 }))
      );
      toast.success(`${selectedUserIds.length} akun siswa dinonaktifkan.`);
      setIsBulkDeactivateOpen(false);
      setSelectedUserIds([]);
      await fetchStudents();
    } catch (e) {
      toast.error('Terjadi kesalahan saat menonaktifkan akun (bulk).');
    } finally {
      setBulkSaving(false);
    }
  };

  const submitBulkActivate = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkSaving(true);
    try {
      await Promise.all(
        selectedUserIds.map((id) => ApiUser().putDeleteUser({ id_user: id, is_active: 1 }))
      );
      toast.success(`${selectedUserIds.length} akun siswa diaktifkan.`);
      setIsBulkActivateOpen(false);
      setSelectedUserIds([]);
      await fetchStudents();
    } catch (e) {
      toast.error('Terjadi kesalahan saat mengaktifkan akun (bulk).');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedUserIds(filtered.map((u) => u.user_id));
    else setSelectedUserIds([]);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) setSelectedUserIds((prev) => [...prev, id]);
    else setSelectedUserIds((prev) => prev.filter((x) => x !== id));
  };

  const isAllSelected = filtered.length > 0 && selectedUserIds.length === filtered.length;

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
              <UserCog className="text-emerald-900" size={28} strokeWidth={1.5} />
              <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">
                Student account management{' '}
                <span className="text-lg text-gray-400 font-sans ml-2 tracking-normal font-normal">
                  (アカウント管理)
                </span>
              </h1>
            </div>
            <p className="text-xs font-medium text-gray-500 tracking-widest uppercase mt-1">
              Ubah nama, password login siswa, atau nonaktifkan akun (soft delete).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateClassOpen(true)}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-900 text-xs tracking-widest uppercase text-white hover:bg-emerald-950 transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus size={16} strokeWidth={1.5} />
          Buat Kelas Baru
        </button>
      </header>

      <div className="bg-white border border-gray-200/60 shadow-sm">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-4 w-full xl:max-w-5xl">
            <div className="relative group w-full sm:max-w-xs">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-800 transition-colors"
                size={18}
                strokeWidth={1.5}
              />
              <input
                type="search"
                placeholder="Cari nama atau username (NIM)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-transparent border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div className="relative w-full sm:max-w-[200px]">
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="appearance-none w-full border border-gray-200 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">Semua Kelas</option>
                {kelasSet.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            <div className="relative w-full sm:max-w-[200px]">
              <select
                value={showInactive ? '0' : '1'}
                onChange={(e) => {
                  setShowInactive(e.target.value === '0');
                  setSelectedUserIds([]);
                  setIsBulkMode(false);
                }}
                className="appearance-none w-full border border-gray-200 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="1">Akun Aktif</option>
                <option value="0">Akun Nonaktif</option>
              </select>
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            <div className="relative w-full sm:max-w-[200px]">
              <select
                value={selectedAngkatan}
                onChange={(e) => setSelectedAngkatan(e.target.value)}
                className="appearance-none w-full border border-gray-200 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">Semua Angkatan</option>
                {angkatanSet.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            <button
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                if (!isBulkMode) setSelectedUserIds([]);
              }}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors ${isBulkMode
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <CheckSquare size={16} />
              {isBulkMode ? 'Tutup Bulk' : 'Pilih Bulk'}
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0 hidden lg:flex text-xs font-medium text-gray-600">
            <span className={`w-2 h-2 rounded-full ${showInactive ? 'bg-red-500' : 'bg-green-500'}`} />
            {showInactive ? 'Siswa Nonaktif' : 'Siswa Aktif'}
          </div>
        </div>

        {selectedUserIds.length > 0 && (
          <div className="bg-indigo-50 border-b border-indigo-100 p-3 px-6 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-semibold text-indigo-900">
              {selectedUserIds.length} siswa terpilih
            </span>
            <div className="flex items-center gap-3">
              {!showInactive ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsBulkClassOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-colors"
                  >
                    <BookOpen size={14} />
                    Assign Kelas (Bulk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBulkDeactivateOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 shadow-sm transition-colors"
                  >
                    <Ban size={14} />
                    Nonaktifkan (Bulk)
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsBulkActivateOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 shadow-sm transition-colors"
                >
                  <CheckSquare size={14} />
                  Aktifkan Akun (Bulk)
                </button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-gray-500 text-sm">Memuat daftar siswa…</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-500 text-sm">
              {rows.length === 0
                ? 'Belum ada akun siswa aktif, atau gagal memuat data.'
                : 'Tidak ada hasil yang cocok dengan pencarian.'}
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                <tr>
                  <th scope="col" className={`px-4 py-4 font-semibold ${isBulkMode ? 'w-12 text-center' : ''}`}>
                    {isBulkMode ? (
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    ) : (
                      'No'
                    )}
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold">
                    Nama
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold">
                    Username (NIM)
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold">
                    Kelas
                  </th>
                  {!isBulkMode && (
                    <th scope="col" className="px-4 py-4 font-semibold text-center sticky right-0 bg-gray-100 border-l border-gray-200">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const isSelected = selectedUserIds.includes(u.user_id);
                  return (
                    <tr key={u.user_id} className={`border-b border-gray-100 hover:bg-emerald-50/40 ${isSelected ? 'bg-indigo-50/30' : 'bg-white'}`}>
                      <td className={`px-4 py-4 ${isBulkMode ? 'text-center' : 'text-gray-500'}`}>
                        {isBulkMode ? (
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(u.user_id, e.target.checked)}
                          />
                        ) : (
                          i + 1
                        )}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-4 font-mono text-emerald-800">{u.user_name}</td>
                      <td className="px-4 py-4">
                        {u.kelas ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {u.kelas}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Belum ada</span>
                        )}
                      </td>
                      {!isBulkMode && (
                        <td className="px-4 py-4 text-right sticky right-0 bg-white border-l border-gray-100 shadow-[-4px_0_8px_rgba(0,0,0,0.04)]">
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            {!showInactive ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openPasswordModal(u)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                >
                                  <KeyRound size={14} />
                                  Ubah password
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openClassModal(u)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                >
                                  <BookOpen size={14} />
                                  Assign kelas
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openNameModal(u)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                >
                                  <UserPen size={14} />
                                  Ubah nama
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeactivateUser(u)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                  <Ban size={14} />
                                  Nonaktifkan
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setActivateUser(u)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                >
                                  <CheckSquare size={14} />
                                  Aktifkan Akun
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setHardDeleteUser(u)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 size={14} />
                                  Hapus Permanen
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {mounted && passwordModalUser
        ? createPortal(
          <div className="fixed inset-0 z-120 bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={closePasswordModal} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pwd-modal-title"
              className="relative z-10 w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6"
            >
              <h2 id="pwd-modal-title" className="text-lg font-serif text-gray-900 mb-1">
                Ubah password siswa
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                {passwordModalUser.name} — <span className="font-mono">{passwordModalUser.user_name}</span>
              </p>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password baru</span>
                  <div className="relative mt-2">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-800"
                      aria-label={showNewPassword ? 'Sembunyikan password baru' : 'Tampilkan password baru'}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Konfirmasi password</span>
                  <div className="relative mt-2">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full border bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${passwordMismatch
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-gray-200 focus:ring-emerald-500'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-800"
                      aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordMismatch ? (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      Password yang anda masukkan tidak sesuai
                    </p>
                  ) : null}
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => void submitPassword()}
                  disabled={savingPassword || passwordMismatch}
                  className="px-4 py-2 text-xs tracking-widest uppercase bg-emerald-900 text-white hover:bg-emerald-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingPassword ? 'Menyimpan…' : 'Simpan password'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}

      {mounted && nameModalUser
        ? createPortal(
          <div className="fixed inset-0 z-120 bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={closeNameModal} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="name-modal-title"
              className="relative z-10 w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6"
            >
              <h2 id="name-modal-title" className="text-lg font-serif text-gray-900 mb-1">
                Ubah nama siswa
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Username tetap <span className="font-mono">{nameModalUser.user_name}</span>. Form ini hanya
                mengubah nama tampilan siswa.
              </p>
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nama baru</span>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="mt-2 w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Masukkan nama siswa"
                />
              </label>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeNameModal}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => void submitName()}
                  disabled={savingName}
                  className="px-4 py-2 text-xs tracking-widest uppercase bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {savingName ? 'Menyimpan…' : 'Simpan nama'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}

      {mounted && deactivateUser
        ? createPortal(
          <div className="fixed inset-0 z-120 bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setDeactivateUser(null)} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              className="relative z-10 w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6"
            >
              <h2 className="text-lg font-serif text-gray-900 mb-2">Nonaktifkan akun siswa?</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Akun <span className="font-mono font-medium">{deactivateUser.user_name}</span> ({deactivateUser.name})
                akan dinonaktifkan. Siswa tidak dapat login hingga akun diaktifkan kembali dari sisi
                administrasi database jika fitur itu tersedia.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeactivateUser(null)}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => void submitDeactivate()}
                  disabled={deactivating}
                  className="px-4 py-2 text-xs tracking-widest uppercase bg-red-800 text-white hover:bg-red-900 disabled:opacity-50"
                >
                  {deactivating ? 'Memproses…' : 'Nonaktifkan'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}

      {mounted && hardDeleteUser
        ? createPortal(
          <div className="fixed inset-0 z-120 bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setHardDeleteUser(null)} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              className="relative z-10 w-full max-w-md bg-white border border-red-200 shadow-2xl p-6"
            >
              <h2 className="text-lg font-serif text-gray-900 mb-2">Hapus Permanen Akun Siswa?</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                Anda akan menghapus akun <span className="font-mono font-medium">{hardDeleteUser.user_name}</span> ({hardDeleteUser.name}) secara <span className="font-bold text-red-600">permanen</span>.
              </p>
              <p className="text-sm text-red-600 font-semibold leading-relaxed">
                Tindakan ini tidak dapat dibatalkan! Semua data yang terkait dengan akun ini akan terhapus.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setHardDeleteUser(null)}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => void submitHardDelete()}
                  disabled={hardDeleting}
                  className="px-4 py-2 text-xs tracking-widest uppercase bg-red-800 text-white hover:bg-red-900 disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {hardDeleting ? 'Memproses…' : 'Hapus Permanen'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}

      {mounted && classModalUser
        ? createPortal(
          <div className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={closeClassModal} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="class-modal-title"
              className="relative z-10 w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6"
            >
              <h2 id="class-modal-title" className="text-lg font-serif text-gray-900 mb-1">
                Assign Kelas Siswa
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                {classModalUser.name} — <span className="font-mono">{classModalUser.user_name}</span>
              </p>
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pilih Kelas</span>
                <select
                  value={editedClass}
                  onChange={(e) => setEditedClass(e.target.value)}
                  className="mt-2 w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {loadingKelasList
                    ? <option disabled>Memuat kelas…</option>
                    : activeKelasOptions.map((k) => (
                      <option key={k.id_kelas} value={String(k.id_kelas)}>{k.nama_kelas}</option>
                    ))
                  }
                </select>
                <p className="mt-2 text-[10px] text-gray-500 leading-relaxed">
                  Pilih kelas dari daftar yang sudah dibuat. Untuk membuat kelas baru, gunakan tombol di pojok kanan atas halaman.
                </p>
              </label>
              <div className="mt-6 flex justify-between items-center gap-3">
                {classModalUser.kelas ? (
                  <button
                    type="button"
                    onClick={() => void submitKickKelas()}
                    disabled={savingClass}
                    className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    Keluarkan
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeClassModal}
                    className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => void submitClass()}
                    disabled={savingClass}
                    className="px-4 py-2 text-xs tracking-widest uppercase bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50"
                  >
                    {savingClass ? 'Menyimpan…' : (classModalUser.kelas ? 'Pindah Kelas' : 'Assign Kelas')}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}

      {mounted && isCreateClassOpen
        ? createPortal(
          <div className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setIsCreateClassOpen(false)} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              className="relative z-10 w-full max-w-2xl bg-white border border-gray-200 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
            >
              {/* Header + Form */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-serif text-gray-900 mb-1">Buat Kelas Baru</h2>
                <p className="text-xs text-gray-500 mb-5">
                  Tambahkan nama kelas baru agar bisa di-assign ke siswa.
                </p>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nama Kelas</span>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="mt-2 w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Contoh: Kelas A, Kelas N4 Sore..."
                    autoFocus
                  />
                </label>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateClassOpen(false)}
                    className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newClassName.trim()) {
                        toast.error('Nama kelas tidak boleh kosong');
                        return;
                      }
                      setSavingCreateClass(true);
                      try {
                        const res = await ApiKelas().postCreateKelas({ nama_kelas: newClassName.trim() });
                        if (res?.status === 200) {
                          setManualClasses(prev => [...prev, newClassName.trim()]);
                          toast.success(`Kelas "${newClassName.trim()}" berhasil dibuat.`);
                          setNewClassName('');
                          // Refresh tabel kelas
                          const listRes = await ApiKelas().getListKelas();
                          if (listRes?.status === 200 && Array.isArray(listRes.data)) {
                            setKelasList(listRes.data as KelasRow[]);
                          }
                        } else {
                          toast.error(res?.message || 'Gagal membuat kelas.');
                        }
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
                      } finally {
                        setSavingCreateClass(false);
                      }
                    }}
                    disabled={savingCreateClass}
                    className="px-4 py-2 text-xs tracking-widest uppercase bg-emerald-900 text-white hover:bg-emerald-950 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingCreateClass ? 'Menyimpan…' : 'Simpan'}
                  </button>
                </div>
              </div>

              {/* Panel tabel daftar kelas */}
              <div className="mx-6 mb-6 mt-2 border border-gray-200 rounded-sm">
                {/* Panel header */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Daftar Kelas
                    </span>
                    <div className="flex bg-gray-200 p-0.5 rounded-sm">
                      <button
                        type="button"
                        onClick={() => setShowInactiveKelas(false)}
                        className={`px-3 py-1 text-[11px] font-medium transition-all rounded-sm ${!showInactiveKelas ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Aktif
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInactiveKelas(true)}
                        className={`px-3 py-1 text-[11px] font-medium transition-all rounded-sm ${showInactiveKelas ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Nonaktif
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {loadingKelasList && (
                      <span className="text-[11px] text-emerald-500 animate-pulse">Memuat…</span>
                    )}
                    {editingKelasId !== null && (
                      <span className="text-[11px] text-amber-600 font-medium">Mode Edit Aktif</span>
                    )}
                  </div>
                </div>

                {/* Konten panel */}
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  {loadingKelasList ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">Memuat data kelas…</div>
                  ) : kelasList.filter((k) => (showInactiveKelas ? k.is_active === 0 : k.is_active === 1)).length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                      {showInactiveKelas ? 'Belum ada kelas nonaktif.' : 'Belum ada kelas aktif.'}
                    </div>
                  ) : (
                    <table className="min-w-max text-xs text-left whitespace-nowrap">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wide min-w-[180px] sticky left-0 z-10 bg-gray-50 shadow-[1px_0_0_0_#e5e7eb]">Nama Kelas</th>
                          <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wide w-24 sticky left-[180px] z-10 bg-gray-50 shadow-[1px_0_0_0_#e5e7eb]">Status</th>
                          <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wide">Dibuat Oleh</th>
                          <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wide">Diedit Oleh</th>
                          <th className="px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wide w-28 text-center sticky right-0 z-10 bg-gray-50 shadow-[-1px_0_0_0_#e5e7eb]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {kelasList.filter((k) => (showInactiveKelas ? k.is_active === 0 : k.is_active === 1)).map((k) => (
                          <tr key={k.id_kelas} className="group hover:bg-emerald-50/30 transition-colors">
                            <td className="px-4 py-2 font-medium text-gray-900 min-w-[180px] sticky left-0 z-[5] bg-white group-hover:bg-emerald-50 shadow-[1px_0_0_0_#e5e7eb]">
                              {editingKelasId === k.id_kelas ? (
                                <input
                                  type="text"
                                  value={editKelasName}
                                  onChange={(e) => setEditKelasName(e.target.value)}
                                  className="w-full border border-emerald-400 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') { setEditingKelasId(null); setEditKelasName(''); }
                                  }}
                                />
                              ) : (
                                k.nama_kelas
                              )}
                            </td>
                            <td className="px-4 py-2 w-24 sticky left-[180px] z-[5] bg-white group-hover:bg-emerald-50 shadow-[1px_0_0_0_#e5e7eb]">
                              {k.is_active === 1 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">{k.created_by ?? <span className="text-gray-300">—</span>}</td>
                            <td className="px-4 py-2 text-gray-600">{k.edit_by ?? <span className="text-gray-300">—</span>}</td>
                            <td className="px-4 py-2 text-center sticky right-0 z-[5] bg-white group-hover:bg-emerald-50 shadow-[-1px_0_0_0_#e5e7eb]">
                              {editingKelasId === k.id_kelas ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={savingEditKelas}
                                    onClick={async () => {
                                      if (!editKelasName.trim()) { toast.error('Nama kelas tidak boleh kosong'); return; }
                                      setSavingEditKelas(true);
                                      try {
                                        const res = await ApiKelas().putUpdateKelas({ id_kelas: k.id_kelas, nama_kelas: editKelasName.trim() });
                                        if (res?.status === 200) {
                                          toast.success('Nama kelas berhasil diperbarui.');
                                          setEditingKelasId(null);
                                          setEditKelasName('');
                                          const listRes = await ApiKelas().getListKelas();
                                          if (listRes?.status === 200 && Array.isArray(listRes.data)) {
                                            setKelasList(listRes.data as KelasRow[]);
                                          }
                                        } else {
                                          toast.error(res?.message || 'Gagal memperbarui kelas.');
                                        }
                                      } catch (e) {
                                        toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
                                      } finally {
                                        setSavingEditKelas(false);
                                      }
                                    }}
                                    className="px-2 py-1 text-[11px] font-medium text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-sm"
                                  >
                                    {savingEditKelas ? 'Menyimpan…' : 'Simpan'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setEditingKelasId(null); setEditKelasName(''); }}
                                    className="px-2 py-1 text-[11px] font-medium text-gray-600 border border-gray-300 hover:bg-gray-100 rounded-sm"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  {k.is_active === 1 && (
                                    <button
                                      type="button"
                                      onClick={() => { setEditingKelasId(k.id_kelas); setEditKelasName(k.nama_kelas); }}
                                      className="px-2.5 py-1 text-[11px] font-medium text-indigo-700 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-sm transition-colors"
                                    >
                                      Edit
                                    </button>
                                  )}
                                  {k.is_active === 1 ? (
                                    <button
                                      type="button"
                                      onClick={() => setDeactivateKelas(k)}
                                      className="px-2.5 py-1 text-[11px] font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 rounded-sm transition-colors"
                                    >
                                      Nonaktifkan
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setActivateKelasRow(k)}
                                        className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-sm transition-colors"
                                      >
                                        Aktifkan
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setHardDeleteKelasRow(k)}
                                        className="px-2.5 py-1 text-[11px] font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 rounded-sm transition-colors"
                                      >
                                        Hapus Permanen
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}

                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}

      {/* Modal konfirmasi nonaktifkan kelas */}
      {mounted && deactivateKelas
        ? createPortal(
          <div className="fixed inset-0 z-[130] bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setDeactivateKelas(null)} aria-hidden />
            <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm bg-white border border-gray-200 shadow-2xl p-6">
              <h2 className="text-lg font-serif text-gray-900 mb-2">Nonaktifkan kelas?</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kelas <span className="font-semibold text-gray-900">&ldquo;{deactivateKelas.nama_kelas}&rdquo;</span> akan dinonaktifkan.
                Siswa yang sudah ter-assign ke kelas ini tidak akan terpengaruh, namun kelas tidak dapat dipilih untuk assignment baru.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeactivateKelas(null)}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={deactivatingKelas}
                  onClick={async () => {
                    setDeactivatingKelas(true);
                    try {
                      const res = await ApiKelas().putDeleteKelas({ id_kelas: deactivateKelas.id_kelas });
                      if (res?.status === 200) {
                        toast.success(`Kelas "${deactivateKelas.nama_kelas}" berhasil dinonaktifkan.`);
                        setDeactivateKelas(null);
                        const listRes = await ApiKelas().getListKelas();
                        if (listRes?.status === 200 && Array.isArray(listRes.data)) {
                          setKelasList(listRes.data as KelasRow[]);
                        }
                      } else {
                        toast.error(res?.message || 'Gagal menonaktifkan kelas.');
                      }
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
                    } finally {
                      setDeactivatingKelas(false);
                    }
                  }}
                  className="px-4 py-2 text-xs tracking-widest uppercase bg-red-800 text-white hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deactivatingKelas ? 'Memproses…' : 'Nonaktifkan'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}

      {/* Modal konfirmasi aktifkan kelas */}
      {mounted && activateKelasRow
        ? createPortal(
          <div className="fixed inset-0 z-[130] bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setActivateKelasRow(null)} aria-hidden />
            <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm bg-white border border-gray-200 shadow-2xl p-6">
              <h2 className="text-lg font-serif text-gray-900 mb-2">Aktifkan kelas?</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kelas <span className="font-semibold text-gray-900">&ldquo;{activateKelasRow.nama_kelas}&rdquo;</span> akan diaktifkan kembali
                dan dapat dipilih untuk assignment siswa.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActivateKelasRow(null)}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={activatingKelasRow}
                  onClick={async () => {
                    setActivatingKelasRow(true);
                    try {
                      const res = await ApiKelas().putActivateKelas({ id_kelas: activateKelasRow.id_kelas });
                      if (res?.status === 200) {
                        toast.success(`Kelas "${activateKelasRow.nama_kelas}" berhasil diaktifkan.`);
                        setActivateKelasRow(null);
                        const listRes = await ApiKelas().getListKelas();
                        if (listRes?.status === 200 && Array.isArray(listRes.data)) {
                          setKelasList(listRes.data as KelasRow[]);
                        }
                      } else {
                        toast.error(res?.message || 'Gagal mengaktifkan kelas.');
                      }
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
                    } finally {
                      setActivatingKelasRow(false);
                    }
                  }}
                  className="px-4 py-2 text-xs tracking-widest uppercase bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activatingKelasRow ? 'Memproses…' : 'Aktifkan'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}

      {/* Modal konfirmasi hapus permanen kelas */}
      {mounted && hardDeleteKelasRow
        ? createPortal(
          <div className="fixed inset-0 z-[130] bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setHardDeleteKelasRow(null)} aria-hidden />
            <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm bg-white border border-gray-200 shadow-2xl p-6">
              <h2 className="text-lg font-serif text-red-600 mb-2">Hapus Permanen Kelas?</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kelas <span className="font-semibold text-gray-900">&ldquo;{hardDeleteKelasRow.nama_kelas}&rdquo;</span> akan dihapus permanen dari database.
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setHardDeleteKelasRow(null)}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={hardDeletingKelas}
                  onClick={async () => {
                    setHardDeletingKelas(true);
                    try {
                      const res = await ApiKelas().putHardDeleteKelas({ id_kelas: hardDeleteKelasRow.id_kelas });
                      if (res?.status === 200) {
                        toast.success(`Kelas "${hardDeleteKelasRow.nama_kelas}" berhasil dihapus permanen.`);
                        setHardDeleteKelasRow(null);
                        const listRes = await ApiKelas().getListKelas();
                        if (listRes?.status === 200 && Array.isArray(listRes.data)) {
                          setKelasList(listRes.data as KelasRow[]);
                        }
                      } else {
                        toast.error(res?.message || 'Gagal menghapus kelas.');
                      }
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
                    } finally {
                      setHardDeletingKelas(false);
                    }
                  }}
                  className="px-4 py-2 text-xs tracking-widest uppercase bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hardDeletingKelas ? 'Menghapus…' : 'Hapus Permanen'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}

      {mounted && isBulkClassOpen
        ? createPortal(
          <div className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setIsBulkClassOpen(false)} aria-hidden />
            <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6">
              <h2 className="text-lg font-serif text-gray-900 mb-1">Assign Kelas ({selectedUserIds.length} Siswa)</h2>
              <p className="text-xs text-gray-500 mb-6">Pilih kelas untuk ditugaskan secara massal.</p>
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pilih Kelas</span>
                <select
                  value={bulkClass}
                  onChange={(e) => setBulkClass(e.target.value)}
                  className="mt-2 w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {loadingKelasList
                    ? <option disabled>Memuat kelas…</option>
                    : activeKelasOptions.map((k) => (
                      <option key={k.id_kelas} value={String(k.id_kelas)}>{k.nama_kelas}</option>
                    ))
                  }
                </select>
              </label>
              <div className="mt-6 flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => void submitBulkKickClass()}
                  disabled={bulkSaving}
                  className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Keluarkan (Bulk)
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsBulkClassOpen(false)} className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500">Batal</button>
                  <button type="button" onClick={() => void submitBulkClass()} disabled={bulkSaving} className="px-4 py-2 text-xs tracking-widest uppercase bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50">
                    {bulkSaving ? 'Memproses…' : 'Simpan (Bulk)'}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
        : null}

      {mounted && isBulkDeactivateOpen
        ? createPortal(
          <div className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setIsBulkDeactivateOpen(false)} aria-hidden />
            <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6">
              <h2 className="text-lg font-serif text-gray-900 mb-2">Nonaktifkan {selectedUserIds.length} Siswa?</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Siswa yang terpilih tidak akan dapat login kembali hingga akun diaktifkan. Anda yakin ingin melanjutkan tindakan massal ini?
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsBulkDeactivateOpen(false)} className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500">Batal</button>
                <button type="button" onClick={() => void submitBulkDeactivate()} disabled={bulkSaving} className="px-4 py-2 text-xs tracking-widest uppercase bg-red-800 text-white hover:bg-red-900 disabled:opacity-50">
                  {bulkSaving ? 'Memproses…' : 'Nonaktifkan (Bulk)'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
        : null}

      {mounted && activateUser
        ? createPortal(
          <div className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setActivateUser(null)} aria-hidden />
            <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6">
              <h2 className="text-lg font-serif text-gray-900 mb-2">Aktifkan akun siswa?</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Akun <span className="font-mono font-medium">{activateUser.user_name}</span> ({activateUser.name})
                akan diaktifkan kembali dan siswa dapat login seperti biasa.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setActivateUser(null)} className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500">Batal</button>
                <button type="button" onClick={() => void submitActivate()} disabled={activating} className="px-4 py-2 text-xs tracking-widest uppercase bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50">
                  {activating ? 'Memproses…' : 'Aktifkan'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
        : null}

      {mounted && isBulkActivateOpen
        ? createPortal(
          <div className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setIsBulkActivateOpen(false)} aria-hidden />
            <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6">
              <h2 className="text-lg font-serif text-gray-900 mb-2">Aktifkan {selectedUserIds.length} Siswa?</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Siswa yang terpilih akan diaktifkan secara massal. Anda yakin ingin melanjutkan tindakan ini?
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsBulkActivateOpen(false)} className="px-4 py-2 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-gray-500">Batal</button>
                <button type="button" onClick={() => void submitBulkActivate()} disabled={bulkSaving} className="px-4 py-2 text-xs tracking-widest uppercase bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50">
                  {bulkSaving ? 'Memproses…' : 'Aktifkan (Bulk)'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
        : null}
    </main>
  );
}
