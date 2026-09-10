'use client';

import { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Isi sisa tinggi parent flex (pagination tetap terlihat di bawah). */
  fill?: boolean;
  /** Scroll vertikal — hanya jika baris per halaman > 10. */
  verticalScroll?: boolean;
};

export default function StickyHorizontalScroll({
  children,
  className = '',
  fill = false,
  verticalScroll = false,
}: Props) {
  const overflow = verticalScroll
    ? 'overflow-auto overscroll-contain'
    : 'overflow-x-auto overflow-y-hidden';

  return (
    <div
      className={`${fill ? 'flex-1 min-h-0' : ''} ${overflow} custom-scrollbar ${className}`}
    >
      {children}
    </div>
  );
}
