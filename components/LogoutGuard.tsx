'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
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

// ─── Modal ───────────────────────────────────────────────────────────────────
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
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white shadow-2xl border border-gray-200">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
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
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 hover:border-gray-400 hover:text-gray-800 transition-colors"
          >
            Tidak
          </button>
          <button
            id="logout-guard-confirm"
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Guard ───────────────────────────────────────────────────────────────────
export function LogoutGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const isRestoringRef = useRef(false);

  // User membuka / dengan sesi aktif (mis. tombol back di HP sampai ke login)
  useEffect(() => {
    if (pathname !== '/') return;
    if (!hasActiveSession()) return;
    // Jangan ganggu saat user baru memilih role demo di homepage
    try {
      if (sessionStorage.getItem('gada_demo_entering') === '1') return;
    } catch {
      /* ignore */
    }
    setShowModal(true);
  }, [pathname]);

  useEffect(() => {
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

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
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
