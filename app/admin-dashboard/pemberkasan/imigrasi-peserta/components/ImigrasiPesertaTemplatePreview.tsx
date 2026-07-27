'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import templateJson from '../template/Template_Dokumen_Imigrasi_Peserta.lpk-hana-template.json';

const A4_W_PX = 794;
const A4_H_PX = 1123;
const PAGE_GAP_PX = 24;

type TemplatePage = {
  id: string;
  html: string;
};

const template = templateJson.template;
const margins = template.margins;
const pages = (template.pages ?? []) as TemplatePage[];

function marginPadding() {
  return `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`;
}

export default function ImigrasiPesertaTemplatePreview() {
  const router = useRouter();
  const [scale, setScale] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalH = useMemo(
    () => A4_H_PX * pages.length + PAGE_GAP_PX * Math.max(pages.length - 1, 0),
    [],
  );

  return (
    <main
      className={`min-h-screen bg-[#F4F7F4] font-sans text-gray-800 relative overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-200' : ''
      }`}
    >
      {!isFullscreen ? <div className="hana-wagara hana-wagara-subtle" aria-hidden /> : null}

      <div className={`relative z-10 ${isFullscreen ? 'h-full flex flex-col' : 'p-4 md:p-6'}`}>
        <header
          className={`flex flex-wrap items-center justify-between gap-3 mb-4 ${
            isFullscreen ? 'px-4 py-3 bg-white border-b border-slate-200 shrink-0' : ''
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {!isFullscreen ? (
              <button
                type="button"
                onClick={() => router.push('/admin-dashboard/pemberkasan')}
                className="flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-medium shrink-0"
              >
                <ArrowLeft size={18} />
                Kembali
              </button>
            ) : null}
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-serif text-emerald-900 truncate">
                {template.name}
              </h1>
              <p className="text-xs text-slate-500">
                Preview template · {pages.length} halaman A4 · placeholder masih mentah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.1).toFixed(2))))}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-semibold text-slate-600 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.4, Number((s + 0.1).toFixed(2))))}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg"
              title={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </header>

        <div
          className={`bg-slate-100/70 border border-slate-200/70 rounded-2xl p-4 md:p-6 overflow-auto ${
            isFullscreen ? 'flex-1 min-h-0 rounded-none border-0' : 'min-h-[70vh]'
          }`}
        >
          <div className="flex justify-center w-full">
            <div
              style={{
                width: A4_W_PX * scale,
                height: totalH * scale,
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: PAGE_GAP_PX,
                }}
              >
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="bg-white shadow-xl ring-1 ring-black/[0.08]"
                    style={{
                      width: A4_W_PX,
                      height: A4_H_PX,
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <div className="absolute top-2 right-3 z-10 text-[10px] font-semibold tracking-wider uppercase text-slate-400 bg-white/80 px-2 py-0.5 rounded">
                      Halaman {index + 1}/{pages.length}
                    </div>
                    <div
                      className="imigrasi-peserta-template"
                      style={{
                        width: A4_W_PX,
                        height: A4_H_PX,
                        boxSizing: 'border-box',
                        padding: marginPadding(),
                        color: '#000',
                        fontSize: '10pt',
                        lineHeight: 1.35,
                        fontFamily:
                          '"Noto Serif JP", "MS Mincho", "ＭＳ 明朝", "Yu Mincho", serif',
                      }}
                      dangerouslySetInnerHTML={{ __html: page.html }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @font-face {
          font-family: 'Noto Serif JP';
          src: url('/fonts/NotoSerifJP-VF.ttf') format('truetype');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'MS Mincho';
          src: url('/fonts/msmincho.ttc') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'Noto Sans JP';
          src: url('/fonts/NotoSansJP-Regular.otf') format('opentype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        .imigrasi-peserta-template {
          font-family: 'Noto Serif JP', 'MS Mincho', 'ＭＳ 明朝', 'Yu Mincho', serif !important;
        }

        .imigrasi-peserta-template p {
          margin: 0;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .imigrasi-peserta-template .doc-table {
          border-collapse: collapse;
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
          margin: 0.35em 0;
        }

        .imigrasi-peserta-template .doc-table > tbody > tr > td,
        .imigrasi-peserta-template .doc-table > tbody > tr > th {
          border: 1px solid #000;
          vertical-align: middle;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
          background: transparent;
          padding: 2px 4px;
        }

        .imigrasi-peserta-template .doc-borderless-table,
        .imigrasi-peserta-template table[data-table-variant='borderless'] {
          border-collapse: collapse;
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
          margin: 0.35em 0;
          border: none;
        }

        .imigrasi-peserta-template .doc-borderless-table td,
        .imigrasi-peserta-template .doc-borderless-table th,
        .imigrasi-peserta-template table[data-table-variant='borderless'] td,
        .imigrasi-peserta-template table[data-table-variant='borderless'] th {
          border: none !important;
          background: transparent;
          padding: 1px 0;
        }

        .imigrasi-peserta-template .tableWrapper {
          width: 100%;
          max-width: 100%;
          overflow: visible;
        }

        .imigrasi-peserta-template u {
          text-decoration: underline;
        }

        .imigrasi-peserta-template .ipes-tbl {
          margin: 0 !important;
          border: 1.5px solid #000;
        }

        .imigrasi-peserta-template .doc-table.ipes-tbl > tbody > tr > td,
        .imigrasi-peserta-template .doc-table.ipes-tbl > tbody > tr > th {
          border: 1px solid #000;
          padding: 3px 4px !important;
          vertical-align: top !important;
          font-size: 9pt;
          line-height: 1.25 !important;
        }

        .imigrasi-peserta-template .ipes-jp {
          font-family: 'Noto Serif JP', 'MS Mincho', 'ＭＳ 明朝', serif !important;
        }

        .imigrasi-peserta-template .ipes-id {
          font-family: Century, 'Times New Roman', Times, serif !important;
        }

        .imigrasi-peserta-template .ipes-sa,
        .imigrasi-peserta-template .ipes-pasal,
        .imigrasi-peserta-template .ipes-bab,
        .imigrasi-peserta-template .ipes-sign-2col {
          font-family: Arial, Helvetica, 'Noto Sans JP', sans-serif !important;
        }

        .imigrasi-peserta-template .ipes-pasal .ipes-body,
        .imigrasi-peserta-template .ipes-pasal .ipes-h {
          font-size: 9.5pt !important;
          line-height: 1.4 !important;
        }

        .imigrasi-peserta-template .ipes-bab .ipes-h {
          font-size: 10pt !important;
        }

        .imigrasi-peserta-template .ipes-l {
          text-align: left !important;
          vertical-align: middle !important;
        }

        .imigrasi-peserta-template .ipes-s,
        .imigrasi-peserta-template .ipes-th {
          text-align: center !important;
          vertical-align: middle !important;
          font-weight: normal;
        }

        .imigrasi-peserta-template .ipes-v {
          text-align: left !important;
        }

        .imigrasi-peserta-template .ipes-c {
          text-align: center !important;
          vertical-align: middle !important;
        }

        .imigrasi-peserta-template .ipes-right {
          text-align: right !important;
        }

        .imigrasi-peserta-template .ipes-sign-cell {
          min-height: 72px;
          height: 88px;
        }

        .imigrasi-peserta-template .ipes-af {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 10px;
          margin-top: 6px;
        }

        .imigrasi-peserta-template .ipes-sign-right {
          margin-left: auto;
          width: fit-content;
          max-width: 100%;
        }

        .imigrasi-peserta-template .ipes-uline {
          display: inline-block;
          min-width: 220px;
          border-bottom: 1px solid #000;
          line-height: 1.2;
        }

        .imigrasi-peserta-template .ipes-inner-boxes {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
          table-layout: auto;
        }

        .imigrasi-peserta-template .ipes-inner-boxes td {
          border: none !important;
          padding: 1px !important;
          vertical-align: middle !important;
        }

        .imigrasi-peserta-template .ipes-ch {
          border: 1px solid #000 !important;
          width: 16px;
          height: 18px;
          text-align: center !important;
          padding: 0 !important;
          line-height: 18px;
        }

        .imigrasi-peserta-template .ipes-box-label {
          padding-right: 4px !important;
          white-space: nowrap;
        }

        .imigrasi-peserta-template .ipes-pasal,
        .imigrasi-peserta-template .ipes-bab {
          display: flex;
          gap: 28px;
          margin: 0 0 12pt 0;
          align-items: flex-start;
        }

        .imigrasi-peserta-template .ipes-col-id,
        .imigrasi-peserta-template .ipes-col-jp {
          flex: 1 1 0;
          min-width: 0;
        }

        .imigrasi-peserta-template .ipes-h {
          margin: 0 0 4px 0 !important;
          line-height: 1.35 !important;
        }

        .imigrasi-peserta-template .ipes-body {
          margin: 0 !important;
          line-height: 1.45 !important;
          text-align: justify;
        }

        .imigrasi-peserta-template .ipes-bab {
          margin: 14pt 0 10pt 0;
        }

        .imigrasi-peserta-template .ipes-sign-2col {
          display: flex;
          gap: 40px;
          margin-top: 8pt;
        }

        .imigrasi-peserta-template .ipes-sign-2col > div {
          flex: 1 1 0;
          min-width: 0;
        }
      `}</style>
    </main>
  );
}
