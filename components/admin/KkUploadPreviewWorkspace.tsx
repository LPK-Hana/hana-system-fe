'use client';

import { useEffect, useRef, useState } from 'react';
import { Edit3, Eye } from 'lucide-react';
import { initialFormData, KkFormData } from '@/app/student-dashboard/kartu-keluarga/types';
import { Header } from '@/app/student-dashboard/kartu-keluarga/components/Header';
import { EditorPanel } from '@/app/student-dashboard/kartu-keluarga/components/EditorPanel';
import { DocumentPreview } from '@/app/student-dashboard/kartu-keluarga/components/DocumentPreview';
import { parseKkDocument } from '@/app/student-dashboard/kartu-keluarga/utils/ocrParser';
import { syncBasicIdToJp, syncMemberIdToJp } from '@/app/student-dashboard/kartu-keluarga/utils/translations';

import { getKkPageSize } from '@/app/student-dashboard/kartu-keluarga/utils/kkPageSize';

export default function KkUploadPreviewWorkspace() {
  const [scale, setScale] = useState(0.78);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'edit_id' | 'edit_jp'>('upload');
  const [viewLanguage, setViewLanguage] = useState<'id' | 'jp'>('id');
  const [scaleMode, setScaleMode] = useState<'fit' | 'manual'>('fit');
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('edit');
  const [containerWidth, setContainerWidth] = useState(1122);
  const [containerHeight, setContainerHeight] = useState(794);
  const [formData, setFormData] = useState<KkFormData>(initialFormData);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = previewContainerRef.current;
    if (!container) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
          setContainerHeight(entry.contentRect.height);
        }
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const rect = container.getBoundingClientRect();
    if (rect.width > 0) {
      setContainerWidth(rect.width);
      setContainerHeight(rect.height);
    }

    return () => resizeObserver.disconnect();
  }, [activeMobileTab, isEditorCollapsed]);

  const { wPx: pageW, hPx: pageH } = getKkPageSize(viewLanguage);

  const scaleByWidth = (containerWidth - 64) / pageW;
  const scaleByHeight = (containerHeight - 64) / pageH;
  const fitScale = Math.min(scaleByWidth, scaleByHeight);
  const currentScale =
    scaleMode === 'fit' ? Math.max(0.2, Math.min(1.2, +fitScale.toFixed(3))) : scale;

  const updateBasic = (field: string, value: string, syncJpField?: string) => {
    setFormData((prev) => ({
      ...prev,
      basic: {
        ...prev.basic,
        [field]: value,
        ...(syncJpField ? { [syncJpField]: syncBasicIdToJp(value) } : {}),
      },
    }));
  };

  const updateHeader = (value: string) => {
    setFormData((prev) => ({ ...prev, header: { number: value } }));
  };

  const updateFooter = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
  };

  const updateMember = (index: number, field: string, value: string, syncJpField?: string) => {
    setFormData((prev) => {
      const newMembers = [...prev.members];
      newMembers[index] = {
        ...newMembers[index],
        [field]: value,
        ...(syncJpField ? { [syncJpField]: syncMemberIdToJp(field, value) } : {}),
      };
      return { ...prev, members: newMembers };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFormData = await parseKkDocument(file, formData, setOcrLoading);
    if (newFormData) {
      setFormData(newFormData);
      setActiveTab('edit_id');
      setActiveMobileTab('preview');
    }
    e.target.value = '';
  };

  const isDataEmpty =
    !formData.header.number.trim() &&
    !formData.basic.kepalaKeluarga.trim() &&
    !formData.basic.alamat.trim() &&
    formData.members.every((m) => !m.name.trim() && !m.nik.trim());

  const pdfFileName =
    viewLanguage === 'id' ? 'KK_Preview_Indonesia.pdf' : 'KK_Preview_Jepang.pdf';

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50/50 font-sans text-slate-800 pb-20 lg:pb-0 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Header
        viewLanguage={viewLanguage}
        setViewLanguage={setViewLanguage}
        scaleMode={scaleMode}
        setScaleMode={setScaleMode}
        currentScale={currentScale}
        setScale={setScale}
        isEditorCollapsed={isEditorCollapsed}
        setIsEditorCollapsed={setIsEditorCollapsed}
        isDataEmpty={isDataEmpty}
        backHref="/admin-dashboard/pemberkasan"
        backLabel="Kembali ke Pemberkasan"
        pdfFileName={pdfFileName}
      />

      <div className="lg:hidden flex border-b border-slate-200/80 bg-white sticky top-[61px] z-15 shadow-sm/2 print:hidden">
        <button
          type="button"
          onClick={() => setActiveMobileTab('edit')}
          className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'edit' ? 'text-indigo-900 border-b-2 border-indigo-900 bg-indigo-50/10' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Edit3 size={15} />
          1. Edit Data Formulir
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'preview' ? 'text-indigo-900 border-b-2 border-indigo-900 bg-indigo-50/10' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Eye size={15} />
          2. Lihat Dokumen A4 ({viewLanguage === 'id' ? 'ID' : 'JP'})
        </button>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 flex-1 min-h-0 lg:overflow-hidden print:block print:p-0 print:m-0">
        <EditorPanel
          activeMobileTab={activeMobileTab}
          isEditorCollapsed={isEditorCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setViewLanguage={setViewLanguage}
          ocrLoading={ocrLoading}
          handleFileUpload={handleFileUpload}
          formData={formData}
          updateHeader={updateHeader}
          updateBasic={updateBasic}
          updateMember={updateMember}
          updateFooter={updateFooter}
        />
        <DocumentPreview
          activeMobileTab={activeMobileTab}
          containerRef={previewContainerRef}
          currentScale={currentScale}
          viewLanguage={viewLanguage}
          formData={formData}
        />
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .kk-a4 {
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          image-rendering: -webkit-optimize-contrast !important;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .kk-a4,
        .kk-a4 * {
          font-family: inherit;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .kk-a4,
          .kk-a4 * {
            visibility: visible;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .kk-a4 {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            zoom: 1 !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
