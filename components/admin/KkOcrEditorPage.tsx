'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  User,
} from 'lucide-react';
import { KkFormData } from '@/app/student-dashboard/kartu-keluarga/types';
import { EditorPanel } from '@/app/student-dashboard/kartu-keluarga/components/EditorPanel';
import { DocumentPreview } from '@/app/student-dashboard/kartu-keluarga/components/DocumentPreview';
import { exportKKToPDF } from '@/app/student-dashboard/kartu-keluarga/utils/exportKkPdf';
import { parseKkDocument } from '@/app/student-dashboard/kartu-keluarga/utils/ocrParser';
import ApiInputKk from '@/app/api/input-kk/api_input_kk';
import { mapToKKID, mapToKKJP } from '@/app/student-dashboard/kartu-keluarga/utils/mapper';
import { syncBasicIdToJp, syncMemberIdToJp, translateToJp } from '@/app/student-dashboard/kartu-keluarga/utils/translations';
import { toast } from 'react-hot-toast';
import LoadingOverlay from '@/components/LoadingOverlay';

const emptyMember = {
  name: '',
  nameJp: '',
  nik: '',
  gender: '',
  genderJp: '',
  pob: '',
  pobJp: '',
  dob: '',
  religion: '',
  religionJp: '',
  education: '',
  educationJp: '',
  occupation: '',
  occupationJp: '',
  maritalStatus: '',
  maritalStatusJp: '',
  marriageDate: '',
  marriageDateJp: '',
  relationship: '',
  relationshipJp: '',
  nationality: '',
  nationalityJp: '',
  passport: '',
  kitas: '',
  father: '',
  fatherJp: '',
  mother: '',
  motherJp: '',
  bloodType: '',
  bloodTypeJp: '',
};

import { getKkPageSize } from '@/app/student-dashboard/kartu-keluarga/utils/kkPageSize';

const EMPTY_KK_DATA: KkFormData = {
  header: { number: '' },
  basic: {
    kepalaKeluarga: '',
    alamat: '',
    rtRw: '',
    kelurahan: '',
    kecamatan: '',
    kabKota: '',
    kodePos: '',
    provinsi: '',
  },
  members: Array.from({ length: 10 }, () => ({ ...emptyMember })),
  footer: {
    issueYear: '',
    issueMonth: '',
    issueDate: '',
    nip: '',
    kepalaDinas: '',
  },
};

type Props = {
  noPeserta: string;
  backHref: string;
  backLabel: string;
};

export default function KkOcrEditorPage({ noPeserta, backHref, backLabel }: Props) {
  const [scale, setScale] = useState(0.78);
  const [activeTab, setActiveTab] = useState<'upload' | 'edit_id' | 'edit_jp'>('upload');
  const [viewLanguage, setViewLanguage] = useState<'id' | 'jp'>('id');
  const [scaleMode, setScaleMode] = useState<'fit' | 'manual'>('fit');
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('edit');
  const [containerWidth, setContainerWidth] = useState(1122);
  const [containerHeight, setContainerHeight] = useState(794);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<KkFormData>(EMPTY_KK_DATA);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [isExistingData, setIsExistingData] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergeDetailsToMembers = (detailsId: any[], detailsJp: any[]) => {
    const members = Array.from({ length: 10 }, () => ({ ...emptyMember }));
    detailsId.forEach((dId, i) => {
      if (i >= 10) return;
      const dJp = detailsJp[i] || {};
      members[i] = {
        name: dId.nama_lengkap || '',
        nameJp: dJp.nama_lengkap || '',
        nik: dId.nik || '',
        gender: dId.jenis_kelamin || '',
        genderJp: dJp.jenis_kelamin || '',
        pob: dId.tempat_lahir || '',
        pobJp: dJp.tempat_lahir || '',
        dob: dId.tanggal_lahir || '',
        religion: dId.agama || '',
        religionJp: dJp.agama || '',
        education: dId.pendidikan || '',
        educationJp: dJp.pendidikan || '',
        occupation: dId.pekerjaan || '',
        occupationJp: dJp.pekerjaan || '',
        maritalStatus: dId.status_perkawinan || '',
        maritalStatusJp: dJp.status_perkawinan || '',
        marriageDate: '',
        marriageDateJp: '',
        relationship: dId.hub_keluarga || '',
        relationshipJp: translateToJp('relationship', dJp.hub_keluarga || dId.hub_keluarga || ''),
        nationality: dId.kewarganegaraan || '',
        nationalityJp: dJp.kewarganegaraan || '',
        passport: dId.no_paspor || '',
        kitas: dId.no_kitas_kitap || '',
        father: dId.nama_ayah || '',
        fatherJp: dJp.nama_ayah || '',
        mother: dId.nama_ibu || '',
        motherJp: dJp.nama_ibu || '',
        bloodType: dId.gol_darah || '',
        bloodTypeJp: dJp.gol_darah || '',
      };
    });
    return members;
  };

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const api = ApiInputKk();
      const checkRes = await api.GetCheckKK(noPeserta);

      if (checkRes?.status === 200 && (checkRes.data?.has_kk_id || checkRes.data?.has_kk_jp)) {
        setIsExistingData(true);
        setActiveTab('edit_id');

        const [resId, resJp] = await Promise.allSettled([
          api.GetAdminDataKKID(noPeserta),
          api.GetAdminDataKKJP(noPeserta),
        ] as const);

        const dId =
          resId.status === 'fulfilled' && resId.value?.status === 200 ? resId.value.data : {};
        const dJp =
          resJp.status === 'fulfilled' && resJp.value?.status === 200 ? resJp.value.data : {};

        setFormData({
          header: { number: dId.nomor_kk || dJp.nomor_kk || '' },
          basic: {
            kepalaKeluarga: dId.nama_kepala_keluarga || '',
            kepalaKeluargaJp: dJp.nama_kepala_keluarga || '',
            alamat: dId.alamat || '',
            alamatJp: dJp.alamat || '',
            rtRw: dId.rt_rw || '',
            rtRwJp: dJp.rt_rw || '',
            kelurahan: dId.desa_kelurahan || '',
            kelurahanJp: dJp.desa_kelurahan || '',
            kecamatan: dId.kecamatan || '',
            kecamatanJp: dJp.kecamatan || '',
            kabKota: dId.kab_kota || '',
            kabKotaJp: dJp.kab_kota || '',
            kodePos: dId.kode_pos || '',
            provinsi: dId.provinsi || '',
            provinsiJp: dJp.provinsi || '',
          },
          footer: {
            issueDate: dId.tgl_terbit || dJp.tgl_terbit || '',
            issueMonth: dId.bln_terbit || dJp.bln_terbit || '',
            issueYear: dId.thn_terbit || dJp.thn_terbit || '',
            kepalaDinas: dId.nama_kepala_dinas || dJp.nama_kepala_dinas || '',
            nip: dId.nip_kadis || dJp.nip_kadis || '',
          },
          members: mergeDetailsToMembers(dId.details || [], dJp.details || []),
        });
      } else {
        setIsExistingData(false);
        setFormData(EMPTY_KK_DATA);
        setActiveTab('upload');
      }
    } catch (error) {
      console.error(error);
      setIsExistingData(false);
      setActiveTab('upload');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noPeserta]);

  useEffect(() => {
    if (activeTab === 'edit_jp') setViewLanguage('jp');
    else if (activeTab === 'edit_id') setViewLanguage('id');
  }, [activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFormData = await parseKkDocument(file, formData, setOcrLoading);
    if (newFormData) {
      setFormData(newFormData);
      setActiveTab('edit_id');
      setActiveMobileTab('edit');
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const api = ApiInputKk();
      const payloadId = { user_name: noPeserta, ...mapToKKID(formData) };
      const payloadJp = { user_name: noPeserta, ...mapToKKJP(formData) };

      const saveKKID = isExistingData ? api.PutUpdateKKID : api.PostCreateKKID;
      const saveKKJP = isExistingData ? api.PutUpdateKKJP : api.PostCreateKKJP;

      const resId = await saveKKID(payloadId);
      if (resId.status !== 200 && resId.status !== 201) {
        throw new Error(resId.message || resId.data?.message || 'Gagal menyimpan data KK (ID)');
      }

      const resJp = await saveKKJP(payloadJp);
      if (resJp.status !== 200 && resJp.status !== 201) {
        throw new Error(resJp.message || resJp.data?.message || 'Gagal menyimpan data KK (JP)');
      }

      toast.success(isExistingData ? 'Berhasil menyimpan revisi data KK!' : 'Berhasil membuat data KK baru!');
      setIsExistingData(true);
      await fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

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
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    const rect = container.getBoundingClientRect();
    if (rect.width > 0) {
      setContainerWidth(rect.width);
      setContainerHeight(rect.height);
    }
    return () => ro.disconnect();
  }, [activeMobileTab]);

  const { wPx: pageW, hPx: pageH } = getKkPageSize(viewLanguage);

  const scaleByWidth = (containerWidth - 64) / pageW;
  const scaleByHeight = (containerHeight - 64) / pageH;
  const fitScale = Math.min(scaleByWidth, scaleByHeight);
  const currentScale =
    scaleMode === 'fit' ? Math.max(0.2, Math.min(1.2, +fitScale.toFixed(3))) : scale;

  const updateBasic = (field: string, value: string, syncJpField?: string) =>
    setFormData((prev) => ({
      ...prev,
      basic: {
        ...prev.basic,
        [field]: value,
        ...(syncJpField ? { [syncJpField]: syncBasicIdToJp(value) } : {}),
      },
    }));

  const updateHeader = (value: string) => setFormData((prev) => ({ ...prev, header: { number: value } }));

  const updateFooter = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, footer: { ...prev.footer, [field]: value } }));

  const updateMember = (index: number, field: string, value: string, syncJpField?: string) =>
    setFormData((prev) => {
      const newMembers = [...prev.members];
      newMembers[index] = {
        ...newMembers[index],
        [field]: value,
        ...(syncJpField ? { [syncJpField]: syncMemberIdToJp(field, value) } : {}),
      };
      return { ...prev, members: newMembers };
    });

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50/50 font-sans text-slate-800 pb-20 lg:pb-0 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 md:px-8 py-3.5 flex flex-wrap gap-3 items-center justify-between print:hidden sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all border border-slate-200 bg-white px-3.5 py-1.5 rounded-lg hover:border-slate-350 active:scale-98 shadow-sm"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            {backLabel}
          </Link>
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
            <User size={13} className="text-emerald-600" />
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block leading-none">
                No. Peserta
              </span>
              <span className="text-xs font-bold text-emerald-900">{noPeserta}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg border shadow-sm bg-slate-100 border-slate-200">
            <button
              type="button"
              onClick={() => setViewLanguage('id')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewLanguage === 'id' ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setViewLanguage('jp')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewLanguage === 'jp' ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
            >
              JP
            </button>
          </div>

          <div className="hidden sm:block w-px h-5 bg-slate-200" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScaleMode((m) => (m === 'fit' ? 'manual' : 'fit'))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 shadow-sm ${scaleMode === 'fit' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {scaleMode === 'fit' ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              <span>Auto-Fit</span>
            </button>
            <div className="flex items-center gap-1 p-0.5 rounded-lg border shadow-sm bg-slate-100/80 border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setScaleMode('manual');
                  setScale((s) => Math.max(0.3, +(currentScale - 0.05).toFixed(2)));
                }}
                className="p-1 rounded transition-all hover:bg-white text-slate-500 hover:text-slate-800"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-semibold min-w-[36px] text-center tabular-nums select-none text-slate-600">
                {Math.round(currentScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => {
                  setScaleMode('manual');
                  setScale((s) => Math.min(1.5, +(currentScale + 0.05).toFixed(2)));
                }}
                className="p-1 rounded transition-all hover:bg-white text-slate-500 hover:text-slate-800"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>

          <div className="hidden lg:block w-px h-5 bg-slate-200" />

          <button
            type="button"
            onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs font-semibold shadow-sm transition-all bg-white border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            {isEditorCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            <span>{isEditorCollapsed ? 'Buka Form' : 'Fokus Pratinjau'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-md transition-all"
          >
            <span>{isSaving ? 'Menyimpan...' : isExistingData ? 'Simpan Revisi' : 'Simpan'}</span>
          </button>

          <button
            type="button"
            onClick={() => exportKKToPDF('kk-print-area', `KK_${noPeserta}_${viewLanguage.toUpperCase()}.pdf`, viewLanguage)}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-white text-xs font-semibold rounded-lg shadow-md transition-all bg-indigo-900 hover:bg-indigo-800 active:scale-95"
          >
            <Printer size={14} strokeWidth={2} />
            <span>Cetak PDF</span>
          </button>
        </div>
      </header>

      <div className="lg:hidden flex border-b border-slate-200/80 bg-white sticky top-[61px] z-15 shadow-sm print:hidden">
        <button
          type="button"
          onClick={() => setActiveMobileTab('edit')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'edit' ? 'text-indigo-900 border-b-2 border-indigo-900 bg-indigo-50/10' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Edit3 size={15} />
          Edit Form
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'preview' ? 'text-indigo-900 border-b-2 border-indigo-900 bg-indigo-50/10' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Eye size={15} />
          Pratinjau ({viewLanguage === 'id' ? 'ID' : 'JP'})
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
          autoTranslateNames={false}
        />

        <DocumentPreview
          activeMobileTab={activeMobileTab}
          containerRef={previewContainerRef}
          currentScale={currentScale}
          viewLanguage={viewLanguage}
          formData={formData}
        />
      </div>

      {(isFetching || isSaving) && (
        <LoadingOverlay fixed text={isSaving ? 'MENYIMPAN DATA...' : 'MEMUAT DATA...'} />
      )}

      <style jsx global>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
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
          .kk-a4 {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 297mm !important; height: 210mm !important;
            transform: none !important; box-shadow: none !important;
            margin: 0 !important; padding: 12mm 15mm !important;
            zoom: 1 !important;
          }
          @page { size: A4 landscape; margin: 0; }
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </main>
  );
}
