'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { GraduationCap, BookOpen, List, Shield, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AUTH_REASON_KEY } from "@/lib/auth";
import { enterDemoRole, type DemoRole } from "@/lib/demo-auth-client";
import hanaLogo from '@/logo/hana-logo.png';

export default function HomePage() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState<DemoRole | null>(null);

  useEffect(() => {
    let reason: string | null = null;
    try {
      reason = sessionStorage.getItem(AUTH_REASON_KEY);
      if (reason) sessionStorage.removeItem(AUTH_REASON_KEY);
    } catch {
      /* ignore */
    }
    if (!reason) return;
    if (reason === "session_expired") {
      toast.error("Sesi berakhir. Silakan pilih akses lagi.");
    } else if (reason === "unauthorized") {
      toast.error("Sesi tidak valid. Silakan pilih akses lagi.");
    }
  }, []);

  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem('hana_demo_entering');
      } catch {
        /* ignore */
      }
    };
  }, []);

  const handleDemoEnter = (role: DemoRole) => {
    if (demoLoading) return;
    setDemoLoading(role);
    try {
      const { redirect } = enterDemoRole(role);
      router.push(redirect);
    } catch {
      toast.error('Gagal masuk mode demo');
    } finally {
      setDemoLoading(null);
    }
  };

  const demoButtons = [
    { role: 'student' as const, label: 'Siswa', sub: 'Dashboard siswa', icon: <GraduationCap size={18} /> },
    { role: 'guru' as const, label: 'Sensei', sub: '先生 · Progress belajar', icon: <BookOpen size={18} /> },
    { role: 'admin' as const, label: 'Admin', sub: 'Dashboard admin', icon: <Shield size={18} /> },
    { role: 'superadmin' as const, label: 'Shachou', sub: '社長 · Kelola admin', icon: <Crown size={18} /> },
    { role: 'guest' as const, label: '学生リスト', sub: 'Student List', icon: <List size={18} /> },
  ];

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 relative overflow-hidden font-sans text-gray-800">
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%23047857' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-xl bg-white p-8 sm:p-10 md:p-12 border border-gray-200/60 flex flex-col items-center">
        <div className="w-20 h-20 md:w-28 md:h-28 relative mb-6 md:mb-8 opacity-90 mix-blend-multiply">
          <Image
            src={hanaLogo}
            alt="Hana System"
            fill
            sizes="(max-width: 768px) 80px, 112px"
            priority
            className="object-contain"
          />
        </div>

        <div className="mb-2">
          <h1 className="text-2xl md:text-3xl font-serif text-emerald-900 tracking-[0.12em] uppercase text-center leading-snug">
            Hana System
          </h1>
        </div>

        <h2 className="text-[9px] md:text-[10px] font-semibold text-gray-400 tracking-[0.25em] md:tracking-[0.3em] uppercase mb-6 md:mb-8 text-center">
          Hana System Administration
        </h2>

        <div className="flex items-center w-full max-w-[200px] md:max-w-xs mb-6 md:mb-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        <div className="flex flex-col items-center gap-1.5 md:gap-2 mb-8 md:mb-10">
          <p className="font-serif text-sm md:text-base text-gray-800 tracking-[0.15em] md:tracking-[0.2em] text-center uppercase">
            Hana System
          </p>
          <p className="text-[11px] md:text-sm text-gray-400 font-serif tracking-[0.2em]">ハナ・システム</p>
        </div>

        <div className="w-full space-y-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center">
            Pilih Akses Demo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {demoButtons.map((btn) => (
              <button
                key={btn.role}
                type="button"
                onClick={() => void handleDemoEnter(btn.role)}
                disabled={!!demoLoading}
                className="group relative overflow-hidden bg-white border border-emerald-200 py-4 px-3 flex flex-col items-center justify-center gap-1.5 transition-colors duration-300 hover:border-emerald-400 hover:bg-emerald-50/30 disabled:opacity-60"
              >
                <span className="text-emerald-800">{btn.icon}</span>
                <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-gray-800 group-hover:text-emerald-900">
                  {demoLoading === btn.role ? 'Memuat...' : btn.label}
                </span>
                <span className="text-[9px] text-gray-400 tracking-wide">{btn.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
