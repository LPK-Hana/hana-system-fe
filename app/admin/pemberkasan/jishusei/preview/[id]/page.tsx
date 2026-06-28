"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Noto_Serif_JP } from "next/font/google";
import JishuseiPage1Document from '../../components/JishuseiPage1Document';
import { getEntryById } from '../../utils';
import { exportPage1ToPdf } from '../../exportPdf';
import type { JishuseiPage1Data } from '../../types';
import 'rsuite/dist/rsuite.min.css';

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [entry, setEntry] = useState<JishuseiPage1Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const id = Number(params.id);
    if (!id) {
      setError('ID tidak valid.');
      return;
    }
    const data = getEntryById(id);
    if (!data) {
      setError('Data tidak ditemukan.');
      return;
    }
    setEntry(data);
  }, [params.id]);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const available = containerRef.current.clientWidth - 32;
      const docWidthPx = (210 / 25.4) * 96;
      setScale(Math.min(1, available / docWidthPx));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [entry]);

  const handleDownload = useCallback(async () => {
    if (!entry) return;
    setDownloading(true);
    try {
      const safeName = entry.romajiName.replace(/\s+/g, '_') || 'Jishusei';
      await exportPage1ToPdf('jishusei-page1', `Riwayat_Hidup_${safeName}.pdf`);
    } catch (e) {
      console.error(e);
      setError('Gagal mengunduh PDF.');
    } finally {
      setDownloading(false);
    }
  }, [entry]);

  const docHeightPx = (297 / 25.4) * 96;

  return (
    <main className={`${notoSerifJP.className} h-screen bg-[#525659] flex flex-col overflow-hidden`}>
      <header className="bg-white border-b border-gray-200 p-4 px-6 shadow-sm flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/pemberkasan/jishusei")}
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-serif text-emerald-900 font-bold">Preview — Riwayat Hidup (Hal. 1)</h1>
            {entry && (
              <p className="text-xs text-gray-500">{entry.romajiName || 'Tanpa nama'}</p>
            )}
          </div>
        </div>

        {entry && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors text-sm"
          >
            {downloading ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Download size={18} className="mr-2" />
            )}
            {downloading ? 'Menyiapkan PDF...' : 'Download PDF A4'}
          </button>
        )}
      </header>

      <div ref={containerRef} className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
        {error ? (
          <div className="text-center text-red-100 font-bold mt-20 bg-red-900/40 p-6 rounded-xl">
            <p>{error}</p>
            <button onClick={() => router.push('/admin/pemberkasan/jishusei')} className="mt-4 text-emerald-300 underline text-sm">
              Kembali ke Daftar
            </button>
          </div>
        ) : entry ? (
          <div
            className="shadow-2xl"
            style={{
              width: `${(210 / 25.4) * 96 * scale}px`,
              height: `${docHeightPx * scale}px`,
            }}
          >
            <div
              style={{
                width: '210mm',
                height: '297mm',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <JishuseiPage1Document data={entry} />
            </div>
          </div>
        ) : (
          <div className="text-white/70 font-bold mt-20 animate-pulse">Memuat dokumen...</div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          header { display: none !important; }
          main { background: white !important; height: auto !important; }
          .jishusei-page1-doc {
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
        @page {
          size: A4 portrait;
          margin: 0;
        }
      `}</style>
    </main>
  );
}
