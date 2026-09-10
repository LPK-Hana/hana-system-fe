'use client';

import { useParams } from 'next/navigation';
import KkOcrEditorPage from '@/components/admin/KkOcrEditorPage';

export default function AdminKartuKeluargaPage() {
  const params = useParams();
  const noPeserta = decodeURIComponent(String(params.noPeserta));

  return (
    <KkOcrEditorPage
      noPeserta={noPeserta}
      backHref="/admin-dashboard/profil-siswa"
      backLabel="Kembali ke Profil Siswa"
    />
  );
}
