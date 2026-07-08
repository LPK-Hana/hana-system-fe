'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LogOut,
  Settings,
  UserPlus,
  Users,
  Briefcase,
  UserCog,
  FolderOpen,
} from 'lucide-react';
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

export default function AdminDashboardMainPage() {
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
      setUserLabel(getAuthDisplayName() || getAuthUserName() || 'Administrator');
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
    <main className="h-dvh bg-[#FDFBF7] font-sans text-gray-800 p-4 md:p-8 relative overflow-hidden flex flex-col">
      <div
        className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%23047857' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 pb-4 border-b border-gray-200/80 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div className="relative shrink-0 pt-1" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Pengaturan administrator"
                >
                  <Settings size={20} strokeWidth={1.5} />
                </button>
                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-20 mt-2 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-md"
                  >
                    <Link
                      role="menuitem"
                      href="/admin-dashboard/change-password"
                      className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
                      onClick={closeMenu}
                    >
                      Ganti password
                    </Link>
                  </div>
                ) : null}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-serif font-normal text-gray-900 tracking-wide">
                  Administrator Dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-800">
                  Selamat datang di sistem Hana,{' '}
                  <span className="font-medium">{userLabel}</span>
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1 pl-0 sm:pl-11">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
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

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5 flex-1 min-h-0 content-start">
          <Link
            href="/admin-dashboard/profil-siswa"
            className="group block relative bg-white no-underline text-inherit p-6 md:p-8 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden lg:col-span-2"
          >
            <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
            <div className="relative z-10">
              <div className="w-11 h-11 border border-emerald-900/20 flex items-center justify-center mb-4 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                <Users size={22} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-serif font-normal text-gray-900 mb-3 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Profil Siswa
              </h2>
              <div className="flex items-center text-xs tracking-widest uppercase text-emerald-900 font-semibold">
                <span className="relative">
                  Kelola Profil
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-900 group-hover:w-full transition-all duration-500 ease-out" />
                </span>
                <svg className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-500 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/admin-dashboard/add-account"
            className="group block relative bg-white no-underline text-inherit p-6 md:p-8 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden lg:col-span-2"
          >
            <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
            <div className="relative z-10">
              <div className="w-11 h-11 border border-emerald-900/20 flex items-center justify-center mb-4 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                <UserPlus size={22} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-serif font-normal text-gray-900 mb-3 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Buat Akun Siswa
              </h2>
              <div className="flex items-center text-xs tracking-widest uppercase text-emerald-900 font-semibold">
                <span className="relative">
                  Buat Akun
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-900 group-hover:w-full transition-all duration-500 ease-out" />
                </span>
                <svg className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-500 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/admin-dashboard/job-management"
            className="group block relative bg-white no-underline text-inherit p-6 md:p-8 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden lg:col-span-2"
          >
            <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
            <div className="relative z-10">
              <div className="w-11 h-11 border border-emerald-900/20 flex items-center justify-center mb-4 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                <Briefcase size={22} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-serif font-normal text-gray-900 mb-3 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Job Management
              </h2>
              <div className="flex items-center text-xs tracking-widest uppercase text-emerald-900 font-semibold">
                <span className="relative">
                  Kelola Job
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-900 group-hover:w-full transition-all duration-500 ease-out" />
                </span>
                <svg className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-500 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/admin-dashboard/student-account-management"
            className="group block relative bg-white no-underline text-inherit p-6 md:p-8 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden lg:col-span-2 lg:col-start-2"
          >
            <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
            <div className="relative z-10">
              <div className="w-11 h-11 border border-emerald-900/20 flex items-center justify-center mb-4 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                <UserCog size={22} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-serif font-normal text-gray-900 mb-3 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Student Account Management
              </h2>
              <div className="flex items-center text-xs tracking-widest uppercase text-emerald-900 font-semibold">
                <span className="relative">
                  Kelola Akun
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-900 group-hover:w-full transition-all duration-500 ease-out" />
                </span>
                <svg className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-500 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
          <Link
            href="/admin-dashboard/pemberkasan"
            className="group block relative bg-white no-underline text-inherit p-6 md:p-8 border border-gray-200/60 hover:border-emerald-900/30 transition-colors duration-700 ease-out overflow-hidden lg:col-span-2 lg:col-start-4"
          >
            <div className="absolute inset-0 bg-emerald-50/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />
            <div className="relative z-10">
              <div className="w-11 h-11 border border-emerald-900/20 flex items-center justify-center mb-4 text-emerald-900 bg-white group-hover:bg-emerald-900 group-hover:text-white transition-colors duration-500 ease-out">
                <FolderOpen size={22} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-serif font-normal text-gray-900 mb-3 tracking-wide group-hover:text-emerald-950 transition-colors duration-500">
                Pemberkasan
              </h2>
              <div className="flex items-center text-xs tracking-widest uppercase text-emerald-900 font-semibold">
                <span className="relative">
                  Kelola Dokumen
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-900 group-hover:w-full transition-all duration-500 ease-out" />
                </span>
                <svg className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-500 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
