'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import templateJson from '../template/Template_Dokumen_Imigrasi_Perusahaan.lpk-raftel-template.json';

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

export default function ImigrasiPerusahaanTemplatePreview() {
  const router = useRouter();
  const [scale, setScale] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalH = useMemo(
    () => A4_H_PX * pages.length + PAGE_GAP_PX * Math.max(pages.length - 1, 0),
    [],
  );

  return (
    <main
      className={`min-h-screen bg-[#F5F9FC] font-sans text-gray-800 relative overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-200' : ''
      }`}
    >
      {!isFullscreen ? <div className="raftel-wagara raftel-wagara-subtle" aria-hidden /> : null}

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
                className="flex items-center gap-2 text-raftel-800 hover:text-raftel-950 font-medium shrink-0"
              >
                <ArrowLeft size={18} />
                Kembali
              </button>
            ) : null}
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-serif text-raftel-900 truncate">
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
                      className="imigrasi-perusahaan-template"
                      style={{
                        width: A4_W_PX,
                        height: A4_H_PX,
                        boxSizing: 'border-box',
                        padding: marginPadding(),
                        color: '#000',
                        fontSize: '10.5pt',
                        lineHeight: 1.45,
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

        .imigrasi-perusahaan-template {
          font-family: 'Noto Serif JP', 'MS Mincho', 'ＭＳ 明朝', 'Yu Mincho', serif !important;
        }

        .imigrasi-perusahaan-template p {
          margin: 0;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .imigrasi-perusahaan-template .doc-table {
          border-collapse: collapse;
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
          margin: 0.35em 0;
        }

        .imigrasi-perusahaan-template .doc-table > tbody > tr > td,
        .imigrasi-perusahaan-template .doc-table > tbody > tr > th {
          border: 1px solid #000;
          vertical-align: middle;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
          background: transparent;
        }

        .imigrasi-perusahaan-template .doc-borderless-table,
        .imigrasi-perusahaan-template table[data-table-variant='borderless'] {
          border-collapse: collapse;
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
          margin: 0.35em 0;
          border: none;
        }

        .imigrasi-perusahaan-template .doc-borderless-table td,
        .imigrasi-perusahaan-template .doc-borderless-table th,
        .imigrasi-perusahaan-template table[data-table-variant='borderless'] td,
        .imigrasi-perusahaan-template table[data-table-variant='borderless'] th {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          padding: 2px 4px;
          vertical-align: top;
        }

        .imigrasi-perusahaan-template .tableWrapper {
          display: block;
          width: 100%;
          max-width: 100%;
        }

        /* Gambar 2: hanging indent — teks tidak di bawah nomor */
        .imigrasi-perusahaan-template .ip-pledge-item {
          display: grid;
          grid-template-columns: 1.5em 1fr;
          column-gap: 0.55em;
          margin: 0 0 6.5pt 0;
          line-height: 1.55;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10.5pt;
          text-align: justify;
        }

        .imigrasi-perusahaan-template .ip-pledge-num {
          text-align: left;
          line-height: 1.55;
        }

        .imigrasi-perusahaan-template .ip-pledge-text {
          line-height: 1.55;
        }

        /* Gambar 3: tabel org di kanan */
        .imigrasi-perusahaan-template .ip-org-wrap {
          margin-left: auto !important;
          width: 74% !important;
          max-width: 540px;
        }

        .imigrasi-perusahaan-template .ip-org-table {
          margin: 0 !important;
          table-layout: fixed !important;
        }

        .imigrasi-perusahaan-template .ip-org-label {
          width: 40%;
          padding: 6px 8px !important;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10.5pt;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-org-label-center {
          text-align: center;
        }

        .imigrasi-perusahaan-template .ip-org-value {
          padding: 6px 8px !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-org-value-tall {
          padding: 10px 8px !important;
        }

        /* Baris 2: layout sendiri, tidak ikut divider baris 1/3 */
        .imigrasi-perusahaan-template .doc-table > tbody > tr > td.ip-org-row2-cell {
          padding: 0 !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-org-row2-inner {
          width: calc(100% + 2px);
          margin: -1px;
          border-collapse: collapse;
          table-layout: auto;
        }

        .imigrasi-perusahaan-template .ip-org-row2-inner td {
          border: 1px solid #000;
          vertical-align: middle;
        }

        /* 送出機関番号 — lebih sempit dari label baris 1/3 */
        .imigrasi-perusahaan-template .ip-org-no-label {
          white-space: nowrap !important;
          width: 1%;
          padding: 4px 8px !important;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif !important;
          font-size: 10.5pt !important;
          text-align: left;
          vertical-align: middle !important;
        }

        /* 整理番号 — satu baris horizontal */
        .imigrasi-perusahaan-template .doc-table td.ip-seiri,
        .imigrasi-perusahaan-template .ip-org-row2-inner td.ip-seiri {
          white-space: nowrap !important;
          writing-mode: horizontal-tb !important;
          text-orientation: mixed !important;
          word-break: keep-all !important;
          overflow-wrap: normal !important;
          min-width: 5em !important;
          width: auto !important;
          padding: 2px 8px !important;
          text-align: center !important;
          vertical-align: middle !important;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif !important;
          font-size: 10.5pt !important;
          line-height: 1.2 !important;
          letter-spacing: 0 !important;
        }

        /* Kotak karakter */
        .imigrasi-perusahaan-template .ip-ch {
          width: 18px !important;
          min-width: 18px !important;
          max-width: 18px !important;
          height: 24px;
          padding: 0 !important;
          text-align: center !important;
          vertical-align: middle !important;
          font-family: Century, 'Times New Roman', Times, serif !important;
          font-size: 11pt !important;
          line-height: 22px;
          box-sizing: border-box;
        }

        /* ===== Halaman 2: 技能実習生の名簿 ===== */
        .imigrasi-perusahaan-template .ip-besshi-box {
          float: right;
          border: 1px solid #000;
          padding: 1px 12px 2px;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 11pt;
          line-height: 1.35;
          text-align: center;
          margin: 0;
        }

        .imigrasi-perusahaan-template .ip-meibo-title {
          clear: both;
        }

        .imigrasi-perusahaan-template .ip-meibo-rule {
          border: none;
          border-top: 1px solid #000;
          margin: 2pt 0 0 0;
          width: 100%;
        }

        .imigrasi-perusahaan-template .ip-meibo-table {
          margin: 0 !important;
        }

        .imigrasi-perusahaan-template .doc-table.ip-meibo-table > tbody > tr > th,
        .imigrasi-perusahaan-template .doc-table.ip-meibo-table > tbody > tr > td {
          border: 1px solid #000;
          text-align: center !important;
          vertical-align: middle !important;
          padding: 7px 3px !important;
          height: 28px;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 11pt;
          font-weight: normal;
          word-break: keep-all !important;
          overflow-wrap: normal !important;
          white-space: nowrap;
        }

        .imigrasi-perusahaan-template .ip-meibo-th-nationality {
          white-space: nowrap !important;
          font-size: 10pt !important;
          letter-spacing: -0.02em;
        }

        .imigrasi-perusahaan-template .ip-meibo-name {
          white-space: nowrap !important;
          font-size: 11pt !important;
        }

        .imigrasi-perusahaan-template .ip-meibo-no {
          font-size: 11pt !important;
        }

        /* ===== Halaman 3: 外国の準備機関の概要書及び誓約書 ===== */
        .imigrasi-perusahaan-template .ip-gaiyo-table {
          margin: 0 !important;
          border: 1.5px solid #000;
        }

        .imigrasi-perusahaan-template .doc-table.ip-gaiyo-table > tbody > tr > td {
          border: 1px solid #000;
          padding: 4px 6px !important;
          vertical-align: middle !important;
          word-break: keep-all !important;
          overflow-wrap: break-word;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-label {
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10.5pt;
          line-height: 1.4;
          text-align: left;
          background: transparent;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-value {
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10.5pt;
          text-align: left;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-value-center {
          text-align: center !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-value-addr {
          vertical-align: top !important;
          padding-top: 4px !important;
          padding-bottom: 4px !important;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-addr {
          white-space: nowrap !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-addr span {
          font-family: 'Arial Narrow', Arial, 'Century', sans-serif !important;
          font-size: 7.8pt !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-contact {
          margin-top: 2px !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-value-rel {
          vertical-align: middle !important;
          padding-top: 4px !important;
          padding-bottom: 4px !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-money {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          width: 100%;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sales {
          display: flex;
          justify-content: flex-end;
          align-items: baseline;
          width: 100%;
          padding-right: 18%;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-other,
        .imigrasi-perusahaan-template .ip-gaiyo-other span {
          white-space: nowrap !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-declare {
          margin: 0 0 2pt 0 !important;
          line-height: 1.4 !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sign {
          margin-left: auto;
          margin-right: 0;
          width: fit-content;
          max-width: 100%;
        }

        .imigrasi-perusahaan-template table.ip-gaiyo-sign-table,
        .imigrasi-perusahaan-template .ip-gaiyo-sign-table {
          display: inline-table !important;
          width: auto !important;
          max-width: none !important;
          min-width: 0 !important;
          border-collapse: collapse;
          border: none !important;
          table-layout: auto !important;
          margin: 0 !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sign-table td,
        .imigrasi-perusahaan-template table.ip-gaiyo-sign-table td {
          border: none !important;
          background: transparent !important;
          padding-top: 1px !important;
          padding-bottom: 1px !important;
          vertical-align: middle !important;
          width: auto !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sign-gap td {
          padding: 2px 0 !important;
          line-height: 1;
          height: 4px;
          font-size: 6pt;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sign-label {
          text-align: right !important;
          white-space: nowrap !important;
          width: 1% !important;
          padding-left: 0 !important;
          padding-right: 10px !important;
          vertical-align: middle !important;
          line-height: 1.45 !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sign-value {
          text-align: left !important;
          white-space: nowrap !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          width: auto !important;
          vertical-align: middle !important;
          line-height: 1.45 !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sign-value-person {
          position: relative !important;
          padding-right: 0 !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sign-value-person > span:first-child {
          display: inline-block;
          padding-right: 24px;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sign-row-director td {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          height: 1.45em;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sign-row-director .ip-gaiyo-sign-label > span {
          display: inline-block;
          transform: translateY(-1.5px);
        }

        .imigrasi-perusahaan-template .ip-gaiyo-sign-row-name td {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-inkan {
          position: absolute !important;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          display: block !important;
          width: 20px;
          height: 20px;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          line-height: 0 !important;
          overflow: visible;
        }

        .imigrasi-perusahaan-template .ip-gaiyo-inkan-svg {
          display: block;
          width: 20px;
          height: 20px;
        }

        .imigrasi-perusahaan-template u {
          text-decoration: underline;
        }

        /* ===== Halaman 4: 技能実習生の推薦状 ===== */
        .imigrasi-perusahaan-template .ip-suisen-sign {
          margin-top: 8pt;
          width: 100%;
        }

        .imigrasi-perusahaan-template .ip-suisen-sekinin {
          display: inline-block;
          width: 100%;
          box-sizing: border-box;
          padding-right: 28px !important;
        }

        .imigrasi-perusahaan-template .ip-suisen-sekinin .ip-gaiyo-inkan {
          right: 2px;
        }

        /* ===== Halaman 6: 同種業務従事経験等説明書 ===== */
        .imigrasi-perusahaan-template .ip-p6-table {
          margin: 0 !important;
        }

        .imigrasi-perusahaan-template .doc-table.ip-p6-table > tbody > tr > td {
          border: 1px solid #000;
          padding: 4px 5px !important;
          vertical-align: top !important;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 8.75pt;
          line-height: 1.25;
        }

        .imigrasi-perusahaan-template .ip-p6-label {
          text-align: left !important;
          vertical-align: top !important;
        }

        .imigrasi-perusahaan-template .ip-p6-note-inline {
          display: block;
          margin-top: 2px;
          font-size: 7.3pt;
          line-height: 1.3;
        }

        .imigrasi-perusahaan-template .ip-p6-sub {
          text-align: center !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p6-value {
          text-align: left !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p6-content {
          text-align: left !important;
          vertical-align: top !important;
        }

        .imigrasi-perusahaan-template .ip-p6-check-item {
          display: grid;
          grid-template-columns: 1.3em 1.4em 1fr;
          column-gap: 3px;
          margin: 0 0 2pt 0;
          line-height: 1.25;
          text-align: justify;
        }

        .imigrasi-perusahaan-template .ip-p6-letter {
          font-weight: bold;
        }

        .imigrasi-perusahaan-template .ip-p6-box {
          text-align: center;
        }

        .imigrasi-perusahaan-template .ip-p6-arrow {
          margin: 0 0 2pt 1.3em;
          line-height: 1.25;
          text-align: justify;
        }

        .imigrasi-perusahaan-template .ip-p6-letter-row {
          display: grid;
          grid-template-columns: 1.3em 1.4em 1fr;
          column-gap: 3px;
          margin: 0 0 2pt 1.7em;
          line-height: 1.25;
          text-align: justify;
        }

        .imigrasi-perusahaan-template .ip-p6-letter-sub {
          font-weight: bold;
        }

        .imigrasi-perusahaan-template .ip-p6-arrow-sub {
          margin: 0 0 2pt 3em;
          line-height: 1.25;
          text-align: justify;
        }

        .imigrasi-perusahaan-template .ip-p6-footnote {
          margin: 3pt 0 0 0;
          line-height: 1.3;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 8pt;
        }

        /* ===== Halaman 8: 外国の所属機関による証明書 ===== */
        .imigrasi-perusahaan-template .ip-p8-table {
          margin: 0 !important;
        }

        .imigrasi-perusahaan-template .doc-table.ip-p8-table > tbody > tr > td {
          border: 1px solid #000;
          padding: 4px 6px !important;
          vertical-align: middle !important;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10.5pt;
        }

        .imigrasi-perusahaan-template .ip-p8-label {
          text-align: left !important;
        }

        .imigrasi-perusahaan-template .ip-p8-label-wide {
          vertical-align: top !important;
        }

        .imigrasi-perusahaan-template .ip-p8-sub {
          text-align: left !important;
        }

        .imigrasi-perusahaan-template .ip-p8-value {
          text-align: left !important;
        }

        .imigrasi-perusahaan-template .ip-p8-value-right {
          text-align: right !important;
        }

        .imigrasi-perusahaan-template .ip-p8-value-tall {
          vertical-align: top !important;
          padding-top: 4px !important;
          padding-bottom: 4px !important;
        }

        .imigrasi-perusahaan-template .ip-p8-check-item {
          display: grid;
          grid-template-columns: 1.4em 1fr;
          margin: 0 0 4pt 0;
          line-height: 1.5;
        }

        .imigrasi-perusahaan-template .ip-p8-box {
          text-align: center;
        }

        .imigrasi-perusahaan-template .ip-p8-note {
          margin: 5pt 0 1pt 0;
          line-height: 1.3;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10pt;
        }

        .imigrasi-perusahaan-template .ip-p8-note-hang {
          padding-left: 1.35em !important;
          text-indent: -1.35em !important;
        }

        .imigrasi-perusahaan-template .ip-p8-note-item {
          margin: 0 0 1pt 0;
          line-height: 1.35;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 9.5pt;
        }

        .imigrasi-perusahaan-template .ip-p8-declare {
          margin: 6pt 0 6pt 0;
          line-height: 1.5;
          text-align: justify;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10.5pt;
        }

        .imigrasi-perusahaan-template .ip-p8-date {
          margin: 0 0 6pt 0;
          text-align: right;
          line-height: 1.4;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 11pt;
        }

        .imigrasi-perusahaan-template .ip-p8-sign {
          margin: 0 0 2pt 0;
          text-align: right;
          line-height: 1.4;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 11pt;
        }

        /* ===== Halaman 10: 外国の送出機関の概要書 ===== */
        .imigrasi-perusahaan-template .ip-p10-seiri-wrap {
          margin-left: auto !important;
          margin-top: 12pt;
          width: fit-content;
          margin-bottom: 10pt;
        }

        .imigrasi-perusahaan-template .ip-p10-seiri-table {
          border-collapse: collapse;
          margin: 0 !important;
        }

        .imigrasi-perusahaan-template .ip-p10-seiri-label,
        .imigrasi-perusahaan-template .ip-p10-seiri-box {
          border: 1px solid #000;
          padding: 4px 10px;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10pt;
          white-space: nowrap;
          vertical-align: middle;
        }

        .imigrasi-perusahaan-template .ip-p10-seiri-box {
          min-width: 80px;
        }

        .imigrasi-perusahaan-template .ip-p10-table {
          margin: 0 !important;
          border: 1.5px solid #000;
        }

        .imigrasi-perusahaan-template .doc-table.ip-p10-table > tbody > tr > td {
          border: 1px solid #000;
          padding: 4px 6px !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p10-sub-label {
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10pt;
          text-align: left;
        }

        .imigrasi-perusahaan-template .ip-p10-sub-value {
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10pt;
          text-align: left;
        }

        .imigrasi-perusahaan-template .ip-p10-postal-line {
          margin: 0;
          text-align: left;
          line-height: 1.4;
        }

        .imigrasi-perusahaan-template .ip-p10-tel-line {
          margin: 3px 0 0 0;
          text-align: right;
          line-height: 1.4;
        }

        .imigrasi-perusahaan-template .ip-p10-note {
          margin: 5pt 0 1pt 0;
          line-height: 1.3;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10pt;
        }

        .imigrasi-perusahaan-template .ip-p10-note-item {
          margin: 0 0 1pt 0;
          line-height: 1.35;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 9.5pt;
        }

        .imigrasi-perusahaan-template .ip-p10-declare {
          margin: 6pt 0 0 0;
          line-height: 1.4;
          text-align: right;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 10.5pt;
        }

        .imigrasi-perusahaan-template .ip-p10-sign {
          margin-top: 6pt;
        }

        .imigrasi-perusahaan-template .ip-p10-sign-line {
          margin: 0 0 4pt 0;
          text-align: right;
          line-height: 1.5;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
          font-size: 11pt;
        }

        /* ===== Halaman 11-12: 外国の送出機関が徴収する費用明細書 ===== */
        .imigrasi-perusahaan-template .ip-p11-title {
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
        }

        .imigrasi-perusahaan-template .ip-p11-table {
          margin: 0 !important;
          border: 1.5px solid #000;
        }

        .imigrasi-perusahaan-template .ip-p11-table.ip-p11-table-cont {
          border-top: none;
        }

        .imigrasi-perusahaan-template .doc-table.ip-p11-table > tbody > tr > td,
        .imigrasi-perusahaan-template .doc-table.ip-p11-table > tbody > tr > th {
          border: 1px solid #000;
          padding: 3px 4px !important;
          vertical-align: middle !important;
          line-height: 1.25 !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
        }

        .imigrasi-perusahaan-template .ip-p11-no,
        .imigrasi-perusahaan-template .ip-p11-item,
        .imigrasi-perusahaan-template .ip-p11-time {
          text-align: center !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p11-amount {
          text-align: left !important;
          vertical-align: top !important;
        }

        .imigrasi-perusahaan-template .ip-p11-th {
          text-align: center !important;
          vertical-align: middle !important;
          font-weight: normal;
        }

        .imigrasi-perusahaan-template .ip-p11-no {
          text-align: center !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p11-time p:first-child span {
          white-space: nowrap !important;
        }

        .imigrasi-perusahaan-template .ip-p11-item,
        .imigrasi-perusahaan-template .ip-p11-time {
          text-align: center !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p11-amount {
          text-align: left !important;
          vertical-align: top !important;
        }

        .imigrasi-perusahaan-template .ip-p11-amount-total {
          font-weight: 600;
        }

        .imigrasi-perusahaan-template .ip-p11-amount-detail {
          padding-left: 0.4em;
        }

        .imigrasi-perusahaan-template .ip-p11-total-row .ip-p11-total-label {
          border-right: none !important;
        }

        .imigrasi-perusahaan-template .ip-p11-total-row .ip-p11-total-value {
          text-align: left !important;
          vertical-align: middle !important;
          font-weight: 600;
        }

        .imigrasi-perusahaan-template .ip-p11-note-item {
          text-indent: -1.5em;
          padding-left: 1.5em;
        }

        .imigrasi-perusahaan-template .ip-p11-sign p {
          text-align: left;
        }

        /* ===== Halaman 13-14: 入国前講習実施（予定）表に関する申請者等の誓約書 ===== */
        .imigrasi-perusahaan-template .ip-p13-title,
        .imigrasi-perusahaan-template .ip-p13-subtitle {
          font-family: 'Courier New', Courier, monospace;
        }

        .imigrasi-perusahaan-template .ip-p13-table {
          margin: 0 0 6pt 0 !important;
          border: 1.5px solid #000;
        }

        .imigrasi-perusahaan-template .doc-table.ip-p13-table > tbody > tr > td,
        .imigrasi-perusahaan-template .doc-table.ip-p13-table > tbody > tr > th {
          border: 1px solid #000;
          padding: 2px 4px !important;
          vertical-align: middle !important;
        }

        /* Table1 outsource marker overlays the top-right corner of the org
           cell (absolute, not float) so it never competes with the org/
           address text for line-wrap width — the address wraps exactly as
           it would on its own, keeping table1 short enough to fit section 2
           + the footer note on the same page as REF. */
        .imigrasi-perusahaan-template .ip-p13-org {
          position: relative;
          padding-right: 54px !important;
        }

        .imigrasi-perusahaan-template .ip-p13-outsource-box {
          position: absolute;
          top: 3px;
          right: 4px;
          text-align: center;
          line-height: 1.2;
        }

        /* Compact table1's naturally long address/subject wraps closer to
           REF's tighter line-height. */
        .imigrasi-perusahaan-template .ip-p13-table .ip-p13-org > p,
        .imigrasi-perusahaan-template .ip-p13-table .ip-p13-place,
        .imigrasi-perusahaan-template .ip-p13-table .ip-p13-subject,
        .imigrasi-perusahaan-template .ip-p13-table .ip-p13-kind-item {
          line-height: 1.1 !important;
        }

        .imigrasi-perusahaan-template .ip-p13-th {
          text-align: center !important;
          font-weight: normal;
        }

        .imigrasi-perusahaan-template .ip-p13-no {
          text-align: center !important;
        }

        .imigrasi-perusahaan-template .ip-p13-subject {
          text-align: left !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p13-org,
        .imigrasi-perusahaan-template .ip-p13-place {
          text-align: left !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p13-outsource {
          white-space: nowrap;
        }

        .imigrasi-perusahaan-template .ip-p13-period,
        .imigrasi-perusahaan-template .ip-p13-period-empty {
          text-align: center !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p13-tilde {
          text-align: center;
          font-family: 'Courier New', Courier, monospace;
          font-size: 9.5pt;
          line-height: 1.3;
        }

        .imigrasi-perusahaan-template .ip-p13-hours {
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
        }

        .imigrasi-perusahaan-template .ip-p13-kind {
          text-align: left !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p13-kind-item {
          padding-left: 0.6em;
        }

        .imigrasi-perusahaan-template .ip-p13-total-row .ip-p13-total-label {
          text-align: center !important;
        }

        .imigrasi-perusahaan-template .ip-p13-note,
        .imigrasi-perusahaan-template .ip-p13-note-cont,
        .imigrasi-perusahaan-template .ip-p13-note-item,
        .imigrasi-perusahaan-template .ip-p13-note-item-cont,
        .imigrasi-perusahaan-template .ip-p13-section {
          font-family: 'Courier New', Courier, monospace;
        }

        .imigrasi-perusahaan-template .ip-p13-signline {
          display: flex;
          align-items: baseline;
          white-space: nowrap;
        }

        .imigrasi-perusahaan-template .ip-p13-signline-blank {
          flex: 1 1 auto;
          border-bottom: 1px solid #000;
          margin-left: 4px;
        }

        .imigrasi-perusahaan-template .ip-p13-signline-value {
          flex: 1 1 auto;
          border-bottom: 1px solid #000;
          padding-left: 8px;
          margin-left: 4px;
        }

        /* ===== Halaman 15-17: 入国前講習実施記録 ===== */
        .imigrasi-perusahaan-template .ip-p15-title {
          letter-spacing: 0.35em !important;
        }

        .imigrasi-perusahaan-template .ip-p15-title,
        .imigrasi-perusahaan-template .ip-p15-subtitle,
        .imigrasi-perusahaan-template .ip-p15-target,
        .imigrasi-perusahaan-template .ip-p15-note,
        .imigrasi-perusahaan-template .ip-p15-signline {
          font-family: 'Courier New', Courier, monospace;
        }

        .imigrasi-perusahaan-template .ip-p15-table {
          margin: 0 !important;
          border: 1.5px solid #000;
        }

        .imigrasi-perusahaan-template .doc-table.ip-p15-table > tbody > tr > td,
        .imigrasi-perusahaan-template .doc-table.ip-p15-table > tbody > tr > th {
          border: 1px solid #000;
          padding: 3px 4px !important;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p15-th {
          text-align: center !important;
          font-weight: normal;
        }

        .imigrasi-perusahaan-template .ip-p15-date,
        .imigrasi-perusahaan-template .ip-p15-date span,
        .imigrasi-perusahaan-template .ip-p15-time,
        .imigrasi-perusahaan-template .ip-p15-time span {
          white-space: nowrap !important;
        }

        .imigrasi-perusahaan-template .ip-p15-date-legacy,
        .imigrasi-perusahaan-template .ip-p15-time-legacy {
          text-align: center !important;
          white-space: nowrap;
        }

        .imigrasi-perusahaan-template .ip-p15-subject,
        .imigrasi-perusahaan-template .ip-p15-teacher {
          text-align: left !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
          font-size: 9pt !important;
          line-height: 1.2 !important;
        }

        /* The teacher cell's lines are separate <p> tags whose unitless
           inline line-height (1.4) computes against the *paragraph's own*
           inherited font-size (10.5pt), not the smaller 8.5pt span inside
           it — so it must be pinned here with an explicit font-size too. */
        .imigrasi-perusahaan-template .ip-p15-teacher > p {
          font-size: 8.5pt !important;
          line-height: 1.15 !important;
        }

        .imigrasi-perusahaan-template .ip-p15-place {
          text-align: left !important;
          vertical-align: middle !important;
          /* Unitless line-height computes against this element's own
             font-size, not the (smaller) font-size set on the inner spans —
             so it must be pinned here too, or each line's "strut" reverts
             to the inherited 10.5pt base and the row balloons in height. */
          font-size: 7pt !important;
          line-height: 1.2 !important;
        }

        .imigrasi-perusahaan-template .ip-p15-remark {
          text-align: center !important;
        }

        .imigrasi-perusahaan-template .ip-p15-holiday-row .ip-p15-subject,
        .imigrasi-perusahaan-template .ip-p15-holiday-row .ip-p15-teacher,
        .imigrasi-perusahaan-template .ip-p15-holiday-row .ip-p15-place {
          text-align: center !important;
        }

        .imigrasi-perusahaan-template .ip-p15-signblock .ip-p15-signline-hanko {
          padding-right: 26px;
        }

        /* ===== Halaman 18: 技能実習生一覧表 ===== */
        .imigrasi-perusahaan-template .ip-p18-table {
          margin: 0 !important;
          border: 1.5px solid #000;
        }

        .imigrasi-perusahaan-template .doc-table.ip-p18-table > tbody > tr > td,
        .imigrasi-perusahaan-template .doc-table.ip-p18-table > tbody > tr > th {
          border: 1px solid #000;
          padding: 7px 8px !important;
          height: 26px;
          vertical-align: middle !important;
        }

        .imigrasi-perusahaan-template .ip-p18-th {
          text-align: center !important;
          font-weight: normal;
        }

        .imigrasi-perusahaan-template .ip-p18-no {
          text-align: center !important;
        }

        .imigrasi-perusahaan-template .ip-p18-name {
          text-align: left !important;
        }

        .imigrasi-perusahaan-template .ip-p18-date {
          text-align: center !important;
        }

        .imigrasi-perusahaan-template .ip-p18-note {
          margin: 10pt 0 0 0;
          line-height: 1.5;
          font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
        }
      `}</style>
    </main>
  );
}
