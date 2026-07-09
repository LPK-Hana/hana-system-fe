'use client';

import { ST_FONT_ID, ST_FONT_JP } from './suratTanggunganFonts';
import { getSuratTanggunganPageSize } from './suratTanggunganPageSize';
import {
  SURAT_TANGGUNGAN_ID_PRINT_CSS,
  SURAT_TANGGUNGAN_JP_PRINT_CSS,
} from './suratTanggunganPrintCss';

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

function findStPage(pageNum: '1' | '2'): HTMLElement | null {
  return document.querySelector(`.st-a4-page[data-st-page="${pageNum}"]`);
}

function prepareStPageClone(pageNum: '1' | '2'): HTMLElement | null {
  const page = findStPage(pageNum);
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
    'position:relative',
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
      }, 500);
    };
    if (printWindow.document.fonts?.ready) {
      printWindow.document.fonts.ready.then(trigger);
    } else {
      setTimeout(trigger, 1500);
    }
  });

  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

/** Export kedua halaman Surat Tanggungan (Indonesia + Jepang) dalam satu PDF */
export async function exportSuratTanggunganBothToPDF(fileName = 'Surat_Tanggungan.pdf') {
  const page1 = prepareStPageClone('1');
  const page2 = prepareStPageClone('2');

  if (!page1 || !page2) {
    alert('Halaman Surat Tanggungan tidak ditemukan. Buka tab Preview terlebih dahulu.');
    return;
  }

  await embedImages(page1);
  await embedImages(page2);

  const { wMm, hMm } = getSuratTanggunganPageSize();
  const title = fileName.replace(/\.pdf$/i, '');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .st-export-page {
      width: ${wMm} !important;
      height: ${hMm} !important;
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
      width: ${wMm} !important;
      height: ${hMm} !important;
      box-sizing: border-box !important;
    }
    ${SURAT_TANGGUNGAN_ID_PRINT_CSS}
    ${SURAT_TANGGUNGAN_JP_PRINT_CSS}
    @media screen {
      body { background: #e5e7eb; padding: 20px 0; }
      .st-export-page { margin: 0 auto 24px !important; box-shadow: 0 4px 24px rgba(0,0,0,0.15) !important; }
    }
  </style>
</head>
<body>
  ${page1.outerHTML}
  ${page2.outerHTML}
</body>
</html>`;

  openPrintWindow(html, title);
}

/** @deprecated gunakan exportSuratTanggunganBothToPDF */
export async function exportSuratTanggunganToPDF(
  _viewLanguage: 'id' | 'jp',
  fileName = 'Surat_Tanggungan.pdf',
) {
  return exportSuratTanggunganBothToPDF(fileName);
}
