"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { generateJishuseiPdf } from '../../../../../utils/pdfGenerator';
import 'rsuite/dist/rsuite.min.css';

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      const id = Number(params.id);
      const stored = localStorage.getItem('jishusei_data');

      if (!stored) {
        setError('Data tidak ditemukan.');
        return;
      }

      const allData = JSON.parse(stored);
      const entry = allData.find((item: any) => item.id === id);

      if (!entry) {
        setError('Entri data tidak ditemukan.');
        return;
      }

      try {
        // Convert date strings back to Date objects
        const formData = {
          ...entry,
          dateCreated: entry.dateCreated ? new Date(entry.dateCreated) : null,
          birthDate: entry.birthDate ? new Date(entry.birthDate) : null,
          schoolStart: entry.schoolStart ? new Date(entry.schoolStart) : null,
          schoolEnd: entry.schoolEnd ? new Date(entry.schoolEnd) : null,
          work1Start: entry.work1Start ? new Date(entry.work1Start) : null,
          work1End: entry.work1End ? new Date(entry.work1End) : null,
        };
        const url = await generateJishuseiPdf(formData);
        setPdfUrl(url);
      } catch (e) {
        console.error(e);
        setError('Gagal membuat pratinjau PDF.');
      }
    };

    fetchPdf();
  }, [params.id]);

  return (
    <main className="h-screen bg-[#F4F7F4] flex flex-col font-sans text-gray-800 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 p-4 px-8 shadow-sm flex items-center justify-between z-10 relative shrink-0 h-20">
        <div className="flex items-center gap-5">
          <button
            onClick={() => router.push("/admin/pemberkasan/jishusei")}
            className="flex items-center justify-center w-11 h-11 bg-white border border-gray-200 !rounded-xl shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="text-2xl font-serif text-emerald-900 font-bold leading-none mt-1">
            Pratinjau Dokumen
          </div>
        </div>

        {pdfUrl && (
          <a
            className="flex items-center !bg-emerald-600 hover:!bg-emerald-700 !text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors text-sm"
            href={pdfUrl}
            target="_blank"
            download="Dokumen_Jishusei.pdf"
          >
            <Download size={18} className="inline-block mr-2" /> Unduh File PDF
          </a>
        )}
      </header>

      {/* PDF Viewport */}
      <div className="flex-1 bg-gray-100/80 p-4 md:p-8 flex justify-center items-start overflow-auto">
        {error ? (
          <div className="text-center text-red-500 font-bold mt-20">
            <p>{error}</p>
            <button onClick={() => router.push('/admin/pemberkasan/jishusei')} className="mt-4 text-emerald-600 underline">Kembali ke Daftar</button>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full max-w-5xl h-[calc(100vh-8rem)] bg-white shadow-2xl rounded-xl border border-gray-200"
            title="PDF Document Viewer"
          />
        ) : (
          <div className="text-center animate-pulse text-gray-500 font-bold mt-20">
            Menyiapkan Dokumen PDF...
          </div>
        )}
      </div>
    </main>
  );
}
