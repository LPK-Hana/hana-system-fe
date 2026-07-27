'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import templateJson from '../template/Template_Dokumen_Jishusei.lpk-hana-template.json';

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

export default function JishuseiTemplatePreview() {
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
                Preview · {pages.length} hlm A4 · Word→HTML (inline styles)
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
                    <div className="absolute top-2 right-3 z-10 text-[9px] font-medium tracking-wide text-slate-400/80 bg-white/70 px-1.5 py-0.5 pointer-events-none select-none">
                      {index + 1}/{pages.length}
                    </div>
                    <div
                      className="jishusei-template"
                      style={{
                        width: A4_W_PX,
                        height: A4_H_PX,
                        boxSizing: 'border-box',
                        padding: marginPadding(),
                        color: '#000',
                        fontSize: '10pt',
                        lineHeight: 1.25,
                        fontFamily: '"MS Mincho", "ＭＳ 明朝", "MS 明朝", serif',
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
        /* Word→HTML: inline styles win. Only provide fonts + light safety net. */
        @font-face {
          font-family: 'MS Mincho';
          src: url('/fonts/msmincho.ttc') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .jishusei-template {
          font-family: 'MS Mincho', 'ＭＳ 明朝', 'MS 明朝', serif;
        }

        .jishusei-template p {
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .jishusei-template table {
          max-width: 100%;
          border-collapse: collapse;
        }

        .jishusei-template td,
        .jishusei-template th {
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
          background: transparent;
        }

        /* —— Page 1 resume (match JPG page-0001) —— */
        .jishusei-template .jish-jp {
          font-family: 'MS Mincho', 'ＭＳ 明朝', 'MS 明朝', serif;
        }
        .jishusei-template .jish-id {
          font-family: 'Arial Narrow', ArialNarrow, Arial, sans-serif;
        }
        .jishusei-template .jish-p1-hdr {
          margin: 0;
          line-height: 1.25;
          overflow: hidden;
        }
        .jishusei-template .jish-p1-hdr-r {
          float: right;
          text-align: right;
        }
        .jishusei-template .jish-p1-abc {
          clear: both;
          margin: 2pt 0 4pt 0;
          line-height: 1.2;
        }
        .jishusei-template .jish-p1-title {
          margin: 2pt 0 0 0;
          text-align: center;
          line-height: 1.3;
        }
        .jishusei-template .jish-p1-title2 {
          margin: 1pt 0 4pt 0;
          text-align: center;
          line-height: 1.25;
        }
        .jishusei-template .jish-p1-date {
          margin: 0 0 4pt 0;
          text-align: right;
          line-height: 1.3;
        }
        .jishusei-template .jish-p1-tbl {
          width: 100% !important;
          border-collapse: collapse;
          table-layout: fixed;
          margin: 0;
          border: 1.5pt solid #000;
        }
        .jishusei-template .jish-p1-tbl td {
          border: 0.75pt solid #000;
          padding: 2pt 3pt !important;
          vertical-align: middle;
          line-height: 1.2;
          font-size: 10pt;
        }
        .jishusei-template .jish-p1-tbl .jish-jp {
          font-size: 10pt;
          line-height: 1.2;
        }
        .jishusei-template .jish-p1-tbl .jish-id {
          font-size: 8pt;
          line-height: 1.15;
        }
        .jishusei-template .jish-p1-l {
          text-align: left !important;
          vertical-align: middle !important;
        }
        .jishusei-template .jish-p1-l-sm .jish-jp {
          font-size: 8.5pt !important;
        }
        .jishusei-template .jish-p1-l-sm .jish-id {
          font-size: 7.5pt !important;
        }
        .jishusei-template .jish-p1-s {
          text-align: center !important;
          vertical-align: middle !important;
        }
        .jishusei-template .jish-p1-th {
          text-align: center !important;
          vertical-align: middle !important;
        }
        .jishusei-template .jish-p1-v {
          text-align: left !important;
          vertical-align: middle !important;
        }
        .jishusei-template .jish-p1-c {
          text-align: center !important;
          vertical-align: middle !important;
        }
        .jishusei-template .jish-p1-empty {
          min-height: 14pt;
          height: 14pt;
        }
        .jishusei-template .jish-p1-job-yr {
          text-align: center !important;
        }
        .jishusei-template .jish-p1-sec10 {
          vertical-align: top !important;
          padding: 3pt 4pt !important;
        }
        .jishusei-template .jish-p1-sec10 p {
          margin: 0;
        }

        .jishusei-template img {
          max-width: 100%;
          height: auto;
        }

        .jishusei-template u {
          text-decoration: underline;
        }

        .jishusei-template .awlist1 {
          list-style: none;
          counter-reset: awlistcounter18_0;
        }
        .jishusei-template .awlist1 > li:before {
          content: '(' counter(awlistcounter18_0) ')';
          counter-increment: awlistcounter18_0;
        }
        .jishusei-template .awlist2 {
          list-style: none;
          counter-reset: awlistcounter18_0 1;
        }
        .jishusei-template .awlist2 > li:before {
          content: '(' counter(awlistcounter18_0) ')';
          counter-increment: awlistcounter18_0;
        }
        .jishusei-template .awlist3 {
          list-style: none;
          counter-reset: awlistcounter16_0;
        }
        .jishusei-template .awlist3 > li:before {
          content: '（' counter(awlistcounter16_0) '）';
          counter-increment: awlistcounter16_0;
        }
        .jishusei-template .awlist4 {
          list-style: none;
          counter-reset: awlistcounter16_0 1;
        }
        .jishusei-template .awlist4 > li:before {
          content: '（' counter(awlistcounter16_0) '）';
          counter-increment: awlistcounter16_0;
        }
      `}</style>
    </main>
  );
}
