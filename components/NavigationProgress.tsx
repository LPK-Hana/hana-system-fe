'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * NavigationProgress
 * ─────────────────
 * Slim top-bar progress indicator that animates on every route change.
 * - Starts on pathname change (navigation begin)
 * - Completes after a short delay once the new route has rendered
 * Uses only CSS transitions — no external library needed.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(pathname);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (completeRef.current) clearTimeout(completeRef.current);
    if (fadeRef.current) clearTimeout(fadeRef.current);
  };

  useEffect(() => {
    // Only trigger on actual navigation (pathname changed)
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    clear();

    // 1. Show bar and rush to ~70%
    setVisible(true);
    setProgress(0);

    timerRef.current = setTimeout(() => setProgress(70), 30);

    // 2. After a moment, complete to 100%
    completeRef.current = setTimeout(() => setProgress(100), 400);

    // 3. Fade out after completion
    fadeRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 750);

    return clear;
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Memuat halaman"
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
    >
      <div
        className="h-full bg-emerald-900 transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '300ms' : '400ms',
          opacity: visible ? 1 : 0,
          transitionProperty: 'width, opacity',
        }}
      />
      {/* Glow tip */}
      <div
        className="absolute top-0 right-0 h-[2px] w-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to left, #1e3a8a00, #1e3a8a)',
          opacity: visible && progress < 100 ? 0.6 : 0,
          transition: 'opacity 300ms',
        }}
      />
    </div>
  );
}
