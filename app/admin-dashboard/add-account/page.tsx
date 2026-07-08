'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Save, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ApiUser from '@/app/api/user/api_user';
import { NIM_PREFIX, buildNim, parseNimParts } from '@/lib/nim';

type ListUserRow = { user_name?: string; is_admin?: number };

function padAngkatan(raw: string): string {
  return String(raw || '')
    .replace(/\D/g, '')
    .slice(0, 2)
    .padStart(2, '0');
}

/** Nomor urut pertama yang aman untuk angkatan ini (berdasarkan user aktif). */
function startUrutForAngkatan(users: ListUserRow[], angkatPart: string): number {
  const angNum = Number(angkatPart);
  if (!Number.isFinite(angNum)) return 1;

  const inCohort = users
    .filter((u) => Number(u?.is_admin) === 0)
    .map((u) => String(u?.user_name || '').trim().toUpperCase())
    .map((username) => parseNimParts(username))
    .filter(Boolean) as Array<{ angkatan: number; urut: number }>;

  const same = inCohort.filter((v) => v.angkatan === angNum);
  if (same.length === 0) return 1;
  return Math.max(...same.map((v) => v.urut)) + 1;
}

function resolveNextNoPeserta(users: ListUserRow[]) {
  const studentNoPesertaValues = users
    .filter((u) => Number(u?.is_admin) === 0)
    .map((u) => String(u?.user_name || '').trim().toUpperCase())
    .map((username) => parseNimParts(username))
    .filter(Boolean) as Array<{ angkatan: number; urut: number }>;

  if (studentNoPesertaValues.length === 0) {
    return { angkatan: '05', nomor: '001' };
  }

  const latest = studentNoPesertaValues.reduce((acc, cur) => {
    const accScore = acc.angkatan * 1000 + acc.urut;
    const curScore = cur.angkatan * 1000 + cur.urut;
    return curScore > accScore ? cur : acc;
  });

  let nextAngkatan = latest.angkatan;
  let nextNomor = latest.urut + 1;

  if (nextNomor > 999) {
    nextAngkatan += 1;
    nextNomor = 1;
  }

  return {
    angkatan: String(nextAngkatan).padStart(2, '0'),
    nomor: String(nextNomor).padStart(3, '0'),
  };
}

export default function AddAccountPage() {
  const [angkatan, setAngkatan] = useState('05');
  const [namesInput, setNamesInput] = useState('');
  const [usersSnapshot, setUsersSnapshot] = useState<ListUserRow[]>([]);
  const [usersListFetched, setUsersListFetched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchLatestNoPeserta = useCallback(async () => {
    const response = await ApiUser().getAllUser();
    const users = Array.isArray(response?.data) ? response.data : [];
    if (response?.status === 200) {
      setUsersSnapshot(users);
      setUsersListFetched(true);
      const next = resolveNextNoPeserta(users);
      setAngkatan(next.angkatan);
    }
  }, []);

  useEffect(() => {
    void fetchLatestNoPeserta();
  }, [fetchLatestNoPeserta]);

  const angkatPart = useMemo(() => padAngkatan(angkatan), [angkatan]);

  const nameLines = useMemo(
    () => namesInput.split('\n').map((n) => n.trim().toUpperCase()).filter((n) => n.length > 0),
    [namesInput],
  );

  const previewStartUrut = useMemo(
    () => startUrutForAngkatan(usersSnapshot, angkatPart),
    [usersSnapshot, angkatPart],
  );

  const batchUrutOverflow =
    nameLines.length > 0 && previewStartUrut + nameLines.length - 1 > 999;

  /** Nomor urut 3 digit berikutnya untuk angkatan yang sedang di input (sama dengan baris pertama preview / simpan). */
  const nextSeqLabel = useMemo(
    () => String(previewStartUrut).padStart(3, '0'),
    [previewStartUrut],
  );

  const generatedAccounts = useMemo(() => {
    if (nameLines.length === 0) return [];

    return nameLines.map((name, index) => {
      const urut = previewStartUrut + index;
      const nim = buildNim(angkatPart, urut);
      const password = `${NIM_PREFIX.toLowerCase()}${angkatPart}`;

      return {
        id: index + 1,
        nim,
        name,
        password,
      };
    });
  }, [nameLines, angkatPart, previewStartUrut]);

  const handleSaveAccounts = useCallback(async () => {
    const names = namesInput
      .split('\n')
      .map((n) => n.trim().toUpperCase())
      .filter((n) => n.length > 0);
    if (names.length === 0) {
      toast.error('Isi daftar nama siswa terlebih dahulu.');
      return;
    }

    const api = ApiUser();
    setIsSaving(true);
    try {
      const fresh = await api.getAllUser();
      const users =
        fresh?.status === 200 && Array.isArray(fresh?.data) ? fresh.data : usersSnapshot;
      const ang = padAngkatan(angkatan);
      const start = startUrutForAngkatan(users, ang);
      if (start + names.length - 1 > 999) {
        toast.error('Nomor urut akan melewati 999 untuk angkatan ini. Kurangi jumlah baris atau ubah angkatan.');
        return;
      }
      const password = `${NIM_PREFIX.toLowerCase()}${ang}`;

      const rows = names.map((name, index) => {
        const urut = start + index;
        return {
          name,
          user_name: buildNim(ang, urut).toUpperCase(),
          user_password: password,
          is_admin: 0,
        };
      });

      const res = await api.postCreateUserBatch({ users: rows });

      if (res?.status === 200) {
        const created = typeof res?.created === 'number' ? res.created : rows.length;
        toast.success(`Berhasil membuat ${created} akun siswa.`);
        setNamesInput('');
        await fetchLatestNoPeserta();
      } else {
        toast.error(res?.message || 'Gagal menyimpan akun.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  }, [angkatan, namesInput, usersSnapshot, fetchLatestNoPeserta]);

  const handleExportCsv = useCallback(() => {
    if (generatedAccounts.length === 0) return;
    const header = 'NIM,Nama,Password\n';
    const body = generatedAccounts
      .map((a) => `"${a.nim}","${a.name.replace(/"/g, '""')}","${a.password}"`)
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `akun-siswa-${angkatPart}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedAccounts, angkatPart]);

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
                Tambah Akun{' '}
                <span className="text-lg text-gray-400 font-sans ml-2 tracking-normal font-normal">
                  (アカウント作成)
                </span>
              </h1>
            </div>
            <p className="text-xs font-medium text-gray-500 tracking-widest uppercase mt-1">
              Buat akun siswa secara massal untuk akses dashboard.
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 border border-gray-200/60 shadow-sm">
            <h2 className="text-lg font-serif text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full"></span>
              Pengaturan Batch (Massal)
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Angkatan (2 Digit)
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-2.5 bg-gray-100 border border-r-0 border-gray-300 text-gray-600 font-mono font-medium">
                    {NIM_PREFIX}
                  </span>
                  <input
                    type="text"
                    maxLength={2}
                    value={angkatan}
                    onChange={(e) => setAngkatan(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full min-w-0 px-4 py-2.5 border border-gray-300 border-l-0 border-r-0 focus:outline-none focus:ring-0 focus:border-emerald-800 transition-colors font-mono"
                    placeholder="05"
                    aria-label="Angkatan 2 digit"
                  />
                  <span
                    className="shrink-0 whitespace-nowrap px-4 py-2.5 bg-gray-100 border border-l-0 border-gray-300 text-gray-600 font-mono text-sm tabular-nums min-w-14 text-center"
                    title="Nomor urut berikutnya untuk angkatan ini (dari user aktif di database; sama dengan NIM baris pertama di preview)"
                  >
                    {usersListFetched ? nextSeqLabel : '···'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                  {!usersListFetched && <span className="text-gray-400">Memuat nomor dari server… </span>}
                  NIM berikutnya untuk angkatan ini: {NIM_PREFIX}<span className="font-bold text-emerald-800">{angkatPart}</span>
                  {nextSeqLabel}. Angkatan 5 gunakan &quot;05&quot;.
                </p>
                <p className="text-[10px] text-emerald-700/90 mt-1 leading-relaxed">
                  Angkatan awal diisi dari database; kotak kanan mengikuti nomor urut terbesar yang sudah ada untuk angkatan
                  yang Anda pilih (sama dengan preview).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Daftar Nama Siswa
                </label>
                <textarea
                  rows={12}
                  value={namesInput}
                  onChange={(e) => setNamesInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-0 focus:border-emerald-800 transition-colors text-sm leading-relaxed"
                  placeholder="Budi Santoso&#10;Siti Aminah&#10;Ahmad Fauzi&#10;&#10;(Paste daftar nama dari file Excel atau ketik manual.&#10;1 Baris = 1 Nama Siswa)"
                ></textarea>
                <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                  NIM diurutkan otomatis per angkatan mengikuti nomor berikutnya di database (satu baris = satu akun).
                  Password default semua baris: <span className="font-mono">{NIM_PREFIX.toLowerCase()}{angkatPart}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-200/60 shadow-sm h-full flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  Preview Akun ({generatedAccounts.length} Siswa)
                </h2>
                {batchUrutOverflow && (
                  <p className="text-xs text-red-700 mt-1 max-w-xl">
                    Nomor urut untuk angkatan ini akan melewati 999. Kurangi jumlah nama atau ubah angkatan sebelum
                    menyimpan.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={generatedAccounts.length === 0 || isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-300 text-xs tracking-widest uppercase text-gray-600 hover:border-emerald-800 hover:text-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet size={16} strokeWidth={1.5} />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={handleSaveAccounts}
                  disabled={generatedAccounts.length === 0 || isSaving || batchUrutOverflow}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-900 border border-emerald-900 text-xs tracking-widest uppercase text-white hover:bg-emerald-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} strokeWidth={1.5} />
                  {isSaving ? 'Menyimpan…' : 'Simpan Akun'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {generatedAccounts.length === 0 ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <UserPlus size={48} strokeWidth={1} className="mb-4 opacity-30" />
                  <p className="text-sm font-medium">Belum ada data siswa</p>
                  <p className="text-xs mt-2 max-w-sm leading-relaxed">
                    Masukkan daftar nama di kolom sebelah kiri untuk melihat preview NIM dan Password yang akan digenerate.
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th scope="col" className="px-6 py-4 font-semibold w-16 text-center">
                        No
                      </th>
                      <th scope="col" className="px-6 py-4 font-semibold">
                        NIM (No. Peserta)
                      </th>
                      <th scope="col" className="px-6 py-4 font-semibold">
                        Nama Siswa
                      </th>
                      <th scope="col" className="px-6 py-4 font-semibold">
                        Default Password
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedAccounts.map((acc) => (
                      <tr key={acc.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-center text-gray-400">{acc.id}</td>
                        <td className="px-6 py-4 font-mono font-medium text-emerald-800">{acc.nim}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{acc.name}</td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 text-xs rounded border border-gray-200">
                            {acc.password}
                          </span>
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
    </main>
  );
}
