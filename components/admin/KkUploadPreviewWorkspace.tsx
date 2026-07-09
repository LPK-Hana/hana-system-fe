'use client';

import { useEffect, useRef, useState } from 'react';
import { Edit3, Eye } from 'lucide-react';
import { initialFormData, KkFormData } from '@/app/student-dashboard/kartu-keluarga/types';
import { Header, KkHeaderDocument } from '@/app/student-dashboard/kartu-keluarga/components/Header';
import { EditorPanel } from '@/app/student-dashboard/kartu-keluarga/components/EditorPanel';
import { DocumentPreview } from '@/app/student-dashboard/kartu-keluarga/components/DocumentPreview';
import { SuratTanggunganPreview } from '@/app/student-dashboard/kartu-keluarga/components/SuratTanggunganPreview';
import { SuratTanggunganEditorPanel, StEditorTab } from '@/app/student-dashboard/kartu-keluarga/components/SuratTanggunganEditorPanel';
import { parseKkDocument } from '@/app/student-dashboard/kartu-keluarga/utils/ocrParser';
import { syncBasicFieldIdToJp, syncMemberIdToJp } from '@/app/student-dashboard/kartu-keluarga/utils/translations';
import { emptyStDependent, initialSuratTanggunganData, parseSignDateId } from '@/app/student-dashboard/kartu-keluarga/types/suratTanggunganTypes';
import { buildSuratTanggunganFromKk } from '@/app/student-dashboard/kartu-keluarga/utils/suratTanggunganMapper';
import {
  syncStApplicantField,
  syncStDependentField,
  syncStMetaField,
} from '@/app/student-dashboard/kartu-keluarga/utils/suratTanggunganSync';

import { getKkPageSize } from '@/app/student-dashboard/kartu-keluarga/utils/kkPageSize';
import {
  getSuratTanggunganPageSize,
  getSuratTanggunganTotalHeightPx,
} from '@/app/student-dashboard/kartu-keluarga/utils/suratTanggunganPageSize';
import { exportBulkKkJpAndSuratTanggungan } from '@/app/student-dashboard/kartu-keluarga/utils/exportPemberkasanBulk';
import { useKkSourceImage } from '@/app/student-dashboard/kartu-keluarga/utils/useKkSourceImage';

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
  const [activeDocument, setActiveDocument] = useState<KkHeaderDocument>('kk');
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const { sourceUrl, fileName: sourceFileName, setSourceFile } = useKkSourceImage();
  const [formData, setFormData] = useState<KkFormData>(initialFormData);
  const [stFormData, setStFormData] = useState(initialSuratTanggunganData);
  const [stActiveTab, setStActiveTab] = useState<StEditorTab>('select');

  useEffect(() => {
    if (activeDocument === 'tanggungan') {
      setActiveMobileTab('edit');
    }
  }, [activeDocument]);

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
  }, [activeMobileTab, isEditorCollapsed, activeDocument]);

  const kkPageSize = getKkPageSize(viewLanguage);
  const stPageSize = getSuratTanggunganPageSize();
  const isTanggungan = activeDocument === 'tanggungan';
  const pageW = isTanggungan ? stPageSize.wPx : kkPageSize.wPx;
  const pageH = isTanggungan ? getSuratTanggunganTotalHeightPx() : kkPageSize.hPx;

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
        ...(syncJpField ? { [syncJpField]: syncBasicFieldIdToJp(field, value) } : {}),
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

    setSourceFile(file);
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

  const isStEmpty =
    stFormData.applicantMemberIndex === null || !stFormData.applicant.name.trim();

  const headerDataEmpty = isTanggungan ? isStEmpty : isDataEmpty;
  const isBulkEmpty = isDataEmpty || isStEmpty;

  const needHiddenKkJp = !isDataEmpty && !(activeDocument === 'kk' && viewLanguage === 'jp');
  const needHiddenSt = !isStEmpty && activeDocument !== 'tanggungan';

  const exportBufferRef = useRef<HTMLDivElement>(null);

  const pdfFileName = isTanggungan
    ? 'Surat_Tanggungan.pdf'
    : viewLanguage === 'id'
      ? 'KK_Preview_Indonesia.pdf'
      : 'KK_Preview_Jepang.pdf';

  const handleSelectApplicant = (memberIndex: number) => {
    try {
      const built = buildSuratTanggunganFromKk(formData, memberIndex);
      setStFormData(built);
      setStActiveTab('edit_id');
      setViewLanguage('id');
    } catch {
      // ignore invalid selection
    }
  };

  const updateStApplicant = (field: string, value: string) => {
    setStFormData((prev) => {
      const applicant = { ...prev.applicant, [field]: value };
      if (!field.endsWith('Jp') && field !== 'nameKatakana') {
        Object.assign(applicant, syncStApplicantField(field, value, formData.basic));
      }
      return { ...prev, applicant };
    });
  };

  const updateStDependent = (idx: number, field: string, value: string) => {
    setStFormData((prev) => {
      const dependents = [...prev.dependents];
      const row = { ...dependents[idx], [field]: value };
      if (!field.endsWith('Jp') && field !== 'nameKatakana') {
        Object.assign(row, syncStDependentField(field, value));
      }
      dependents[idx] = row;
      return { ...prev, dependents };
    });
  };

  const updateStDependentRelationship = (idx: number, relationship: string, relationshipJp: string) => {
    setStFormData((prev) => {
      const dependents = [...prev.dependents];
      dependents[idx] = { ...dependents[idx], relationship, relationshipJp };
      return { ...prev, dependents };
    });
  };

  const addStDependent = () => {
    setStFormData((prev) => ({
      ...prev,
      dependents: [...prev.dependents, emptyStDependent()],
    }));
  };

  const removeStDependent = (idx: number) => {
    setStFormData((prev) => ({
      ...prev,
      dependents: prev.dependents.filter((_, i) => i !== idx),
    }));
  };

  const updateStMeta = (field: keyof typeof stFormData, value: string) => {
    setStFormData((prev) => {
      if (field === 'signDateId') {
        const parts = parseSignDateId(value);
        return {
          ...prev,
          signDateId: value,
          signDateDay: parts.day,
          signDateMonth: parts.month,
          signDateYear: parts.year,
        };
      }
      if (field === 'signDateYear' || field === 'signDateMonth' || field === 'signDateDay') {
        const next = { ...prev, [field]: value };
        const day = field === 'signDateDay' ? value : prev.signDateDay;
        const month = field === 'signDateMonth' ? value : prev.signDateMonth;
        const year = field === 'signDateYear' ? value : prev.signDateYear;
        if (day && month && year) {
          next.signDateId = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
        }
        return next;
      }
      const patch: Partial<typeof stFormData> = { [field]: value };
      if (field !== 'locationJp' && field !== 'villageNameJp' && field !== 'applicantMemberIndex') {
        Object.assign(patch, syncStMetaField(field, value, formData.basic));
      }
      return { ...prev, ...patch };
    });
  };

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
        isDataEmpty={headerDataEmpty}
        backHref="/admin-dashboard/pemberkasan"
        backLabel="Kembali ke Pemberkasan"
        pdfFileName={pdfFileName}
        printAreaId={isTanggungan ? 'surat-tanggungan-print-area' : 'kk-print-area'}
        activeDocument={activeDocument}
        onDocumentChange={setActiveDocument}
        showBulkDownload
        isBulkEmpty={isBulkEmpty}
        onBulkDownload={() => void exportBulkKkJpAndSuratTanggungan()}
      />

      <div className="lg:hidden flex border-b border-slate-200/80 bg-white sticky top-[61px] z-15 shadow-sm/2 print:hidden">
        {activeDocument === 'kk' ? (
          <>
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
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveMobileTab('edit')}
              className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'edit' ? 'text-indigo-900 border-b-2 border-indigo-900 bg-indigo-50/10' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Edit3 size={15} />
              Edit Surat Tanggungan
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab('preview')}
              className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'preview' ? 'text-indigo-900 border-b-2 border-indigo-900 bg-indigo-50/10' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Eye size={15} />
              Preview ({viewLanguage === 'id' ? 'Lembar 1' : 'Lembar 2'})
            </button>
          </>
        )}
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 flex-1 min-h-0 lg:overflow-hidden print:block print:p-0 print:m-0">
        {activeDocument === 'kk' ? (
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
        ) : (
          <SuratTanggunganEditorPanel
            activeMobileTab={activeMobileTab}
            isEditorCollapsed={isEditorCollapsed}
            activeTab={stActiveTab}
            setActiveTab={setStActiveTab}
            setViewLanguage={setViewLanguage}
            kkFormData={formData}
            stFormData={stFormData}
            onSelectApplicant={handleSelectApplicant}
            updateApplicant={updateStApplicant}
            updateDependent={updateStDependent}
            updateDependentRelationship={updateStDependentRelationship}
            updateMeta={updateStMeta}
            onAddDependent={addStDependent}
            onRemoveDependent={removeStDependent}
          />
        )}

        {activeDocument === 'kk' ? (
          <DocumentPreview
            activeMobileTab={activeMobileTab}
            containerRef={previewContainerRef}
            currentScale={currentScale}
            viewLanguage={viewLanguage}
            formData={formData}
            sourceImageUrl={sourceUrl}
            sourceFileName={sourceFileName}
          />
        ) : (
          <SuratTanggunganPreview
            activeMobileTab={activeMobileTab}
            containerRef={previewContainerRef}
            currentScale={currentScale}
            viewLanguage={viewLanguage}
            formData={stFormData}
          />
        )}
      </div>

      {/* Buffer off-screen untuk export bulk / export saat tab tidak aktif */}
      <div
        className="fixed -left-[20000px] top-0 w-px h-px overflow-hidden opacity-0 pointer-events-none"
        aria-hidden
      >
        {needHiddenKkJp ? (
          <DocumentPreview
            activeMobileTab="preview"
            containerRef={exportBufferRef}
            currentScale={1}
            viewLanguage="jp"
            formData={formData}
            printAreaId="kk-print-area-jp-export"
          />
        ) : null}
        {needHiddenSt ? (
          <SuratTanggunganPreview
            activeMobileTab="preview"
            containerRef={exportBufferRef}
            currentScale={1}
            viewLanguage="id"
            formData={stFormData}
          />
        ) : null}
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

        .st-a4-page,
        .st-a4-page * {
          font-family: inherit;
        }

        .st-a4-page {
          text-rendering: geometricPrecision !important;
          -webkit-font-smoothing: auto !important;
          -moz-osx-font-smoothing: auto !important;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .kk-a4,
          .kk-a4 *,
          .st-a4-page,
          .st-a4-page * {
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
          #surat-tanggungan-print-area {
            position: static !important;
            width: auto !important;
            height: auto !important;
            transform: none !important;
          }
          #surat-tanggungan-print-area > div {
            position: static !important;
            transform: none !important;
            display: block !important;
            gap: 0 !important;
          }
          .st-a4-page {
            position: relative !important;
            width: 210mm !important;
            height: 297mm !important;
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
            break-after: page;
          }
          .st-page-inner {
            transform: scale(1.07) !important;
            transform-origin: top left !important;
          }
          .st-a4-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          @page kk-landscape {
            size: A4 landscape;
            margin: 0;
          }
          .kk-a4 {
            page: kk-landscape;
          }
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
