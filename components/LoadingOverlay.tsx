import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingOverlayProps {
  /** Text to display below the spinner */
  text?: string;
  /** If true, the overlay covers the whole viewport, otherwise it covers the closest relative parent */
  fixed?: boolean;
}

export default function LoadingOverlay({ text = 'MEMUAT DATA...', fixed = false }: LoadingOverlayProps) {
  const positionClass = fixed ? 'fixed inset-0 z-[200]' : 'absolute inset-0 z-50';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${positionClass} flex flex-col items-center justify-center bg-[#FDFBF7]/80 backdrop-blur-[2px]`}
      style={{
        animation: 'fadeInOverlay 150ms ease-out forwards',
      }}
    >
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        <div
          className="absolute inset-0 rounded-full border border-emerald-900/10"
          style={{ animation: 'pulseRing 1.5s ease-in-out infinite' }}
        />
        <Loader
          size={28}
          strokeWidth={1.5}
          className="text-emerald-900"
          style={{ animation: 'spin 800ms linear infinite' }}
        />
      </div>
      <p
        className="text-[11px] font-semibold tracking-[0.25em] uppercase text-emerald-900/60"
        style={{ animation: 'fadeInText 300ms 100ms ease-out both' }}
      >
        {text}
      </p>
    </div>
  );
}
