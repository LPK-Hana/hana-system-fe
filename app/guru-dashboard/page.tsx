'use client';

import Link from 'next/link';
import { BookOpen, ClipboardList, LogOut } from 'lucide-react';
import { exitToHome, getAuthDisplayName, getAuthUserName } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { formatJapaneseDateTime, useServerClock } from '@/hooks/useServerClock';

export default function GuruDashboardPage() {
  const [userLabel, setUserLabel] = useState('');
  const serverNow = useServerClock();

  useEffect(() => {
    setUserLabel(getAuthDisplayName() || getAuthUserName() || 'Sensei');
  }, []);

  const menuItems = [
    {
      href: '/admin-dashboard/progress-belajar',
      label: 'Progress Belajar',
      sub: 'Input & pantau nilai siswa',
      icon: <BookOpen size={24} strokeWidth={1.5} />,
    }];

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 p-6 md:p-12 relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%23047857' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-8 border-b border-gray-200/80">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-wide">Sensei Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              ようこそ <span className="font-medium">{userLabel}</span>
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="text-left sm:text-right order-2 sm:order-1">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Tanggal & waktu server (WIB)</p>
              <p className="text-sm font-medium text-gray-800 tabular-nums">
                {serverNow ? formatJapaneseDateTime(serverNow) : '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => exitToHome()}
              className="shrink-0 inline-flex items-center gap-2 self-start rounded-md border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-600 hover:bg-red-800 hover:border-red-800 hover:text-white transition-colors order-1 sm:order-2"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </header>

        <div className="mt-10 grid sm:grid-cols-2 gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block relative bg-white no-underline text-inherit p-10 md:p-12 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out z-0" />
              <div className="relative z-10">
                <div className="w-12 h-12 border border-emerald-900/20 flex items-center justify-center mb-6 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500">
                  {item.icon}
                </div>
                <h2 className="text-xl font-serif text-gray-900 mb-2">{item.label}</h2>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
