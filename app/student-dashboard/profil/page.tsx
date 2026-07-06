'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Loader2, UserRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { defaultCVData } from '@/app/student-dashboard/cv-form/defaults';
import type { CVData } from '@/app/student-dashboard/cv-form/types';
import { mergeCVData } from '@/lib/student-profile-storage';
import ApiResume from '@/app/api/resume/api_resume';
import ProfileCvSections from './components/ProfileCvSections';
import { getAuthUserName } from '@/lib/auth';
import { mapApiResponseToCVData } from '@/lib/cv-mapper';

export default function StudentProfilPage() {
  const [apiCv, setApiCv] = useState<CVData | null>(null);
  const [mcuUrl, setMcuUrl] = useState('');
  const [mcuStatus, setMcuStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchMyResume = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiResume().getMyResume();
      if (res?.status === 200 && res.data) {
        const { cv, mcuUrl: mcu, mcuStatus: statusMcu } = mapApiResponseToCVData(res.data);
        setApiCv(cv);
        setMcuUrl(mcu);
        setMcuStatus(statusMcu);
      } else {
        setApiCv(null);
        setMcuUrl('');
        setMcuStatus('');
      }
    } catch {
      setApiCv(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    void fetchMyResume();
  }, [fetchMyResume]);

  // cv = data dari API jika ada, atau struktur kosong (semua —) jika belum isi CV
  const cv = apiCv ?? mergeCVData(defaultCVData);
  // cvNotFound = API tidak mengembalikan data → tampilkan banner info
  const cvNotFound = apiCv === null;

  const jmsDisplay = cv.informasi_dasar.no_peserta?.trim() || getAuthUserName() || '';
  const hasMcu = !!mcuUrl;

  const handleDownloadMcu = () => {
    if (!hasMcu) return;
    const a = document.createElement('a');
    a.href = mcuUrl;
    a.download = `HASIL_MCU_${jmsDisplay || 'SISWA'}.pdf`;
    a.target = '_blank';
    a.click();
  };

  if (!mounted || loading) {
    return (
      <main className="min-h-screen bg-[#F4F7F4] flex items-center justify-center text-gray-500 text-sm gap-2">
        <Loader2 size={16} className="animate-spin" />
        Memuat profil…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7F4] font-sans text-gray-800 p-6 md:p-12 relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%230047AB' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gray-200/50 pb-8">
          <div>
            <Link
              href="/student-dashboard"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-emerald-900/70 hover:text-emerald-900 mb-4"
            >
              <ArrowLeft size={14} />
              Kembali ke dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border border-emerald-900/20 flex items-center justify-center text-emerald-900 bg-white">
                <UserRound size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-serif text-gray-900 tracking-wide">Profil siswa</h1>
                <p className="text-sm font-light text-gray-500 mt-1">
                  Ringkasan data diri Anda.
                </p>
              </div>
            </div>
          </div>
        </header>

        {cvNotFound ? (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-emerald-50/80 border border-emerald-200/80 px-4 py-3 text-sm text-emerald-900">
            <p>
              <span className="font-semibold">Data diri belum tersedia:</span> Data Anda belum ditemukan di server —{' '}
              isi form data diri terlebih dahulu untuk menampilkan data lengkap.
            </p>
            <Link
              href="/student-dashboard/cv-form"
              className="shrink-0 text-xs tracking-widest uppercase font-semibold text-emerald-900 hover:underline"
            >
              Buka form data diri
            </Link>
          </div>
        ) : null}

        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200/60 p-8 md:p-10 shadow-sm min-w-0">
            <h2 className="text-xl font-serif text-gray-900 mb-2 tracking-wide">Data Lengkap</h2>
            <p className="text-xs text-gray-500 mb-8 pb-6 border-b border-gray-100">
              Data diambil langsung dari server berdasarkan akun yang sedang login.
            </p>
            <div className="mb-8 pb-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-500">
                  Dokumen Medical Checkup
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Status: <span className="font-medium">{mcuStatus || '-'}</span>
                </p>
              </div>
              {hasMcu ? (
                <button
                  type="button"
                  onClick={handleDownloadMcu}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs tracking-widest uppercase border border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors"
                >
                  <Download size={14} />
                  Download Hasil MCU
                </button>
              ) : (
                <span className="text-xs text-gray-400 italic">File belum tersedia</span>
              )}
            </div>
            <ProfileCvSections data={cv} />
          </div>
        </div>
      </div>
    </main>
  );
}
