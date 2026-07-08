'use client';

import { Toaster } from 'react-hot-toast';

/** Satu instance untuk seluruh app — toast tetap tampil setelah navigasi (mis. setelah login). */
export function GlobalToaster() {
  return <Toaster position="top-center" />;
}
