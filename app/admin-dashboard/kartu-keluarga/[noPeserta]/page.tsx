'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Halaman redirect dari URL lama /admin-dashboard/kartu-keluarga/[noPeserta]
 * ke URL baru /admin-dashboard/profil-siswa/kartu-keluarga/[noPeserta]
 */
export default function KartuKeluargaRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const noPeserta = params?.noPeserta as string;

  useEffect(() => {
    if (noPeserta) {
      router.replace(`/admin-dashboard/profil-siswa/kartu-keluarga/${noPeserta}`);
    }
  }, [noPeserta, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Mengalihkan halaman…</p>
    </div>
  );
}
