'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { GraduationCap, BookOpen, List, Shield, Crown, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { authToast } from "@/lib/auth-toast";
import {
  AUTH_REASON_KEY,
  getDashboardPathForRole,
  saveAuthSession,
} from "@/lib/auth";
import { isDemoModeClient } from "@/lib/demo-mode";
import { enterDemoRole, type DemoRole } from "@/lib/demo-auth-client";
import ApiAuth from "@/app/api/auth/api_auth";
import raftelLogoHd from '@/logo/Raftel-HD.png';

type LoginKind = 'student' | 'guru' | 'admin' | 'superadmin' | 'guest';

const ROLE_LABEL: Record<LoginKind, string> = {
  student: 'Siswa',
  guru: 'Sensei',
  admin: 'Admin',
  superadmin: 'Shachou',
  guest: 'Guest',
};

function roleFromCredentials(cred: Record<string, unknown>): LoginKind {
  if (cred?.super_admin_id) return 'superadmin';
  if (cred?.guest_id) return 'guest';
  if (Number(cred?.is_guru) === 1) return 'guru';
  if (Number(cred?.is_admin) === 1) return 'admin';
  return 'student';
}

export default function HomePage() {
  const router = useRouter();
  const demoEnabled = isDemoModeClient();
  const [demoLoading, setDemoLoading] = useState<DemoRole | null>(null);
  const [kind, setKind] = useState<LoginKind>('student');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      authToast.sessionExpired();
    } else if (reason === "unauthorized") {
      authToast.unauthorized();
    } else if (reason === "logged_out") {
      authToast.loggedOut();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const api = ApiAuth();
      const payload = { user_name: userName.trim(), user_password: password, role: kind };
      let res: { status?: number; message?: string; token?: string; credentials?: Record<string, unknown> };
      if (kind === 'guest') {
        res = await api.postLoginGuest(payload);
      } else if (kind === 'superadmin') {
        res = await api.postLoginSuperAdmin(payload);
      } else {
        res = await api.postLogin(payload);
      }
      if (!res || res.status !== 200 || !res.token) {
        const msg = res?.message || 'Login gagal';
        if (/silakan pilih tab/i.test(msg)) {
          authToast.roleMismatch(msg);
        } else {
          authToast.loginFailed(msg);
        }
        return;
      }
      const cred = res.credentials || {};
      const authRole = roleFromCredentials(cred);
      if (authRole !== kind) {
        authToast.roleMismatch(
          `Akun ini adalah ${ROLE_LABEL[authRole]}. Silakan pilih tab ${ROLE_LABEL[authRole]}`,
        );
        return;
      }
      saveAuthSession(res.token, authRole, String(cred.user_name || userName), {
        userId: Number(cred.user_id || cred.guest_id || cred.super_admin_id || 0),
        name: String(cred.name || ''),
      });
      authToast.loginSuccess();
      router.push(getDashboardPathForRole());
    } catch {
      authToast.serverError();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoEnter = (role: DemoRole) => {
    if (demoLoading) return;
    setDemoLoading(role);
    try {
      const { redirect } = enterDemoRole(role);
      authToast.loginSuccess();
      router.push(redirect);
    } catch {
      authToast.loginFailed('Gagal masuk mode demo');
    } finally {
      setDemoLoading(null);
    }
  };

  const kinds: { id: LoginKind; label: string }[] = [
    { id: 'student', label: 'Siswa' },
    { id: 'guru', label: 'Sensei' },
    { id: 'admin', label: 'Admin' },
    { id: 'superadmin', label: 'Shachou' },
    { id: 'guest', label: 'Guest' },
  ];
  const selectedKind = kinds.find((k) => k.id === kind);
  const usernameHint = kind === 'student' ? 'NIM atau username' : 'Username';

  const demoButtons = [
    { role: 'student' as const, label: 'Siswa', sub: 'Dashboard siswa', icon: <GraduationCap size={18} /> },
    { role: 'guru' as const, label: 'Sensei', sub: '先生 · Progress belajar', icon: <BookOpen size={18} /> },
    { role: 'admin' as const, label: 'Admin', sub: 'Dashboard admin', icon: <Shield size={18} /> },
    { role: 'superadmin' as const, label: 'Shachou', sub: '社長 · Kelola admin', icon: <Crown size={18} /> },
    { role: 'guest' as const, label: '学生リスト', sub: 'Student List', icon: <List size={18} /> },
  ];

  return (
    <main className="min-h-screen bg-[#F5F9FC] flex items-center justify-center p-6 relative overflow-hidden font-sans text-gray-800">
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%232196F3' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-lg bg-white/90 px-7 py-9 sm:px-9 sm:py-10 rounded-xl border border-gray-200/70 shadow-[0_8px_30px_rgb(15,23,42,0.04)] flex flex-col items-center">
        <div className="relative mb-5 w-28 h-28 sm:w-32 sm:h-32">
          <Image
            src={raftelLogoHd}
            alt="LPK Raftel Satya Indonesia"
            fill
            sizes="(max-width: 640px) 112px, 128px"
            priority
            className="object-contain"
          />
        </div>

        <div className="flex flex-col items-center gap-1 mb-7">
          <p className="font-serif text-base text-gray-800 tracking-[0.12em] uppercase">
            Raftel System
          </p>
          <p className="text-[11px] text-gray-400 tracking-[0.18em]">ラフテル・システム</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <div className="flex rounded-lg border border-gray-200 bg-gray-50/80 p-0.5">
              {kinds.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  className={`flex-1 min-w-0 py-1.5 px-0.5 text-[10px] sm:text-[11px] font-medium rounded-md transition-colors ${
                    kind === k.id
                      ? 'bg-white text-raftel-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-center text-[11px] text-gray-400">
              Masuk sebagai {selectedKind?.label}
            </p>
          </div>
          <label className="block">
            <span className="text-xs text-gray-500">Username</span>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={usernameHint}
              className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-gray-300 focus:border-raftel-400 focus:ring-2 focus:ring-raftel-50"
              autoComplete="username"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Password</span>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none placeholder:text-gray-300 focus:border-raftel-400 focus:ring-2 focus:ring-raftel-50"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
              </button>
            </div>
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-1 rounded-lg bg-raftel-900 text-white py-2.5 text-sm font-medium tracking-wide hover:bg-raftel-950 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        {demoEnabled ? (
          <div className="w-full space-y-3 mt-8 pt-6 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center">
              Pilih akses demo
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {demoButtons.map((btn) => (
                <button
                  key={btn.role}
                  type="button"
                  onClick={() => void handleDemoEnter(btn.role)}
                  disabled={!!demoLoading}
                  className="group relative overflow-hidden bg-white border border-gray-200 rounded-lg py-3.5 px-3 flex flex-col items-center justify-center gap-1 transition-colors hover:border-raftel-300 hover:bg-raftel-50/30 disabled:opacity-60"
                >
                  <span className="text-raftel-800">{btn.icon}</span>
                  <span className="text-xs font-medium text-gray-800">
                    {demoLoading === btn.role ? 'Memuat...' : btn.label}
                  </span>
                  <span className="text-[10px] text-gray-400">{btn.sub}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
