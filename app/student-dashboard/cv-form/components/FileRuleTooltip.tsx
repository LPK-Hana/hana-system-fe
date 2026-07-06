'use client';

import { CircleHelp } from 'lucide-react';

/**
 * Ikon bantuan dengan tooltip terlihat (CSS hover/focus).
 * Tooltip native `title` saja sering lambat atau tidak terasa; ini menampilkan panel teks langsung.
 */
export function FileRuleTooltip({ text }: { text: string }) {
  return (
    <span
      className="group relative inline-flex shrink-0 cursor-help rounded p-0.5 align-middle text-slate-400 outline-none hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1"
      tabIndex={0}
      aria-label={`Informasi format file: ${text}`}
    >
      <CircleHelp className="h-4 w-4" strokeWidth={2} aria-hidden />
      <span
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 w-max max-w-[min(280px,85vw)] -translate-x-1/2 rounded-md bg-slate-800 px-2.5 py-2 text-left text-[11px] normal-case leading-snug whitespace-normal text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
        role="tooltip"
      >
        {text}
      </span>
    </span>
  );
}
