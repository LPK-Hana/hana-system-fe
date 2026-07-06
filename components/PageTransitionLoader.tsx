'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader } from 'lucide-react';

/**
 * PageTransitionLoader
 * ─────────────────────
 * Shows a full-page overlay spinner on every client-side navigation.
 * - Appears when pathname changes (immediately)
 * - Disappears after the new page has rendered (short delay)
 */
export default function PageTransitionLoader() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [show, setShow] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    if (hideRef.current) clearTimeout(hideRef.current);

    setShow(true);

    // Auto-hide after the new page finishes rendering
    hideRef.current = setTimeout(() => {
      setShow(false);
    }, 600);

    return () => {
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Memuat halaman"
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-[#F4F7F4]/80 backdrop-blur-[2px] pointer-events-none"
      style={{
        animation: 'fadeInOverlay 150ms ease-out forwards',
      }}
    >
      {/* Spinner ring */}
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        {/* Outer decorative ring */}
        <div
          className="absolute inset-0 rounded-full border border-emerald-900/10"
          style={{ animation: 'pulseRing 1.5s ease-in-out infinite' }}
        />
        {/* Spinner */}
        <Loader
          size={28}
          strokeWidth={1.5}
          className="text-emerald-900"
          style={{ animation: 'spin 800ms linear infinite' }}
        />
      </div>

      {/* Label */}
      <p
        className="text-[11px] font-semibold tracking-[0.25em] uppercase text-emerald-900/60"
        style={{ animation: 'fadeInText 300ms 100ms ease-out both' }}
      >
        Memuat...
      </p>

      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeInText {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1);   opacity: 0.4; }
          50%       { transform: scale(1.15); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}
