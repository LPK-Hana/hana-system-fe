'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Crown,
  LogOut,
  UserPlus,
  Shield,
  BookOpen,
  X,
  ChevronRight,
} from 'lucide-react';
import { exitToHome, getAuthDisplayName, getAuthUserName } from '@/lib/auth';
import { ADMIN_MENU_ITEMS, GURU_MENU_ITEMS } from '@/lib/roles';
import { formatJapaneseDateTime, useServerClock } from '@/hooks/useServerClock';

type MenuModal = 'admin' | 'guru' | null;

export default function ShachouHubPage() {
  const [menuModal, setMenuModal] = useState<MenuModal>(null);
  const [userLabel, setUserLabel] = useState('');
  const serverNow = useServerClock();

  useEffect(() => {
    setUserLabel(getAuthDisplayName() || getAuthUserName() || 'Shachou');
  }, []);

  const hubItems = [
    {
      href: '/admin-dashboard/create-guest',
      label: 'Buat Guest User',
      sub: 'Akun tamu untuk showcase',
      icon: <UserPlus size={24} strokeWidth={1.5} />,
    },
    {
      href: '/super-admin/kelola-admin',
      label: 'Buat Akun Admin',
      sub: 'Tambah & kelola administrator',
      icon: <Shield size={24} strokeWidth={1.5} />,
    },
  ];

  const modalItems = menuModal === 'admin' ? ADMIN_MENU_ITEMS : menuModal === 'guru' ? GURU_MENU_ITEMS : [];

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 p-6 md:p-12 relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%23047857' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-8 border-b border-gray-200/80">
          <div className="flex items-center gap-3">
            <Crown className="text-red-800 shrink-0" size={28} strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-wide">Shachou</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">社長 · Dashboard Utama</p>
              <p className="mt-2 text-sm text-gray-700">
                ようこそ <span className="font-medium">{userLabel}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Tanggal & waktu server (WIB)</p>
              <p className="text-sm font-medium text-gray-800 tabular-nums">
                {serverNow ? formatJapaneseDateTime(serverNow) : '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => exitToHome()}
              className="shrink-0 inline-flex items-center gap-2 self-start rounded-md border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-600 hover:bg-red-800 hover:border-red-800 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </header>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {hubItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block relative bg-white no-underline text-inherit p-8 md:p-10 border border-gray-200/60 hover:border-red-800/30 transition-colors duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out z-0" />
              <div className="relative z-10">
                <div className="w-12 h-12 border border-red-800/20 flex items-center justify-center mb-6 text-red-800 bg-white group-hover:bg-red-800 group-hover:text-white transition-colors duration-500">
                  {item.icon}
                </div>
                <h2 className="text-xl font-serif text-gray-900 mb-2">{item.label}</h2>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMenuModal('admin')}
            className="group flex items-center justify-between bg-white border border-gray-200/60 hover:border-emerald-900/30 p-6 text-left transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 border border-emerald-900/20 flex items-center justify-center text-emerald-900">
                <Shield size={22} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-serif text-lg text-gray-900">Menu Admin</p>
                <p className="text-xs text-gray-500 mt-0.5">Lihat modul yang bisa diakses admin</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-900 transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => setMenuModal('guru')}
            className="group flex items-center justify-between bg-white border border-gray-200/60 hover:border-emerald-900/30 p-6 text-left transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 border border-emerald-900/20 flex items-center justify-center text-emerald-900">
                <BookOpen size={22} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-serif text-lg text-gray-900">Menu Guru</p>
                <p className="text-xs text-gray-500 mt-0.5">Lihat modul yang bisa diakses sensei</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-900 transition-colors" />
          </button>
        </div>
      </div>

      {menuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setMenuModal(null)}>
          <div
            className="bg-white w-full max-w-md rounded-lg shadow-xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-serif text-lg text-gray-900">
                {menuModal === 'admin' ? 'Menu Admin' : 'Menu Guru / Sensei'}
              </h3>
              <button type="button" onClick={() => setMenuModal(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <ul className="divide-y divide-gray-100">
              {modalItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuModal(null)}
                    className="flex items-center justify-between px-5 py-4 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
