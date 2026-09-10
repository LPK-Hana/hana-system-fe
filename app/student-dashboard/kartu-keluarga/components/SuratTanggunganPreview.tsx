'use client';

import React, { useEffect, useRef } from 'react';
import { SuratTanggunganFormData } from '../types/suratTanggunganTypes';
import {
  getSuratTanggunganPageSize,
  ST_PAGE_GAP_PX,
  stMarginPadding,
} from '../utils/suratTanggunganPageSize';
import { SURAT_TANGGUNGAN_ID_MARGINS } from '../utils/suratTanggunganIdTemplate';
import { SURAT_TANGGUNGAN_JP_MARGINS } from '../utils/suratTanggunganJpTemplate';
import { ST_FONT_ID, ST_FONT_JP } from '../utils/suratTanggunganFonts';
import { SuratTanggunganIdTemplatePage } from './SuratTanggunganIdTemplatePage';
import { SuratTanggunganJpTemplatePage } from './SuratTanggunganJpTemplatePage';

interface SuratTanggunganPreviewProps {
  activeMobileTab: 'edit' | 'preview';
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentScale: number;
  viewLanguage: 'id' | 'jp';
  formData: SuratTanggunganFormData;
}

const PageShell: React.FC<{
  pageNumber: 1 | 2;
  language: 'id' | 'jp';
  active: boolean;
  pageRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}> = ({ pageNumber, language, active, pageRef, children }) => {
  const { wPx, hPx } = getSuratTanggunganPageSize();
  const isJp = language === 'jp';
  const useIdTemplate = pageNumber === 1 && language === 'id';
  const margin = useIdTemplate ? SURAT_TANGGUNGAN_ID_MARGINS : SURAT_TANGGUNGAN_JP_MARGINS;

  return (
    <div
      ref={pageRef}
      data-st-page={pageNumber}
      data-st-lang={language}
      className={`st-a4-page bg-white shadow-xl rounded-sm print:shadow-none transition-shadow ${
        active ? 'ring-2 ring-indigo-400/60' : 'ring-1 ring-black/[0.08]'
      }`}
      style={{
        width: wPx,
        height: hPx,
        boxSizing: 'border-box',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <div
        className="st-page-inner"
        style={{
          width: wPx,
          height: hPx,
          boxSizing: 'border-box',
          padding: stMarginPadding(margin),
          fontFamily: isJp ? ST_FONT_JP : ST_FONT_ID,
          color: '#000',
          fontSize: '10.5pt',
          lineHeight: 1.5,
          WebkitTextSizeAdjust: '100%',
          textRendering: 'geometricPrecision',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const SuratTanggunganPreview: React.FC<SuratTanggunganPreviewProps> = ({
  activeMobileTab,
  containerRef,
  currentScale,
  viewLanguage,
  formData,
}) => {
  const { wPx: pageW, hPx: pageH } = getSuratTanggunganPageSize();
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const totalH = pageH * 2 + ST_PAGE_GAP_PX;

  useEffect(() => {
    const target = viewLanguage === 'id' ? page1Ref.current : page2Ref.current;
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [viewLanguage]);

  return (
    <div
      ref={containerRef}
      className={`
        ${activeMobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}
        flex-1 flex flex-col min-h-[500px] lg:min-h-0 lg:h-full bg-slate-100/50 border border-slate-200/60 rounded-2xl p-4 lg:p-6 print:border-none print:bg-transparent print:p-0 print:m-0 relative overflow-hidden
      `}
    >
      <div className="flex-1 min-h-0 overflow-auto flex justify-center w-full">
        <div
          id="surat-tanggungan-print-area"
          style={{
            width: pageW * currentScale,
            height: totalH * currentScale,
            flexShrink: 0,
            position: 'relative',
            margin: '0 auto',
          }}
          className="print:!w-auto print:!h-auto print:!m-0"
        >
          <div
            style={{
              transform: `scale(${currentScale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: ST_PAGE_GAP_PX,
            }}
          >
            <PageShell pageNumber={1} language="id" active={viewLanguage === 'id'} pageRef={page1Ref}>
              <SuratTanggunganIdTemplatePage data={formData} />
            </PageShell>
            <PageShell pageNumber={2} language="jp" active={viewLanguage === 'jp'} pageRef={page2Ref}>
              <SuratTanggunganJpTemplatePage data={formData} />
            </PageShell>
          </div>
        </div>
      </div>
    </div>
  );
};
