'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import {
  LOGOUT_CONFIRM_EVENT,
  getAuthToken,
  getDashboardPathForRole,
  hasActiveSession,
  logoutUser,
} from '@/lib/auth';

const PROTECTED_PREFIXES = [
  '/admin-dashboard',
  '/student-dashboard',
  '/cust-page',
  '/super-admin',
];

function isProtectedPath(path: string) {
  return PROTECTED_PREFIXES.some((p) => path.startsWith(p));
}

function LogoutConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-amber-600" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Keluar dari Akun?</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed pl-11">
            Apakah Anda ingin keluar dari akun ini? Sesi anda akan berakhir dan
            Anda perlu login kembali.
          </p>
        </div>

        <div className="px-6 py-4 flex items-center justify-end gap-3 bg-gray-50">
          <button
            id="logout-guard-cancel"
            onClick={onCancel}
            className="px-5 py-2 text-sm font-medium text-gray-600 rounded-lg border border-gray-300 hover:border-gray-400 hover:text-gray-800 transition-colors"
          >
            Tidak
          </button>
          <button
            id="logout-guard-confirm"
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function LogoutGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const isRestoringRef = useRef(false);

  useEffect(() => {
    if (pathname !== '/') return;
    if (!hasActiveSession()) return;
    try {
      if (sessionStorage.getItem('raftel_demo_entering') === '1') return;
    } catch {
      /* ignore */
    }
    setShowModal(true);
  }, [pathname]);

  useEffect(() => {
    const handleLogoutRequest = () => {
      if (!hasActiveSession()) {
        logoutUser();
        return;
      }
      setShowModal(true);
    };

    const handlePopState = () => {
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
        return;
      }

      const token = getAuthToken();
      if (!token && !hasActiveSession()) return;

      const destinationPath = window.location.pathname;

      if (destinationPath === '/' || !isProtectedPath(destinationPath)) {
        if (destinationPath === '/') {
          setShowModal(true);
          return;
        }

        isRestoringRef.current = true;
        window.history.go(1);
        setShowModal(true);
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      if (window.location.pathname === '/' && hasActiveSession()) {
        setShowModal(true);
      }
    };

    window.addEventListener(LOGOUT_CONFIRM_EVENT, handleLogoutRequest);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener(LOGOUT_CONFIRM_EVENT, handleLogoutRequest);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const handleConfirm = () => {
    setShowModal(false);
    logoutUser();
  };

  const handleCancel = () => {
    setShowModal(false);
    if (window.location.pathname === '/') {
      router.replace(getDashboardPathForRole());
    }
  };

  if (!showModal) return null;
  return <LogoutConfirmModal onConfirm={handleConfirm} onCancel={handleCancel} />;
}
