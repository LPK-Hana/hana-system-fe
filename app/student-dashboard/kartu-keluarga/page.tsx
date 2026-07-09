'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Edit3, Eye, FileText, Pencil } from 'lucide-react';
import { initialFormData, KkFormData, emptyMember } from './types';
import { parseKkDocument } from './utils/ocrParser';
import { Header } from './components/Header';
import { EditorPanel } from './components/EditorPanel';
import { DocumentPreview } from './components/DocumentPreview';
import ApiInputKk from '@/app/api/input-kk/api_input_kk';
import { mapToKKID, mapToKKJP } from './utils/mapper';
import { syncBasicFieldIdToJp, syncMemberIdToJp, translateToJp } from './utils/translations';
import { toast } from 'react-hot-toast';
import LoadingOverlay from '@/components/LoadingOverlay';

import { getKkPageSize } from './utils/kkPageSize';
import { useKkSourceImage } from './utils/useKkSourceImage';

export default function KartuKeluargaPage() {
  const [scale, setScale] = useState(0.78);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'edit_id' | 'edit_jp'>('upload');
  const [viewLanguage, setViewLanguage] = useState<'id' | 'jp'>('id');

  const [scaleMode, setScaleMode] = useState<'fit' | 'manual'>('fit');
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('edit');
  const [containerWidth, setContainerWidth] = useState(1122);
  const [containerHeight, setContainerHeight] = useState(794);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const { sourceUrl, fileName: sourceFileName, setSourceFile } = useKkSourceImage();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = previewContainerRef.current;
    if (!container) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (let entry of entries) {
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

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeMobileTab]);

  const { wPx: pageW, hPx: pageH } = getKkPageSize(viewLanguage);

  const scaleByWidth = (containerWidth - 64) / pageW;
  const scaleByHeight = (containerHeight - 64) / pageH;
  const fitScale = Math.min(scaleByWidth, scaleByHeight);

  const currentScale = scaleMode === 'fit'
    ? Math.max(0.2, Math.min(1.2, +fitScale.toFixed(3)))
    : scale;

  const [formData, setFormData] = useState<KkFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);
  // null = not yet fetched/no data, KkFormData = has saved data
  const [savedKKIDData, setSavedKKIDData] = useState<KkFormData | null>(null);
  const [savedKKJPData, setSavedKKJPData] = useState<KkFormData | null>(null);
  const [isViewingSaved, setIsViewingSaved] = useState(false);

  // Helper: convert API response detail to member format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const detailsToMembers = (details: any[]) => {
    const members = Array.from({ length: 10 }, () => ({ ...emptyMember }));
    details.forEach((d, i) => {
      if (i >= 10) return;
      members[i] = {
        name: d.nama_lengkap || '',
        nameJp: '',
        nik: d.nik || '',
        gender: d.jenis_kelamin || '',
        genderJp: '',
        pob: d.tempat_lahir || '',
        pobJp: '',
        dob: d.tanggal_lahir || '',
        religion: d.agama || '',
        religionJp: '',
        education: d.pendidikan || '',
        educationJp: '',
        occupation: d.pekerjaan || '',
        occupationJp: '',
        maritalStatus: d.status_perkawinan || '',
        maritalStatusJp: '',
        marriageDate: '',
        marriageDateJp: '',
        relationship: d.hub_keluarga || '',
        relationshipJp: translateToJp('relationship', d.hub_keluarga || ''),
        nationality: d.kewarganegaraan || '',
        nationalityJp: '',
        passport: d.no_paspor || '',
        kitas: d.no_kitas_kitap || '',
        father: d.nama_ayah || '',
        fatherJp: '',
        mother: d.nama_ibu || '',
        motherJp: '',
        bloodType: d.gol_darah || '',
        bloodTypeJp: '',
      };
    });
    return members;
  };

  // Fetch existing saved data on mount
  const fetchSavedData = useCallback(async () => {
    setIsFetchingInitial(true);
    try {
      const api = ApiInputKk();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [resId, resJp] = await Promise.allSettled([api.GetDataKKID(), api.GetDataKKJP()] as any);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (resId.status === 'fulfilled' && (resId as any).value?.status === 200 && (resId as any).value?.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = (resId as any).value.data;
        const loadedData = {
          header: { number: d.nomor_kk || '' },
          basic: {
            kepalaKeluarga: d.nama_kepala_keluarga || '',
            kepalaKeluargaJp: '',
            alamat: d.alamat || '',
            alamatJp: '',
            rtRw: d.rt_rw || '',
            rtRwJp: '',
            kelurahan: d.desa_kelurahan || '',
            kelurahanJp: '',
            kecamatan: d.kecamatan || '',
            kecamatanJp: '',
            kabKota: d.kab_kota || '',
            kabKotaJp: '',
            kodePos: d.kode_pos || '',
            provinsi: d.provinsi || '',
            provinsiJp: '',
          },
          members: detailsToMembers(d.details || []),
          footer: {
            issueDate: d.tgl_terbit || '',
            issueMonth: d.bln_terbit || '',
            issueYear: d.thn_terbit || '',
            kepalaDinas: d.nama_kepala_dinas || '',
            nip: d.nip_kadis || '',
          },
        };
        setSavedKKIDData(loadedData);
        setFormData(loadedData);
        setIsViewingSaved(true);
        setActiveTab('edit_id');
        setIsEditorCollapsed(true);
        setActiveMobileTab('preview');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (resJp.status === 'fulfilled' && (resJp as any).value?.status === 200 && (resJp as any).value?.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = (resJp as any).value.data;
        const dId = resId.status === 'fulfilled' ? (resId as any).value?.data : null;
        setSavedKKJPData({
          header: { number: d.nomor_kk || '' },
          basic: {
            kepalaKeluarga: dId?.nama_kepala_keluarga || '',
            kepalaKeluargaJp: d.nama_kepala_keluarga || '',
            alamat: '',
            alamatJp: d.alamat || '',
            rtRw: d.rt_rw || '',
            rtRwJp: '',
            kelurahan: '',
            kelurahanJp: d.desa_kelurahan || '',
            kecamatan: '',
            kecamatanJp: d.kecamatan || '',
            kabKota: '',
            kabKotaJp: d.kab_kota || '',
            kodePos: d.kode_pos || '',
            provinsi: '',
            provinsiJp: d.provinsi || '',
          },
          members: detailsToMembers(d.details || []),
          footer: {
            issueDate: d.tgl_terbit || '',
            issueMonth: d.bln_terbit || '',
            issueYear: d.thn_terbit || '',
            kepalaDinas: d.nama_kepala_dinas || '',
            nip: d.nip_kadis || '',
          },
        });
      }
    } catch {
      // no saved data yet, ignore
    } finally {
      setIsFetchingInitial(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSavedData();
  }, [fetchSavedData]);

  const updateBasic = (field: string, value: string, syncJpField?: string) => {
    setFormData(prev => ({
      ...prev,
      basic: {
        ...prev.basic,
        [field]: value,
        ...(syncJpField ? { [syncJpField]: syncBasicFieldIdToJp(field, value) } : {}),
      },
    }));
  };

  const updateHeader = (value: string) => {
    setFormData(prev => ({ ...prev, header: { number: value } }));
  };

  const updateFooter = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
  };

  const updateMember = (index: number, field: string, value: string, syncJpField?: string) => {
    setFormData(prev => {
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
    if (isViewingSaved) return;
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

  const handleSaveData = async () => {
    if (isViewingSaved) return;
    setIsSaving(true);
    try {
      const api = ApiInputKk();
      const payloadId = mapToKKID(formData);
      const payloadJp = mapToKKJP(formData);

      const saveKKID = isViewingSaved ? api.PutUpdateKKID : api.PostCreateKKID;
      const saveKKJP = isViewingSaved ? api.PutUpdateKKJP : api.PostCreateKKJP;

      const resId = await saveKKID(payloadId);
      if (resId.status === 200 || resId.status === 201) {
        // success ID
      } else {
        throw new Error(resId.data?.message || 'Gagal menyimpan data KK (ID)');
      }

      const resJp = await saveKKJP(payloadJp);
      if (resJp.status === 200 || resJp.status === 201) {
        // success JP
      } else {
        throw new Error(resJp.data?.message || 'Gagal menyimpan data KK (JP)');
      }

      toast.success('Berhasil menyimpan data Kartu Keluarga!');
      // Refresh saved data and switch to view mode
      await fetchSavedData();
    } catch (error: any) {
      toast.error(error?.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  // Always show formData in preview so edits are visible
  const savedPreviewData = formData;

  const isDataEmpty = !isViewingSaved &&
    !formData.header.number.trim() &&
    !formData.basic.kepalaKeluarga.trim() &&
    !formData.basic.alamat.trim() &&
    formData.members.every(m => !m.name.trim() && !m.nik.trim());

  if (isFetchingInitial) {
    return <LoadingOverlay fixed={true} text="MEMUAT DATA KK..." />;
  }

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
        onSave={handleSaveData}
        isDataEmpty={isDataEmpty}
        readOnly={isViewingSaved}
      />

      {/* ── Saved View Banner ── */}
      {isViewingSaved && savedPreviewData && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 lg:px-8 py-2.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <FileText size={16} />
            <span>Kartu Keluarga Anda telah tersimpan. Anda hanya dapat mengunduh dokumen ini.</span>
          </div>
        </div>
      )}

      {/* ── Mobile/Tablet Tabs Navigation ── */}
      {!isViewingSaved && (
        <div className="lg:hidden flex border-b border-slate-200/80 bg-white sticky top-[61px] z-15 shadow-sm/2 print:hidden">
            <button
              onClick={() => setActiveMobileTab('edit')}
              className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'edit' ? 'text-indigo-900 border-b-2 border-indigo-900 bg-indigo-50/10' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Edit3 size={15} />
              1. Edit Data Formulir
            </button>
            <button
              onClick={() => setActiveMobileTab('preview')}
              className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'preview' ? 'text-indigo-900 border-b-2 border-indigo-900 bg-indigo-50/10' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Eye size={15} />
              2. Lihat Dokumen A4 ({viewLanguage === 'id' ? 'ID' : 'JP'})
            </button>
        </div>
      )}

      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 flex-1 min-h-0 lg:overflow-hidden print:block print:p-0 print:m-0">
        {!isViewingSaved && (
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
            isExistingData={isViewingSaved}
          />
        )}
        <DocumentPreview
          activeMobileTab={isViewingSaved ? 'preview' : activeMobileTab}
          containerRef={previewContainerRef}
          currentScale={currentScale}
          viewLanguage={viewLanguage}
          formData={formData}
          sourceImageUrl={sourceUrl}
          sourceFileName={sourceFileName}
        />
      </div>

      {isSaving && <LoadingOverlay fixed={true} text="MENYIMPAN DATA KK..." />}

      <style jsx global>{`
        /* Custom scrollbars for a premium feel */
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

        /* Anti-pixelation rendering rules for screen scale */
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
          body * { visibility: hidden; }
          .kk-a4, .kk-a4 * { visibility: visible; }
          body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .kk-a4[data-kk-variant="jp"],
          .kk-a4[data-kk-variant="jp"] * {
            color: #000000 !important;
            -webkit-font-smoothing: auto !important;
            -moz-osx-font-smoothing: auto !important;
            text-rendering: geometricPrecision !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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
          @page { size: A4 landscape; margin: 0; }
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </main>
  );
}
