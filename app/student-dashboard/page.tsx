'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, LogOut, Settings, UserRound, Users, Target } from 'lucide-react';
import Link from 'next/link';
import { getAuthDisplayName, getAuthUserName, exitToHome } from '@/lib/auth';

const TIMEZONE = 'Asia/Jakarta';

function formatJapaneseDateTime(d: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export default function StudentDashboardPage() {
  const [userLabel, setUserLabel] = useState('');
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const [offsetReady, setOffsetReady] = useState(false);
  const [serverNow, setServerNow] = useState<Date | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setUserLabel(getAuthDisplayName() || getAuthUserName() || 'Siswa');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/server-time', { cache: 'no-store' });
        if (!res.ok) throw new Error('time');
        const { iso } = (await res.json()) as { iso?: string };
        const serverMs = iso ? new Date(iso).getTime() : NaN;
        if (!cancelled && Number.isFinite(serverMs)) {
          setServerOffsetMs(serverMs - Date.now());
          setOffsetReady(true);
        }
      } catch {
        if (!cancelled) {
          setServerOffsetMs(0);
          setOffsetReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!offsetReady) return;
    const tick = () => {
      setServerNow(new Date(Date.now() + serverOffsetMs));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [offsetReady, serverOffsetMs]);

  const handleLogout = () => {
    exitToHome();
  };

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen, closeMenu]);

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 p-6 md:p-12 relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%23047857' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4 pb-8 border-b border-gray-200/80">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between sm:justify-start gap-3">
              <div className="relative shrink-0 pt-1 order-2 sm:order-1" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Pengaturan siswa"
                >
                  <Settings size={20} strokeWidth={1.5} />
                </button>
                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 sm:left-0 top-full z-20 mt-2 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-md"
                  >
                    <Link
                      role="menuitem"
                      href="/student-dashboard/change-password"
                      className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
                      onClick={closeMenu}
                    >
                      Ganti password
                    </Link>
                  </div>
                ) : null}
              </div>
              <div className="min-w-0 order-1 sm:order-2">
                <h1 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-wide">
                  Student Dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-800">
                  ようこそ <span className="font-medium">{userLabel}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2 pl-0 sm:pl-11">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Tanggal &amp; waktu server (WIB)
              </p>
              <p className="text-base text-gray-900 leading-relaxed font-medium">
                {serverNow ? formatJapaneseDateTime(serverNow) : '—'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 inline-flex items-center gap-2 self-start rounded-md border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-600 hover:bg-red-800 hover:border-red-800 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </header>

        <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 lg:gap-12">
          <Link
            href="/student-dashboard/cv-form"
            className="group block relative bg-white no-underline text-inherit p-5 md:p-10 lg:p-14 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 border border-emerald-900/20 flex items-center justify-center mb-3 md:mb-5 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                <FileText className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-sm md:text-xl lg:text-2xl font-serif text-gray-900 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Data Diri
              </h2>
            </div>
          </Link>

          <Link
            href="/student-dashboard/profil"
            className="group block relative bg-white no-underline text-inherit p-5 md:p-10 lg:p-14 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 border border-emerald-900/20 flex items-center justify-center mb-3 md:mb-5 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                <UserRound className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-sm md:text-xl lg:text-2xl font-serif text-gray-900 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Profil
              </h2>
            </div>
          </Link>

          <Link
            href="/student-dashboard/kartu-keluarga"
            className="group block relative bg-white no-underline text-inherit p-5 md:p-10 lg:p-14 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 border border-emerald-900/20 flex items-center justify-center mb-3 md:mb-5 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                <Users className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-sm md:text-xl lg:text-2xl font-serif text-gray-900 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Kartu Keluarga
              </h2>
            </div>
          </Link>

          <Link
            href="/student-dashboard/peminatan"
            className="group block relative bg-white no-underline text-inherit p-5 md:p-10 lg:p-14 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 border border-emerald-900/20 flex items-center justify-center mb-3 md:mb-5 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                <Target className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-sm md:text-xl lg:text-2xl font-serif text-gray-900 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Peminatan
              </h2>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
