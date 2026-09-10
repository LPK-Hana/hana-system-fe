'use client';

import { Toaster } from 'react-hot-toast';

/** Satu instance untuk seluruh app — toast tetap tampil setelah navigasi (mis. setelah login). */
export function GlobalToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className:
          '!rounded-xl !shadow-lg !border !border-gray-100 !px-3 !py-2.5 !text-sm !text-gray-800',
        duration: 4000,
        success: { duration: 3500 },
        error: { duration: 4500 },
      }}
    />
  );
}
