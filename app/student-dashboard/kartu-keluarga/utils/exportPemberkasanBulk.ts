'use client';

import { KK_FONT_JP_PRINT, KK_GOOGLE_SERIF_JP_URL } from './kkFonts';
import { getKkPageSize } from './kkPageSize';
import { exportSuratTanggunganBothToPDF } from './exportSuratTanggunganPdf';
import { ST_FONT_ID, ST_FONT_JP } from './suratTanggunganFonts';
import { getSuratTanggunganPageSize } from './suratTanggunganPageSize';
import {
  SURAT_TANGGUNGAN_ID_PRINT_CSS,
  SURAT_TANGGUNGAN_JP_PRINT_CSS,
} from './suratTanggunganPrintCss';

const KK_EXPORT_ID = 'kk-print-area-jp-export';
const KK_MAIN_ID = 'kk-print-area';

async function embedImages(root: HTMLElement) {
  const images = root.querySelectorAll<HTMLImageElement>('img');
  await Promise.all(
    Array.from(images).map(async (img) => {
      const src = img.src;
      if (!src || src.startsWith('data:')) return;
      try {
        const resp = await fetch(src);
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
      } catch {
        // ignore
      }
    }),
  );
}

function findKkJpElement(): HTMLElement | null {
  const hidden = document.getElementById(KK_EXPORT_ID);
  if (hidden) return hidden;
  const main = document.getElementById(KK_MAIN_ID);
  if (main?.getAttribute('data-kk-variant') === 'jp') return main;
  return null;
}

function prepareKkJpClone(): HTMLElement | null {
  const el = findKkJpElement();
  if (!el) return null;

  const { wMm, hMm } = getKkPageSize('jp');
  const clone = el.cloneNode(true) as HTMLElement;
  clone.id = 'kk-bulk-export';
  clone.className = 'kk-a4 kk-export-sheet';
  clone.setAttribute('data-kk-variant', 'jp');
  clone.style.cssText = [
    `width:${wMm}`,
    `height:${hMm}`,
    'margin:0',
    'padding:0',
    'box-shadow:none',
    'transform:none',
    'overflow:hidden',
    'position:relative',
    'page-break-after:always',
    'break-after:page',
  ].join(';');
  return clone;
}

function prepareStPageClone(pageNum: '1' | '2'): HTMLElement | null {
  const page = document.querySelector(`.st-a4-page[data-st-page="${pageNum}"]`);
  if (!page) return null;

  const { wMm, hMm } = getSuratTanggunganPageSize();
  const lang = pageNum === '1' ? 'id' : 'jp';
  const clone = page.cloneNode(true) as HTMLElement;

  clone.className = 'st-a4-page st-export-page';
  clone.style.cssText = [
    `width:${wMm}`,
    `height:${hMm}`,
    'box-sizing:border-box',
    'overflow:hidden',
    'margin:0',
    'padding:0',
    'background:#fff',
    'box-shadow:none',
    'transform:none',
    'page-break-after:always',
    'break-after:page',
  ].join(';');

  const inner = clone.querySelector('.st-page-inner') as HTMLElement | null;
  if (inner) {
    inner.style.width = wMm;
    inner.style.height = hMm;
    inner.style.boxSizing = 'border-box';
    inner.style.fontFamily = lang === 'jp' ? ST_FONT_JP : ST_FONT_ID;
    inner.style.color = '#000';
  }

  return clone;
}

function openPrintWindow(html: string, title: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, '_blank');

  if (!printWindow) {
    alert('Popup diblokir browser. Izinkan popup untuk localhost lalu coba lagi.');
    URL.revokeObjectURL(blobUrl);
    return;
  }

  printWindow.addEventListener('load', () => {
    const trigger = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 600);
    };
    if (printWindow.document.fonts?.ready) {
      printWindow.document.fonts.ready.then(trigger);
    } else {
      setTimeout(trigger, 1500);
    }
  });

  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

/**
 * Download bulk: KK (Jepang) + Surat Tanggungan (Indonesia + Jepang)
 * dalam satu dialog cetak / simpan PDF.
 */
export async function exportBulkKkJpAndSuratTanggungan(
  fileName = 'Pemberkasan_KK_JP_Surat_Tanggungan.pdf',
) {
  const kkClone = prepareKkJpClone();
  const st1 = prepareStPageClone('1');
  const st2 = prepareStPageClone('2');

  if (!kkClone) {
    alert('KK versi Jepang tidak ditemukan. Pastikan data KK sudah diisi.');
    return;
  }
  if (!st1 || !st2) {
    alert('Surat Tanggungan tidak ditemukan. Pilih peserta dan buka tab Preview.');
    return;
  }

  await embedImages(kkClone);
  await embedImages(st1);
  await embedImages(st2);

  const kkSize = getKkPageSize('jp');
  const stSize = getSuratTanggunganPageSize();
  const title = fileName.replace(/\.pdf$/i, '');

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${KK_GOOGLE_SERIF_JP_URL}" rel="stylesheet">
  <style>
    @page kk-sheet { size: A3 landscape; margin: 0; }
    @page st-sheet { size: A4 portrait; margin: 0; }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .kk-export-sheet {
      page: kk-sheet;
      width: ${kkSize.wMm} !important;
      height: ${kkSize.hMm} !important;
      margin: 0 !important;
      box-shadow: none !important;
      transform: none !important;
      overflow: hidden !important;
      page-break-after: always;
      break-after: page;
      font-family: ${KK_FONT_JP_PRINT};
      color: #000 !important;
    }

    .kk-export-sheet,
    .kk-export-sheet * {
      color: #000000 !important;
      -webkit-font-smoothing: auto !important;
      text-rendering: geometricPrecision !important;
    }

    .st-export-page {
      page: st-sheet;
      width: ${stSize.wMm} !important;
      height: ${stSize.hMm} !important;
      margin: 0 !important;
      box-shadow: none !important;
      transform: none !important;
      overflow: hidden !important;
      page-break-after: always;
      break-after: page;
    }

    .st-export-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .st-page-inner {
      width: ${stSize.wMm} !important;
      height: ${stSize.hMm} !important;
      box-sizing: border-box !important;
    }

    ${SURAT_TANGGUNGAN_ID_PRINT_CSS}
    ${SURAT_TANGGUNGAN_JP_PRINT_CSS}

    @media screen {
      body { background: #e5e7eb; padding: 20px 0; }
      .kk-export-sheet,
      .st-export-page {
        margin: 0 auto 24px !important;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15) !important;
      }
    }
  </style>
</head>
<body>
  ${kkClone.outerHTML}
  ${st1.outerHTML}
  ${st2.outerHTML}
</body>
</html>`;

  openPrintWindow(html, title);
}

export { exportSuratTanggunganBothToPDF };
