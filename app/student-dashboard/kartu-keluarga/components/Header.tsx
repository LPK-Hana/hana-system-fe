import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportKKToPDF } from '../utils/exportKkPdf';

interface HeaderProps {
  viewLanguage: 'id' | 'jp';
  setViewLanguage: (lang: 'id' | 'jp') => void;
  scaleMode: 'fit' | 'manual';
  setScaleMode: React.Dispatch<React.SetStateAction<'fit' | 'manual'>>;
  currentScale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  isEditorCollapsed: boolean;
  setIsEditorCollapsed: (collapsed: boolean) => void;
  onSave?: () => void;
  isDataEmpty?: boolean;
  readOnly?: boolean;
  backHref?: string;
  backLabel?: string;
  printAreaId?: string;
  pdfFileName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  viewLanguage,
  setViewLanguage,
  scaleMode,
  setScaleMode,
  currentScale,
  setScale,
  isEditorCollapsed,
  setIsEditorCollapsed,
  onSave,
  isDataEmpty,
  readOnly,
  backHref = '/student-dashboard',
  backLabel = 'Kembali ke Dashboard',
  printAreaId = 'kk-print-area',
  pdfFileName = 'Kartu_Keluarga.pdf',
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 md:px-8 py-3.5 flex flex-wrap gap-4 items-center justify-between print:hidden sticky top-0 z-20 shadow-sm/5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all border border-slate-200 bg-white px-3.5 py-1.5 rounded-lg hover:border-slate-350 active:scale-98 shadow-sm"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        {backLabel}
      </Link>

      {/* Dynamic Controls Group */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        {/* Language Switcher Toggle */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 print:hidden shadow-sm/5">
          <button
            onClick={() => setViewLanguage('id')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${viewLanguage === 'id' ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <span className="text-[13px]">ID</span>
          </button>
          <button
            onClick={() => setViewLanguage('jp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${viewLanguage === 'jp' ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <span className="text-[13px]">JP</span>
          </button>
        </div>

        <div className="hidden sm:block w-px h-5 bg-slate-200 print:hidden" />

        {/* Scale Fitting Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScaleMode(m => m === 'fit' ? 'manual' : 'fit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 shadow-sm ${scaleMode === 'fit' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            title="Sesuaikan lebar dokumen secara otomatis agar pas dengan layar"
          >
            {scaleMode === 'fit' ? <Maximize2 size={13} className="text-indigo-650" /> : <Minimize2 size={13} />}
            <span>Auto-Fit</span>
          </button>

          {/* Manual Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200 shadow-sm">
            <button
              onClick={() => {
                setScaleMode('manual');
                setScale(s => Math.max(0.3, +(currentScale - 0.05).toFixed(2)));
              }}
              className="p-1 hover:bg-white rounded transition-all text-slate-500 hover:text-slate-800 disabled:opacity-50"
              title="Perkecil"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs font-semibold text-slate-600 min-w-[36px] text-center tabular-nums select-none">
              {Math.round(currentScale * 100)}%
            </span>
            <button
              onClick={() => {
                setScaleMode('manual');
                setScale(s => Math.min(1.5, +(currentScale + 0.05).toFixed(2)));
              }}
              className="p-1 hover:bg-white rounded transition-all text-slate-500 hover:text-slate-800"
              title="Perbesar"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>

        <div className="hidden lg:block w-px h-5 bg-slate-200" />

        {/* Desktop Sidebar Collapsible Toggle */}
        {!readOnly && (
          <button
            onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-250 hover:border-slate-350 rounded-md text-xs font-semibold text-slate-650 hover:text-slate-850 hover:bg-slate-50 shadow-sm transition-all"
            title={isEditorCollapsed ? "Tampilkan Panel Form" : "Sembunyikan Panel Form"}
          >
            {isEditorCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            <span>{isEditorCollapsed ? "Buka Form" : "Fokus Pratinjau"}</span>
          </button>
        )}

        <button
          onClick={() => exportKKToPDF(printAreaId, pdfFileName, viewLanguage)}
          disabled={isDataEmpty}
          className={`inline-flex items-center gap-2 px-4.5 py-1.5 text-white text-xs md:text-sm font-semibold rounded-lg transition-all ${isDataEmpty ? 'bg-slate-400 cursor-not-allowed shadow-none opacity-70' : 'bg-indigo-900 hover:bg-indigo-850 active:scale-95 shadow-md shadow-indigo-950/10 hover:shadow-indigo-950/15'}`}
        >
          <Printer size={15} strokeWidth={2} />
          <span>Cetak / Simpan PDF</span>
        </button>

        {onSave && !readOnly && (
          <button
            onClick={onSave}
            disabled={isDataEmpty}
            className={`inline-flex items-center gap-2 px-4.5 py-1.5 text-white text-xs md:text-sm font-semibold rounded-lg transition-all ${isDataEmpty ? 'bg-slate-400 cursor-not-allowed shadow-none opacity-70' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-900/10 hover:shadow-emerald-900/15'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Simpan Data</span>
          </button>
        )}
      </div>
    </header>
  );
};
