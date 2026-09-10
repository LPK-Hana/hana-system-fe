'use client';

import { KK_FONT_JP_PRINT, KK_GOOGLE_SERIF_JP_URL } from './kkFonts';
import { getKkPageSize, type KkPageVariant } from './kkPageSize';

export async function exportKKToPDF(
  elementId: string,
  fileName = 'Kartu_Keluarga',
  variant: KkPageVariant = 'jp',
) {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`Element #${elementId} tidak ditemukan.`);
    return;
  }

  const detected = el.getAttribute('data-kk-variant');
  const pageVariant: KkPageVariant = detected === 'id' || detected === 'jp' ? detected : variant;
  const { wMm, hMm } = getKkPageSize(pageVariant);
  const pageSizeRule = pageVariant === 'jp' ? 'A3 landscape' : 'A4 landscape';

  const clone = el.cloneNode(true) as HTMLElement;

  const images = clone.querySelectorAll<HTMLImageElement>('img');
  await Promise.all(
    Array.from(images).map(async (img) => {
      const src = img.src;
      if (src.startsWith('data:')) return;
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
    @page {
      size: ${pageSizeRule};
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: ${wMm};
      height: ${hMm};
      margin: 0;
      padding: 0;
      background: #fff;
      font-family: ${KK_FONT_JP_PRINT};
      color: #000000;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      overflow: hidden;
    }

    [data-kk-variant="jp"],
    [data-kk-variant="jp"] * {
      color: #000000 !important;
      -webkit-font-smoothing: auto !important;
      -moz-osx-font-smoothing: auto !important;
      text-rendering: geometricPrecision !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    #${elementId} {
      width: ${wMm} !important;
      height: ${hMm} !important;
      margin: 0 !important;
      box-shadow: none !important;
      transform: none !important;
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      border: none !important;
      zoom: 1 !important;
      overflow: hidden !important;
    }

    @media print {
      html, body {
        width: ${wMm};
        height: ${hMm};
      }
      #${elementId} {
        width: ${wMm} !important;
        height: ${hMm} !important;
        margin: 0 !important;
        box-shadow: none !important;
        transform: none !important;
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        border: none !important;
        page-break-after: avoid;
      }
    }

    @media screen {
      body {
        display: flex;
        justify-content: center;
        background: #e5e7eb;
        padding: 20px 0;
      }
      #${elementId} {
        background: #fff;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      }
    }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  const printWindow = window.open(blobUrl, '_blank');
  if (!printWindow) {
    alert('Popup diblokir browser. Izinkan popup untuk localhost lalu coba lagi.');
    URL.revokeObjectURL(blobUrl);
    return;
  }

  printWindow.addEventListener('load', () => {
    const doc = printWindow.document;

    const triggerPrint = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 400);
    };

    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(triggerPrint);
    } else {
      setTimeout(triggerPrint, 1500);
    }
  });

  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}
