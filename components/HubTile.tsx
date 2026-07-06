import Link from 'next/link';
import type { ReactNode } from 'react';

export const hubTileClassName =
  'group relative overflow-hidden bg-white border border-emerald-200 py-4 px-3 flex flex-col items-center justify-center gap-1.5 no-underline transition-colors duration-300 hover:border-emerald-400 hover:bg-emerald-50/30';

export function hubGridClassName(cols: 3 | 4) {
  return cols === 3
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3';
}

type HubTileLinkProps = {
  href: string;
  label: string;
  sub: string;
  icon: ReactNode;
};

export function HubTileLink({ href, label, sub, icon }: HubTileLinkProps) {
  return (
    <Link href={href} className={hubTileClassName}>
      <span className="text-emerald-800">{icon}</span>
      <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-gray-800 group-hover:text-emerald-900">
        {label}
      </span>
      <span className="text-[9px] text-gray-400 tracking-wide">{sub}</span>
    </Link>
  );
}

type HubTileButtonProps = {
  label: string;
  sub: string;
  icon: ReactNode;
  onClick: () => void;
};

export function HubTileButton({ label, sub, icon, onClick }: HubTileButtonProps) {
  return (
    <button type="button" onClick={onClick} className={hubTileClassName}>
      <span className="text-emerald-800">{icon}</span>
      <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-gray-800 group-hover:text-emerald-900">
        {label}
      </span>
      <span className="text-[9px] text-gray-400 tracking-wide">{sub}</span>
    </button>
  );
}
